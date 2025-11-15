import { GoogleGenAI, Type } from "@google/genai";
import { ScriptData } from '../types';

export async function generateScriptFromIdea(idea: string, duration: string, style: string, aspectRatio: string): Promise<ScriptData> {
  if (!process.env.API_KEY) {
    throw new Error("Biến môi trường API_KEY chưa được thiết lập");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const model = "gemini-2.5-flash";
  
  const parsedDuration = parseInt(duration, 10) || 24; // Mặc định là 24 giây nếu không hợp lệ
  const numScenes = Math.ceil(parsedDuration / 8);

  const prompt = `
    Bạn là một "Chuyên gia Viết Kịch bản và Prompt cho AI Video".
    Nhiệm vụ của bạn là nhận ý tưởng của người dùng, phân tích và chia thành các phân cảnh, sau đó tạo ra các prompt tối ưu cho từng phân cảnh.

    **Yêu cầu của người dùng:**
    *   **Ý tưởng**: "${idea}"
    *   **Tổng thời lượng mong muốn**: khoảng ${duration} giây.
    *   **Phong cách**: ${style}
    *   **Tỉ lệ khung hình**: ${aspectRatio}

    **Hướng dẫn thực hiện:**
    1.  Tạo ra một kịch bản có chính xác **${numScenes}** phân cảnh.
    2.  Mỗi phân cảnh phải có thời lượng là "8 giây".
    3.  Toàn bộ kịch bản và các prompt phải thống nhất và phản ánh rõ ràng phong cách **"${style}"**.
    4.  Mọi mô tả về góc quay, bố cục trong "Mo_ta_Kich_ban_Chi_tiet" và các prompt phải được tối ưu hóa cho tỉ lệ khung hình **"${aspectRatio}"**.
    5.  **QUAN TRỌNG (HỘI THOẠI)**: Nếu trong kịch bản có câu thoại tiếng Việt, khi chuyển nó vào các prompt tiếng Anh, bạn phải **GIỮ NGUYÊN câu thoại tiếng Việt đó và đặt nó trong dấu ngoặc kép ("")**.
    6.  **QUAN TRỌNG (GIỌNG NÓI)**: Nếu một nhân vật có thoại trong nhiều phân cảnh, hãy đảm bảo mô tả về giọng nói của nhân vật đó (ví dụ: a deep male voice says "...", a gentle female voice whispers "...") phải được giữ **giống hệt nhau** trong tất cả các prompt liên quan để đảm bảo tính nhất quán.

    **Định dạng đầu ra:**
    Hãy tạo ra một kịch bản chi tiết dựa trên các tiêu chuẩn sau và trả về dưới dạng một đối tượng JSON duy nhất.

    1.  **Tổng quan Kịch bản**: Tóm tắt ngắn gọn cốt truyện bằng tiếng Việt, phù hợp với phong cách đã chọn.
    2.  **Bảng Phân cảnh**: Trình bày dưới dạng một mảng các đối tượng JSON, với mỗi đối tượng đại diện cho một phân cảnh. Mỗi cảnh phải có 6 thuộc tính sau:
        *   **STT_Phan_canh**: Số thứ tự cảnh (bắt đầu từ 1).
        *   **Thoi_gian**: Luôn là "8 giây".
        *   **Mo_ta_Kich_ban_Chi_tiet**: Mô tả hành động, bối cảnh, ánh sáng, góc quay bằng TIẾNG VIỆT. Mô tả này phải thể hiện được phong cách **"${style}"** và phù hợp với tỉ lệ khung hình **"${aspectRatio}"**.
        *   **Prompt_Tao_Anh**: Prompt chi tiết bằng TIẾNG ANH. Prompt này phải được tối ưu hóa cao để tạo ra hình ảnh chất lượng cao và **phải bao gồm các từ khóa đặc trưng cho phong cách "${style}"** và tỉ lệ khung hình (ví dụ: --ar ${aspectRatio.split(' ')[0]}). Ví dụ: 8K, cinematic, hyper-realistic, photorealistic, Unreal Engine 5 render, dramatic lighting, vivid colors, sharp focus, octane render, và chỉ định chi tiết máy ảnh (ví dụ: wide-angle shot, close-up, shot on Arri Alexa with 85mm lens). Nếu có lời thoại, hãy tuân thủ quy tắc về hội thoại và giọng nói.
        *   **Prompt_Tao_Chuyen_dong**: Prompt riêng biệt bằng TIẾNG ANH, mô tả chính xác chuyển động và hiệu ứng. Ví dụ: slow pan right, subtle zoom in, a character with a deep, commanding voice says "Xin chào", lens flare effect. Nếu có lời thoại, hãy tuân thủ quy tắc về hội thoại và giọng nói.
        *   **Prompt_Tao_Video_JSON**: Một chuỗi JSON (JSON string) chứa một đối tượng. Đối tượng này có một key là "prompt". Giá trị của "prompt" là một câu lệnh TIẾNG ANH hoàn chỉnh để tạo video, kết hợp tinh túy của "Prompt_Tao_Anh" và "Prompt_Tao_Chuyen_dong". Ví dụ: '{"prompt": "Cinematic shot of an astronaut discovering an ancient alien artifact, the camera slowly panning right. A deep, commanding voice says, \\"Nó thật đẹp\\", 8K, hyper-realistic, dramatic lighting, aspect ratio ${aspectRatio.split(' ')[0]}."}'. Nếu có lời thoại, hãy tuân thủ quy tắc về hội thoại và giọng nói.

    Toàn bộ đầu ra phải tuân thủ nghiêm ngặt schema JSON đã được cung cấp.
    `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            Tong_quan_Kich_ban: {
              type: Type.STRING,
              description: "Tóm tắt ngắn gọn cốt truyện bằng tiếng Việt."
            },
            Bang_Phan_canh: {
              type: Type.ARRAY,
              description: "Một danh sách các phân cảnh cho video.",
              items: {
                type: Type.OBJECT,
                properties: {
                  STT_Phan_canh: {
                    type: Type.INTEGER,
                    description: "Số thứ tự của phân cảnh."
                  },
                  Thoi_gian: {
                    type: Type.STRING,
                    description: "Thời lượng của phân cảnh, cố định là '8 giây'."
                  },
                  Mo_ta_Kich_ban_Chi_tiet: {
                    type: Type.STRING,
                    description: "Mô tả chi tiết kịch bản bằng tiếng Việt."
                  },
                  Prompt_Tao_Anh: {
                    type: Type.STRING,
                    description: "Prompt tạo ảnh bằng tiếng Anh. Phải giữ nguyên lời thoại tiếng Việt trong dấu ngoặc kép và đảm bảo giọng nói nhất quán."
                  },
                  Prompt_Tao_Chuyen_dong: {
                    type: Type.STRING,
                    description: "Prompt tạo chuyển động video bằng tiếng Anh. Phải giữ nguyên lời thoại tiếng Việt trong dấu ngoặc kép và đảm bảo giọng nói nhất quán."
                  },
                  Prompt_Tao_Video_JSON: {
                    type: Type.STRING,
                    description: "Một chuỗi JSON chứa prompt để tạo video cho Veo 3.1. Phải giữ nguyên lời thoại tiếng Việt trong dấu ngoặc kép và đảm bảo giọng nói nhất quán."
                  }
                },
                 required: ["STT_Phan_canh", "Thoi_gian", "Mo_ta_Kich_ban_Chi_tiet", "Prompt_Tao_Anh", "Prompt_Tao_Chuyen_dong", "Prompt_Tao_Video_JSON"]
              }
            }
          },
          required: ["Tong_quan_Kich_ban", "Bang_Phan_canh"]
        }
      }
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);
    return parsedData as ScriptData;

  } catch (error) {
    console.error("Error generating script:", error);
    throw new Error("Không thể tạo kịch bản từ Gemini API. Vui lòng kiểm tra API key và kết nối mạng của bạn.");
  }
}