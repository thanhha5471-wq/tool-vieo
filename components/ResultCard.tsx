
import React, { useCallback } from 'react';
import { GenerationResult, GeneratedImage } from '../types';
import { DownloadIcon, EyeIcon } from './Icons';

declare const JSZip: any;

interface ResultCardProps {
  result: GenerationResult;
  onView: (image: GeneratedImage) => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onView }) => {
    const modelName = result.modelFile.file.name.split('.')[0];
    const garmentName = result.garmentFile.file.name.split('.')[0];
    
    const downloadSingleResult = useCallback(async () => {
        const zip = new JSZip();
        
        for (const image of result.images) {
            try {
                const response = await fetch(image.url);
                const blob = await response.blob();
                const safeDescription = image.description.replace(/\s/g, '_').toLowerCase();
                zip.file(`${modelName}-${garmentName}-${safeDescription}.png`, blob);
            } catch (e) {
                console.error(`Failed to fetch or add image ${image.description} to zip:`, e);
            }
        }

        zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `${modelName}-${garmentName}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }, [result, modelName, garmentName]);

  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-md animate-fade-in">
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-3 truncate">
            <p><strong>Nhân vật:</strong> {result.modelFile.file.name}</p>
            <p><strong>Trang phục:</strong> {result.garmentFile.file.name}</p>
            {result.accessoryFile && (
                <p><strong>Phụ kiện:</strong> {result.accessoryFile.file.name}</p>
            )}
        </div>
      <div className="grid grid-cols-2 gap-4">
        {result.images.map((image, index) => (
            <div key={index} className="relative group text-center">
                <img src={image.url} alt={image.description} className="w-full h-auto object-cover rounded-md aspect-square" />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity flex items-center justify-center rounded-md">
                    <button 
                        onClick={() => onView(image)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-white/30"
                    >
                        <EyeIcon />
                        Xem
                    </button>
                </div>
                <p className="mt-2 text-sm font-semibold">{image.description}</p>
            </div>
        ))}
      </div>
      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <button 
            onClick={downloadSingleResult}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-blue-600 transition-colors duration-300"
            >
            <DownloadIcon />
            Tải xuống (.zip)
        </button>
      </div>
    </div>
  );
};

export default ResultCard;
