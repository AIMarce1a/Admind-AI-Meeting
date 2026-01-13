
import React from 'react';
import { Meeting } from '../types';
import { Icons } from '../constants';

interface Props {
  meetings: Meeting[];
  onSelect: (meeting: Meeting) => void;
  onDelete: (id: string) => void;
  activeId?: string;
}

const Archive: React.FC<Props> = ({ meetings, onSelect, onDelete, activeId }) => {
  return (
    <div className="h-full flex flex-col bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
      <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
          <Icons.History /> Archivio
        </h2>
        <span className="text-[10px] bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-black uppercase tracking-widest">{meetings.length} Sessioni</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {meetings.sort((a,b) => b.date.localeCompare(a.date)).map(m => (
          <div
            key={m.id}
            onClick={() => onSelect(m)}
            className={`group p-6 rounded-3xl cursor-pointer transition-all border relative overflow-hidden ${
              activeId === m.id 
                ? 'bg-indigo-50/50 border-indigo-200 shadow-sm' 
                : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-md'
            }`}
          >
            {activeId === m.id && <div className="absolute left-0 top-0 w-1.5 h-full bg-indigo-600" />}
            
            <div className="flex justify-between items-start mb-3">
              <h3 className={`font-bold text-sm leading-tight pr-4 ${activeId === m.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                {m.title}
              </h3>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(m.id); }}
                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                  {new Date(m.date).toLocaleDateString('it-IT')}
                </span>
                <span className="text-[9px] text-slate-300 font-medium">
                  {new Date(m.date).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[9px] font-black text-indigo-500 uppercase tracking-tighter">
                <span>{m.transcript.length} PARTI</span>
                <Icons.ChevronRight />
              </div>
            </div>
          </div>
        ))}
        {meetings.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-full mx-auto mb-4 flex items-center justify-center text-slate-200 font-bold text-xl">0</div>
            <p className="text-slate-400 font-medium text-sm">Archivio vuoto.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Archive;
