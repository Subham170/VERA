const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const ffmpeg = require('fluent-ffmpeg');


const PROCESSED_FOLDER = 'processed';
const PREDEFINED_WATERMARK_PATH = path.join(process.cwd(), 'badge_17460216.png');

fs.mkdirSync(PROCESSED_FOLDER, { recursive: true });


export const createwatermarkforvideo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Missing video file part" });
  }

  if (!fs.existsSync(PREDEFINED_WATERMARK_PATH)) {
    console.error('Error: Predefined watermark file not found at', PREDEFINED_WATERMARK_PATH);
    fs.unlinkSync(req.file.path);
    return res.status(500).json({ error: "Server configuration error: watermark file missing." });
  }

  const videoFile = req.file;
  const videoPath = videoFile.path;
  const outputFilename = `${crypto.randomBytes(16).toString('hex')}_processed${path.extname(videoFile.originalname)}`;
  const outputPath = path.join(PROCESSED_FOLDER, outputFilename);

  ffmpeg(videoPath)
    .input(PREDEFINED_WATERMARK_PATH)
    .complexFilter([
      '[0:v][1:v] overlay=main_w-overlay_w-10:10'
    ])
    .on('error', (err) => {
      console.error('FFmpeg Error:', err.message);
      fs.unlinkSync(videoPath);
      res.status(500).json({ error: "FFmpeg processing failed", details: err.message });
    })
    .on('end', () => {
      console.log('Processing finished successfully!');
      res.download(outputPath, outputFilename, (err) => {
        if (err) {
          console.error("Download Error:", err);
        }
        fs.unlinkSync(videoPath);
        fs.unlinkSync(outputPath);
      });
    })
    .save(outputPath);
};