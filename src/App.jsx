import React, { useState, useEffect, useMemo, useRef } from 'react';
// Note : Tailwind est géré nativement par l'environnement.
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import { 
  Plus, TrendingUp, List, Settings, Star, Trash2, Search, Globe, X, RotateCcw, Save,
  CalendarDays, CheckCircle2, AlertCircle, RefreshCw, AlertTriangle, MapPin
} from 'lucide-react';

// --- CONFIGURATION ---
// Mise à jour avec votre URL Render spécifique
const FALLBACK_URL = "https://fruity-backend-7qbq.onrender.com";

// Correction de l'accès aux variables d'environnement pour éviter les erreurs de build
const getEnvUrl = () => {
  try {
    // @ts-ignore
    return import.meta.env.VITE_API_URL;
  } catch (e) {
    return null;
  }
};

const ENV_URL = getEnvUrl();

const SUPPORTED_FRUITS = {
  en: ["Abiu", "Açaí", "Acerola", "Akebi", "Ackee", "Apple", "Apricot", "Avocado", "Banana", "Blackberry", "Blueberry", "Cherry", "Coconut", "Cranberry", "Date", "Dragonfruit", "Durian", "Fig", "Grape", "Grapefruit", "Guava", "Kiwi", "Lemon", "Lime", "Lychee", "Mango", "Melon", "Orange", "Papaya", "Passionfruit", "Peach", "Pear", "Persimmon", "Pineapple", "Plum", "Pomegranate", "Raspberry", "Strawberry", "Tangerine", "Watermelon"],
  fr: ["Abiu", "Açaí", "Acérola", "Akébie", "Akée", "Pomme", "Abricot", "Avocat", "Banane", "Mûre", "Bleuet", "Cerise", "Noix de coco", "Canneberge", "Datte", "Fruit du dragon", "Durian", "Figue", "Raisin", "Pamplemousse", "Goyave", "Kiwi", "Citron", "Lime", "Litchi", "Mangue", "Melon", "Orange", "Papaye", "Fruit de la passion", "Pêche", "Poire", "Kaki", "Ananas", "Prune", "Grenade", "Framboise", "Fraise", "Tangerine", "Melon d'eau"]
};

