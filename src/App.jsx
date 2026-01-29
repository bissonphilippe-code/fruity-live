import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Legend, Cell
} from 'recharts';
import { 
  Plus, TrendingUp, List, Settings, Star, Trash2, Search, Globe, X, RotateCcw, Save,
  CalendarDays, CheckCircle2, AlertCircle, RefreshCw, AlertTriangle, MapPin,
  Download, Upload, FileText, Languages, ChevronRight, ArrowLeft, BarChart2,
  FileDown
} from 'lucide-react';

// --- CONFIGURATION LIVE RENDER ---
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
  en: ["Abiu", "Açaí", "Acerola", "Akebi", "Ackee", "African Cherry Orange", "Apple", "Apricot", "Aratiles", "Araza", "Avocado", "Banana", "Bilberry", "Blackberry", "Blackcurrant", "Black sapote", "Blueberry", "Boysenberry", "Breadfruit", "Buddha's hand", "Cactus pear", "Canistel", "Catmon", "Cempedak", "Cherimoya", "Cherry", "Chico fruit", "Citron", "Cloudberry", "Coco de mer", "Coconut", "Crab apple", "Cranberry", "Currant", "Damson", "Date", "Dragonfruit", "Durian", "Elderberry", "Feijoa", "Fig", "Finger Lime", "Gac", "Goji berry", "Gooseberry", "Grape", "Grapefruit", "Grewia asiatica", "Guava", "Guarana", "Hala fruit", "Haws", "Honeyberry", "Huckleberry", "Jabuticaba", "Jackfruit", "Jambul", "Japanese plum", "Jostaberry", "Jujube", "Juniper berry", "Kaffir lime", "Kiwano", "Kiwifruit", "Kumquat", "Lanzones", "Lemon", "Lime", "Loganberry", "Longan", "Loquat", "Lulo", "Lychee", "Magellan Barberry", "Macopa", "Mamey apple", "Mamey Sapote", "Mango", "Mangosteen", "Marionberry", "Medlar", "Cantaloupe", "Galia melon", "Honeydew", "Mouse melon", "Muskmelon", "Watermelon", "Miracle fruit", "Mohsina", "Momordica fruit", "Monstera deliciosa", "Mulberry", "Nance", "Nectarine", "Orange", "Blood orange", "Clementine", "Mandarine", "Tangerine", "Papaya", "Passionfruit", "Pawpaw", "Peach", "Pear", "Persimmon", "Pineapple", "Pineberry", "Plantain", "Plum", "Prune", "Plumcot", "Pomegranate", "Pomelo", "Quince", "Raspberry", "Salmonberry", "Rambutan", "Redcurrant", "Rose apple", "Salal berry", "Salak", "Santol", "Sapodilla", "Sapote", "Sarguelas", "Saskatoon berry", "Satsuma", "Sloe", "Soursop", "Star apple", "Star fruit", "Strawberry", "Sugar apple", "Suriname cherry", "Tamarillo", "Tamarind", "Tangelo", "Tayberry", "Thimbleberry", "Ugli fruit", "White currant", "White sapote", "Ximenia", "Yuzu"],
  fr: ["Abiu", "Açaí", "Acérola", "Akébie", "Akée", "Citron-cerise africain", "Pomme", "Abricot", "Aratiles", "Arazà", "Avocat", "Banane", "Myrtille", "Mûre", "Cassis", "Sapotille noire", "Bleuet", "Mûre de Boysen", "Fruit à pain", "Main de Bouddha", "Figue de Barbarie", "Canistel", "Catmon", "Cempedak", "Chérimole", "Cerise", "Sapotille", "Cédrat", "Chypre", "Noix de coco", "Pomme sauvage", "Canneberge", "Groseille", "Prune de Damas", "Datte", "Fruit du dragon", "Durian", "Sureau", "Goyave du Brésil", "Figue", "Citron caviar", "Gac", "Baie de Goji", "Groseille à maquereau", "Raisin", "Pamplemousse", "Phalsa", "Goyave", "Guarana", "Fruit de Hala", "Cenelle", "Camérise", "Airelle", "Jaboticaba", "Jaquier", "Jamelonier", "Prune japonaise", "Casseille", "Jujube", "Baie de genièvre", "Combava", "Kiwano", "Kiwi", "Kumquat", "Langsat", "Citron", "Lime", "Loganberry", "Longane", "Néflier du Japon", "Lulo", "Litchi", "Calafate", "Jamrose", "Abricot des Antilles", "Sapotille mamey", "Mangue", "Mangoustan", "Marionberry", "Nèfle", "Cantaloup", "Melon Galia", "Melon miel", "Melothria scabra", "Melon brodé", "Melon d'eau", "Fruit miracle", "Mohsina", "Margose", "Cériman", "Mûre sauvage", "Nance", "Nectarine", "Orange", "Orange sanguine", "Clémentine", "Mandarine", "Tangerine", "Papaye", "Fruit de la passion", "Asimine", "Pêche", "Poire", "Kaki", "Ananas", "Fraise blanche", "Banane plantain", "Prune", "Pruneau", "Plumcot", "Grenade", "Pomélo", "Coing", "Framboise", "Ronce parviflore", "Ramboutan", "Groseille rouge", "Pomme d'eau", "Salal", "Salak", "Santol", "Sapodilla", "Sapote", "Sarguelas", "Amélanche", "Satsuma", "Prunelle", "Corossol", "Caïmite", "Carambole", "Fraise", "Pomme cannelle", "Cerise de Cayenne", "Tamarillo", "Tamarin", "Tangelo", "Tayberry", "Ronce à petites fleurs", "Ugli", "Groseille blanche", "Sapote blanche", "Ximenia", "Yuzu"]
};

