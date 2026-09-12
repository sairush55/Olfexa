const path = require('path');
const { createWorker } = require('tesseract.js');

async function testFull() {
  try {
    const workerPath = path.join(process.cwd(), 'node_modules', 'tesseract.js', 'src', 'worker-script', 'node', 'index.js');
    const worker = await createWorker('eng', 1, {
      workerPath: workerPath,
    });

    // 1x1 transparent png test
    const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    const res = await worker.recognize(dummyPng);
    console.log('Recognition succeeded! Text length:', res.data.text.length);

    await worker.terminate();
    console.log('Worker terminated cleanly.');
  } catch (err) {
    console.error('Error during full OCR test:', err);
  }
}

testFull();
