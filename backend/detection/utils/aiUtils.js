import OpenAI from "openai";

// Lazy initialization of OpenAI client
let openai = null;

function getOpenAIClient() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

/**
 * Check if OpenAI is properly configured
 * @returns {boolean} - True if OpenAI is configured
 */
export function isOpenAIConfigured() {
  try {
    getOpenAIClient();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * AI Detection prompt template
 */
const DETECTION_PROMPT = `
You are an AI model specialized in detecting deepfakes or manipulated media. 
You will be given an input (image, video, audio, or text). 
Your task is to analyze it and determine whether it is natural (authentic/original) or deepfake (AI-generated, manipulated, or synthetic). 

Return the result ONLY in the following JSON format:

{
  "media_type": "<image | video | audio | text>",
  "deepfake_probability": <integer 0–100>,
  "natural_probability": <integer 0–100>,
  "reasoning": {
    "content_analysis": "Brief description of the media (faces, voices, handwriting, text style, etc.)",
    "deepfake_indicators": "Signs of manipulation or AI generation if any",
    "authentic_indicators": "Signs of natural origin (lighting, noise, handwriting variation, speech cadence, etc.)",
    "overall": "Short conclusion explaining why the probabilities were assigned"
  }
}

Rules:
- Probabilities must sum to 100.
- No ranges allowed, only exact integers.
- If the medium does not contain faces/voices, state 'not applicable' for that section.
- Keep reasoning concise, factual, and evidence-based.
`;

/**
 * Create content block for OpenAI API based on media type and content
 * @param {string} mediaType - The media type (image, video, audio, text)
 * @param {string} content - The content (URL for media, text for text)
 * @returns {Object} - The content block for OpenAI API
 */
export function createMediaContentBlock(mediaType, content) {
  if (mediaType === "image") {
    return { type: "input_image", image_url: content };
  } else if (mediaType === "video" || mediaType === "audio") {
    // For video/audio, we'll use the URL as text since OpenAI may not support direct video/audio URLs
    return { type: "input_text", text: `Media URL: ${content}` };
  } else {
    return { type: "input_text", text: content };
  }
}

/**
 * Build the input for OpenAI Responses API
 * @param {string} mediaType - The media type
 * @param {Object} mediaContentBlock - The media content block
 * @returns {Array} - The input array for OpenAI API
 */
export function buildOpenAIInput(mediaType, mediaContentBlock) {
  return [
    {
      role: "user",
      content: [
        { type: "input_text", text: DETECTION_PROMPT.trim() },
        { type: "input_text", text: `media_type_hint:${mediaType ?? "unknown"}` },
        mediaContentBlock,
      ],
    },
  ];
}

/**
 * Call OpenAI Responses API for detection
 * @param {Array} input - The input array for OpenAI API
 * @param {Object} options - Additional options for the API call
 * @returns {Promise<Object>} - The OpenAI API response
 */
export async function callOpenAIDetection(input, options = {}) {
  try {
    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: "o3",
      input: input,
      max_output_tokens: 800,
      ...options
    });
    
    return response;
  } catch (error) {
    throw new Error(`OpenAI API call failed: ${error.message}`);
  }
}

/**
 * Extract text from OpenAI response
 * @param {Object} response - The OpenAI API response
 * @returns {string} - The extracted text
 */
export function extractTextFromResponse(response) {
  let modelText = "";
  
  try {
    if (response.output && Array.isArray(response.output)) {
      modelText = response.output
        .map((o) =>
          Array.isArray(o.content)
            ? o.content.map((c) => c.text ?? c?.plain_text ?? "").join("")
            : o.content?.text ?? ""
        )
        .join("\n");
    } else if (response.output_text) {
      modelText = response.output_text;
    } else if (Array.isArray(response?.choices)) {
      modelText = response.choices.map((c) => c.text ?? c.message?.content ?? "").join("\n");
    } else {
      modelText = JSON.stringify(response).slice(0, 2000);
    }
  } catch (ex) {
    modelText = JSON.stringify(response).slice(0, 2000);
  }
  
  return modelText;
}

/**
 * Parse JSON from model output
 * @param {string} modelText - The text output from the model
 * @returns {Object|null} - The parsed JSON object or null if parsing fails
 */
export function parseModelOutput(modelText) {
  try {
    const first = modelText.indexOf("{");
    const last = modelText.lastIndexOf("}");
    if (first >= 0 && last > first) {
      const jsonStr = modelText.slice(first, last + 1);
      return JSON.parse(jsonStr);
    } else {
      return JSON.parse(modelText);
    }
  } catch (err) {
    return null;
  }
}

/**
 * Normalize and validate detection results
 * @param {Object} parsed - The parsed JSON from model output
 * @param {string} mediaType - The detected media type
 * @returns {Object} - The normalized detection result
 */
export function normalizeDetectionResult(parsed, mediaType) {
  // Normalize probabilities
  let df = parsed.deepfake_probability;
  let nat = parsed.natural_probability;

  // Convert to numbers if possible, otherwise fallback to NaN
  df = typeof df === "number" ? df : Number(df);
  nat = typeof nat === "number" ? nat : Number(nat);

  if (!Number.isFinite(df) && Number.isFinite(nat)) {
    df = Math.round(100 - nat);
  } else if (Number.isFinite(df) && !Number.isFinite(nat)) {
    nat = Math.round(100 - df);
  } else if (!Number.isFinite(df) && !Number.isFinite(nat)) {
    // fallback — mark uncertain
    df = 0;
    nat = 100;
  }

  // Round and clamp df to [0,100]
  df = Math.round(df);
  df = Math.max(0, Math.min(100, df));

  // Set nat to guarantee sum 100
  nat = 100 - df;
  nat = Math.max(0, Math.min(100, nat));

  // Ensure media_type matches allowed values
  const allowed = ["image", "video", "audio", "text"];
  let returnedMediaType = (parsed.media_type || mediaType || "unknown").toLowerCase();
  if (!allowed.includes(returnedMediaType)) {
    returnedMediaType = allowed.includes(mediaType) ? mediaType : "unknown";
  }

  // Ensure reasoning fields exist
  const reasoning = parsed.reasoning || {};
  const content_analysis = reasoning.content_analysis !== undefined ? String(reasoning.content_analysis) : "not available";
  const deepfake_indicators = reasoning.deepfake_indicators !== undefined ? String(reasoning.deepfake_indicators) : "not available";
  const authentic_indicators = reasoning.authentic_indicators !== undefined ? String(reasoning.authentic_indicators) : "not available";
  const overall = reasoning.overall !== undefined ? String(reasoning.overall) : "not available";

  return {
    media_type: returnedMediaType,
    deepfake_probability: df,
    natural_probability: nat,
    reasoning: {
      content_analysis,
      deepfake_indicators,
      authentic_indicators,
      overall,
    }
  };
}
