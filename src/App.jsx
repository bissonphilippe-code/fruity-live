import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import { 
  Plus, TrendingUp, List, Settings, Star, Trash2, 
  MapPin, Search, Globe, X, RotateCcw, Save,
  CalendarDays, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';

// --- CONFIGURATION ---
const RENDER_BACKEND_URL = "https://fruity-backend.onrender.com"; 

const SUPPORTED_FRUITS = {
  en: ["Apple", "Banana", "Blueberry", "Cherry", "Dragonfruit", "Grape", "Kiwi", "Lemon", "Mango", "Orange", "Papaya", "Peach", "Pear", "Pineapple", "Raspberry", "Strawberry", "Watermelon"],
  fr: ["Pomme", "Banane", "Bleuet", "Cerise", "Fruit du dragon", "Raisin", "Kiwi", "Citron", "Mangue", "Orange", "Papaye", "Pêche", "Poire", "Ananas", "Framboise", "Fraise", "Melon d'eau"]
};

const translations = {
  en: {
    logButton: "Log Fruit",
    topPicks: "Top Picks",
    bestRatedIn: "Best in {region} now.",
    allLogs: "Your History",
    appPreferences: "Preferences",
    saveLog: "Save to Cloud",
    serverError: "Cloud connection issue.",
    serverWaking: "Server is waking up...",
    apiUrlLabel: "Backend API URL",
    saveUrl: "Save URL",
    tabs: { dashboard: "Harvest", list: "Notes", settings: "Shed" }
  },
  fr: {
    logButton: "Ajouter",
    topPicks: "Meilleur Choix",
    bestRatedIn: "Le top en {region}.",
    allLogs: "Historique",
    appPreferences: "Préférences",
    saveLog: "Enregistrer Cloud",
    serverError: "Connexion Cloud impossible.",
    serverWaking: "Le serveur se réveille...",
    apiUrlLabel: "URL de l'API Backend",
    saveUrl: "Enregistrer l'URL",
    tabs: { dashboard: "Récolte", list: "Notes", settings: "Atelier" }
  }
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [wakingUp, setWakingUp] = useState(false);
  const [myRegion, setMyRegion] = useState(() => localStorage.getItem('sft_region') || 'Quebec');
  const [lang, setLang] = useState(() => localStorage.getItem('sft_lang') || 'fr');
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('fruity_api_url') || RENDER_BACKEND_URL);
  const [tempApiUrl, setTempApiUrl] = useState(apiUrl);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLog, setNewLog] = useState({ fruit: '', origin: '', rating: 3, date: new Date().toISOString().split('T')[0] });

  const fetchLogs = async (retryCount = 0) => {
    try {
      if (retryCount === 0) { setLoading(true); setApiError(false); }
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`${apiUrl}/api/logs`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLogs(data.map(l => ({ ...l, dateObj: new Date(l.date) })));
      setWakingUp(false);
      setApiError(false);
    } catch (e) { 
      if (retryCount < 2) {
        setWakingUp(true);
        setTimeout(() => fetchLogs(retryCount + 1), 4000);
      } else {
        setApiError(true);
        setWakingUp(false);
      }
    } finally { 
      if (retryCount >= 2 || !wakingUp) setLoading(false); 
    }
  };

  useEffect(() => { fetchLogs(); }, [apiUrl]);

  const handleAddLog = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/api/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newLog, userRegion: myRegion })
      });
      if (res.ok) {
        fetchLogs();
        setIsAddModalOpen(false);
        setNewLog({ fruit: '', origin: '', rating: 3, date: new Date().toISOString().split('T')[0] });
      }
    } catch (e) { alert(translations[lang].serverError); }
  };

  const getFruitIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('fraise')) return '🍓';
    if (n.includes('pomme')) return '🍎';
    if (n.includes('banane')) return '🍌';
    return '🍎';
  };

  if (loading && !wakingUp) return (
    <div className="flex h-screen flex-col items-center justify-center font-bold text-orange-500 bg-white">
      <RefreshCw size={48} className="animate-spin mb-4" />
      <p className="uppercase tracking-widest text-sm">Synchronisation Cloud...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 font-sans pb-24">
      <header className="bg-white border-b sticky top-0 z-20 h-20 flex items-center px-6 justify-between shadow-sm">
        <h1 className="text-2xl font-black text-orange-500">FRUITY LIVE</h1>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-orange-500 text-white p-3 rounded-full shadow-lg active:scale-90 transition-transform">
          <Plus size={24} />
        </button>
      </header>

      <main className="p-4 max-w-xl mx-auto space-y-6">
        {wakingUp && <div className="bg-blue-50 p-4 rounded-2xl text-blue-700 text-xs font-bold animate-pulse">Réveil du serveur Render en cours...</div>}
        {apiError && <div className="bg-red-50 p-4 rounded-2xl text-red-700 text-xs font-bold">Erreur de connexion. Vérifiez l'URL dans l'Atelier.</div>}

        {activeTab === 'dashboard' && (
          <div className="bg-green-600 rounded-[2rem] p-8 text-white shadow-xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Star fill="white" size={20} /> Top Picks</h2>
            <div className="space-y-3">
              {logs.slice(0, 3).map(l => (
                <div key={l.id} className="bg-white/10 p-4 rounded-xl flex justify-between items-center">
                  <span className="font-bold">{getFruitIcon(l.fruit)} {l.fruit}</span>
                  <span className="font-black">{l.rating} ★</span>
                </div>
              ))}
              {logs.length === 0 && <p className="opacity-60 text-sm">Aucune donnée sur le Cloud.</p>}
            </div>
          </div>
        )}

        {activeTab === 'list' && (
          <div className="space-y-3">
            {logs.map(l => (
              <div key={l.id} className="bg-white p-5 rounded-3xl flex justify-between items-center shadow-sm border border-slate-100">
                <div>
                  <p className="font-bold text-lg">{getFruitIcon(l.fruit)} {l.fruit}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{l.date} • {l.origin || 'Inconnu'}</p>
                </div>
                <span className="font-black text-orange-500 text-xl">{l.rating}★</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm space-y-6 border border-slate-100">
            <h3 className="font-black uppercase text-sm tracking-widest text-slate-400">Configuration</h3>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-400">URL Backend Render</label>
              <input 
                className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-orange-500"
                value={tempApiUrl} 
                onChange={e => setTempApiUrl(e.target.value)}
              />
              <button onClick={() => { localStorage.setItem('fruity_api_url', tempApiUrl); setApiUrl(tempApiUrl); alert("URL Sauvegardée"); }} className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest">
                Mettre à jour l'URL
              </button>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl border border-slate-100 p-2 flex justify-around items-center rounded-full shadow-2xl z-20">
        {['dashboard', 'list', 'settings'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${activeTab === tab ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-300'}`}>
            {tab === 'dashboard' ? <TrendingUp /> : tab === 'list' ? <List /> : <Settings />}
          </button>
        ))}
      </nav>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-8 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800">NOTER UN FRUIT</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-slate-100 rounded-full"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddLog} className="space-y-4">
              <input placeholder="Nom du fruit" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none" value={newLog.fruit} onChange={e => setNewLog({...newLog, fruit: e.target.value})} required />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" className="p-4 bg-slate-50 rounded-2xl font-bold text-xs" value={newLog.date} onChange={e => setNewLog({...newLog, date: e.target.value})} />
                <input placeholder="Origine" className="p-4 bg-slate-50 rounded-2xl font-bold text-xs" value={newLog.origin} onChange={e => setNewLog({...newLog, origin: e.target.value})} />
              </div>
              <div className="flex justify-center gap-2 p-4 bg-orange-50 rounded-2xl">
                {[1,2,3,4,5].map(v => (
                  <button key={v} type="button" onClick={() => setNewLog({...newLog, rating: v})} className={newLog.rating >= v ? 'text-orange-500' : 'text-slate-200'}>
                    <Star size={32} fill="currentColor" stroke="none" />
                  </button>
                ))}
              </div>
              <button className="w-full bg-slate-800 text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl">Enregistrer Cloud</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- RENDU DANS LE DOM ---
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}

export default App;
