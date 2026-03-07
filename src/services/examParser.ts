import { GoogleGenAI, Type } from '@google/genai';
import { Exam } from '../types';

export class ExamParserService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Gemini API Key is missing');
    this.ai = new GoogleGenAI({ apiKey });
  }

  async parsePDF(file: File, gradeLevel?: string): Promise<Exam[]> {
    try {
      // Convert file to base64
      const base64Data = await this.fileToBase64(file);
      // Remove data URL prefix if present (e.g., "data:application/pdf;base64,")
      const cleanBase64 = base64Data.split(',')[1];

      const model = 'gemini-2.5-flash';
      
      const prompt = `
        Analyze this PDF document which contains an exam timetable.
        ${gradeLevel ? `
        IMPORTANT: The student is in Grade/Standard: "${gradeLevel}".
        Please extract the exam schedule SPECIFICALLY for this grade.
        
        Look for variations of the grade level, such as:
        - "Grade ${gradeLevel}"
        - "Class ${gradeLevel}"
        - "Std ${gradeLevel}"
        - "Standard ${gradeLevel}"
        - "${gradeLevel}th Grade" or "${gradeLevel}nd Grade" or "${gradeLevel}rd Grade" or "${gradeLevel}st Grade"
        - Roman numerals (e.g., if grade is 2, look for "II", "Std II", "Class II")
        
        If the document contains multiple grades, ONLY return the exams for ${gradeLevel} (or its variations).
        If the document does not explicitly mention grades or only has one schedule, extract that.
        ` : ''}
        Extract all exam entries into a structured JSON format.
        For each exam, identify:
        - Subject name
        - Date (in YYYY-MM-DD format). If the year is missing, assume the current or next upcoming occurrence.
        - Topics (if mentioned, otherwise infer from subject or leave generic)
        - Prerequisites (if mentioned, otherwise leave empty)
        - Reminder (if mentioned, e.g., "Bring calculator", "Open book", otherwise leave empty)
        
        Return ONLY the JSON array of objects.
      `;

      const response = await this.ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: cleanBase64
              }
            },
            {
              text: prompt
            }
          ]
        },
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        subject: { type: Type.STRING, description: "The name of the subject" },
                        date: { type: Type.STRING, description: "The date of the exam in YYYY-MM-DD format" },
                        topics: { type: Type.STRING, description: "Topics covered in the exam" },
                        prerequisites: { type: Type.STRING, description: "Any prerequisites mentioned" },
                        reminder: { type: Type.STRING, description: "Any specific reminders or instructions" }
                    },
                    required: ['subject', 'date', 'topics']
                }
            }
        }
      });

      if (response.text) {
        const exams = JSON.parse(response.text);
        // Add IDs to the exams
        return exams.map((exam: any) => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            subject: exam.subject,
            date: exam.date,
            topics: exam.topics,
            prerequisites: exam.prerequisites || '',
            reminder: exam.reminder || ''
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw error;
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
}

export const examParserService = new ExamParserService();
