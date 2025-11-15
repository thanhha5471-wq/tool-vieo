import React, { useState, useEffect } from 'react';
import ApiKeyManager from './ApiKeyManager';
import { generateVideoFromText, generateVideoFromImage, pollForVideoCompletion, downloadVideo } from '../services/veoService';
import { fileToBase64 } from '../utils/fileUtils';

interface VideoGeneratorProps {
  initialPrompt?: string;
}

type GenMethod = 'api' | 'web';

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ initialPrompt }) => {
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // State mới
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [genMethod, setGenMethod] = useState<GenMethod>('web'); // Mặc định là web theo yêu cầu mới

  useEffect(() => {
    if (initialPrompt) {
        setPrompt(initialPrompt);
        try {
            const parsed = JSON.parse(initialPrompt);
            if (parsed.prompt) {
                setPrompt(parsed.prompt);
            }
        } catch (e) {
            // Không phải JSON, giữ nguyên
        }
    }
  }, [initialPrompt]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setMode('image');
    }
  };

  // Xử lý upload video kết quả (cho chế độ Web)
  const handleResultVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const url = URL.createObjectURL(file);
          setVideoUrl(url);
          setError(null);
      }
  };

  // Xử lý mở Google Labs
  const handleOpenLabs = () => {
      const targetUrl = 'https://labs.google/fx/vi/tools/flow/project';
      
      if (prompt) {
          // 1. Copy vào Clipboard (Cơ chế tin cậy nhất để chuyển nội dung)
          navigator.clipboard.writeText(prompt).then(() => {
              setStatusMessage('✅ Đã copy prompt! Đang mở Google Labs...');
              
              // 2. Tạo URL có kèm prompt (Best effort - phòng trường hợp Labs hỗ trợ nhận qua URL)
              const encodedPrompt = encodeURIComponent(prompt);
              const fullUrl = `${targetUrl}?prompt=${encodedPrompt}`;
              
              // 3. Mở trang
              window.open(fullUrl, '_blank');

              // 4. Nhắc người dùng dán
              setTimeout(() => setStatusMessage('💡 Mẹo: Nhấn Ctrl+V (hoặc chuột phải > Dán) vào ô nhập liệu bên Google Labs!'), 1500);
          }).catch(() => {
              // Fallback nếu copy lỗi
              window.open(targetUrl, '_blank');
              setStatusMessage('Không thể tự động copy. Vui lòng copy thủ công.');
          });
      } else {
          window.open(targetUrl, '_blank');
      }
  };

  const handleGenerateApi = async () => {
    if (!apiKey) {
        setError("Vui lòng nhập và lưu API Key trước.");
        return;
    }
    if (!prompt && !selectedImage) {
        setError("Vui lòng nhập nội dung mô tả hoặc chọn ảnh.");
        return;
    }

    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    setStatusMessage('Đang gửi yêu cầu đến máy chủ Veo...');

    try {
      let operation;

      if (mode === 'image' && selectedImage) {
        const base64Data = await fileToBase64(selectedImage);
        operation = await generateVideoFromImage(base64Data, selectedImage.type, apiKey, prompt);
      } else {
        operation = await generateVideoFromText(prompt, apiKey);
      }

      setStatusMessage('Đang tạo video... (Quá trình này có thể mất vài phút)');
      
      const completedOperation = await pollForVideoCompletion(operation, apiKey);
      
      if (completedOperation.error) {
          throw completedOperation.error;
      }

      const videoUri = completedOperation.response?.generatedVideos?.[0]?.video?.uri;
      if (videoUri) {
          setStatusMessage('Đang tải video xuống...');
          const url = await downloadVideo(videoUri, apiKey);
          setVideoUrl(url);
          setStatusMessage('Hoàn tất!');
      } else {
          throw new Error("Không tìm thấy đường dẫn video trong phản hồi.");
      }

    } catch (err: any) {
      console.error("Video Generation Error:", err);
      
      let errorMessage = "Có lỗi xảy ra trong quá trình tạo video.";
      let isKeyError = false;
      const apiError = err.error || err; 

      if (apiError) {
        const code = apiError.code || apiError.status;
        const msg = apiError.message || '';
        
        if (code === 404 || code === 'NOT_FOUND' || msg.includes('NOT_FOUND') || msg.includes('Requested entity was not found')) {
           errorMessage = "Lỗi 404: Model Veo không khả dụng với API Key này.";
           isKeyError = true;
        } else if (code === 403 || code === 'PERMISSION_DENIED') {
           errorMessage = "Lỗi 403: API Key bị từ chối quyền truy cập.";
           isKeyError = true;
        } else if (msg) {
            errorMessage = `Lỗi API: ${msg}`;
        }
      }

      if (isKeyError) {
          errorMessage += " (Hãy kiểm tra lại Key hoặc dùng chế độ Google Labs)";
      }

      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">
          Veo 3.1 Video Generator
        </h2>
        <p className="text-gray-400">Tạo video chất lượng cao từ văn bản và hình ảnh</p>
      </div>

      {/* Method Selection */}
      <div className="flex justify-center space-x-4 mb-6">
          <button
              onClick={() => setGenMethod('web')}
              className={`px-4 py-2 rounded-md font-bold transition-all ${
                  genMethod === 'web' 
                  ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400' 
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
          >
              🌍 Dùng Google Labs (Miễn phí)
          </button>
          <button
              onClick={() => setGenMethod('api')}
              className={`px-4 py-2 rounded-md font-bold transition-all ${
                  genMethod === 'api' 
                  ? 'bg-orange-600 text-white shadow-lg ring-2 ring-orange-400' 
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
          >
              🔑 Dùng Veo API (Cần Key)
          </button>
      </div>

      {/* API Key Manager (Only show if API method selected) */}
      {genMethod === 'api' && (
          <ApiKeyManager onKeyUpdate={(key) => setApiKey(key)} />
      )}

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-xl space-y-6">
            
            {/* Mode Selection Tabs */}
            <div className="flex space-x-4 border-b border-gray-700 pb-2">
                <button 
                    onClick={() => setMode('text')}
                    className={`pb-2 font-bold px-4 transition-colors ${mode === 'text' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Từ Văn Bản (Text-to-Video)
                </button>
                <button 
                    onClick={() => setMode('image')}
                    className={`pb-2 font-bold px-4 transition-colors ${mode === 'image' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Từ Hình Ảnh (Image-to-Video)
                </button>
            </div>

            {/* Image Input Area */}
            {mode === 'image' && (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Hình ảnh tham chiếu (Bắt buộc)</label>
                    <div className="flex items-start space-x-4">
                        <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                <p className="text-xs text-gray-400">Chọn ảnh</p>
                            </div>
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                        {imagePreview && (
                            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-600">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                                    className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-bl-md text-xs hover:bg-red-700"
                                >
                                    X
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Prompt Input Area */}
            <div className="space-y-2">
                <label htmlFor="videoPrompt" className="block text-sm font-medium text-gray-300">
                    {mode === 'text' ? 'Mô tả video bạn muốn tạo (Tiếng Anh)' : 'Mô tả chuyển động cho ảnh (Tiếng Anh)'}
                </label>
                <textarea
                    id="videoPrompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder={mode === 'text' ? "A cinematic drone shot of a futuristic city..." : "Slow zoom in, cinematic lighting..."}
                />
            </div>

            {/* Action Buttons based on Method */}
            {genMethod === 'api' ? (
                <button
                    onClick={handleGenerateApi}
                    disabled={isGenerating || !apiKey}
                    className={`w-full py-4 rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-[1.01]
                        ${isGenerating 
                            ? 'bg-gray-600 cursor-wait text-gray-400' 
                            : 'bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 text-white'
                        }
                    `}
                >
                    {isGenerating ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {statusMessage}
                        </span>
                    ) : (
                        '🚀 Tạo Video (API)'
                    )}
                </button>
            ) : (
                <div className="space-y-4">
                     <button
                        onClick={handleOpenLabs}
                        className="w-full py-4 rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-[1.01] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center gap-2"
                    >
                        <span>📋 Tự động Copy & Mở Dự Án Mới</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </button>
                    {statusMessage && <p className="text-green-400 text-center text-sm font-semibold animate-pulse">{statusMessage}</p>}
                    
                    <div className="pt-4 border-t border-gray-700">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Đã tạo xong? Tải video kết quả lên đây để lưu vào ứng dụng:
                        </label>
                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors">
                            <div className="flex flex-col items-center justify-center">
                                <svg className="w-8 h-8 mb-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                <p className="text-sm text-gray-300">Nhấn để tải video lên (.mp4)</p>
                            </div>
                            <input type="file" accept="video/*" className="hidden" onChange={handleResultVideoUpload} />
                        </label>
                    </div>
                </div>
            )}
            
            {error && (
                <div className="bg-red-900/50 text-red-200 p-4 rounded-md border border-red-700">
                    ⚠️ {error}
                </div>
            )}
        </div>

        {/* Result Area */}
        {videoUrl && (
            <div className="mt-8 bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-2xl">
                <h3 className="text-xl font-bold mb-4 text-green-400">🎉 Video của bạn</h3>
                <video 
                    controls 
                    autoPlay 
                    loop 
                    className="w-full rounded-lg border border-gray-600 bg-black aspect-video"
                    src={videoUrl}
                >
                    Trình duyệt của bạn không hỗ trợ thẻ video.
                </video>
                <div className="mt-4 flex justify-end">
                    <a 
                        href={videoUrl} 
                        download="my_video.mp4"
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Tải xuống máy
                    </a>
                </div>
            </div>
        )}
    </div>
  );
};

export default VideoGenerator;