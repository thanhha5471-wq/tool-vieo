import { GoogleGenAI, Modality } from "@google/genai";
import { GeneratedImage } from '../types';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove "data:image/jpeg;base64,"
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });

export const generateTryOnImages = async (
    modelFile: File, 
    garmentFile: File, 
    accessoryFile: File | undefined, 
    aspectRatio: string,
    style: string
): Promise<GeneratedImage[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const modelFileBase64 = await fileToBase64(modelFile);
  const garmentFileBase64 = await fileToBase64(garmentFile);

  const modelImagePart = {
    inlineData: {
      data: modelFileBase64,
      mimeType: modelFile.type,
    },
  };
  
  const garmentImagePart = {
    inlineData: {
      data: garmentFileBase64,
      mimeType: garmentFile.type,
    },
  };

  const parts = [modelImagePart, garmentImagePart];

  if (accessoryFile) {
    const accessoryFileBase64 = await fileToBase64(accessoryFile);
    parts.push({
      inlineData: {
        data: accessoryFileBase64,
        mimeType: accessoryFile.type,
      },
    });
  }

  const generateImage = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          ...parts,
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in response");
  };
  
  const accessoryText = accessoryFile ? "Đồng thời, kết hợp phụ kiện từ ảnh thứ ba một cách tự nhiên." : "";
  const ratioText = `Tạo hình ảnh với tỷ lệ khung hình ${aspectRatio}.`;
  
  if (style === 'teacher') {
    const prompts = [
        {
            prompt: `Tạo một bức ảnh chân dung của người trong ảnh đầu tiên (cô giáo) mặc trang phục từ ảnh thứ hai. Cô giáo đang đứng một mình giữa một cánh đồng hoa rực rỡ. Hậu cảnh cánh đồng hoa phía sau được xóa phông với hiệu ứng bokeh đẹp mắt, làm nổi bật cô giáo. ${accessoryText} ${ratioText}`,
            description: "Chân dung nền hoa bokeh"
        },
        {
            prompt: `Tạo một bức ảnh chân thực trong đó người từ ảnh đầu tiên (cô giáo) mặc trang phục từ ảnh thứ hai, đang ngồi trên một chiếc ghế đá trong sân trường. Xung quanh cô là các em học sinh đang vui vẻ tặng hoa cho cô. ${accessoryText} ${ratioText}`,
            description: "Học sinh tặng hoa"
        },
        {
            prompt: `Tạo một bức ảnh trong đó người từ ảnh đầu tiên (cô giáo) mặc trang phục từ ảnh thứ hai, đang đứng giữa sân trường rợp bóng hoa phượng đỏ. Cô giáo nắm tay các em học sinh, tạo thành một vòng tròn ấm cúng. ${accessoryText} ${ratioText}`,
            description: "Sân trường hoa phượng"
        },
        {
            prompt: `Tạo một bức ảnh đầy chất thơ: người từ ảnh đầu tiên (cô giáo) mặc trang phục từ ảnh thứ hai, đang ngồi ở trung tâm trên một bãi cỏ xanh mướt. Các em học sinh ngồi thành vòng tròn xung quanh cô. Những cánh hoa anh đào trắng đang nhẹ nhàng rơi xuống, tạo nên một khung cảnh huyền ảo. ${accessoryText} ${ratioText}`,
            description: "Vòng tròn hoa anh đào"
        }
    ];

    const imagePromises = prompts.map(p => generateImage(p.prompt));
    const imageUrls = await Promise.all(imagePromises);

    return imageUrls.map((url, index) => ({
        url,
        description: prompts[index].description,
    }));

  } else if (style === 'work') {
    const prompts = [
        {
            prompt: `Tạo một bức ảnh chuyên nghiệp, người trong ảnh đầu tiên mặc trang phục từ ảnh thứ hai, đang đứng tự tin trong một không gian văn phòng hiện đại và sáng sủa. ${accessoryText} ${ratioText}`,
            description: "Đứng trong văn phòng"
        },
        {
            prompt: `Tạo một bức ảnh người trong ảnh đầu tiên mặc trang phục từ ảnh thứ hai, đang đứng ở sảnh của một tòa nhà công ty sang trọng. Hậu cảnh là quầy lễ tân và có thể thấy logo công ty. ${accessoryText} ${ratioText}`,
            description: "Sảnh tòa nhà công ty"
        },
        {
            prompt: `Tạo một bức ảnh người trong ảnh đầu tiên mặc trang phục từ ảnh thứ hai, đang ngồi tại bàn làm việc của mình. Bàn làm việc gọn gàng, có máy tính xách tay và một vài vật dụng văn phòng, trông rất chuyên nghiệp. ${accessoryText} ${ratioText}`,
            description: "Ngồi tại bàn làm việc"
        },
        {
            prompt: `Tạo một bức ảnh người trong ảnh đầu tiên mặc trang phục từ ảnh thứ hai, đang đứng thuyết trình trước một màn hình chiếu lớn trong phòng họp. Phía dưới là các nhân viên khác đang ngồi quanh bàn họp và chăm chú lắng nghe. ${accessoryText} ${ratioText}`,
            description: "Thuyết trình trong phòng họp"
        }
    ];

    const imagePromises = prompts.map(p => generateImage(p.prompt));
    const imageUrls = await Promise.all(imagePromises);

    return imageUrls.map((url, index) => ({
        url,
        description: prompts[index].description,
    }));

  } else { // 'fashion' style (default)
    const prompts = [
        {
            prompt: `Tạo một bức ảnh thời trang toàn thân, người trong ảnh đầu tiên mặc trang phục từ ảnh thứ hai, đang đi dạo trong một công viên xanh mát với nhiều cây cối và ánh nắng nhẹ. ${accessoryText} ${ratioText}`,
            description: "Dạo phố công viên"
        },
        {
            prompt: `Tạo một bức ảnh thời trang đường phố, người trong ảnh đầu tiên mặc trang phục từ ảnh thứ hai, đang tự tin sải bước trên một con phố đông đúc của thành phố. ${accessoryText} ${ratioText}`,
            description: "Thời trang đường phố"
        },
        {
            prompt: `Tạo một bức ảnh thanh lịch, người trong ảnh đầu tiên mặc trang phục từ ảnh thứ hai, đang ở trong một không gian sang trọng như sảnh khách sạn 5 sao hoặc một buổi tiệc tối cao cấp. ${accessoryText} ${ratioText}`,
            description: "Không gian sang trọng"
        },
        {
            prompt: `Tạo một bức ảnh nghệ thuật, người trong ảnh đầu tiên mặc trang phục từ ảnh thứ hai, đang tạo dáng trong một không gian mang phong cách hoài cổ, như một quán cà phê vintage hoặc một con hẻm cổ kính với tường gạch cũ. ${accessoryText} ${ratioText}`,
            description: "Không gian hoài cổ"
        }
    ];
    
    const imagePromises = prompts.map(p => generateImage(p.prompt));
    const imageUrls = await Promise.all(imagePromises);

    return imageUrls.map((url, index) => ({
        url,
        description: prompts[index].description,
    }));
  }
};