import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { AudioRecorder, AudioStreamPlayer } from '../services/audio';
import { schoolDataService } from '../services/schoolData';
import { SYSTEM_INSTRUCTION } from '../constants';
import { useStudySession } from '../context/StudyContext';

export function useLiveAgent() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  // Use any for session type since LiveSession is not exported directly or has a different name
  const sessionRef = useRef<any>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const playerRef = useRef<AudioStreamPlayer | null>(null);
  const videoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  // Access Study Context
  const { startSprint, stopTimer, pauseTimer, resumeTimer, timeLeft, isActive, topic, language } = useStudySession();

  // We need refs to access the latest context values inside the callback closure
  const studyControlsRef = useRef({ startSprint, stopTimer, pauseTimer, resumeTimer, timeLeft, isActive, topic });
  useEffect(() => {
    studyControlsRef.current = { startSprint, stopTimer, pauseTimer, resumeTimer, timeLeft, isActive, topic };
  }, [startSprint, stopTimer, pauseTimer, resumeTimer, timeLeft, isActive, topic]);

  const stopCamera = useCallback(() => {
    if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    if (videoElementRef.current) {
      videoElementRef.current.srcObject = null;
      videoElementRef.current = null;
    }
    setIsCameraOn(false);
  }, [videoStream]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      setVideoStream(stream);
      setIsCameraOn(true);
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      videoElementRef.current = video;
      
      const canvas = document.createElement('canvas');
      
      videoIntervalRef.current = setInterval(() => {
        if (sessionRef.current && video.readyState >= 2) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const base64Data = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
            try {
              sessionRef.current.sendRealtimeInput({
                media: {
                  mimeType: "image/jpeg",
                  data: base64Data
                }
              });
            } catch (e) {
              console.error("Error sending video frame", e);
            }
          }
        }
      }, 1000); // 1 frame per second
    } catch (err: any) {
      console.error("Failed to start camera", err);
      setError("Failed to access camera: " + err.message);
    }
  }, []);

  const toggleCamera = useCallback(() => {
    if (isCameraOn) {
      stopCamera();
    } else {
      startCamera();
    }
  }, [isCameraOn, startCamera, stopCamera]);

  const toggleMute = useCallback(() => {
    if (audioStream) {
      audioStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!audioStream.getAudioTracks()[0].enabled);
    }
  }, [audioStream]);

  const connect = useCallback(async (initialSpeed = 50) => {
    try {
      setIsConnecting(true);
      setError(null);
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('Gemini API Key is missing');

      const ai = new GoogleGenAI({ apiKey });
      playerRef.current = new AudioStreamPlayer();
      
      recorderRef.current = new AudioRecorder((base64Data) => {
        if (sessionRef.current) {
             sessionRef.current.sendRealtimeInput({
                media: {
                    mimeType: "audio/pcm;rate=16000",
                    data: base64Data
                }
            });
        }
      });

      // Start recording immediately to give instant feedback to the user
      // Audio frames will be dropped until sessionRef.current is populated
      await recorderRef.current.start();
      setAudioStream(recorderRef.current.getStream() || null);

      const now = new Date();
      
      // Inject current school data so the AI knows it immediately without needing to call tools
      const currentTimetable = schoolDataService.getTimetable();
      const currentExams = schoolDataService.getExams();
      const currentProfile = schoolDataService.getProfile();
      const currentStats = schoolDataService.getStats();
      
      const timeInstruction = `
# CURRENT CONTEXT
- Current Date: ${now.toLocaleDateString()}
- Current Day: ${now.toLocaleDateString('en-US', { weekday: 'long' })}
- Current Time: ${now.toLocaleTimeString()}

# STUDENT PROFILE & STATS
- Name: ${currentProfile.name || 'Student'}
- Grade Level: ${currentProfile.gradeLevel || 'Not set'}
- Goals: ${currentProfile.goals || 'Not set'}
- Study Streak: ${currentStats.currentStreak} days
- Focus Points: ${currentStats.focusPoints} points
- **Coach Note:** If their streak is high, congratulate them. If points are high, tell them they are crushing it.

# CURRENT TIMETABLE (Weekly Classes)
${currentTimetable.length > 0 ? currentTimetable.map(c => `- ${c.day} at ${c.time}: ${c.name} (Notes: ${c.notes || 'none'}, Topics: ${c.topics || 'none'}, Homework: ${c.homework || 'none'})`).join('\n') : '- No classes scheduled yet.'}

# UPCOMING EXAMS
${currentExams.length > 0 ? currentExams.map(e => `- ${e.date}: ${e.subject} (Topics: ${e.topics || 'none'}, Reminder: ${e.reminder || 'none'})`).join('\n') : '- No upcoming exams.'}
`;

      const languageInstruction = `
# LANGUAGE ADAPTATION
- The user's preferred UI language is set to "${language}".
- **CRITICAL:** You must continuously detect the language the user is speaking in EVERY turn and respond in that EXACT same language.
- If the user switches languages mid-conversation, you MUST immediately switch your spoken response to match their new language.
- If they speak English, reply in English. If they speak Hindi, reply in Hindi.
- If they mix languages (e.g., Hinglish), reply in a similar natural mix.
- Do not get stuck in one language. Always mirror the user's CURRENT language.

# AUDIO FOCUS & NOISE REJECTION
- **CRITICAL:** You must ONLY respond to clear, direct human speech.
- IGNORE all background noise, typing, shuffling, coughing, or ambient room sounds.
- If you hear audio but no clear human words, DO NOT respond. Stay silent and wait for the user to speak.
`;

      // Determine speed instruction based on initialSpeed (0-100)
      let paceDescription = "normal and conversational";
      if (initialSpeed <= 33) {
        paceDescription = "significantly SLOWER than default. Pause for 2-3 seconds after items. Be very deliberate.";
      } else if (initialSpeed >= 67) {
        paceDescription = "fast, energetic, and snappy. Keep momentum high.";
      }

      const speedInstruction = `
# SPEECH PACE & CLARITY
- **CRITICAL:** The user has set the speaking speed to: ${initialSpeed}/100.
- You MUST speak in a manner that is ${paceDescription}.
- If the speed is low (<40), ensure you pause frequently to let the student process tasks (like packing a bag).
`;

      const visionInstruction = `
# VISION & HOMEWORK HELP
- The user may turn on their camera to show you their homework, a math problem, or their environment.
- If they ask you to "look at this" or "help me with this problem", you can see the video feed.
- **CRITICAL:** When helping with homework, DO NOT just give the final answer. Act as a coach: give hints, ask guiding questions, and help them arrive at the answer themselves.
- If you cannot see clearly, politely ask them to move the camera closer or ensure good lighting.
`;

      const session = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          systemInstruction: timeInstruction + languageInstruction + speedInstruction + visionInstruction + SYSTEM_INSTRUCTION,
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          tools: [{
            functionDeclarations: [
              {
                name: "get_school_data",
                description: "Get school schedule or exam data.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    category: {
                      type: Type.STRING,
                      enum: ["timetable", "exams"],
                      description: "The category of data to retrieve."
                    }
                  },
                  required: ["category"]
                }
              },
              {
                name: "add_school_class",
                description: "Add a new class to the weekly timetable.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Name of the class (e.g., 'Math')" },
                    time: { type: Type.STRING, description: "Time of the class (e.g., '08:00 AM')" },
                    day: { type: Type.STRING, description: "Day of the week (e.g., 'Monday')" },
                    notes: { type: Type.STRING, description: "Additional notes (e.g., 'Room 101')" }
                  },
                  required: ["name", "time", "day", "notes"]
                }
              },
              {
                name: "add_exam",
                description: "Add a new upcoming exam.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    subject: { type: Type.STRING, description: "Subject of the exam" },
                    date: { type: Type.STRING, description: "Date of the exam (YYYY-MM-DD)" },
                    topics: { type: Type.STRING, description: "Topics covered" }
                  },
                  required: ["subject", "date", "topics"]
                }
              },
              {
                name: "update_exam",
                description: "Update an existing exam's details. Use the ID from get_school_data.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "The ID of the exam to update" },
                    date: { type: Type.STRING, description: "New date (optional)" },
                    topics: { type: Type.STRING, description: "New topics (optional)" },
                    subject: { type: Type.STRING, description: "New subject (optional)" }
                  },
                  required: ["id"]
                }
              },
              {
                name: "update_school_class",
                description: "Update an existing class details. Use the ID from get_school_data.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "The ID of the class to update" },
                    name: { type: Type.STRING, description: "New name (optional)" },
                    time: { type: Type.STRING, description: "New time (optional)" },
                    day: { type: Type.STRING, description: "New day (optional)" },
                    notes: { type: Type.STRING, description: "New notes (optional)" }
                  },
                  required: ["id"]
                }
              },
              {
                name: "start_study_sprint",
                description: "Start a focused study timer.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    minutes: { type: Type.NUMBER, description: "Duration in minutes" },
                    topic: { type: Type.STRING, description: "Topic to focus on" }
                  },
                  required: ["minutes"]
                }
              },
              {
                name: "stop_study_sprint",
                description: "Stop the current study timer."
              },
              {
                name: "get_timer_status",
                description: "Get the current status of the study timer."
              },
              {
                name: "get_current_datetime",
                description: "Get the exact current date and time."
              }
            ]
          }]
        },
        callbacks: {
          onopen: async () => {
            console.log('Session connected');
            setIsConnected(true);
            setIsConnecting(false);
            setIsListening(true);
          },
          onmessage: async (message: any) => {
            // Handle Audio
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts) {
              for (const part of parts) {
                const audioData = part.inlineData?.data;
                if (audioData) {
                  setIsSpeaking(true);
                  const binaryString = window.atob(audioData);
                  const len = binaryString.length;
                  const bytes = new Uint8Array(len);
                  for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }
                  playerRef.current?.add16BitPCM(bytes.buffer);
                  setTimeout(() => setIsSpeaking(false), 2000); 
                }
              }
            }

            // Handle Tool Calls
            // Check both locations just in case, but cast to any to avoid TS errors if one doesn't exist on type
            const toolCall = message.toolCall || message.serverContent?.toolCall;
            
            if (toolCall) {
                console.log('Tool call received:', toolCall);
                const functionCalls = toolCall.functionCalls;
                
                if (functionCalls && functionCalls.length > 0) {
                  const responses = functionCalls.map((call: any) => {
                      const args = typeof call.args === 'string' ? JSON.parse(call.args) : call.args;
                      let result;
                      
                      if (call.name === 'get_school_data') {
                          result = schoolDataService.getData(args.category);
                      } else if (call.name === 'add_school_class') {
                        result = schoolDataService.addSchoolClass(args.name, args.time, args.day, args.notes);
                    } else if (call.name === 'add_exam') {
                        result = schoolDataService.addExam(args.subject, args.date, args.topics);
                    } else if (call.name === 'update_exam') {
                        result = schoolDataService.updateExam(args.id, args.date, args.topics, args.subject);
                    } else if (call.name === 'update_school_class') {
                        result = schoolDataService.updateSchoolClass(args.id, args.name, args.time, args.day, args.notes);
                    } else if (call.name === 'start_study_sprint') {
                        studyControlsRef.current.startSprint(args.minutes, args.topic);
                        result = { status: 'started', minutes: args.minutes, topic: args.topic };
                    } else if (call.name === 'stop_study_sprint') {
                        studyControlsRef.current.stopTimer();
                        result = { status: 'stopped' };
                    } else if (call.name === 'get_timer_status') {
                        result = {
                            timeLeft: studyControlsRef.current.timeLeft,
                            isActive: studyControlsRef.current.isActive,
                            topic: studyControlsRef.current.topic
                        };
                    } else if (call.name === 'get_current_datetime') {
                        const now = new Date();
                        result = {
                            date: now.toLocaleDateString(),
                            time: now.toLocaleTimeString(),
                            day: now.toLocaleDateString('en-US', { weekday: 'long' })
                        };
                    } else {
                        return {
                            id: call.id,
                            name: call.name,
                            response: { error: 'Unknown function' }
                        };
                    }

                    return {
                        id: call.id,
                        name: call.name,
                        response: { result }
                    };
                });
                
                sessionRef.current?.sendToolResponse({
                    functionResponses: responses
                });
              }
            }
            
            if (message.serverContent?.interrupted) {
                playerRef.current?.stop();
                setIsSpeaking(false);
            }
            
            if (message.serverContent?.turnComplete) {
                setIsSpeaking(false);
            }
          },
          onclose: () => {
            console.log('Session closed');
            setIsConnected(false);
            setIsListening(false);
            setIsSpeaking(false);
          },
          onerror: (err: any) => {
            console.error('Session error:', err);
            setError(err.message);
            setIsConnected(false);
            setIsConnecting(false);
          }
        }
      });

      sessionRef.current = session;

    } catch (err: any) {
      console.error('Connection failed:', err);
      setError(err.message || 'Failed to connect');
      if (recorderRef.current) {
        recorderRef.current.stop();
      }
      setAudioStream(null);
      setIsConnected(false);
      setIsConnecting(false);
    }
  }, [language]);

  const disconnect = useCallback(async () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
    }
    if (playerRef.current) {
      await playerRef.current.close();
    }
    if (sessionRef.current) {
        try {
            (sessionRef.current as any).close();
        } catch (e) {
            console.error('Error closing session:', e);
        }
    }
    
    stopCamera();
    
    setIsConnected(false);
    setIsConnecting(false);
    setIsListening(false);
    setIsSpeaking(false);
    setAudioStream(null);
    setIsMuted(false);
  }, [stopCamera]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    isConnected,
    isConnecting,
    isListening,
    isSpeaking,
    error,
    audioStream,
    isCameraOn,
    toggleCamera,
    videoStream,
    isMuted,
    toggleMute
  };
}
