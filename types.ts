
export interface VoiceProfile {
  id: string;
  name: string;
  characteristics: string; // Impronta vocale generata dall'AI
}

export interface SpeakerTurn {
  speakerName: string;
  text: string;
  timestamp: number;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  transcript: SpeakerTurn[];
  audioUrl?: string;
  summary?: string;
  minutes?: string;
  todo?: string;
  status: 'recording' | 'completed' | 'processing';
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
