import { GoogleGenAI, Type } from "@google/genai";
import { Candidate } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = (file: File) => {
  return new Promise<{inlineData: {data: string, mimeType: string}}>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64Data = dataUrl.substring(dataUrl.indexOf(',') + 1);
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      });
    };
    reader.onerror = error => reject(error);
  });
};

export const extractElectionDetailsFromImage = async (imageFile: File): Promise<{ title: string, candidates: Candidate[] }> => {
  try {
    const imagePart = await fileToGenerativePart(imageFile);
    
    const prompt = `Analyze the provided image of a ballot paper. Extract the main title of the election and the list of candidates. The candidate list is numbered. For each candidate, identify their full name. Return the result as a JSON object with two keys: 'title' (a string for the election title, for example "PHIẾU BẦU CỬ BAN CHẤP HÀNH CÔNG ĐOÀN...") and 'candidates' (an array of objects, where each object has an 'id' and a 'name').`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "The main title or subject of the election from the ballot paper."
            },
            candidates: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER, description: "The number of the candidate in the list." },
                  name: { type: Type.STRING, description: "The full name of the candidate." }
                },
                required: ['id', 'name']
              }
            }
          },
          required: ['title', 'candidates']
        },
      }
    });

    const parsedJson = JSON.parse(response.text);
    if (parsedJson && parsedJson.title && Array.isArray(parsedJson.candidates)) {
        return parsedJson;
    } else {
        throw new Error("Invalid JSON structure received from API.");
    }

  } catch (error) {
    console.error("Error processing image with Gemini API:", error);
    throw new Error("Could not extract candidate list from the image. Please try again with a clearer image.");
  }
};
