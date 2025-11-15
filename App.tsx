
import React, { useState } from 'react';
import Header from './components/Header';
import IdeaInputForm from './components/IdeaInputForm';
import LoadingSpinner from './components/LoadingSpinner';
import ScriptDisplay from './components/ScriptDisplay';
import { generateScriptFromIdea } from './services/geminiService';
import { ScriptData } from './types';
import AllPromptsDisplay from './components/AllPromptsDisplay';
import VideoGenerator from './components/VideoGenerator';

type Tab = 'script' | 'video';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('script');
  const [idea, setIdea] = useState<string>('');
  const [duration, setDuration] = useState<string>('24');
  const [style, setStyle] = useState<string>('Điện ảnh (Cinematic)');
  const [aspectRatio, setAspectRatio] = useState<string>('16:9 (Ngang - Phim)');
  const [scriptData, setScriptData] = useState<ScriptData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [allImagePrompts, setAllImagePrompts] = useState<string>('');
  const [allMotionPrompts, setAllMotionPrompts] = useState<string>('');
  const [allVeoJsonPrompts, setAllVeoJsonPrompts] = useState<string>('');
  const [videoGenPrompt, setVideoGenPrompt] = useState<string>('');


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || !duration.trim()) return;

    setIsLoading(true);
    setError(null);
    setScriptData(null);
    setAllImagePrompts('');
    setAllMotionPrompts('');
    setAllVeoJsonPrompts('');

    try {
      const data = await generateScriptFromIdea(idea, duration, style, aspectRatio);
      setScriptData(data);
      if (data && data.Bang_Phan_canh) {
          const imagePrompts = data.Bang_Phan_canh.map(scene => scene.Prompt_Tao_Anh).join('\n\n');
          const motionPrompts = data.Bang_Phan_canh.map(scene => scene.Prompt_Tao_Chuyen_dong).join('\n\n');
          const veoJsonPrompts = data.Bang_Phan_canh.map(scene => scene.Prompt_Tao_Video_JSON).join('\n\n');
          setAllImagePrompts(imagePrompts);
          setAllMotionPrompts(motionPrompts);
          setAllVeoJsonPrompts(veoJsonPrompts);
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi không mong muốn.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToVideo = (prompt: string) => {
      setVideoGenPrompt(prompt);
      setActiveTab('video');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 md:p-8">
      <div className="container mx-auto">
        <Header />
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
            <div className="bg-gray-800 p-1 rounded-lg inline-flex">
                <button
                    onClick={() => setActiveTab('script')}
                    className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${
                        activeTab === 'script' 
                        ? 'bg-indigo-600 text-white shadow-lg' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                >
                    📜 Kịch bản & Prompts
                </button>
                <button
                    onClick={() => setActiveTab('video')}
                    className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${
                        activeTab === 'video' 
                        ? 'bg-gradient-to-r from-orange-600 to-pink-600 text-white shadow-lg' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                >
                    🎥 Tạo Video AI (Veo)
                </button>
            </div>
        </div>

        <main className="mt-4">
          {activeTab === 'script' ? (
            <div className="animate-fade-in">
              <IdeaInputForm 
                idea={idea}
                setIdea={setIdea}
                duration={duration}
                setDuration={setDuration}
                style={style}
                setStyle={setStyle}
                aspectRatio={aspectRatio}
                setAspectRatio={setAspectRatio}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
              
              <div className="mt-12">
                {isLoading && <LoadingSpinner />}
                {error && (
                  <div className="max-w-3xl mx-auto bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg" role="alert">
                    <strong className="font-bold">Lỗi: </strong>
                    <span className="block sm:inline">{error}</span>
                  </div>
                )}
                {scriptData && (
                  <>
                    <ScriptDisplay 
                        data={scriptData} 
                        onGenerateVideo={handleSwitchToVideo}
                    />
                    <AllPromptsDisplay 
                      imagePrompts={allImagePrompts}
                      motionPrompts={allMotionPrompts}
                      veoJsonPrompts={allVeoJsonPrompts}
                    />
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
                <VideoGenerator initialPrompt={videoGenPrompt} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
