import React from 'react';
import CopyButton from './CopyButton';

interface AllPromptsDisplayProps {
  imagePrompts: string;
  motionPrompts: string;
  veoJsonPrompts: string;
}

const AllPromptsDisplay: React.FC<AllPromptsDisplayProps> = ({ imagePrompts, motionPrompts, veoJsonPrompts }) => {
  if (!imagePrompts && !motionPrompts && !veoJsonPrompts) {
    return null;
  }

  const countPrompts = (prompts: string) => prompts ? prompts.split('\n\n').filter(p => p.trim() !== '').length : 0;

  const imagePromptCount = countPrompts(imagePrompts);
  const motionPromptCount = countPrompts(motionPrompts);
  const veoPromptCount = countPrompts(veoJsonPrompts);

  return (
    <div className="w-full max-w-7xl mx-auto mt-12 space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* All Image Prompts */}
        {imagePrompts && (
            <div>
            <h3 className="text-xl font-bold mb-3 text-gray-200">
                Tất cả Prompt Tạo Ảnh ({imagePromptCount})
            </h3>
            <div className="relative">
                <textarea
                readOnly
                value={imagePrompts}
                className="w-full h-64 p-3 bg-gray-900 border border-gray-600 rounded-md font-mono text-xs leading-relaxed text-gray-300 resize-y"
                placeholder="Các prompt tạo ảnh sẽ xuất hiện ở đây..."
                />
                <CopyButton textToCopy={imagePrompts} />
            </div>
            </div>
        )}

        {/* All Motion Prompts */}
        {motionPrompts && (
            <div>
            <h3 className="text-xl font-bold mb-3 text-gray-200">
                Tất cả Prompt Tạo Chuyển động ({motionPromptCount})
            </h3>
            <div className="relative">
                <textarea
                readOnly
                value={motionPrompts}
                className="w-full h-64 p-3 bg-gray-900 border border-gray-600 rounded-md font-mono text-xs leading-relaxed text-gray-300 resize-y"
                placeholder="Các prompt tạo chuyển động sẽ xuất hiện ở đây..."
                />
                <CopyButton textToCopy={motionPrompts} />
            </div>
            </div>
        )}
      </div>

      {/* Veo 3.1 JSON Prompts */}
      {veoJsonPrompts && (
        <div className="mt-8">
            <h3 className="text-xl font-bold mb-3 text-gray-200">
                Prompt Tạo Video (Veo 3.1 - JSON) ({veoPromptCount})
            </h3>
            <div className="relative">
                <textarea
                readOnly
                value={veoJsonPrompts}
                className="w-full h-80 p-3 bg-gray-900 border border-gray-600 rounded-md font-mono text-xs leading-relaxed text-gray-300 resize-y"
                placeholder="Các prompt JSON cho Veo 3.1 sẽ xuất hiện ở đây..."
                />
                <CopyButton textToCopy={veoJsonPrompts} />
            </div>
        </div>
      )}
    </div>
  );
};

export default AllPromptsDisplay;
