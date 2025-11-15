
export interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
}

export interface GeneratedImage {
  url: string;
  description: string;
}

export interface GenerationResult {
  id: string;
  modelFile: UploadedFile;
  garmentFile: UploadedFile;
  accessoryFile?: UploadedFile;
  images: GeneratedImage[];
}
