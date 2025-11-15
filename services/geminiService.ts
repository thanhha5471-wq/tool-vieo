import { ScriptData } from '../types';

export async function generateScriptFromIdea(
  idea: string,
  duration: string,
  style: string,
  aspectRatio: string
): Promise<ScriptData> {

  if (!process.env.FLOWLAB_TOKEN) {
    throw new Error("Thiếu FLOWLAB_TOKEN trong môi trường.");
  }

  if (!process.env.FLOWLAB_API_URL) {
    throw new Error("Thiếu FLOWLAB_API_URL trong môi trường.");
  }

  const token = process.env.FLOWLAB_TOKEN;
  const apiUrl = process.env.FLOWLAB_API_URL;

  const parsedDuration = parseInt(duration, 10) || 24;
  const numScenes = Math.ceil(parsedDuration / 8);

  const prompt = `
    Bạn là một "Chuyên gia Viết Kịch bản và Prompt cho AI Video". 
    Hãy tạo một kịch bản gồm đúng ${numScenes} phân cảnh...

    (⭐ GIỮ NGUYÊN phần prompt bạn đã viết — không thay đổi gì)
    
    Ý tưởng: ${idea}
    Thời lượng: ${duration}s
    Phong cách: ${style}
    Tỉ lệ khung hình: ${aspectRatio}
  `;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        input: {
          prompt: prompt
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Flow Lab API lỗi: ${response.status}`);
    }

    const data = await response.json();

    // Flow Lab thường trả về trong output
    const rawText = data.output?.text || data.output || "";

    const parsedData = JSON.parse(rawText);

    return parsedData as ScriptData;

  } catch (err) {
    console.error("Error calling Flow Lab:", err);
    throw new Error("Không thể tạo kịch bản từ Flow Lab API.");
  }
}
