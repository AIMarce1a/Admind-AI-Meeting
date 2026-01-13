
import React, { useState, useEffect, useRef } from 'react';
import { Meeting, ChatMessage } from '../types';
import { generateAnalysis, chatWithMeeting } from '../services/geminiService';
// Added Icons to the import from constants
import { PROMPTS, Icons } from '../constants';

interface Props {
  meeting: Meeting;
  onUpdate: (meeting: Meeting) => void;
}

const MeetingView: React.FC<Props> = ({ meeting, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'doc' | 'transcript' | 'chat'>('doc');
  const [loading, setLoading] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isChatLoading, activeTab]);

  const transcriptStr = meeting.transcript.map(t => `${t.speakerName}: ${t.text}`).join('\n');

  const renderMarkdown = (text: string) => {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-bold">$1</strong>')
      .replace(/^\s*-\s+(.*)/gm, '<li class="ml-5 list-disc text-slate-700 mb-1">$1</li>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  };

  const runAction = async (type: 'summary' | 'minutes' | 'todo') => {
    if (!transcriptStr.trim()) return alert("Trascrizione vuota, impossibile analizzare.");
    setLoading(type);
    try {
      const prompt = type === 'summary' ? PROMPTS.GENERATE_SUMMARY(transcriptStr) :
                     type === 'minutes' ? PROMPTS.GENERATE_MINUTES(transcriptStr) :
                     PROMPTS.GENERATE_TODO(transcriptStr);
      
      const result = await generateAnalysis(prompt);
      onUpdate({ ...meeting, [type]: result });
    } catch (err) {
      console.error("Errore generazione:", err);
      alert("Errore durante la generazione del documento. Riprova.");
    } finally {
      setLoading(null);
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;
    
    const userMsg = { role: 'user' as const, content: chatInput };
    setChatHistory(h => [...h, userMsg]);
    setChatInput('');
    setIsChatLoading(true);
    
    try {
      const res = await chatWithMeeting(meeting.title, transcriptStr, chatInput);
      setChatHistory(h => [...h, { role: 'assistant' as const, content: res }]);
    } catch (err) {
      setChatHistory(h => [...h, { role: 'assistant' as const, content: "Spiacente, si è verificato un errore di comunicazione con l'AI." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const downloadDoc = (title: string, content: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${meeting.title.replace(/\s+/g, '_')}_${title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in fade-in duration-500">
      {/* Header Navigation */}
      <div className="px-10 py-8 bg-white border-b border-slate-50 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{meeting.title}</h1>
          <div className="flex gap-4 items-center mt-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(meeting.date).toLocaleDateString('it-IT')}</span>
            <div className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
              Ready
            </span>
          </div>
        </div>
        
        <div className="flex bg-slate-50 p-1 rounded-2xl gap-1">
          {['doc', 'transcript', 'chat'].map(t => (
            <button 
              key={t}
              onClick={() => setActiveTab(t as any)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {t === 'doc' ? 'Documenti AI' : t === 'transcript' ? 'Trascrizione' : 'AI Chat Intelligence'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {/* DOCUMENTAZIONE TAB */}
        {activeTab === 'doc' && (
          <div className="h-full overflow-y-auto px-10 py-8 custom-scrollbar">
            <div className="max-w-5xl mx-auto space-y-12 pb-20">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-b border-slate-50 pb-10">
                 {[
                   { id: 'summary', label: 'Executive Summary', color: 'indigo', icon: meeting.summary },
                   { id: 'minutes', label: 'Verbale Riunione', color: 'emerald', icon: meeting.minutes },
                   { id: 'todo', label: 'To-Do & Azioni', color: 'amber', icon: meeting.todo }
                 ].map(btn => (
                   <button 
                    key={btn.id}
                    onClick={() => runAction(btn.id as any)} 
                    disabled={loading === btn.id}
                    className={`flex flex-col items-center justify-center p-8 rounded-[2rem] border transition-all active:scale-95 group ${
                      loading === btn.id ? 'bg-slate-50 border-slate-200 animate-pulse' : 
                      btn.icon ? `bg-${btn.color}-50/50 border-${btn.color}-100 text-${btn.color}-700 shadow-sm` : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/10 text-slate-500'
                    }`}
                   >
                     <span className="text-[11px] font-black uppercase tracking-[0.2em] mb-2">{btn.label}</span>
                     <div className="flex items-center gap-2">
                        {loading === btn.id && <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>}
                        <span className="text-[9px] font-bold opacity-60 uppercase">{loading === btn.id ? 'Analisi...' : btn.icon ? 'Rigenera' : 'Avvia Generazione'}</span>
                     </div>
                   </button>
                 ))}
              </div>

              <div className="space-y-16">
                {meeting.summary && (
                  <article className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex justify-between items-end mb-6">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-4">
                        <div className="w-2 h-8 bg-indigo-600 rounded-full shadow-lg shadow-indigo-100"></div>
                        Summary
                      </h3>
                      <button onClick={() => downloadDoc('Riassunto', meeting.summary!)} className="text-[10px] font-black uppercase text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all">Download .txt</button>
                    </div>
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 text-slate-700 leading-relaxed text-lg shadow-sm prose-slate" dangerouslySetInnerHTML={{ __html: renderMarkdown(meeting.summary) }} />
                  </article>
                )}

                {meeting.todo && (
                  <article className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                    <div className="flex justify-between items-end mb-6">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-4">
                        <div className="w-2 h-8 bg-amber-500 rounded-full shadow-lg shadow-amber-100"></div>
                        Action Items
                      </h3>
                      <button onClick={() => downloadDoc('ToDo', meeting.todo!)} className="text-[10px] font-black uppercase text-amber-600 hover:bg-amber-50 px-4 py-2 rounded-xl transition-all">Download .txt</button>
                    </div>
                    <div className="bg-amber-50/10 p-10 rounded-[3rem] border border-amber-100 text-slate-800 font-medium text-lg shadow-sm" dangerouslySetInnerHTML={{ __html: renderMarkdown(meeting.todo) }} />
                  </article>
                )}

                {meeting.minutes && (
                  <article className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                    <div className="flex justify-between items-end mb-6">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-4">
                        <div className="w-2 h-8 bg-emerald-500 rounded-full shadow-lg shadow-emerald-100"></div>
                        Minutes
                      </h3>
                      <button onClick={() => downloadDoc('Verbale', meeting.minutes!)} className="text-[10px] font-black uppercase text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-xl transition-all">Download .txt</button>
                    </div>
                    <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/20 font-serif text-xl leading-loose text-slate-700" dangerouslySetInnerHTML={{ __html: renderMarkdown(meeting.minutes) }} />
                  </article>
                )}
              </div>

              {!loading && !meeting.summary && !meeting.minutes && !meeting.todo && (
                <div className="py-32 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                    {/* Fixed Icons missing import */}
                    <Icons.Layout />
                  </div>
                  <p className="font-black text-slate-900 uppercase tracking-widest text-sm">Pronto per l'Analisi</p>
                  <p className="text-slate-400 text-sm mt-2">Seleziona un'azione sopra per estrarre intelligenza dalla trascrizione.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TRASCRIZIONE TAB */}
        {activeTab === 'transcript' && (
          <div className="h-full overflow-y-auto px-10 py-10 custom-scrollbar animate-in fade-in duration-500">
            <div className="max-w-5xl mx-auto space-y-8 pb-20">
              <div className="flex justify-end mb-8 border-b border-slate-50 pb-6">
                 <button onClick={() => downloadDoc('Trascrizione', transcriptStr)} className="text-[11px] font-black uppercase text-slate-400 hover:text-slate-950 transition-colors flex items-center gap-2 group">
                    Scarica Trascrizione Completa
                    {/* Fixed Icons missing import */}
                    <Icons.ChevronRight />
                 </button>
              </div>
              {meeting.transcript.map((turn, i) => (
                <div key={i} className="flex gap-12 group items-start">
                  <div className="w-40 shrink-0 sticky top-0">
                    <span className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] block mb-1">{turn.speakerName}</span>
                    <div className="w-4 h-0.5 bg-indigo-100 rounded-full group-hover:w-full transition-all duration-700"></div>
                    <span className="text-[9px] text-slate-300 font-mono mt-2 block">{(turn.timestamp / 1000).toFixed(1)}s</span>
                  </div>
                  <div className="flex-1 text-xl text-slate-700 leading-relaxed font-medium">
                    {turn.text}
                  </div>
                </div>
              ))}
              {meeting.transcript.length === 0 && (
                <div className="py-32 text-center text-slate-300 italic">Trascrizione non disponibile per questa sessione.</div>
              )}
            </div>
          </div>
        )}

        {/* CHAT TAB - EXPANSIVE DESIGN */}
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col bg-slate-50/40 animate-in fade-in duration-500">
             <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <div className="max-w-[1200px] mx-auto w-full space-y-8">
                  {chatHistory.length === 0 && (
                    <div className="h-full py-40 flex flex-col items-center justify-center text-center">
                      <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-indigo-600 shadow-xl mb-8 ring-1 ring-slate-100">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      </div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Meeting Intelligence Chat</h2>
                      <p className="text-slate-500 mt-4 text-lg max-w-xl mx-auto">Interroga l'AI sui contenuti della riunione. Chiedi decisioni, quote specifiche o riassunti di particolari argomenti.</p>
                      
                      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full">
                        {["Quali decisioni sono state prese?", "Quali sono i prossimi passi?", "Chi ha detto cosa su...?", "Riassumi l'intervento di..."].map(q => (
                          <button key={q} onClick={() => setChatInput(q)} className="p-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-all text-left shadow-sm">
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {chatHistory.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] lg:max-w-[75%] p-10 rounded-[3rem] text-lg leading-relaxed shadow-xl ${
                        m.role === 'user' ? 'bg-slate-950 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100 ring-1 ring-slate-50'
                      }`}>
                        <div className="markdown-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }} />
                      </div>
                    </div>
                  ))}

                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white p-10 rounded-[3rem] rounded-tl-none border border-slate-100 flex gap-2 items-center shadow-lg">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
             </div>

             {/* Input Area - Floated Style */}
             <div className="p-10 bg-gradient-to-t from-slate-50/80 to-transparent shrink-0">
               <form onSubmit={handleChat} className="max-w-[1200px] mx-auto w-full flex gap-4 p-5 bg-white rounded-[3rem] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.08)] ring-1 ring-slate-100">
                  <input 
                    type="text" 
                    value={chatInput} 
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Interroga la riunione... (es: Quali sono i TO-DO definitivi?)"
                    className="flex-1 bg-transparent px-8 font-bold text-slate-800 outline-none text-xl"
                  />
                  <button type="submit" disabled={isChatLoading || !chatInput.trim()} className="px-12 py-6 bg-slate-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-black transition-all disabled:opacity-30 active:scale-95 shadow-lg">
                    Chiedi all'AI
                  </button>
               </form>
               <p className="text-center text-[10px] text-slate-300 mt-6 font-black uppercase tracking-[0.5em]">L'AI risponde basandosi esclusivamente sui contenuti della trascrizione.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingView;
