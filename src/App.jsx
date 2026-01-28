import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import { 
  Plus, TrendingUp, List, Settings, Star, Trash2, Upload, Database,
  MapPin, ChevronDown, Search, Globe, BarChart2, AlertTriangle,
  ShoppingBag, CalendarDays, ArrowLeft, X, RotateCcw, Download,
  FileDown, CheckCircle2, AlertCircle, RefreshCw, Save
} from 'lucide-react';

// --- CONFIGURATION PAR DÉFAUT ---
// Cette URL est utilisée si aucune autre n'est enregistrée localement.
const DEFAULT_API_URL = "https://fruity-backend.onrender.com"; 

const SUPPORTED_FRUITS = {
  en: ["Abiu", "Açaí", "Acerola", "Akebi", "Ackee", "African Cherry Orange", "Apple", "Apricot", "Aratiles", "Araza", "Avocado", "Banana", "Bilberry", "Blackberry", "Blackcurrant", "Black sapote", "Blueberry", "Boysenberry", "Breadfruit", "Buddha's hand", "Cactus pear", "Canistel", "Catmon", "Cempedak", "Cherimoya", "Cherry", "Chico fruit", "Citron", "Cloudberry", "Coco de mer", "Coconut", "Crab apple", "Cranberry", "Currant", "Damson", "Date", "Dragonfruit", "Durian", "Elderberry", "Feijoa", "Fig", "Finger Lime", "Gac", "Goji berry", "Gooseberry", "Grape", "Grapefruit", "Grewia asiatica", "Guava", "Guarana", "Hala fruit", "Haws", "Honeyberry", "Huckleberry", "Jabuticaba", "Jackfruit", "Jambul", "Japanese plum", "Jostaberry", "Jujube", "Juniper berry", "Kaffir lime", "Kiwano", "Kiwifruit", "Kumquat", "Lanzones", "Lemon", "Lime", "Loganberry", "Longan", "Loquat", "Lulo", "Lychee", "Magellan Barberry", "Macopa", "Mamey apple", "Mamey Sapote", "Mango", "Mangosteen", "Marionberry", "Medlar", "Cantaloupe", "Galia melon", "Honeydew", "Mouse melon", "Muskmelon", "Watermelon", "Miracle fruit", "Mohsina", "Momordica fruit", "Monstera deliciosa", "Mulberry", "Nance", "Nectarine", "Orange", "Blood orange", "Clementine", "Mandarine", "Tangerine", "Papaya", "Passionfruit", "Pawpaw", "Peach", "Pear", "Persimmon", "Pineapple", "Pineberry", "Plantain", "Plum", "Prune", "Plumcot", "Pomegranate", "Pomelo", "Quince", "Raspberry", "Salmonberry", "Rambutan", "Redcurrant", "Rose apple", "Salal berry", "Salak", "Santol", "Sapodilla", "Sapote", "Sarguelas", "Saskatoon berry", "Satsuma", "Sloe", "Soursop", "Star apple", "Star fruit", "Strawberry", "Sugar apple", "Suriname cherry", "Tamarillo", "Tamarind", "Tangelo", "Tayberry", "Thimbleberry", "Ugli fruit", "White currant", "White sapote", "Ximenia", "Yuzu"],
  fr: ["Abiu", "Açaí", "Acérola", "Akébie", "Akée", "Citron-cerise africain", "Pomme", "Abricot", "Aratiles", "Arazà", "Avocat", "Banane", "Myrtille", "Mûre", "Cassis", "Sapotille noire", "Bleuet", "Mûre de Boysen", "Fruit à pain", "Main de Bouddha", "Figue de Barbarie", "Canistel", "Catmon", "Cempedak", "Chérimole", "Cerise", "Sapotille", "Cédrat", "Chypre", "Noix de coco", "Pomme sauvage", "Canneberge", "Groseille", "Prune de Damas", "Datte", "Fruit du dragon", "Durian", "Sureau", "Goyave du Brésil", "Figue", "Citron caviar", "Gac", "Baie de Goji", "Groseille à maquereau", "Raisin", "Pamplemousse", "Phalsa", "Goyave", "Guarana", "Fruit de Hala", "Cenelle", "Camérise", "Airelle", "Jaboticaba", "Jaquier", "Jamelonier", "Prune japonaise", "Casseille", "Jujube", "Baie de genièvre", "Combava", "Kiwano", "Kiwi", "Kumquat", "Langsat", "Citron", "Lime", "Loganberry", "Longane", "Néflier du Japon", "Lulo", "Litchi", "Calafate", "Jamrose", "Abricot des Antilles", "Sapotille mamey", "Mangue", "Mangoustan", "Marionberry", "Nèfle", "Cantaloup", "Melon Galia", "Melon miel", "Melothria scabra", "Melon brodé", "Melon d'eau", "Fruit miracle", "Mohsina", "Margose", "Cériman", "Mûre sauvage", "Nance", "Nectarine", "Orange", "Orange sanguine", "Clémentine", "Mandarine", "Tangerine", "Papaye", "Fruit de la passion", "Asimine", "Pêche", "Poire", "Kaki", "Ananas", "Fraise blanche", "Banane plantain", "Prune", "Pruneau", "Plumcot", "Grenade", "Pomélo", "Coing", "Framboise", "Ronce parviflore", "Ramboutan", "Groseille rouge", "Pomme d'eau", "Salal", "Salak", "Santol", "Sapodilla", "Sapote", "Sarguelas", "Amélanche", "Satsuma", "Prunelle", "Corossol", "Caïmite", "Carambole", "Fraise", "Pomme cannelle", "Cerise de Cayenne", "Tamarillo", "Tamarin", "Tangelo", "Tayberry", "Ronce à petites fleurs", "Ugli", "Groseille blanche", "Sapote blanche", "Ximenia", "Yuzu"]
};

