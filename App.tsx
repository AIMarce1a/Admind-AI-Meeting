
import React, { useState, useEffect } from 'react';
import Recorder from './components/Recorder';
import Archive from './components/Archive';
import VoiceProfiles from './components/VoiceProfiles';
import MeetingView from './components/MeetingView';
import { Meeting, VoiceProfile } from './types';
import { Icons } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profiles'>('dashboard');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [profiles, setProfiles] = useState<VoiceProfile[]>([]);

  useEffect(() => {
    const savedMeetings = localStorage.getItem('ai_meetings_v3');
    const savedProfiles = localStorage.getItem('ai_profiles_v3');
    if (savedMeetings) setMeetings(JSON.parse(savedMeetings));
    if (savedProfiles) setProfiles(JSON.parse(savedProfiles));
  }, []);

  useEffect(() => {
    localStorage.setItem('ai_meetings_v3', JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem('ai_profiles_v3', JSON.stringify(profiles));
  }, [profiles]);

  const handleUpdateMeeting = (updated: Meeting) => {
    setMeetings(prev => prev.map(m => m.id === updated.id ? updated : m));
    setSelectedMeeting(updated); // CRITICO: Aggiorna la vista corrente
  };

  return (
    <div className="flex h-screen bg-[#fcfdfe] text-slate-900 overflow-hidden font-sans antialiased">
      {/* Sidebar Nav */}
      <aside className="w-20 bg-white border-r border-slate-100 flex flex-col items-center py-10 gap-12 shrink-0 z-20 shadow-sm">
        <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-95 transition-all cursor-pointer" onClick={() => { setActiveTab('dashboard'); setSelectedMeeting(null); }}>
          <Icons.Mic />
        </div>
        
        <nav className="flex flex-col gap-8">
          <button 
            onClick={() => { setActiveTab('dashboard'); setSelectedMeeting(null); }} 
            className={`p-4 rounded-2xl transition-all group relative ${activeTab === 'dashboard' ? 'bg-slate-100 text-slate-900 shadow-inner' : 'text-slate-300 hover:text-slate-500'}`}
            title="Meeting Dashboard"
          >
            <Icons.Layout />
            {activeTab === 'dashboard' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-slate-900 rounded-r-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('profiles')} 
            className={`p-4 rounded-2xl transition-all group relative ${activeTab === 'profiles' ? 'bg-slate-100 text-slate-900 shadow-inner' : 'text-slate-300 hover:text-slate-500'}`}
            title="Database Voci"
          >
            <Icons.User />
            {activeTab === 'profiles' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-slate-900 rounded-r-full"></div>}
          </button>
        </nav>

        <div className="mt-auto flex flex-col gap-6">
           <button className="text-slate-200 hover:text-slate-400 transition-colors">
              <Icons.Settings />
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-8 lg:p-10 overflow-hidden relative">
          {activeTab === 'dashboard' ? (
            <div className="flex h-full gap-10">
              <div className="flex-[3] h-full flex flex-col">
                {!selectedMeeting ? (
                  <Recorder voiceProfiles={profiles} onFinish={m => { setMeetings([m, ...meetings]); setSelectedMeeting(m); }} />
                ) : (
                  <div className="h-full flex flex-col">
                    <button onClick={() => setSelectedMeeting(null)} className="mb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 flex items-center gap-2 group transition-all">
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
                       Torna alla Dashboard
                    </button>
                    <MeetingView meeting={selectedMeeting} onUpdate={handleUpdateMeeting} />
                  </div>
                )}
              </div>
              <div className="flex-1 xl:block hidden">
                <Archive 
                  meetings={meetings} 
                  activeId={selectedMeeting?.id} 
                  onSelect={m => setSelectedMeeting(m)} 
                  onDelete={id => {
                    if(confirm("Sei sicuro di voler eliminare questa sessione?")) {
                       const updated = meetings.filter(m => m.id !== id);
                       setMeetings(updated);
                       if (selectedMeeting?.id === id) setSelectedMeeting(null);
                    }
                  }} 
                />
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto h-full overflow-y-auto custom-scrollbar">
              <VoiceProfiles profiles={profiles} onAdd={p => setProfiles([...profiles, p])} onDelete={id => setProfiles(profiles.filter(p => p.id !== id))} />
            </div>
          )}
        </div>

        {/* Corporate Footer / Privacy Disclaimer */}
        <footer className="h-14 px-10 bg-white border-t border-slate-50 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Enterprise Meeting AI v3.6</span>
            <div className="flex gap-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase cursor-help hover:text-slate-600 transition-colors" title="I dati audio vengono processati in modo sicuro e non utilizzati per il training pubblico dei modelli.">Privacy Policy</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase cursor-help hover:text-slate-600 transition-colors" title="Trattamento dati conforme GDPR - Sicurezza End-to-End.">Data Security</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-300 italic">© 2024 AI Solutions for Business. Trattamento dati protetto.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
