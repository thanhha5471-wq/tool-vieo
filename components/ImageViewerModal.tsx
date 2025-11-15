
import React from 'react';
import { GenerationResult, GeneratedImage } from '../types';
import { CloseIcon } from './Icons';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: GenerationResult;
  image: GeneratedImage;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ isOpen, onClose, result, image }) => {
  if (!isOpen) return null;

  const { modelFile, garmentFile, accessoryFile } = result;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto relative animate-fade-in-up flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors z-10"
          aria-label="Đóng"
        >
          <CloseIcon />
        </button>
        <div className="text-center mb-4 flex-shrink-0">
            <p className="text-sm text-gray-600 dark:text-gray-300 truncate"><strong>Nhân vật:</strong> {modelFile.file.name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 truncate"><strong>Trang phục:</strong> {garmentFile.file.name}</p>
            {accessoryFile && (
              <p className="text-sm text-gray-600 dark:text-gray-300 truncate"><strong>Phụ kiện:</strong> {accessoryFile.file.name}</p>
            )}
        </div>
        <div className="flex-grow flex justify-center items-center min-h-0">
            <div className="text-center">
                <h3 className="text-xl font-bold mb-3">{image.description}</h3>
                <img 
                    src={image.url} 
                    alt={image.description} 
                    className="w-full h-auto object-contain rounded-md"
                    style={{ maxHeight: '75vh' }}
                />
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImageViewerModal;