const translations = {
  en: {
    logButton: "Log Fruit",
    searchPlaceholder: "Find a fruit...",
    backToDashboard: "Harvest",
    noLogsForFruit: "No logs found for this fruit in {region} yet.",
    totalEntries: "entries",
    insightsFor: "Insights for",
    topPicks: "Top Picks",
    bestRatedIn: "Best in {region} now.",
    noData: "No data yet.",
    allLogs: "Your History",
    appPreferences: "Preferences",
    language: "Language",
    currentRegion: "My Region",
    dataManagement: "Data",
    logModalTitle: "Log a Fruit",
    fruitName: "Fruit Name",
    datePurchased: "Date",
    originCountry: "Origin",
    qualityRating: "Rating",
    saveLog: "Save to Cloud",
    invalidFruitWarn: "Please select from the approved list.",
    serverError: "Server error or 404. Check your URL.",
    serverWaking: "Server is waking up, please wait...",
    apiUrlLabel: "API Backend URL",
    saveUrl: "Save URL",
    tabs: { dashboard: "Harvest", trends: "Almanac", list: "Observations", settings: "Shed" },
    fruits: Object.fromEntries(SUPPORTED_FRUITS.en.map((f, i) => [f.toLowerCase(), f]))
  },
  fr: {
    logButton: "Ajouter",
    searchPlaceholder: "Chercher un fruit...",
    backToDashboard: "Récolte",
    noLogsForFruit: "Aucun historique pour ce fruit en {region}.",
    totalEntries: "entrées",
    insightsFor: "Aperçu pour",
    topPicks: "Meilleur Choix",
    bestRatedIn: "Le top en {region}.",
    noData: "Aucune donnée.",
    allLogs: "Historique",
    appPreferences: "Préférences",
    language: "Langue",
    currentRegion: "Ma Région",
    dataManagement: "Données",
    logModalTitle: "Noter un Fruit",
    fruitName: "Fruit",
    datePurchased: "Date",
    originCountry: "Origine",
    qualityRating: "Qualité",
    saveLog: "Enregistrer Cloud",
    invalidFruitWarn: "Veuillez choisir dans la liste.",
    serverError: "Erreur serveur (404 ou réseau). Vérifiez l'URL.",
    serverWaking: "Le serveur se réveille, patientez...",
    apiUrlLabel: "URL du Backend Render",
    saveUrl: "Enregistrer l'URL",
    tabs: { dashboard: "Récolte", trends: "Almanach", list: "Observations", settings: "Atelier" },
    fruits: Object.fromEntries(SUPPORTED_FRUITS.en.map((f, i) => [f.toLowerCase(), SUPPORTED_FRUITS.fr[i]]))
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [wakingUp, setWakingUp] = useState(false);
  const [myRegion, setMyRegion] = useState(() => localStorage.getItem('sft_region') || 'Quebec');
  const [lang, setLang] = useState(() => localStorage.getItem('sft_lang') || 'fr');
  
  // Gestion de l'URL API dynamique
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem('fruity_api_url') || DEFAULT_API_URL);
  const [tempApiUrl, setTempApiUrl] = useState(apiUrl);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLog, setNewLog] = useState({ fruit: '', origin: '', rating: 3, date: new Date().toISOString().split('T')[0], store: '' });
  const [fruitSuggestions, setFruitSuggestions] = useState([]);

  // Récupération des données avec gestion d'erreurs améliorée
  const fetchLogs = async (retryCount = 0) => {
    try {
      if (retryCount === 0) {
        setLoading(true);
        setApiError(false);
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); 

      const res = await fetch(`${apiUrl}/api/logs`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Code : ${res.status}`);
      }
      
      const data = await res.json();
      setLogs(data.map(l => ({ ...l, dateObj: new Date(l.date) })));
      setWakingUp(false);
      setApiError(false);
    } catch (e) { 
      console.error("Fetch error:", e);
      
      if (retryCount < 2) {
        setWakingUp(true);
        setTimeout(() => fetchLogs(retryCount + 1), 3000);
      } else {
        setApiError(true);
        setWakingUp(false);
      }
    } finally { 
      if (retryCount >= 2 || !wakingUp) setLoading(false); 
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [apiUrl]);

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
        setNewLog({ fruit: '', origin: '', rating: 3, date: new Date().toISOString().split('T')[0], store: '' });
      } else {
        throw new Error(`Ajout impossible : ${res.status}`);
      }
    } catch (e) { 
      console.error(e);
      alert(t('serverError'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette observation ?')) return;
    try {
      const res = await fetch(`${apiUrl}/api/logs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchLogs();
      } else {
        throw new Error(`Suppression impossible : ${res.status}`);
      }
    } catch (e) { 
      console.error(e); 
      alert(t('serverError'));
    }
  };

  const saveApiUrl = () => {
    localStorage.setItem('fruity_api_url', tempApiUrl);
    setApiUrl(tempApiUrl);
    alert("URL enregistrée ! Rechargement en cours...");
  };

  const t = (path) => {
    const keys = path.split('.');
    let value = translations[lang];
    for (const key of keys) { if (value && value[key]) { value = value[key]; } else { return path; } }
    return value;
  };

  const tf = (name) => {
    if (!name) return "";
    const key = name.toLowerCase().trim();
    const foundKey = Object.keys(translations.en.fruits).find(k => translations.en.fruits[k].toLowerCase() === key || translations.fr.fruits[k].toLowerCase() === key);
    return foundKey ? translations[lang].fruits[foundKey] : name;
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
    if (!name) return "🍎";
    const n = name.toLowerCase();
    if (n.includes('fraise')) return '🍓';
    if (n.includes('bleuet')) return '🫐';
    if (n.includes('ananas')) return '🍍';
    if (n.includes('banane')) return '🍌';
    if (n.includes('orange')) return '🍊';
    return '🍎';
  };

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const regionalLogs = logs.filter(log => (log.userRegion || 'Quebec') === myRegion);
    const logsThisMonth = regionalLogs.filter(log => log.dateObj.getMonth() === currentMonth);
    const fruitStats = {};
    logsThisMonth.forEach(log => {
      if (!fruitStats[log.fruit]) fruitStats[log.fruit] = { weightedSum: 0, totalWeight: 0, count: 0 };
      const weight = Math.max(0.2, 1 - ((currentYear - log.dateObj.getFullYear()) * 0.2));
      fruitStats[log.fruit].weightedSum += (log.rating * weight);
      fruitStats[log.fruit].totalWeight += weight;
      fruitStats[log.fruit].count += 1;
    });
    const allStats = Object.entries(fruitStats).map(([fruit, data]) => ({ fruit, avgRating: data.weightedSum / (data.totalWeight || 1), count: data.count }));
    return { topPicks: allStats.filter(i => i.avgRating >= 3.5).sort((a, b) => b.avgRating - a.avgRating), regionalLogs };
  }, [logs, myRegion]);

  if (loading && !wakingUp) return <div className="flex h-screen flex-col items-center justify-center font-bold text-orange-500 animate-pulse bg-white p-10 text-center">
    <RefreshCw size={48} className="animate-spin mb-4" />
    <p className="text-xl font-black uppercase tracking-tighter">Initialisation Cloud</p>
    <p className="text-xs text-slate-400 mt-2">Tentative de connexion à {apiUrl}</p>
  </div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 font-sans pb-24">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&family=Chewy&display=swap');`}</style>
      
      <header className="bg-white border-b sticky top-0 z-20 h-20 flex items-center px-4 justify-between shadow-sm">
        <h1 className="text-3xl font-bold text-orange-500" style={{ fontFamily: "'Chewy', cursive" }}>Fruity</h1>
        <div className="flex gap-2">
            {(apiError || wakingUp) && <AlertTriangle className={`${wakingUp ? 'text-blue-400 animate-pulse' : 'text-red-500 animate-bounce'}`} size={24} />}
            <button onClick={() => setIsAddModalOpen(true)} className="bg-orange-500 text-white p-2.5 rounded-full hover:bg-orange-600 transition-colors shadow-lg active:scale-90">
              <Plus size={24} strokeWidth={3} />
            </button>
        </div>
      </header>

      <main className="p-4 max-w-xl mx-auto space-y-6">
        {wakingUp && (
          <div className="bg-blue-50 border-2 border-blue-100 p-4 rounded-2xl flex items-center gap-3 text-blue-700 animate-in fade-in">
             <RefreshCw size={20} className="animate-spin" />
             <p className="text-xs font-black uppercase tracking-wider">{t('serverWaking')}</p>
          </div>
        )}

        {apiError && !wakingUp && (
          <div className="bg-red-50 border-2 border-red-200 p-5 rounded-3xl flex flex-col gap-3 text-red-700 animate-in shake">
            <div className="flex items-center gap-3">
                <AlertCircle size={32} />
                <p className="font-black text-sm leading-tight">{t('serverError')}</p>
            </div>
            <p className="text-[10px] bg-white/50 p-2 rounded-lg font-bold opacity-80">URL actuelle : {apiUrl}</p>
            <button onClick={() => setActiveTab('settings')} className="text-xs font-black bg-red-700 text-white py-2 rounded-xl uppercase tracking-widest">Corriger l'URL dans l'Atelier</button>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="bg-green-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-2xl font-black mb-1 flex items-center gap-2"><Star fill="white" size={24} /> Top Picks</h2>
                <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-6">{t('bestRatedIn', { region: myRegion })}</p>
                <div className="space-y-3">
                    {logs.length > 0 ? stats.topPicks.slice(0, 3).map(l => (
                    <div key={l.fruit} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl flex justify-between items-center border border-white/10">
                        <span className="flex items-center gap-3 font-bold text-lg">{getFruitIcon(l.fruit)} {tf(l.fruit)}</span>
                        <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                            <span className="font-black text-xl">{l.avgRating.toFixed(1)}</span>
                            <Star size={12} fill="white" />
                        </div>
                    </div>
                    )) : <p className="text-white/60 italic text-sm text-center py-4">Aucune donnée trouvée.</p>}
                </div>
              </div>
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
            </div>
          </div>
        )}

        {activeTab === 'list' && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex justify-between items-center px-1">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Journal</h2>
                <span className="bg-white shadow-sm text-slate-400 text-[10px] font-black px-3 py-1 rounded-full uppercase border border-slate-100">{logs.length} NOTES</span>
            </div>
            <div className="space-y-3">
                {logs.map(l => (
                <div key={l.id} className="bg-white p-5 rounded-3xl flex justify-between items-center border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="text-4xl bg-slate-50 p-2 rounded-2xl group-hover:scale-110 transition-transform">{getFruitIcon(l.fruit)}</div>
                        <div>
                            <p className="font-black text-slate-700 text-lg leading-tight">{tf(l.fruit)}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <CalendarDays size={12} className="text-slate-300" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{l.date}</p>
                                {l.origin && <span className="text-[10px] text-slate-300">•</span>}
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{l.origin}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                    <span className="font-black text-orange-500 text-xl">{l.rating}★</span>
                    <button onClick={() => handleDelete(l.id)} className="text-slate-200 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-all">
                        <Trash2 size={20} />
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
              <h3 className="font-black text-2xl flex items-center gap-3 text-slate-800 uppercase tracking-widest text-sm"><Settings size={18}/> {t('appPreferences')}</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('apiUrlLabel')}</label>
                  <div className="flex flex-col gap-2 mt-2">
                    <input 
                        className={`w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-orange-400 transition-all text-slate-700 ${apiError ? 'border-red-200' : 'border-transparent'}`}
                        placeholder="https://votre-backend.onrender.com"
                        value={tempApiUrl} 
                        onChange={(e) => setTempApiUrl(e.target.value)}
                    />
                    <button onClick={saveApiUrl} className="w-full py-3 bg-orange-500 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg">
                        <Save size={16} /> {t('saveUrl')}
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Langue / Language</label>
                  <div className="flex gap-3 mt-2 p-1 bg-slate-50 rounded-2xl">
                    <button onClick={() => setLang('fr')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${lang === 'fr' ? 'bg-white text-orange-500 shadow-md' : 'text-slate-400'}`}>FRANÇAIS</button>
                    <button onClick={() => setLang('en')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${lang === 'en' ? 'bg-white text-orange-500 shadow-md' : 'text-slate-400'}`}>ENGLISH</button>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                    <button onClick={() => fetchLogs()} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-xl">
                        <RotateCcw size={18} /> Recharger les données
                    </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl border border-white/50 p-2 flex justify-around items-center rounded-full shadow-2xl z-20 md:max-w-md md:mx-auto">
        {[ { id: 'dashboard', icon: <TrendingUp />, label: "Harvest" }, { id: 'list', icon: <List />, label: "Journal" }, { id: 'settings', icon: <Settings />, label: "Shed" } ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all ${activeTab === tab.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'text-slate-300'}`}>
            {tab.icon}
            <span className="text-[8px] font-black uppercase mt-1 tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </nav>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md p-8 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl space-y-6 animate-in slide-in-from-bottom-10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">Nouvelle <br/> Note</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-3 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors text-slate-400"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleAddLog} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Choix du fruit</label>
                <div className="relative">
                  <Search className={`absolute left-4 top-4 ${isValidFruit ? 'text-green-500' : 'text-slate-300'}`} size={20} />
                  <input 
                    placeholder="Tapez un nom..." 
                    className={`w-full pl-12 pr-10 py-4 bg-slate-50 rounded-2xl font-black outline-none border-2 transition-all ${isValidFruit ? 'border-green-200 bg-green-50/50' : 'border-transparent focus:border-orange-400'}`}
                    value={newLog.fruit}
                    onChange={e => setNewLog({...newLog, fruit: e.target.value})} 
                    required 
                  />
                  {isValidFruit && <CheckCircle2 className="absolute right-4 top-4 text-green-500" size={20} />}
                </div>
              </div>

              {fruitSuggestions.length > 0 && !isValidFruit && (
                <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 p-1">
                  {fruitSuggestions.map(f => (
                    <button key={f} type="button" onClick={() => setNewLog({...newLog, fruit: f})} className="text-[10px] bg-orange-50 text-orange-600 px-3 py-2 rounded-xl font-black hover:bg-orange-100 transition-colors uppercase tracking-wider shadow-sm">{f}</button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date d'achat</label>
                  <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl font-black text-xs border-none outline-none text-slate-600" value={newLog.date} onChange={e => setNewLog({...newLog, date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pays / Origine</label>
                  <input placeholder="ex: Mexique" className="w-full p-4 bg-slate-50 rounded-2xl font-black text-xs border-none outline-none text-slate-600" value={newLog.origin} onChange={e => setNewLog({...newLog, origin: e.target.value})} />
                </div>
              </div>

              <div className="p-8 bg-orange-50 rounded-[2.5rem] flex flex-col items-center gap-4">
                <label className="text-xs font-black text-orange-400 uppercase tracking-[0.2em]">Qualité Gustative</label>
                <div className="flex justify-center gap-3">
                  {[1,2,3,4,5].map(v => (
                    <button key={v} type="button" onClick={() => setNewLog({...newLog, rating: v})} className={`transition-all hover:scale-125 active:scale-90 ${newLog.rating >= v ? 'text-orange-500 drop-shadow-md' : 'text-slate-200'}`}>
                      <Star size={40} fill="currentColor" stroke="none" />
                    </button>
                  ))}
                </div>
                <span className="font-black text-orange-600 text-2xl tracking-tighter">{newLog.rating} / 5</span>
              </div>

              <button disabled={!isValidFruit} className="w-full bg-slate-800 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl transition-all active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none">
                {t('saveLog')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