const translations = {
  en: {
    logButton: "Log Fruit", searchPlaceholder: "Find a fruit...", backToDashboard: "Harvest",
    noLogsForFruit: "No logs for this fruit in {region} yet.", insightsFor: "Insights for",
    topPicks: "Top Picks", bestRatedIn: "Best in {region} now.", noData: "No data yet.",
    seasonalTrends: "Fruit Trends", sortBy: "Sort by:", bestNow: "Best Now", 
    bestAllTime: "Best All-Time", alphabetical: "A-Z", allLogs: "Your History",
    appPreferences: "Preferences", language: "Language", currentRegion: "My Region",
    dataManagement: "Data", loadMyData: "Sync Personal History", loadingData: "Syncing...",
    logModalTitle: "Log a Fruit", fruitName: "Fruit Name", datePurchased: "Date",
    originCountry: "Origin", qualityRating: "Rating", saveLog: "Save to Cloud",
    serverError: "Cloud connection issue.", serverWaking: "Server is waking up...",
    apiUrlLabel: "Backend URL", saveUrl: "Save URL", openImport: "Import Tool", 
    downloadCSV: "Export CSV", importModalTitle: "Paste CSV Data", processData: "Process",
    duplicateWarn: "Already logged today!", invalidFruitWarn: "Select from list.",
    bestMonth: "Best Month", avgRating: "Avg Rating", seasonalTrend: "Seasonal Trend",
    totalEntries: "entries",
    tabs: { dashboard: "Harvest", trends: "Almanac", list: "Notes", settings: "Shed" }
  },
  fr: {
    logButton: "Ajouter", searchPlaceholder: "Chercher un fruit...", backToDashboard: "Récolte",
    noLogsForFruit: "Aucun historique pour ce fruit en {region}.", insightsFor: "Aperçu pour",
    topPicks: "Meilleur Choix", bestRatedIn: "Le top en {region}.", noData: "Aucune donnée.",
    seasonalTrends: "Tendances", sortBy: "Trier :", bestNow: "Top (Maint.)", 
    bestAllTime: "Top (Toujours)", alphabetical: "A-Z", allLogs: "Historique",
    appPreferences: "Préférences", language: "Langue", currentRegion: "Ma Région",
    dataManagement: "Données", loadMyData: "Sync mon historique", loadingData: "Envoi...",
    logModalTitle: "Noter un Fruit", fruitName: "Fruit", datePurchased: "Date",
    originCountry: "Origine", qualityRating: "Qualité", saveLog: "Enregistrer Cloud",
    serverError: "Erreur de connexion Cloud.", serverWaking: "Le serveur se réveille...",
    apiUrlLabel: "URL du Backend", saveUrl: "Enregistrer l'URL", openImport: "Outil d'import", 
    downloadCSV: "Exporter CSV", importModalTitle: "Coller Données CSV", processData: "Traiter",
    duplicateWarn: "Déjà noté aujourd'hui !", invalidFruitWarn: "Choisissez dans la liste.",
    bestMonth: "Meilleur Mois", avgRating: "Note Moy.", seasonalTrend: "Tendance Qualité",
    totalEntries: "notes",
    tabs: { dashboard: "Récolte", trends: "Almanach", list: "Notes", settings: "Atelier" }
  }
};

