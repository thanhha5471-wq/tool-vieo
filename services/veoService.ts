
import { GoogleGenAI } from "@google/genai";

// Hàm helper để khởi tạo client với key được truyền vào
const getAiClient = (apiKey: string) => {
  if (!apiKey) {
    throw new Error("Thiếu API Key. Vui lòng nhập API Key.");
  }
  return new GoogleGenAI({ apiKey: apiKey });
};

export async function generateVideoFromText(prompt: string, apiKey: string) {
  const ai = getAiClient(apiKey);
  
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    return operation;
  } catch (error) {
    console.error("Veo generation error:", error);
    throw error;
  }
}

export async function generateVideoFromImage(imageBase64: string, mimeType: string, apiKey: string, prompt?: string) {
  const ai = getAiClient(apiKey);

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || "Animate this image",
      image: {
        imageBytes: imageBase64,
        mimeType: mimeType,
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    return operation;
  } catch (error) {
    console.error("Veo image generation error:", error);
    throw error;
  }
}

export async function pollForVideoCompletion(initialOperation: any, apiKey: string) {
  const ai = getAiClient(apiKey);
  let operation = initialOperation;

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Đợi 5 giây
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  return operation;
}

export async function downloadVideo(uri: string, apiKey: string) {
   if (!apiKey) {
    throw new Error("Thiếu API Key");
  }
  // Append key vào URL để fetch
  const response = await fetch(`${uri}&key=${apiKey}`);
  if (!response.ok) {
      throw new Error("Không thể tải video xuống.");
  }
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
