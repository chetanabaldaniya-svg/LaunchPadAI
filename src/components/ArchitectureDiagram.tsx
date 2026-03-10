import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Layers, Loader2, Image as ImageIcon } from 'lucide-react';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export function ArchitectureDiagram() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      // Check if user has selected a paid API key
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
          // Assume success after triggering openSelectKey
        }
      }

      // Use process.env.API_KEY which is injected by the platform after selection
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('API Key is missing');

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: {
          parts: [
            {
              text: 'A clean, modern, high-quality system architecture diagram for LaunchPadAI, an AI-powered school success coach. The diagram shows the flow between "React User Interface", "Live Audio WebSockets", "Gemini 2.5 Flash Native Audio API", "System Instructions", and "School Data Service". Tech-forward, educational, friendly color palette with blue and orange accents. Professional software architecture diagram style.',
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9",
            imageSize: "1K"
          }
        },
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          setImageUrl(`data:image/png;base64,${base64EncodeString}`);
          foundImage = true;
          break;
        }
      }
      
      if (!foundImage) {
        throw new Error("No image data found in the response.");
      }
    } catch (err: any) {
      console.error('Failed to generate image:', err);
      setError(err.message || 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">System Architecture</h2>
            <p className="text-sm text-slate-500">Generate a diagram of LaunchPadAI</p>
          </div>
        </div>
        <button
          onClick={generateImage}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <ImageIcon className="w-4 h-4" />
              Generate Diagram
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm mb-4">
          {error}
        </div>
      )}

      {imageUrl && (
        <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
          <img 
            src={imageUrl} 
            alt="LaunchPadAI System Architecture" 
            className="w-full h-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
      
      {!imageUrl && !isGenerating && !error && (
        <div className="mt-4 h-48 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
          <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm">Click generate to view the architecture diagram</p>
        </div>
      )}
    </div>
  );
}
