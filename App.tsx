
import React, { useState, useCallback } from 'react';
import { UploadedFile, GenerationResult, GeneratedImage } from './types';
import { generateTryOnImages } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import ResultCard from './components/ResultCard';
import ImageViewerModal from './components/ImageViewerModal';
import { DownloadIcon, RocketIcon } from './components/Icons';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const [modelFiles, setModelFiles] = useState<UploadedFile[]>([]);
  const [garmentFiles, setGarmentFiles] = useState<UploadedFile[]>([]);
  const [accessoryFiles, setAccessoryFiles] = useState<UploadedFile[]>([]);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [style, setStyle] = useState<string>('fashion');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedResult, setSelectedResult] = useState<GenerationResult | null>(null);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);


  const handleGenerate = async () => {
    if (modelFiles.length === 0 || garmentFiles.length === 0) {
      setError('Vui lòng tải lên ít nhất một ảnh nhân vật và một ảnh trang phục.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setResults([]);
    
    const newResults: GenerationResult[] = [];

    for (const modelFile of modelFiles) {
      for (const garmentFile of garmentFiles) {
        // Case 1: Accessories are provided. Generate combinations for each accessory.
        if (accessoryFiles.length > 0) {
          for (const accessoryFile of accessoryFiles) {
            try {
              const generatedImages = await generateTryOnImages(modelFile.file, garmentFile.file, accessoryFile.file, aspectRatio, style);
              const result: GenerationResult = {
                id: `${modelFile.id}-${garmentFile.id}-${accessoryFile.id}`,
                modelFile,
                garmentFile,
                accessoryFile,
                images: generatedImages,
              };
              newResults.push(result);
              setResults([...newResults]);
            } catch (err) {
              console.error('Error generating images with accessory:', err);
              setError('Đã xảy ra lỗi trong quá trình tạo ảnh. Vui lòng thử lại.');
              setIsLoading(false);
              return;
            }
          }
        } else {
          // Case 2: No accessories. Generate model + garment only.
          try {
            const generatedImages = await generateTryOnImages(modelFile.file, garmentFile.file, undefined, aspectRatio, style);
            const result: GenerationResult = {
              id: `${modelFile.id}-${garmentFile.id}`,
              modelFile,
              garmentFile,
              images: generatedImages,
            };
            newResults.push(result);
            setResults([...newResults]); // Update results progressively
          } catch (err) {
            console.error('Error generating images:', err);
            setError('Đã xảy ra lỗi trong quá trình tạo ảnh. Vui lòng thử lại.');
            setIsLoading(false);
            return;
          }
        }
      }
    }
    setIsLoading(false);
  };

  const downloadAllResults = useCallback(async () => {
    if (results.length === 0) return;

    for (const result of results) {
        const modelName = result.modelFile.file.name.split('.')[0];
        const garmentName = result.garmentFile.file.name.split('.')[0];
        const accessoryName = result.accessoryFile ? result.accessoryFile.file.name.split('.')[0] : '';
        
        const baseFilename = [modelName, garmentName, accessoryName].filter(Boolean).join('-');

        const downloadImage = async (url: string, filename: string) => {
            try {
                const response = await fetch(url);
                const blob = await response.blob();
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            } catch (e) {
                console.error(`Failed to download ${filename}:`, e);
            }
        };
        
        for (const image of result.images) {
            const safeDescription = image.description.replace(/\s/g, '_').toLowerCase();
            // Add a small delay between downloads to improve browser handling
            await new Promise(resolve => setTimeout(resolve, 300));
            await downloadImage(image.url, `${baseFilename}-${safeDescription}.png`);
        }
    }
  }, [results]);

  const handleViewImage = (result: GenerationResult, image: GeneratedImage) => {
    setSelectedResult(result);
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setSelectedResult(null);
      setSelectedImage(null);
  };


  return (
    <>
    <div className="min-h-screen text-gray-800 dark:text-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
            Trình Tạo Ảnh MIA (created by Nhiệm Trần)
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Tải ảnh, chọn phong cách, và xem kết quả kết hợp diệu kỳ!
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <ImageUploader
              title="Tải ảnh Nhân vật"
              files={modelFiles}
              onFilesChange={setModelFiles}
              id="models"
            />
            <ImageUploader
              title="Tải ảnh Trang phục"
              files={garmentFiles}
              onFilesChange={setGarmentFiles}
              id="garments"
            />
             <ImageUploader
              title="Tải ảnh Phụ kiện (Tùy chọn)"
              files={accessoryFiles}
              onFilesChange={setAccessoryFiles}
              id="accessories"
            />
            <div>
                <h3 className="text-xl font-semibold mb-3">Phong cách</h3>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setStyle('fashion')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                            style === 'fashion'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                    >
                        Phong cách Thời trang
                    </button>
                    <button
                        onClick={() => setStyle('teacher')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                            style === 'teacher'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                    >
                        Phong cách Cô giáo
                    </button>
                    <button
                        onClick={() => setStyle('work')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                            style === 'work'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                    >
                        Phong cách Đi làm
                    </button>
                </div>
            </div>
             <div>
                <h3 className="text-xl font-semibold mb-3">Tỉ lệ khung ảnh</h3>
                <div className="flex gap-2 flex-wrap">
                {['1:1', '3:4', '4:3', '9:16', '16:9'].map((ratio) => (
                    <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                        aspectRatio === ratio
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                    >
                    {ratio}
                    </button>
                ))}
                </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isLoading || modelFiles.length === 0 || garmentFiles.length === 0}
              className="w-full flex items-center justify-center gap-3 bg-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <RocketIcon />
                  Tạo ảnh
                </>
              )}
            </button>
            {error && <p className="text-red-500 text-center mt-4">{error}</p>}
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Kết quả</h2>
              {results.length > 0 && (
                <button
                    onClick={downloadAllResults}
                    className="flex items-center gap-2 bg-green-500 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-green-600 transition-colors duration-300"
                >
                    <DownloadIcon />
                    Tải tất cả
                </button>
              )}
            </div>
            <div className="h-[65vh] overflow-y-auto pr-2 space-y-6">
              {isLoading && results.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <Spinner size="lg" />
                  <p className="mt-4 text-lg">Đang khởi tạo phép màu...</p>
                </div>
              )}
              {!isLoading && results.length === 0 && (
                 <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 text-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <p className="text-lg font-medium">Khu vực hiển thị kết quả</p>
                    <p>Các hình ảnh được tạo sẽ xuất hiện ở đây.</p>
                </div>
              )}
              {results.map((result) => (
                <ResultCard key={result.id} result={result} onView={(image) => handleViewImage(result, image)} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
    {isModalOpen && selectedResult && selectedImage && (
        <ImageViewerModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            result={selectedResult}
            image={selectedImage}
        />
    )}
    </>
  );
};

export default App;