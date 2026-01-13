
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { APP_CONFIG, PROMPTS } from "../constants";
import { createPcmBlob } from "../utils/audio";

const API_KEY = process.env.API_KEY || "";

export const getGeminiAI = () => new GoogleGenAI({ apiKey: API_KEY });

/**
 * Analizza un campione audio per estrarre un'impronta vocale tecnica.
 */
export async function analyzeVoiceSample(audioBlob: Blob): Promise<string> {
  const ai = getGeminiAI();
  const base64Data = await blobToBase64(audioBlob);

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [
      {
        parts: [
          { inlineData: { data: base64Data, mimeType: audioBlob.type } },
          { text: "Analizza questa clip audio. Estrai un'impronta vocale tecnica dettagliata (frequenza media, timbro, pattern di risonanza, accento, velocità) che permetta di distinguere univocamente questa persona in una stanza con più oratori. Rispondi solo con la descrizione tecnica concisa." }
        ]
      }
    ]
  });

  return response.text || "Impronta vocale non rilevata";
}

/**
 * Esegue la diarizzazione professionale sull'audio completo.
 */
export async function performProfessionalDiarization(
  audioBlob: Blob, 
  profiles: {name: string, characteristics: string}[]
): Promise<any[]> {
  const ai = getGeminiAI();
  const base64Data = await blobToBase64(audioBlob);
  
  const profilesContext = profiles.map(p => `- ORATORE: ${p.name}\n  PROFILO VOCALE: ${p.characteristics}`).join('\n\n');

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [
      {
        parts: [
          { inlineData: { data: base64Data, mimeType: audioBlob.type } },
          { text: `Esegui la diarizzazione di questo audio. 
          
DATABASE ORATORI CONOSCIUTI:
${profilesContext}

REGOLE:
1. Identifica chi parla confrontando l'audio con il database.
2. Se un oratore non è nel database, usa "Speaker 1", "Speaker 2", etc.
3. Restituisci esclusivamente un array JSON di oggetti: { "speakerName": "...", "text": "...", "timestamp": number_ms }
4. La trascrizione deve essere integrale, professionale e fedele.` }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json"
    }
  });

  try {
    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (e) {
    console.error("Errore parsing diarizzazione:", e);
    return [];
  }
}

/**
 * Connessione Live per feedback visivo immediato.
 */
export async function connectLiveTranscription(
  onTranscript: (text: string) => void,
  systemInstruction: string
) {
  const ai = getGeminiAI();
  const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: APP_CONFIG.SAMPLE_RATE_INPUT });
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const sessionPromise = ai.live.connect({
    model: APP_CONFIG.MODEL_LIVE,
    config: {
      responseModalities: [Modality.AUDIO],
      systemInstruction,
      inputAudioTranscription: {},
    },
    callbacks: {
      onopen: () => {
        const source = inputAudioContext.createMediaStreamSource(stream);
        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
        scriptProcessor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmBlob = createPcmBlob(inputData);
          sessionPromise.then((session) => {
            session.sendRealtimeInput({ media: pcmBlob });
          });
        };
        source.connect(scriptProcessor);
        scriptProcessor.connect(inputAudioContext.destination);
      },
      onmessage: async (message: LiveServerMessage) => {
        if (message.serverContent?.inputTranscription) {
          onTranscript(message.serverContent.inputTranscription.text);
        }
      },
      onerror: (e) => console.error("Live transcription error:", e),
      onclose: () => {
        stream.getTracks().forEach(t => t.stop());
        inputAudioContext.close();
      }
    }
  });

  return sessionPromise;
}

/**
 * Genera analisi testuali (riassunti, verbali, etc.)
 */
export async function generateAnalysis(prompt: string): Promise<string> {
  const ai = getGeminiAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });
  return response.text || "Impossibile generare l'analisi in questo momento.";
}

/**
 * Chat contestuale sulla riunione.
 */
export async function chatWithMeeting(meetingTitle: string, transcript: string, message: string) {
  const ai = getGeminiAI();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: PROMPTS.CHAT_CONTEXT(meetingTitle, transcript),
    }
  });
  const response = await chat.sendMessage({ message });
  return response.text || "Spiacente, non riesco a rispondere a questa domanda.";
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.readAsDataURL(blob);
  });
}
