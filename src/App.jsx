import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import { 
  Plus, TrendingUp, List, Settings, Star, Trash2, Search, Globe, X, RotateCcw, Save,
  CalendarDays, CheckCircle2, AlertCircle, RefreshCw, AlertTriangle, MapPin,
  Download, Upload, FileText, Languages
} from 'lucide-react';

// --- CONFIGURATION ---
const FALLBACK_URL = "https://fruity-backend-7qbq.onrender.com";

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
    serverError: "Connection Issue. Check Backend URL.",
    serverWaking: "Server is waking up...",
    apiUrlLabel: "Backend API URL",
    saveUrl: "Save URL",
    language: "Language",
    currentRegion: "My Region",
    dataTools: "Data Tools",
    exportCsv: "Export CSV",
    importCsv: "Import CSV",
    tabs: { dashboard: "Harvest", list: "Notes", settings: "Shed" }
  },
  fr: {
    logButton: "Ajouter",
    topPicks: "Meilleur Choix",
    bestRatedIn: "Le top en {region}.",
    allLogs: "Historique",
    appPreferences: "Préférences",
    saveLog: "Enregistrer Cloud",
    serverError: "Erreur de connexion Backend.",
    serverWaking: "Le serveur se réveille...",
    apiUrlLabel: "URL de l'API Backend",
    saveUrl: "Enregistrer l'URL",
    language: "Langue",
    currentRegion: "Ma Région",
    dataTools: "Outils de données",
    exportCsv: "Exporter CSV",
    importCsv: "Importer CSV",
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

  const fileInputRef = useRef(null);

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

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette observation ?')) return;
    try {
      const res = await fetch(`${apiUrl}/api/logs/${id}`, { method: 'DELETE' });
      if (res.ok) fetchLogs();
    } catch (e) { 
      alert(translations[lang].serverError);
    }
  };

  const handleExportCsv = () => {
    if (logs.length === 0) return;
    const headers = ["Date", "Fruit", "Origin", "Rating", "Region"];
    const rows = logs.map(l => [l.date, l.fruit, l.origin || "", l.rating, l.userRegion || ""]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `fruity_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCsv = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const rows = text.split("\n").slice(1); // Skip headers
      for (const row of rows) {
        const [date, fruit, origin, rating, region] = row.split(",");
        if (fruit && rating) {
          await fetch(`${apiUrl}/api/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                date: date.trim(), 
                fruit: fruit.trim(), 
                origin: origin.trim(), 
                rating: parseInt(rating.trim()), 
                userRegion: region ? region.trim() : myRegion 
            })
          });
        }
      }
      fetchLogs();
      alert("Importation terminée !");
    };
    reader.readAsText(file);
  };

  const saveSettings = () => {
    localStorage.setItem('sft_region', myRegion);
    localStorage.setItem('sft_lang', lang);
    const cleanUrl = sanitizeUrl(tempApiUrl);
    localStorage.setItem('fruity_api_url', cleanUrl);
    setApiUrl(cleanUrl);
    alert("Paramètres enregistrés !");
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
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&family=Chewy&display=swap');`}</style>
      
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

        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="flex justify-between items-center px-1">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
                    <TrendingUp size={20} className="text-orange-500" /> {translations[lang].tabs.dashboard}
                </h2>
                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                    <MapPin size={12} className="text-green-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{myRegion}</span>
                </div>
            </div>
            
            <div className="bg-green-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
              <h2 className="text-2xl font-black mb-1 flex items-center gap-2"><Star fill="white" size={24} /> {translations[lang].topPicks}</h2>
              <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-6">{translations[lang].bestRatedIn.replace('{region}', myRegion)}</p>
              <div className="space-y-3">
                  {logs.length > 0 ? logs.slice(0, 3).map(l => (
                  <div key={l.id} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl flex justify-between items-center border border-white/10">
                      <span className="font-bold text-lg">{getFruitIcon(l.fruit)} {tf(l.fruit)}</span>
                      <span className="font-black text-xl">{l.rating} ★</span>
                  </div>
                  )) : <p className="opacity-60 italic text-sm text-center py-4">Aucune donnée disponible.</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'list' && (
          <div className="space-y-4 animate-in fade-in duration-500">
             <h2 className="text-xl font-black px-1 uppercase tracking-tighter">{translations[lang].allLogs}</h2>
             <div className="space-y-3">
               {logs.map(l => (
                  <div key={l.id} className="bg-white p-5 rounded-3xl flex justify-between items-center shadow-sm border border-slate-100 group">
                      <div className="flex items-center gap-4">
                          <div className="text-4xl bg-slate-50 p-2 rounded-2xl">{getFruitIcon(l.fruit)}</div>
                          <div>
                              <p className="font-black text-slate-700 text-lg leading-tight">{tf(l.fruit)}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{l.date} • {l.origin || '?'}</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-black text-orange-500 text-xl">{l.rating}★</span>
                        <button onClick={() => handleDelete(l.id)} className="text-slate-200 hover:text-red-500 transition-colors">
                            <Trash2 size={18} />
                        </button>
                      </div>
                  </div>
               ))}
             </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
              <h3 className="font-black text-2xl flex items-center gap-3"><Settings className="text-slate-300" /> {translations[lang].tabs.settings}</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{translations[lang].language}</label>
                  <div className="flex gap-2 p-1 bg-slate-50 rounded-xl mt-2">
                    <button onClick={() => setLang('fr')} className={`flex-1 py-3 rounded-lg text-xs font-black transition-all ${lang === 'fr' ? 'bg-white shadow-sm text-orange-500' : 'text-slate-400'}`}>FRANÇAIS</button>
                    <button onClick={() => setLang('en')} className={`flex-1 py-3 rounded-lg text-xs font-black transition-all ${lang === 'en' ? 'bg-white shadow-sm text-orange-500' : 'text-slate-400'}`}>ENGLISH</button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{translations[lang].currentRegion}</label>
                  <input 
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-sm outline-none mt-2 focus:border-orange-500"
                    value={myRegion} 
                    onChange={e => setMyRegion(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{translations[lang].apiUrlLabel}</label>
                  <input 
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-sm outline-none mt-2 focus:border-orange-500"
                    value={tempApiUrl} 
                    onChange={e => setTempApiUrl(e.target.value)}
                  />
                </div>

                <button onClick={saveSettings} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
                    <Save size={18} /> {translations[lang].saveUrl}
                </button>

                <div className="pt-6 border-t border-slate-100 space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{translations[lang].dataTools}</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={handleExportCsv} className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                            <Download size={16} /> {translations[lang].exportCsv}
                        </button>
                        <button onClick={() => fileInputRef.current.click()} className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                            <Upload size={16} /> {translations[lang].importCsv}
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleImportCsv} accept=".csv" className="hidden" />
                    </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl border border-white/50 p-2 flex justify-around items-center rounded-full shadow-2xl z-20 md:max-w-md md:mx-auto">
        {[ { id: 'dashboard', icon: <TrendingUp />, label: translations[lang].tabs.dashboard }, { id: 'list', icon: <List />, label: translations[lang].tabs.list }, { id: 'settings', icon: <Settings />, label: translations[lang].tabs.settings } ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all ${activeTab === tab.id ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-300'}`}>
            {tab.icon}
            <span className="text-[8px] font-black uppercase mt-1 tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </nav>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-8 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl space-y-6 animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">{translations[lang].logModalTitle}</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-3 bg-slate-50 rounded-full text-slate-400"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddLog} className="space-y-6">
              <div className="relative">
                <Search className={`absolute left-4 top-4 ${isValidFruit ? 'text-green-500' : 'text-slate-300'}`} size={20} />
                <input 
                  placeholder={translations[lang].searchPlaceholder} 
                  className={`w-full pl-12 pr-10 py-4 bg-slate-50 rounded-2xl font-black outline-none border-2 transition-all ${isValidFruit ? 'border-green-200 bg-green-50/50' : 'border-transparent focus:border-orange-400'}`}
                  value={newLog.fruit}
                  onChange={e => setNewLog({...newLog, fruit: e.target.value})} 
                  required 
                />
              </div>

              {fruitSuggestions.length > 0 && !isValidFruit && (
                <div className="flex flex-wrap gap-2 p-1">
                  {fruitSuggestions.map(f => (
                    <button key={f} type="button" onClick={() => setNewLog({...newLog, fruit: f})} className="text-[10px] bg-orange-50 text-orange-600 px-3 py-2 rounded-xl font-black hover:bg-orange-100 uppercase tracking-wider shadow-sm">{f}</button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <input type="date" className="p-4 bg-slate-50 rounded-2xl font-black text-xs outline-none" value={newLog.date} onChange={e => setNewLog({...newLog, date: e.target.value})} />
                <input placeholder={translations[lang].originCountry} className="p-4 bg-slate-50 rounded-2xl font-black text-xs outline-none" value={newLog.origin} onChange={e => setNewLog({...newLog, origin: e.target.value})} />
              </div>
              
              <div className="p-6 bg-orange-50 rounded-3xl flex flex-col items-center gap-3">
                <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest">{translations[lang].qualityRating}</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(v => (
                    <button key={v} type="button" onClick={() => setNewLog({...newLog, rating: v})} className={newLog.rating >= v ? 'text-orange-500' : 'text-slate-200'}><Star size={32} fill="currentColor" /></button>
                  ))}
                </div>
              </div>

              <button disabled={!isValidFruit} className="w-full bg-slate-800 text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl disabled:opacity-20 active:scale-95 transition-all">
                {translations[lang].saveLog}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