// --- HELPERS DESIGN ---
const getFruitColorContext = (name) => {
  if (!name) return { cardBg: 'bg-[#388E3C]', soft: 'bg-[#388E3C]/10', text: 'text-[#388E3C]', line: '#388E3C' };
  const n = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (['fraise', 'straw', 'framboise', 'rasp', 'pomme', 'apple', 'cerise', 'cherry', 'water', 'grenade'].some(k => n.includes(k))) {
    return { cardBg: 'bg-[#D32F2F]', soft: 'bg-[#D32F2F]/10', text: 'text-[#D32F2F]', line: '#D32F2F' };
  }
  if (['orange', 'mandarine', 'clementin', 'tangerine', 'peche', 'peach', 'abricot', 'apricot', 'mangue', 'mango', 'papaye', 'cantaloup'].some(k => n.includes(k))) {
    return { cardBg: 'bg-orange-500', soft: 'bg-orange-50', text: 'text-orange-800', line: '#F57C00' };
  }
  if (['banane', 'banana', 'citron', 'lemon', 'ananas', 'pine'].some(k => n.includes(k))) {
    return { cardBg: 'bg-[#FF9800]', soft: 'bg-[#FF9800]/10', text: 'text-[#F57C00]', line: '#FF9800' };
  }
  if (['raisin', 'grape', 'bleuet', 'blue', 'mure', 'blackb', 'prune', 'plum', 'fig'].some(k => n.includes(k))) {
    return { cardBg: 'bg-[#512DA8]', soft: 'bg-[#512DA8]/10', text: 'text-[#512DA8]', line: '#673AB7' };
  }
  return { cardBg: 'bg-[#388E3C]', soft: 'bg-[#388E3C]/10', text: 'text-[#388E3C]', line: '#388E3C' };
};

const getFruitIcon = (name) => {
    if (!name) return "🍎";
    const n = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (n.includes('fraise') || n.includes('straw')) return '🍓';
    if (n.includes('bleuet') || n.includes('blue')) return '🫐';
    if (n.includes('ananas') || n.includes('pine')) return '🍍';
    if (n.includes('mangue') || n.includes('mango')) return '🥭';
    if (n.includes('banane') || n.includes('banana')) return '🍌';
    if (n.includes('orange') || n.includes('clementin')) return '🍊';
    if (n.includes('peche') || n.includes('peach')) return '🍑';
    return '🍎';
};

