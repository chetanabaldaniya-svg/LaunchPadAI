import { GoogleGenAI } from "@google/genai";
import fs from "fs";

async function generate() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set.");
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });
  console.log("Generating image...");
  
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

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      const base64EncodeString = part.inlineData.data;
      const buffer = Buffer.from(base64EncodeString, 'base64');
      fs.writeFileSync('./public/architecture.png', buffer);
      console.log('Image successfully saved to ./public/architecture.png');
      return;
    }
  }
  console.log("No image data found in the response.");
}

generate().catch(console.error);
