
import React, { useState, useEffect, useRef } from 'react';
import { connectLiveTranscription, performProfessionalDiarization } from '../services/geminiService';
import { Icons, PROMPTS } from '../constants';
import { SpeakerTurn, VoiceProfile, Meeting } from '../types';

interface Props {
  onFinish: (meeting: Meeting) => void;
  voiceProfiles: VoiceProfile[];
}

const Recorder: React.FC<Props> = ({ onFinish, voiceProfiles }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveText, setLiveText] = useState('');
  const [timer, setTimer] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const sessionRef = useRef<any>(null);
  const timerInterval = useRef<number | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerInterval.current = window.setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      if (timerInterval.current) clearInterval(timerInterval.current);
      setTimer(0);
    }
    return () => { if (timerInterval.current) clearInterval(timerInterval.current); };
  }, [isRecording]);

  const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  // Funzione per pulire il testo live ed evitare spazi tra lettere
  const cleanLiveText = (newChunk: string) => {
    setLiveText(prev => {
      const combined = prev + newChunk;
      // Rimuove spazi multipli e corregge spazi prima della punteggiatura
      return combined
        .replace(/\s+/g, ' ')
        .replace(/\s+([.,!?;:])/g, '$1')
        .trimStart();
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      const session = await connectLiveTranscription(
        (text) => cleanLiveText(text),
        "Trascrivi professionalmente. Unisci correttamente le parole senza spezzarle con spazi inutili."
      );
      sessionRef.current = session;
      
      setIsRecording(true);
      setLiveText('');
    } catch (err) {
      console.error(err);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setIsProcessing(true);

    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }

    mediaRecorderRef.current?.stop();
    
    setTimeout(async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const transcript = await performProfessionalDiarization(audioBlob, voiceProfiles);
      
      const meeting: Meeting = {
        id: Date.now().toString(),
        title: `Riunione ${new Date().toLocaleDateString('it-IT')} ${new Date().toLocaleTimeString('it-IT', {hour:'2-digit', minute:'2-digit'})}`,
        date: new Date().toISOString(),
        transcript,
        status: 'completed',
        audioUrl: URL.createObjectURL(audioBlob)
      };

      onFinish(meeting);
      setIsProcessing(false);
      setLiveText('');
    }, 800);
  };

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto w-full">
      <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-700 ${isRecording ? 'bg-red-50 text-red-600 scale-105 shadow-xl shadow-red-100 pulse-record' : 'bg-slate-50 text-slate-300'}`}>
            {isRecording ? <div className="w-4 h-4 bg-red-600 rounded-sm animate-pulse" /> : <Icons.Mic />}
          </div>
          <div>
            <span className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase mb-1 block">
              {isRecording ? 'SISTEMA IN ASCOLTO' : isProcessing ? 'AI DIARIZATION...' : 'READY TO RECORD'}
            </span>
            <h2 className="text-3xl font-black text-slate-900 tabular-nums">
              {isRecording ? formatTime(timer) : isProcessing ? 'Elaborazione Impronte...' : 'Inizia Nuova Sessione'}
            </h2>
          </div>
        </div>

        <div className="flex gap-4">
          {!isRecording && !isProcessing ? (
            <button onClick={startRecording} className="px-10 py-4 bg-slate-950 hover:bg-black text-white rounded-2xl font-black text-xs tracking-widest transition-all shadow-xl active:scale-95 uppercase">
              Avvia Registrazione
            </button>
          ) : isRecording ? (
            <button onClick={stopRecording} className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs tracking-widest transition-all shadow-xl active:scale-95 uppercase">
              Termina Riunione
            </button>
          ) : (
            <div className="flex items-center gap-3 px-8 py-4 bg-slate-50 rounded-2xl text-slate-500 font-bold text-xs uppercase tracking-widest">
              <div className="w-3 h-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              Processing
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[3rem] shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden flex flex-col relative group">
        <div className="px-10 py-6 border-b border-slate-50 bg-slate-50/20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-200'}`} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anteprima Live Smart-Clean</span>
          </div>
        </div>
        <div className="flex-1 p-12 overflow-y-auto text-slate-600 font-medium text-xl leading-relaxed">
          {liveText || (isProcessing ? "L'AI sta separando gli oratori e pulendo la trascrizione finale..." : "Il testo apparirà qui non appena inizierai a parlare...")}
        </div>
        {isRecording && <div className="absolute bottom-8 right-10 text-[9px] font-black text-red-500/50 uppercase tracking-[0.4em] animate-pulse">REC</div>}
      </div>
    </div>
  );
};

export default Recorder;
