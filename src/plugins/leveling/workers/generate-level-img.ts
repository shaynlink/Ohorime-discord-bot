import { Worker, isMainThread, workerData, parentPort } from 'node:worker_threads';
import { resolve } from 'node:path';
import { createCanvas, loadImage, type Canvas } from '@napi-rs/canvas';

const __filename = resolve(import.meta.filename);

export default function generateImage(displayName: string, avatar: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, {
      workerData: { displayName, avatar }
    });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
    });
  })
}

if (!isMainThread) {
  function applyText(canvas: Canvas, text: string) {
    const context = canvas.getContext('2d');
    let fontSize = 70;

    do {
      context.font = `${fontSize -= 10}px sans-serif`;
    } while (context.measureText(text).width > canvas.width - 300);

    return context.font;
  }

  (async () => {
    const canvas = createCanvas(700, 250);
    const context = canvas.getContext('2d');

    context.strokeStyle = '#0099ff';
    context.strokeRect(0, 0, canvas.width, canvas.height);

    context.font = '28px sans-serif';
    context.fillStyle = '#ffffff';
    context.fillText('Profile', canvas.width / 2.5, canvas.height / 3.5);

    context.font = applyText(canvas, workerData.displayName);
    context.fillStyle = '#ffffff';
    context.fillText(workerData.displayName, canvas.width / 2.5, canvas.height / 1.8);

    context.beginPath();
    context.arc(125, 125, 100, 0, Math.PI * 2, true);
    context.closePath();
    context.clip();

    const avatar = await loadImage(workerData.avatar);

    context.drawImage(avatar, 25, 25, 200, 200);

    parentPort?.postMessage(await canvas.encode('png'));
  })()
}