const StarRating = ({ rating, setRating, readonly = false, size = 32 }) => (
  <div className="flex gap-1.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <button key={star} type="button" disabled={readonly} onClick={() => !readonly && setRating(star)} className="transition-transform active:scale-95">
        <Star fill={star <= rating ? "#FF9800" : "transparent"} size={size} className={`${star <= rating ? 'text-[#FF9800]' : 'text-slate-200'}`} />
      </button>
    ))}
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [wakingUp, setWakingUp] = useState(false);
  
  const [myRegion, setMyRegion] = useState(() => localStorage.getItem('sft_region') || 'Quebec');
  const [lang, setLang] = useState(() => localStorage.getItem('sft_lang') || 'fr');
  const [viewFruit, setViewFruit] = useState(null);
  const [trendSort, setTrendSort] = useState('bestNow');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // --- CONFIG URL ---
  const sanitizeUrl = (url) => url?.endsWith('/') ? url.slice(0, -1) : url;
  const [apiUrl, setApiUrl] = useState(() => sanitizeUrl(localStorage.getItem('fruity_api_url')) || ENV_URL || FALLBACK_URL);
  const [tempApiUrl, setTempApiUrl] = useState(apiUrl);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvData, setCsvData] = useState('');
  const [newLog, setNewLog] = useState({ fruit: '', origin: '', rating: 3, date: new Date().toISOString().split('T')[0] });
  const [fruitSuggestions, setFruitSuggestions] = useState([]);

  // --- API SYNC ---
  const fetchLogs = async (retryCount = 0) => {
    try {
      if (retryCount === 0) setLoading(true);
      const res = await fetch(`${apiUrl}/api/logs`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLogs(data.map(l => ({ ...l, dateObj: new Date(l.date) })));
      setWakingUp(false); setApiError(false);
    } catch (e) {
      if (retryCount < 2) { setWakingUp(true); setTimeout(() => fetchLogs(retryCount + 1), 4000); }
      else { setApiError(true); setWakingUp(false); }
    } finally { if (retryCount >= 2 || !wakingUp) setLoading(false); }
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
      if (res.ok) { fetchLogs(); setIsAddModalOpen(false); setNewLog({ fruit: '', origin: '', rating: 3, date: new Date().toISOString().split('T')[0] }); }
    } catch (e) { alert(translations[lang].serverError); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ?')) return;
    try { await fetch(`${apiUrl}/api/logs/${id}`, { method: 'DELETE' }); fetchLogs(); } catch (e) { alert(translations[lang].serverError); }
  };

  const handleImportCSV = async () => {
    const rows = csvData.split('\n').slice(1);
    for (let row of rows) {
      const [date, fruit, origin, rating] = row.split(',');
      if (fruit && rating) {
        await fetch(`${apiUrl}/api/logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: date.trim(), fruit: fruit.trim(), origin: origin.trim(), rating: parseInt(rating), userRegion: myRegion })
        });
      }
    }
    setCsvData(''); setIsImportModalOpen(false); fetchLogs();
  };

  const handleExportCSV = () => {
    const header = "Date,Fruit,Origin,Rating\n";
    const csv = header + logs.map(l => `${l.date},${l.fruit},${l.origin},${l.rating}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'fruity_export.csv'; a.click();
  };

  // --- LOGIC ---
  const t = (p, params = {}) => {
    let v = translations[lang]; p.split('.').forEach(k => v = v?.[k]);
    if (typeof v !== 'string') return p;
    Object.keys(params).forEach(k => v = v.replace(`{${k}}`, params[k]));
    return v;
  };

  const tf = (name) => {
    if (!name) return "";
    const key = name.toLowerCase().trim();
    const index = SUPPORTED_FRUITS.en.findIndex(f => f.toLowerCase() === key);
    if (index !== -1) return SUPPORTED_FRUITS[lang][index];
    const indexFr = SUPPORTED_FRUITS.fr.findIndex(f => f.toLowerCase() === key);
    if (indexFr !== -1) return SUPPORTED_FRUITS[lang][indexFr];
    return name;
  };

  const isValidFruit = useMemo(() => SUPPORTED_FRUITS[lang].some(f => f.toLowerCase() === newLog.fruit.toLowerCase().trim()), [newLog.fruit, lang]);

  useEffect(() => {
    if (!newLog.fruit.trim()) { setFruitSuggestions([]); return; }
    const term = newLog.fruit.toLowerCase().trim();
    setFruitSuggestions(SUPPORTED_FRUITS[lang].filter(f => f.toLowerCase().includes(term) && f.toLowerCase() !== term).slice(0, 5));
  }, [newLog.fruit, lang]);

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const regionalLogs = logs.filter(log => (log.userRegion || 'Quebec') === myRegion);
    const fruitGroups = {};
    regionalLogs.forEach(l => { if (!fruitGroups[l.fruit]) fruitGroups[l.fruit] = []; fruitGroups[l.fruit].push(l); });

    const almanacData = Object.entries(fruitGroups).map(([name, fLogs]) => {
      const monthLogs = fLogs.filter(l => l.dateObj.getMonth() === currentMonth);
      const avgCurrent = monthLogs.length ? monthLogs.reduce((a, b) => a + b.rating, 0) / monthLogs.length : 0;
      const avgAll = fLogs.reduce((a, b) => a + b.rating, 0) / fLogs.length;
      const seasonalData = Array.from({length:12}).map((_, i) => {
        const mLogs = fLogs.filter(l => l.dateObj.getMonth() === i);
        return { name: new Date(0, i).toLocaleString(lang==='fr'?'fr-CA':'en-US', {month:'short'}), rating: mLogs.length ? mLogs.reduce((a,b)=>a+b.rating,0)/mLogs.length : null };
      });
      return { name, avgCurrent, avgAll, count: fLogs.length, seasonalData };
    });

    return { 
      topPicks: almanacData.filter(f => f.avgCurrent >= 3.5).sort((a, b) => b.avgCurrent - a.avgCurrent),
      almanacData: almanacData.sort((a,b) => {
        if (trendSort === 'bestNow') return b.avgCurrent - a.avgCurrent;
        if (trendSort === 'bestAllTime') return b.avgAll - a.avgAll;
        return tf(a.name).localeCompare(tf(b.name));
      }),
      regionalLogs 
    };
  }, [logs, myRegion, trendSort, lang]);

  if (loading && !wakingUp) return <div className="flex h-screen items-center justify-center font-bold text-orange-500 bg-white animate-pulse text-xl">Cloud Sync...</div>;

  return (
    <div className="min-h-screen bg-white text-[#37474F] font-sans pb-24" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Chewy&display=swap');`}</style>

      {/* HEADER TYPE GEMINI */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-20 h-20">
        <div className="max-w-4xl mx-auto px-4 h-full flex items-center justify-between gap-4">
          <button onClick={() => {setActiveTab('dashboard'); setViewFruit(null);}} className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl overflow-hidden bg-orange-400 shadow-sm ring-2 ring-white">
                <img src="https://i.imgur.com/wzW4qu9.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl tracking-wide" style={{ fontFamily: "'Chewy', cursive" }}>Fruity</h1>
          </button>
          
          <div className="flex-1 max-w-xs relative hidden sm:block">
            <Search className="absolute left-3 top-2.5 text-slate-300" size={18} />
            <input 
              placeholder={t('searchPlaceholder')} 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-full border-none focus:ring-2 focus:ring-orange-400 text-sm font-bold"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
            />
            {isSearchFocused && searchTerm && (
               <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border p-2 z-30">
                 {logs.filter(l => l.fruit.toLowerCase().includes(searchTerm.toLowerCase())).map(l => (
                   <button key={l.id} onMouseDown={() => {setViewFruit(l.fruit); setActiveTab('fruitDetail'); setSearchTerm('');}} className="w-full text-left p-2 hover:bg-orange-50 rounded-lg text-xs font-bold">{tf(l.fruit)}</button>
                 ))}
               </div>
            )}
          </div>

          <button onClick={() => setIsAddModalOpen(true)} className="bg-orange-400 text-white p-2.5 rounded-full shadow-lg active:scale-95">
            <Plus size={24} strokeWidth={3} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-8">
        {wakingUp && <div className="bg-blue-50 p-4 rounded-2xl text-blue-700 text-xs font-bold animate-pulse text-center">Réveil du serveur Render (Mode Gratuit)...</div>}

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="flex justify-between items-center px-1">
                <h2 className="text-xl font-black flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest">{t('insightsFor')}</span>
                  {new Date().toLocaleString(lang==='fr'?'fr-CA':'en-US', {month:'long'})}
                </h2>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                    <MapPin size={14} className="text-green-600" /><span className="text-xs font-bold">{myRegion}</span>
                </div>
            </div>
            
            <div className="bg-[#388E3C] rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
              <h2 className="text-2xl font-black mb-1 flex items-center gap-2"><Star fill="white" size={24} /> {t('topPicks')}</h2>
              <p className="text-white/80 text-sm font-medium mb-6">{t('bestRatedIn', { region: myRegion })}</p>
              <div className="grid gap-3">
                  {stats.topPicks.slice(0, 3).map((f, idx) => (
                    <div key={f.name} onClick={() => {setViewFruit(f.name); setActiveTab('fruitDetail');}} className="bg-black/10 backdrop-blur-sm p-4 rounded-3xl flex justify-between items-center border border-white/5 cursor-pointer hover:bg-black/20 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center font-black">{idx+1}</div>
                            <div><p className="font-bold text-lg flex items-center gap-2"><span>{getFruitIcon(f.name)}</span>{tf(f.name)}</p></div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full">
                            <span className="font-black text-lg">{f.avgCurrent.toFixed(1)}</span><Star size={14} fill="white" />
                        </div>
                    </div>
                  ))}
                  {stats.topPicks.length === 0 && <p className="text-center py-4 opacity-60 text-sm">{t('noData')}</p>}
              </div>
            </div>
          </div>
        )}

        {/* ALMANACH (TRENDS GEMINI) */}
        {activeTab === 'trends' && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex justify-between items-center px-1">
                <h2 className="text-2xl font-black uppercase tracking-tighter">{t('seasonalTrends')}</h2>
                <select value={trendSort} onChange={e => setTrendSort(e.target.value)} className="bg-white border rounded-full px-4 py-2 text-xs font-bold outline-none">
                    <option value="bestNow">{t('bestNow')}</option>
                    <option value="bestAllTime">{t('bestAllTime')}</option>
                    <option value="alphabetical">{t('alphabetical')}</option>
                </select>
             </div>
             <div className="grid gap-6">
                {stats.almanacData.map(f => (
                   <div key={f.name} onClick={() => {setViewFruit(f.name); setActiveTab('fruitDetail');}} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 cursor-pointer hover:border-orange-200 transition-all">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                            <div className="text-4xl bg-slate-50 p-2 rounded-2xl">{getFruitIcon(f.name)}</div>
                            <div>
                                <h3 className="font-black text-lg">{tf(f.name)}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">{f.count} notes</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-orange-500 font-black text-xl">{f.avgCurrent > 0 ? f.avgCurrent.toFixed(1) : '--'} ★</p>
                            <p className="text-[8px] font-bold uppercase text-slate-300">Ce mois</p>
                        </div>
                      </div>
                      <div className="h-32 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={f.seasonalData}>
                                <Tooltip />
                                <Line type="monotone" dataKey="rating" stroke={getFruitColorContext(f.name).line} strokeWidth={3} dot={false} connectNulls />
                            </LineChart>
                        </ResponsiveContainer>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {/* FRUIT PAGE DETAIL */}
        {activeTab === 'fruitDetail' && viewFruit && (
            <div className="animate-in slide-in-from-right duration-300 space-y-6">
                <button onClick={() => {setViewFruit(null); setActiveTab('trends');}} className="flex items-center gap-2 text-slate-400 font-bold bg-white px-4 py-2 rounded-full shadow-sm w-fit active:scale-95 transition-all">
                    <ArrowLeft size={18} /> {t('backToDashboard')}
                </button>
                
                {(() => {
                    const fData = stats.almanacData.find(f => f.name === viewFruit);
                    if (!fData) return null;
                    const color = getFruitColorContext(viewFruit);
                    return (
                      <>
                        <div className={`${color.soft} rounded-[3rem] p-10 text-center border-4 border-white shadow-sm`}>
                            <div className="text-8xl mb-4 drop-shadow-md">{getFruitIcon(viewFruit)}</div>
                            <h2 className="text-4xl font-black mb-6">{tf(viewFruit)}</h2>
                            <div className="flex justify-center gap-10">
                                <div><p className="text-3xl font-black text-orange-500">{fData.avgAll.toFixed(1)}</p><p className="text-[10px] font-bold text-slate-400 uppercase">{t('avgRating')}</p></div>
                                <div className="w-px bg-slate-200"></div>
                                <div><p className="text-3xl font-black text-green-600">{fData.count}</p><p className="text-[10px] font-bold text-slate-400 uppercase">{t('totalEntries')}</p></div>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                            <h3 className="font-black text-sm uppercase tracking-widest text-slate-300 mb-8 flex items-center gap-2"><BarChart2 size={16}/> {t('seasonalTrend')}</h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={fData.seasonalData}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900}} />
                                        <YAxis domain={[1,5]} hide />
                                        <Tooltip cursor={{fill:'transparent'}} />
                                        <Bar dataKey="rating" radius={[6,6,6,6]} fill={color.line}>
                                            {fData.seasonalData.map((e,i) => <Cell key={i} opacity={e.rating ? 1 : 0.1} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                      </>
                    );
                })()}
            </div>
        )}

        {/* LIST */}
        {activeTab === 'list' && (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-500">
             <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-xl">{t('allLogs')}</h3>
                <span className="text-xs font-black bg-white border px-3 py-1 rounded-full text-slate-400">{logs.length}</span>
             </div>
             <div className="divide-y divide-slate-50">
                {logs.map(l => (
                   <div key={l.id} className="p-5 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{getFruitIcon(l.fruit)}</div>
                        <div><p className="font-black text-lg">{tf(l.fruit)}</p><p className="text-[10px] font-bold text-slate-300 uppercase">{l.date} • {l.origin || '?'}</p></div>
                      </div>
                      <div className="flex items-center gap-4">
                        <StarRating rating={l.rating} readonly size={16} />
                        <button onClick={() => handleDelete(l.id)} className="p-2 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18}/></button>
                      </div>
                   </div>
                ))}
                {logs.length === 0 && <p className="p-12 text-center text-slate-300 font-bold">{t('noData')}</p>}
             </div>
          </div>
        )}

        {/* SETTINGS (SHED) */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 space-y-8">
              <h3 className="font-black text-2xl flex items-center gap-3"><Settings size={28} className="text-slate-300" /> {t('appPreferences')}</h3>
              
              <div className="space-y-6">
                <div><label className="block text-xs font-black text-slate-400 uppercase mb-3 tracking-widest">{t('language')}</label>
                    <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl">
                        <button onClick={() => setLang('fr')} className={`flex-1 py-3 rounded-xl text-xs font-black ${lang==='fr'?'bg-white shadow-md text-orange-500':'text-slate-400'}`}>Français</button>
                        <button onClick={() => setLang('en')} className={`flex-1 py-3 rounded-xl text-xs font-black ${lang==='en'?'bg-white shadow-md text-orange-500':'text-slate-400'}`}>English</button>
                    </div>
                </div>

                <div><label className="block text-xs font-black text-slate-400 uppercase mb-3 tracking-widest">{t('currentRegion')}</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-3.5 text-green-500" size={18} />
                        <input value={myRegion} onChange={e => setMyRegion(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl font-bold focus:ring-2 focus:ring-orange-400 outline-none" />
                    </div>
                </div>

                <div className="pt-6 border-t space-y-4">
                    <h4 className="font-black text-sm uppercase tracking-widest text-slate-300">{t('dataManagement')}</h4>
                    <button onClick={handleExportCSV} className="w-full border-2 border-dashed py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-3 hover:bg-slate-50 active:scale-95 transition-all">
                        <FileDown size={18} /> {t('downloadCSV')}
                    </button>
                    <button onClick={() => setIsImportModalOpen(true)} className="w-full border-2 border-dashed py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-3 hover:bg-slate-50 active:scale-95 transition-all">
                        <Upload size={18} /> {t('openImport')}
                    </button>
                </div>

                <div className="pt-6 border-t">
                    <label className="block text-xs font-black text-slate-400 uppercase mb-3 tracking-widest">{t('apiUrlLabel')}</label>
                    <div className="flex gap-2">
                        <input value={tempApiUrl} onChange={e => setTempApiUrl(e.target.value)} className="flex-1 px-4 py-3 bg-slate-50 rounded-2xl font-bold text-xs outline-none" />
                        <button onClick={() => { localStorage.setItem('fruity_api_url', tempApiUrl); setApiUrl(tempApiUrl); alert("URL Saved"); }} className="bg-slate-800 text-white p-3 rounded-2xl active:scale-95"><Save size={18}/></button>
                    </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* NAV FIXÉE */}
      <nav className="fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl border border-slate-100 p-2 flex justify-around items-center rounded-full shadow-2xl z-20 md:max-w-md md:mx-auto">
        {[ 
          { id: 'dashboard', icon: <TrendingUp />, label: t('tabs.dashboard') }, 
          { id: 'trends', icon: <BarChart2 />, label: t('tabs.trends') },
          { id: 'list', icon: <List />, label: t('tabs.list') }, 
          { id: 'settings', icon: <Settings />, label: t('tabs.settings') } 
        ].map(tab => (
          <button key={tab.id} onClick={() => {setActiveTab(tab.id); setViewFruit(null);}} className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all ${activeTab === tab.id ? 'bg-orange-500 text-white shadow-lg scale-110' : 'text-slate-300'}`}>
            {tab.icon}<span className="text-[7px] font-black uppercase mt-1">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* MODAL AJOUT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black uppercase tracking-tighter">{t('logModalTitle')}</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-300 p-2"><X size={24}/></button>
            </div>
            <form onSubmit={handleAddLog} className="space-y-6">
              <div className="relative">
                <Search className={`absolute left-4 top-4 ${isValidFruit ? 'text-green-500' : 'text-slate-300'}`} size={18} />
                <input placeholder={t('fruitName')} className={`w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl font-bold border-2 transition-all outline-none ${isValidFruit ? 'border-green-200 bg-green-50' : 'border-transparent focus:border-orange-400'}`} value={newLog.fruit} onChange={e => setNewLog({...newLog, fruit: e.target.value})} required />
                {fruitSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border p-2 z-10">
                    {fruitSuggestions.map(f => <button key={f} type="button" onClick={() => setNewLog({...newLog, fruit: f})} className="w-full text-left p-2 hover:bg-orange-50 rounded-xl text-sm font-bold">{f}</button>)}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="date" className="p-4 bg-slate-50 rounded-2xl font-bold text-xs" value={newLog.date} onChange={e => setNewLog({...newLog, date: e.target.value})} />
                <input placeholder={t('originCountry')} className="p-4 bg-slate-50 rounded-2xl font-bold text-xs" value={newLog.origin} onChange={e => setNewLog({...newLog, origin: e.target.value})} />
              </div>
              <div className={`p-6 rounded-[2rem] flex flex-col items-center gap-3 ${isValidFruit ? 'bg-orange-50' : 'bg-slate-50 opacity-40 grayscale pointer-events-none'}`}>
                <StarRating rating={newLog.rating} setRating={v => setNewLog({...newLog, rating: v})} />
                <span className="font-black text-orange-500">{isValidFruit ? `${newLog.rating}/5` : '--'}</span>
              </div>
              <button disabled={!isValidFruit} className="w-full py-5 rounded-2xl bg-slate-800 text-white font-black uppercase tracking-widest shadow-xl active:scale-95 disabled:opacity-20 transition-all">{t('saveLog')}</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL IMPORT */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-8 rounded-[2rem] shadow-2xl">
            <h2 className="text-xl font-black mb-6">{t('importModalTitle')}</h2>
            <textarea value={csvData} onChange={e => setCsvData(e.target.value)} className="w-full h-48 p-4 bg-slate-50 rounded-2xl font-mono text-xs mb-4" placeholder="YYYY-MM-DD, Fruit, Origin, Rating" />
            <div className="flex gap-3">
                <button onClick={() => setIsImportModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400">Annuler</button>
                <button onClick={handleImportCSV} className="flex-2 bg-green-600 text-white px-8 py-4 rounded-xl font-black">{t('processData')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
