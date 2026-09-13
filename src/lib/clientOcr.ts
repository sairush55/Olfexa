"use client";

/**
 * OLFEXA Client-Side Vision & OCR Preprocessor
 * Runs directly in the browser via HTML5 Canvas and WebAssembly.
 * Eliminates serverless timeouts, bypasses payload limits, and delivers real-time progress.
 */

export interface PreprocessedImageResult {
  blob: Blob;
  dataUrl: string;
  originalWidth: number;
  originalHeight: number;
  processedWidth: number;
  processedHeight: number;
}

/**
 * Preprocesses an image using an HTML5 canvas:
 * 1. Downscales excessively large smartphone photos (e.g. 12MP down to ~1800px)
 * 2. Converts to high-contrast grayscale to eliminate bottle glare and color noise
 * 3. Applies histogram contrast stretching so faint metallic/fine print text is crisp
 */
export async function preprocessImageForOcr(
  fileOrBlob: Blob,
  maxDimension: number = 1800
): Promise<PreprocessedImageResult> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      return reject(new Error("Canvas preprocessing requires a browser environment"));
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(fileOrBlob);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const originalWidth = img.naturalWidth || img.width;
      const originalHeight = img.naturalHeight || img.height;

      // Calculate scaled dimensions
      let width = originalWidth;
      let height = originalHeight;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (!ctx) {
        return reject(new Error("Could not initialize 2D canvas context"));
      }

      // Draw downscaled image
      ctx.drawImage(img, 0, 0, width, height);

      // Extract raw pixel data for contrast enhancement
      try {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Pass 1: Compute min & max luminance for contrast stretching
        let minLum = 255;
        let maxLum = 0;

        for (let i = 0; i < data.length; i += 4) {
          // Standard ITU-R BT.601 luma conversion
          const lum = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
          if (lum < minLum) minLum = lum;
          if (lum > maxLum) maxLum = lum;
        }

        const lumRange = maxLum - minLum;

        // Pass 2: Contrast stretch & grayscale
        if (lumRange > 20) {
          for (let i = 0; i < data.length; i += 4) {
            const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            // Normalize and stretch to [0, 255]
            let stretched = ((lum - minLum) / lumRange) * 255;

            // Apply slight S-curve for punchier character edges
            if (stretched < 128) {
              stretched = Math.max(0, stretched - 15);
            } else {
              stretched = Math.min(255, stretched + 15);
            }

            data[i] = stretched;
            data[i + 1] = stretched;
            data[i + 2] = stretched;
            // keep alpha unchanged
          }
          ctx.putImageData(imageData, 0, 0);
        }
      } catch (canvasErr) {
        console.warn("Canvas pixel processing warning (falling back to standard draw):", canvasErr);
      }

      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return reject(new Error("Canvas blob conversion failed"));
          }
          resolve({
            blob,
            dataUrl,
            originalWidth,
            originalHeight,
            processedWidth: width,
            processedHeight: height,
          });
        },
        "image/jpeg",
        0.9
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image into memory for processing"));
    };

    img.src = objectUrl;
  });
}

export type OcrProgressCallback = (stepDescription: string, percent: number) => void;

/**
 * Executes high-precision OCR directly in the browser using WebAssembly.
 * Supports real-time progress callbacks for seamless UX.
 */
export async function runBrowserOcr(
  imageBlobOrUrl: Blob | string,
  onProgress?: OcrProgressCallback
): Promise<{ rawText: string; confidence: number }> {
  if (typeof window === "undefined") {
    throw new Error("runBrowserOcr can only run in the browser");
  }

  onProgress?.("Loading OCR Engine...", 10);

  // Dynamic import keeps Tesseract out of the initial page load bundle
  const { createWorker } = await import("tesseract.js");

  let worker: any = null;
  try {
    worker = await createWorker("eng", 1, {
      logger: (m: any) => {
        if (!onProgress) return;
        const progress = Math.min(100, Math.max(0, Math.round((m.progress || 0) * 100)));

        if (m.status === "recognizing text") {
          onProgress("Reading packaging typography...", 40 + Math.round(progress * 0.55));
        } else if (m.status === "loading language traineddata") {
          onProgress("Downloading dictionary models...", 15 + Math.round(progress * 0.2));
        } else if (m.status === "initializing api") {
          onProgress("Calibrating optical filters...", 35);
        } else if (m.status) {
          onProgress(m.status, 25);
        }
      },
    });

    onProgress?.("Scanning cosmetic ingredients...", 45);
    const result = await worker.recognize(imageBlobOrUrl);

    const rawText = result?.data?.text || "";
    const confidence = Math.round(result?.data?.confidence || 0) / 100;

    onProgress?.("Extraction complete!", 100);
    return { rawText, confidence };
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        // silent
      }
    }
  }
}
