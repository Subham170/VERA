import axios from 'axios';
import fs from 'fs';

async function sendFile() {
  const raw = fs.readFileSync('fake.png');            // or a video file
  const base64 = raw.toString('base64');

  const body = {
    doc_base64: base64,
    req_id: 'req-' + Date.now(),
    isIOS: false,
    doc_type: 'image',
    orientation: 1
  };

  const resp = await axios.post(
    'https://ping.arya.ai/api/v1/deepfake-detection/image',
    body,
    { headers: { token: 'c927f89af2643ec3f225e1e04bd3a91e', 'Content-Type': 'application/json' } }
  );

  // console.log(resp.data);
}

sendFile().catch(console.error);
