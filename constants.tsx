
import React from 'react';

export const APP_CONFIG = {
  MODEL_LIVE: 'gemini-2.5-flash-native-audio-preview-12-2025',
  MODEL_ANALYSIS: 'gemini-3-flash-preview',
  SAMPLE_RATE_INPUT: 16000,
  SAMPLE_RATE_OUTPUT: 24000
};

export const PROMPTS = {
  SYSTEM_INSTRUCTION_RECORDER: `Agisci come un sistema di trascrizione e diarizzazione professionale di altissimo livello.
Il tuo compito è trascrivere accuratamente la conversazione e identificare in tempo reale chi sta parlando.

DATABASE ORATORI CONOSCIUTI:
{profiles}

ISTRUZIONI CRITICHE:
1. Analizza costantemente il timbro, il tono e le caratteristiche vocali degli oratori.
2. Confronta l'audio in ingresso con le descrizioni nel database.
3. Ogni volta che trascrivi un intervento, identifica l'oratore.
4. Se riconosci l'oratore, usa il suo Nome esatto dal database.
5. Se l'oratore non è nel database, assegnali un identificativo coerente come "Speaker 1", "Speaker 2", ecc. mantenedo lo stesso ID per la stessa voce durante tutta la sessione.
6. La trascrizione deve essere fedele, includendo punteggiatura corretta.`,
  
  GENERATE_SUMMARY: (transcript: string) => `Analizza professionalmente questa trascrizione di riunione. Produci un Executive Summary strutturato con: 
- Obiettivo dell'incontro
- Punti chiave discussi
- Decisioni prese
- Clima della riunione. 
Usa un tono business formale.\n\nTrascrizione:\n${transcript}`,
  
  GENERATE_MINUTES: (transcript: string) => `Genera un Verbale di Riunione (Meeting Minutes) professionale basato sulla seguente trascrizione. Includi:
- Intestazione (Data/Partecipanti identificati)
- Ordine del Giorno rilevato
- Sintesi analitica degli interventi per oratore
- Conclusioni.\n\nTrascrizione:\n${transcript}`,
  
  GENERATE_TODO: (transcript: string) => `Estrai esclusivamente i Action Items (To-Do List) dalla trascrizione. Per ogni task indica:
- Descrizione chiara del task
- Responsabile (se menzionato)
- Eventuale deadline o priorità.\n\nTrascrizione:\n${transcript}`,

  CHAT_CONTEXT: (meetingTitle: string, transcript: string) => `Sei l'assistente virtuale esperto per la riunione "${meetingTitle}". 
Hai accesso alla trascrizione completa qui sotto. Rispondi in modo professionale, preciso e conciso basandoti sui fatti discussi.
Se l'utente chiede qualcosa non presente nella trascrizione, rispondi gentilmente che l'argomento non è stato trattato.\n\nTrascrizione:\n${transcript}`
};

export const Icons = {
  Mic: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
  ),
  Stop: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="5" y="5" rx="2"/></svg>
  ),
  History: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
  ),
  Layout: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
  ),
  ChevronRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  )
};
