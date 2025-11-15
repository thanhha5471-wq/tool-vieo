import React, { useCallback } from 'react';
import { UploadedFile } from '../types';
import { UploadIcon, TrashIcon } from './Icons';

interface ImageUploaderProps {
  title: string;
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  id: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ title, files, onFilesChange, id }) => {

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      // FIX: Explicitly type the 'file' parameter in the map function as 'File' to resolve type inference issues.
      const newFiles: UploadedFile[] = Array.from(selectedFiles).map((file: File) => ({
        id: `${file.name}-${file.lastModified}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      onFilesChange([...files, ...newFiles]);
    }
  };

  const removeFile = useCallback((fileId: string) => {
    const fileToRemove = files.find(f => f.id === fileId);
    if(fileToRemove) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
    }
    onFilesChange(files.filter((file) => file.id !== fileId));
  }, [files, onFilesChange]);

  return (
    <div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
        <label htmlFor={`file-upload-${id}`} className="cursor-pointer flex flex-col items-center text-gray-500 dark:text-gray-400">
          <UploadIcon />
          <span className="mt-2 text-sm font-medium">Chọn hoặc kéo thả tệp</span>
          <p className="text-xs">PNG, JPG, WEBP</p>
        </label>
        <input
          id={`file-upload-${id}`}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {files.map((uploadedFile) => (
            <div key={uploadedFile.id} className="relative group aspect-square">
              <img
                src={uploadedFile.previewUrl}
                alt={uploadedFile.file.name}
                className="w-full h-full object-cover rounded-md shadow-sm"
              />
              <button
                onClick={() => removeFile(uploadedFile.id)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                aria-label="Xóa ảnh"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
