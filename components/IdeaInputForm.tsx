import React from 'react';

interface IdeaInputFormProps {
  idea: string;
  setIdea: (idea: string) => void;
  duration: string;
  setDuration: (duration: string) => void;
  style: string;
  setStyle: (style: string) => void;
  aspectRatio: string;
  setAspectRatio: (aspectRatio: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const styleOptions = [
  'Điện ảnh (Cinematic)',
  'Hoạt hình Anime',
  'Tài liệu',
  'Quảng cáo sản phẩm',
  'Khoa học viễn tưởng',
  'Kinh dị',
  'Lãng mạn',
  'Hài hước',
  'Vlog Du lịch',
];

const aspectRatioOptions = [
    '16:9 (Ngang - Phim)',
    '9:16 (Dọc - Mạng xã hội)',
    '1:1 (Vuông)',
    '4:3 (Cổ điển)',
    '2.39:1 (Màn ảnh rộng)',
];

const IdeaInputForm: React.FC<IdeaInputFormProps> = ({
  idea,
  setIdea,
  duration,
  setDuration,
  style,
  setStyle,
  aspectRatio,
  setAspectRatio,
  onSubmit,
  isLoading,
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={onSubmit} className="bg-gray-800/50 border border-gray-700 shadow-xl rounded-lg p-6 md:p-8 space-y-6">
        {/* Idea Input */}
        <div className="flex flex-col">
          <label htmlFor="idea" className="mb-2 font-semibold text-gray-300">
            1. Nhập ý tưởng chính của bạn
          </label>
          <textarea
            id="idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder-gray-500"
            rows={4}
            placeholder="Ví dụ: một phi hành gia khám phá một hành tinh lạ và tìm thấy một di vật cổ đại..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Duration Input */}
          <div className="flex flex-col">
            <label htmlFor="duration" className="mb-2 font-semibold text-gray-300">
              2. Thời lượng (giây)
            </label>
            <input
              type="number"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder-gray-500"
              placeholder="Ví dụ: 24"
              min="8"
              step="1"
              required
            />
          </div>

          {/* Style Select */}
          <div className="flex flex-col">
            <label htmlFor="style" className="mb-2 font-semibold text-gray-300">
              3. Chọn phong cách
            </label>
            <select
              id="style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              {styleOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Aspect Ratio Select */}
          <div className="flex flex-col">
            <label htmlFor="aspectRatio" className="mb-2 font-semibold text-gray-300">
              4. Tỉ lệ khung hình
            </label>
            <select
              id="aspectRatio"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              {aspectRatioOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading || !idea.trim()}
            className="w-full flex justify-center items-center py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </>
            ) : (
              'Tạo Kịch Bản'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IdeaInputForm;