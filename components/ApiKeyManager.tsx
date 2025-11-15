
import React, { useState, useEffect } from 'react';

interface ApiKeyManagerProps {
  onKeyUpdate: (key: string | null) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onKeyUpdate }) => {
  const [inputKey, setInputKey] = useState('');
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    // Kiểm tra localStorage khi load
    const storedKey = localStorage.getItem('veo_api_key');
    if (storedKey) {
      setSavedKey(storedKey);
      onKeyUpdate(storedKey);
    }
  }, [onKeyUpdate]);

  const handleSaveKey = () => {
    if (inputKey.trim()) {
      localStorage.setItem('veo_api_key', inputKey.trim());
      setSavedKey(inputKey.trim());
      onKeyUpdate(inputKey.trim());
      setInputKey('');
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem('veo_api_key');
    setSavedKey(null);
    onKeyUpdate(null);
  };

  if (savedKey) {
    return (
      <div className="bg-green-900/30 border border-green-600 text-green-300 p-4 rounded-lg mb-6 flex justify-between items-center animate-fade-in">
        <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Đã nhập API Key. Sẵn sàng tạo video.</span>
        </div>
        <button 
            onClick={handleClearKey}
            className="text-sm bg-green-800 hover:bg-green-700 px-3 py-1 rounded transition-colors text-green-100 border border-green-600"
        >
            Nhập Key Khác
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg mb-6 shadow-lg animate-fade-in">
      <h3 className="text-lg font-bold text-gray-200 mb-3 flex items-center gap-2">
        🔑 Cấu hình API Key (Veo)
      </h3>
      <p className="text-gray-400 text-sm mb-4">
        Vui lòng nhập Google Gemini API Key để sử dụng tính năng tạo video. Key của bạn sẽ được lưu cục bộ trên trình duyệt.
      </p>
      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="password"
          value={inputKey}
          onChange={(e) => setInputKey(e.target.value)}
          placeholder="Dán API Key của bạn vào đây (AIza...)"
          className="flex-1 bg-gray-900 border border-gray-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-600"
        />
        <button
          onClick={handleSaveKey}
          disabled={!inputKey.trim()}
          className="px-6 py-2 bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 text-white font-bold rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          Lưu Key
        </button>
      </div>
      <p className="mt-3 text-xs text-gray-500">
        Chưa có key? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-orange-400 hover:underline">Lấy API Key tại Google AI Studio</a>.
      </p>
    </div>
  );
};

export default ApiKeyManager;
