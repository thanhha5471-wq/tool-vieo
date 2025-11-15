
import React from 'react';
import { ScriptData } from '../types';
import CopyButton from './CopyButton';

interface ScriptDisplayProps {
  data: ScriptData;
  onGenerateVideo: (prompt: string) => void;
}

const ScriptDisplay: React.FC<ScriptDisplayProps> = ({ data, onGenerateVideo }) => {
  return (
    <div className="w-full max-w-7xl mx-auto mt-12 space-y-12 animate-fade-in">
      {/* Script Overview */}
      <div>
        <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-500">
          Tổng quan Kịch bản
        </h2>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <p className="text-gray-300 leading-relaxed">{data.Tong_quan_Kich_ban}</p>
        </div>
      </div>

      {/* Storyboard Table */}
      <div>
        <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-500">
          Bảng Phân cảnh
        </h2>
        <div className="overflow-x-auto bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/12">Cảnh</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/12">Thời gian</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-3/12">Mô tả Kịch bản</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-3/12">Prompt Tạo Ảnh</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-2/12">Prompt Chuyển động</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-2/12">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {data.Bang_Phan_canh.map((scene) => (
                <tr key={scene.STT_Phan_canh} className="hover:bg-gray-700/50 transition-colors duration-200">
                  <td className="px-4 py-4 text-sm font-medium text-gray-200 align-top text-center">{scene.STT_Phan_canh}</td>
                  <td className="px-4 py-4 text-sm text-gray-300 align-top">{scene.Thoi_gian}</td>
                  <td className="px-4 py-4 text-sm text-gray-300 align-top">{scene.Mo_ta_Kich_ban_Chi_tiet}</td>
                  <td className="px-4 py-4 text-sm text-gray-300 align-top relative">
                    <div className="bg-gray-900 p-3 rounded-md border border-gray-600 font-mono text-xs leading-relaxed">
                        {scene.Prompt_Tao_Anh}
                        <CopyButton textToCopy={scene.Prompt_Tao_Anh} />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-300 align-top relative">
                    <div className="bg-gray-900 p-3 rounded-md border border-gray-600 font-mono text-xs leading-relaxed">
                        {scene.Prompt_Tao_Chuyen_dong}
                        <CopyButton textToCopy={scene.Prompt_Tao_Chuyen_dong} />
                    </div>
                  </td>
                  <td className="px-4 py-4 align-middle text-center">
                    <button
                        onClick={() => onGenerateVideo(scene.Prompt_Tao_Video_JSON)}
                        className="px-3 py-2 bg-gradient-to-r from-orange-600 to-pink-600 text-white text-xs font-bold rounded hover:from-orange-500 hover:to-pink-500 transition-all shadow-md"
                    >
                        🎬 Tạo Video
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ScriptDisplay;
