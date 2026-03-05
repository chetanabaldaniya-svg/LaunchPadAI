# LaunchPad AI - Video Script (Target Duration: ~2:45)

**Title:** LaunchPad AI: The Empathetic, Real-Time School Success Coach  
**Tone:** Energetic, Professional, Tech-Forward yet Accessible.

---

## **0:00 - 0:30 | The Hook & Introduction**

**[Visual: Split screen. Left side: A chaotic student desk with books everywhere. Right side: The clean, calming LaunchPad AI interface on a laptop/tablet.]**

**Narrator (Voiceover):**
"School isn't just about grades. It's about managing chaos. Between missing assignments, forgotten lab coats, and exam stress, students need more than a calendar—they need a coach."

**[Visual: The LaunchPad AI logo animates onto the screen. Text overlay: "LaunchPad AI: Your Live Study Coach"]**

**Narrator:**
"Meet LaunchPad AI. It’s not a chatbot. It’s a proactive, voice-native intelligent agent powered by Google’s Gemini Multimodal Live API. It helps students pack their bags, plan their day, and stay calm under pressure."

---

## **0:30 - 1:15 | Core Features (The Student Experience)**

**[Visual: A student clicks the "Live Study Coach" button. The status changes from "Speak Now" to "Listening..." with a smooth audio visualizer pulsing.]**

**Narrator:**
"At the heart of the experience is the **Live Study Coach**. It’s always ready. Just click 'Speak Now'."

**[Visual: Demo of the 'Morning Check'. The user asks, "What do I need for today?" The AI responds, listing items slowly.]**

**Audio (AI Voice):**
*"Good morning! You have Chemistry Lab at 9:30. Don't forget your lab coat... [pause]... and your safety goggles."*

**[Visual: Close-up of the new 'Speaking Speed' slider. The user drags it from 'Normal' to 'Slow/Deliberate'.]**

**Narrator:**
"Notice the pacing? We’ve added a **Speaking Speed Slider**, putting the student in control. Whether they need a slow, deliberate pace for packing their bag or a high-energy sprint mode, the agent adapts its system instructions instantly."

**[Visual: The 'Progress Dashboard' screen. Mouse hovers over the 'Math' row, showing the subtle scale animation and shadow effect.]**

**Narrator:**
"It tracks progress, too. The dashboard visualizes grades and study hours with beautiful, animated charts, helping students see where they’re winning and where they need to focus."

**[Visual: The 'Study Sprint' timer counting down from 25:00. The AI voice says: "Great focus session! Want to take a 5-minute break?"]**

**Narrator:**
"And when it's time to work, the **Study Sprint** feature keeps them locked in, using the Pomodoro technique to manage burnout."

---

## **1:15 - 2:30 | Technical Deep Dive (Under the Hood)**

**[Visual: A schematic diagram appears. React Logo + Vite Logo -> WebSocket -> Gemini API Logo.]**

**Narrator:**
"But how does it work? LaunchPad AI is built on a modern **React and Vite** stack, styled with **Tailwind CSS** for that crisp, mobile-responsive look."

**[Visual: Code snippet scrolling on screen showing `useLiveAgent.ts` and the `connect` function.]**

**Narrator:**
"The real magic happens here. We use the **Gemini Multimodal Live API** via a secure WebSocket connection. This isn't just text-to-speech; it's a continuous, low-latency audio stream."

**[Visual: Split screen showing `constants.ts` (System Instructions) on one side and the AI responding on the other.]**

**Narrator:**
"We steer the model using complex **System Instructions**. We define a specific persona—empathetic, organized, and patient. We even instruct it to adapt to the user's language instantly, whether they speak English, Hindi, Spanish, or a mix."

**[Visual: A graphic showing 'Function Calling'. An arrow points from the AI to a 'Database' icon labeled 'School Data'.]**

**Narrator:**
"The agent isn't just talking; it's *doing*. Using **Function Calling**, the model can query our structured school data—timetables, exam dates, and grades—in real-time. It knows exactly when your History exam is and proactively warns you 3 days in advance."

---

## **2:30 - 2:45 | Conclusion**

**[Visual: The AI interface again. The status indicator glows green. Text overlay: "Empathy + Intelligence".]**

**Narrator:**
"LaunchPad AI combines the emotional intelligence of a mentor with the raw power of Generative AI. It validates feelings, builds momentum, and ensures no student flies solo."

**[Visual: Fade to Black. Text: "Built with Gemini 2.5 Flash".]**

**Narrator:**
"This is the future of personalized education. Built today."
