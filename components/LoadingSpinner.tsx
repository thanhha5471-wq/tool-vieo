
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 my-10">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-500"></div>
      <p className="text-lg text-gray-300">Đang tạo kịch bản điện ảnh của bạn...</p>
    </div>
  );
};

export default LoadingSpinner;