const translations = {
  en: {
    logButton: "Log Fruit",
    topPicks: "Top Picks",
    bestRatedIn: "Best in {region} now.",
    allLogs: "Your History",
    appPreferences: "Preferences",
    saveLog: "Save to Cloud",
    serverError: "Connection Issue (404). Check Backend URL.",
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
    serverError: "Erreur 404 : URL Backend incorrecte.",
    serverWaking: "Le serveur se réveille...",
    apiUrlLabel: "URL de l'API Backend",
    saveUrl: "Enregistrer l'URL",
    tabs: { dashboard: "Récolte", list: "Notes", settings: "Atelier" }
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [is404, setIs404] = useState(false);
  const [wakingUp, setWakingUp] = useState(false);
  const [myRegion, setMyRegion] = useState(() => localStorage.getItem('sft_region') || 'Quebec');
  const [lang, setLang] = useState(() => localStorage.getItem('sft_lang') || 'fr');
  
  const sanitizeUrl = (url) => {
    if (!url) return null;
    return url.endsWith('/') ? url.slice(0, -1) : url;
  };

  // Logique de priorité : LocalStorage > Env Render > Fallback (votre URL)
  const [apiUrl, setApiUrl] = useState(() => {
    const saved = localStorage.getItem('fruity_api_url');
    if (saved) return sanitizeUrl(saved);
    if (ENV_URL) return sanitizeUrl(ENV_URL);
    return FALLBACK_URL;
  });
  
  const [tempApiUrl, setTempApiUrl] = useState(apiUrl);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLog, setNewLog] = useState({ fruit: '', origin: '', rating: 3, date: new Date().toISOString().split('T')[0] });
  const [fruitSuggestions, setFruitSuggestions] = useState([]);

  const fetchLogs = async (retryCount = 0) => {
    try {
      if (retryCount === 0) { setLoading(true); setApiError(false); setIs404(false); }
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); 

      const res = await fetch(`${apiUrl}/api/logs`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (res.status === 404) {
        setIs404(true);
        setApiError(true);
        setLoading(false);
        return;
      }

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
    if (!isValidFruit) return;
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

  const saveApiUrl = () => {
    const cleanUrl = sanitizeUrl(tempApiUrl);
    localStorage.setItem('fruity_api_url', cleanUrl);
    setApiUrl(cleanUrl);
    alert("URL enregistrée ! Tentative de connexion...");
  };

  const tf = (name) => {
    if (!name) return "";
    const key = name.toLowerCase().trim();
    const foundKey = Object.keys(SUPPORTED_FRUITS.en).find(i => SUPPORTED_FRUITS.en[i].toLowerCase() === key || SUPPORTED_FRUITS.fr[i].toLowerCase() === key);
    return foundKey !== undefined ? SUPPORTED_FRUITS[lang][foundKey] : name;
  };

  const isValidFruit = useMemo(() => {
    const term = newLog.fruit.toLowerCase().trim();
    return term !== "" && SUPPORTED_FRUITS[lang].some(f => f.toLowerCase() === term);
  }, [newLog.fruit, lang]);

  useEffect(() => {
    if (newLog.fruit.trim() === '') { setFruitSuggestions([]); return; }
    const term = newLog.fruit.toLowerCase().trim();
    setFruitSuggestions(SUPPORTED_FRUITS[lang].filter(f => f.toLowerCase().includes(term) && f.toLowerCase() !== term).slice(0, 5));
  }, [newLog.fruit, lang]);

  const getFruitIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('fraise')) return '🍓';
    if (n.includes('bleuet')) return '🫐';
    if (n.includes('banane')) return '🍌';
    if (n.includes('orange')) return '🍊';
    return '🍎';
  };

  if (loading && !wakingUp) return (
    <div className="flex h-screen flex-col items-center justify-center font-bold text-orange-500 bg-white p-10 text-center">
      <RefreshCw size={48} className="animate-spin mb-4" />
      <p className="text-xl font-black uppercase tracking-tighter">Connexion Cloud...</p>
      <p className="text-[10px] text-slate-400 mt-2 font-mono break-all">{apiUrl}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 font-sans pb-24">
      <header className="bg-white border-b sticky top-0 z-20 h-20 flex items-center px-6 justify-between shadow-sm">
        <h1 className="text-3xl font-bold text-orange-500" style={{ fontFamily: "'Chewy', cursive" }}>Fruity <span className="text-slate-800">Live</span></h1>
        <div className="flex gap-2">
            {(apiError || wakingUp) && <AlertTriangle className={`${wakingUp ? 'text-blue-400 animate-pulse' : 'text-red-500 animate-bounce'}`} size={24} />}
            <button onClick={() => setIsAddModalOpen(true)} className="bg-orange-500 text-white p-3 rounded-full shadow-lg active:scale-90">
              <Plus size={24} strokeWidth={3} />
            </button>
        </div>
      </header>

      <main className="p-4 max-w-xl mx-auto space-y-6">
        {wakingUp && <div className="bg-blue-50 p-4 rounded-3xl text-blue-700 text-xs font-bold animate-pulse">Serveur en cours de réveil (Render Free)...</div>}

        {apiError && !wakingUp && (
          <div className="bg-red-50 border-2 border-red-200 p-6 rounded-[2rem] flex flex-col gap-3 text-red-700">
            <div className="flex items-center gap-3">
                <AlertCircle size={32} />
                <p className="font-black text-sm">{translations[lang].serverError}</p>
            </div>
            <div className="bg-white/50 p-4 rounded-xl space-y-2">
                <p className="text-[10px] font-mono break-all opacity-70">URL testée : {apiUrl}/api/logs</p>
                {is404 && <p className="text-[10px] font-bold">L'URL semble pointer vers le mauvais service (Static Site au lieu de Web Service).</p>}
            </div>
            <button onClick={() => setActiveTab('settings')} className="text-xs font-black bg-red-700 text-white py-4 rounded-xl uppercase tracking-widest shadow-md">Ouvrir l'Atelier</button>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="bg-green-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
            <h2 className="text-2xl font-black mb-4 flex items-center gap-2"><Star fill="white" size={24} /> {translations[lang].topPicks}</h2>
            <div className="space-y-3">
                {logs.length > 0 ? logs.slice(0, 3).map(l => (
                <div key={l.id} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl flex justify-between items-center border border-white/10">
                    <span className="font-bold text-lg">{getFruitIcon(l.fruit)} {tf(l.fruit)}</span>
                    <span className="font-black text-xl">{l.rating} ★</span>
                </div>
                )) : <p className="opacity-60 italic text-sm text-center py-4">Aucune donnée disponible.</p>}
            </div>
          </div>
        )}

        {activeTab === 'list' && (
          <div className="space-y-3">
             <h2 className="text-xl font-black px-1 uppercase tracking-tighter">Journal Cloud</h2>
             {logs.map(l => (
                <div key={l.id} className="bg-white p-5 rounded-3xl flex justify-between items-center shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="text-4xl bg-slate-50 p-2 rounded-2xl">{getFruitIcon(l.fruit)}</div>
                        <div>
                            <p className="font-black text-slate-700 text-lg">{tf(l.fruit)}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{l.date} • {l.origin || '?'}</p>
                        </div>
                    </div>
                    <span className="font-black text-orange-500 text-xl">{l.rating}★</span>
                </div>
             ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-black text-2xl flex items-center gap-3"><Settings className="text-slate-300" /> Atelier</h3>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{translations[lang].apiUrlLabel}</label>
              <input 
                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-sm outline-none focus:border-orange-500 transition-all"
                placeholder="https://fruity-backend-7qbq.onrender.com"
                value={tempApiUrl} 
                onChange={e => setTempApiUrl(e.target.value)}
              />
              <button onClick={saveApiUrl} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                  <Save size={18} /> {translations[lang].saveUrl}
              </button>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl border border-white/50 p-2 flex justify-around items-center rounded-full shadow-2xl z-20 md:max-w-md md:mx-auto">
        {['dashboard', 'list', 'settings'].map(id => (
          <button key={id} onClick={() => setActiveTab(id)} className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all ${activeTab === id ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-300'}`}>
            {id === 'dashboard' ? <TrendingUp /> : id === 'list' ? <List /> : <Settings />}
          </button>
        ))}
      </nav>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-8 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl space-y-6 animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Noter un fruit</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-3 bg-slate-50 rounded-full text-slate-400"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddLog} className="space-y-4">
              <input placeholder="Nom du fruit..." className="w-full p-4 bg-slate-50 rounded-2xl font-black outline-none border-2 border-transparent focus:border-orange-500" value={newLog.fruit} onChange={e => setNewLog({...newLog, fruit: e.target.value})} required />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" className="p-4 bg-slate-50 rounded-2xl font-black text-xs outline-none" value={newLog.date} onChange={e => setNewLog({...newLog, date: e.target.value})} />
                <input placeholder="Origine" className="p-4 bg-slate-50 rounded-2xl font-black text-xs outline-none" value={newLog.origin} onChange={e => setNewLog({...newLog, origin: e.target.value})} />
              </div>
              <div className="p-6 bg-orange-50 rounded-2xl flex flex-col items-center gap-3">
                <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Qualité</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(v => (
                    <button key={v} type="button" onClick={() => setNewLog({...newLog, rating: v})} className={newLog.rating >= v ? 'text-orange-500' : 'text-slate-200'}><Star size={32} fill="currentColor" /></button>
                  ))}
                </div>
              </div>
              <button disabled={!isValidFruit} className="w-full bg-slate-800 text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl disabled:opacity-20 transition-all">{translations[lang].saveLog}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
