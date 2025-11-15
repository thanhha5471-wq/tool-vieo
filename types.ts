
export interface Scene {
  STT_Phan_canh: number;
  Thoi_gian: string;
  Mo_ta_Kich_ban_Chi_tiet: string;
  Prompt_Tao_Anh: string;
  Prompt_Tao_Chuyen_dong: string;
  Prompt_Tao_Video_JSON: string;
}

export interface ScriptData {
  Tong_quan_Kich_ban: string;
  Bang_Phan_canh: Scene[];
}

// Mở rộng interface AIStudio để hỗ trợ aistudio
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}
