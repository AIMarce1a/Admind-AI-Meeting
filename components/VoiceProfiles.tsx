
import React, { useState, useRef } from 'react';
import { VoiceProfile } from '../types';
import { Icons } from '../constants';
import { analyzeVoiceSample } from '../services/geminiService';

interface Props {
  profiles: VoiceProfile[];
  onAdd: (profile: VoiceProfile) => void;
  onDelete: (id: string) => void;
}

const VoiceProfiles: React.FC<Props> = ({ profiles, onAdd, onDelete }) => {
  const [name, setName] = useState('');
  const [isRecordingSample, setIsRecordingSample] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    audioChunksRef.current = [];
    
    recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
    recorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      setIsAnalyzing(true);
      try {
        const characteristics = await analyzeVoiceSample(audioBlob);
        onAdd({
          id: Date.now().toString(),
          name: name || 'Oratore Senza Nome',
          characteristics
        });
        setName('');
      } catch (err) {
        console.error("Errore analisi voce:", err);
      } finally {
        setIsAnalyzing(false);
      }
      stream.getTracks().forEach(t => t.stop());
    };

    recorder.start();
    setIsRecordingSample(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecordingSample(false);
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-3">
        <Icons.User /> Registra Database Oratori
      </h2>
      <p className="text-sm text-slate-500 mb-8">
        Crea un'impronta vocale per permettere all'AI di riconoscere correttamente chi parla.
      </p>

      <div className="space-y-6 mb-10">
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Identificativo Oratore</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isRecordingSample || isAnalyzing}
            className="w-full bg-white px-5 py-3 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
            placeholder="es. Mario Rossi"
          />
          
          <div className="mt-6 flex flex-col items-center">
            {!isRecordingSample ? (
              <button
                onClick={startRecording}
                disabled={!name || isAnalyzing}
                className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-8 py-3 rounded-full font-bold transition-all disabled:opacity-30 shadow-lg shadow-indigo-100"
              >
                {isAnalyzing ? (
                   <span className="flex items-center gap-2">
                     <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     AI Voice Profiling...
                   </span>
                ) : (
                  <> <Icons.Mic /> Registra Voce </>
                )}
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-full font-bold transition-all pulse-record"
              >
                <Icons.Stop /> Ferma e Analizza
              </button>
            )}
            <p className="text-[10px] text-slate-400 mt-4 italic">
              Frase suggerita: "Ciao, sono {name || 'Mario'} e sto registrando il mio profilo per le riunioni."
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profiles.map(p => (
          <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-200 group hover:border-indigo-400 transition-all shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-slate-800">{p.name}</h3>
              <button onClick={() => onDelete(p.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed italic line-clamp-2">"{p.characteristics}"</p>
          </div>
        ))}
        {profiles.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 font-medium">
            Nessun oratore configurato.
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceProfiles;
