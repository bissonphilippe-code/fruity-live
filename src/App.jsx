import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Plus, TrendingUp, List, Settings, Star, Trash2, Search, X,
  MapPin, Download, Upload, ArrowLeft, BarChart2, FileDown,
  CheckCircle2, AlertCircle, AlertTriangle, Store, Database,
  ChevronRight, Calendar
} from 'lucide-react';

// --- LOCAL STORAGE KEYS ---
const STORAGE_KEY_LOGS = 'fruity_local_logs_v2';
const STORAGE_KEY_REGION = 'fruity_local_region';
const STORAGE_KEY_LANG = 'fruity_local_lang';

// --- BILINGUAL SUPPORTED FRUITS DICTIONARY ---
// Index-aligned between English and French for canonical deduplication & instant translation
const SUPPORTED_FRUITS = {
  en: [
    "Abiu", "Açaí", "Acerola", "Akebi", "Ackee", "African Cherry Orange", "Apple", "Apricot",
    "Aratiles", "Araza", "Avocado", "Banana", "Bilberry", "Blackberry", "Blackcurrant",
    "Black sapote", "Blueberry", "Boysenberry", "Breadfruit", "Buddha's hand", "Cactus pear",
    "Canistel", "Catmon", "Cempedak", "Cherimoya", "Cherry", "Chico fruit", "Citron",
    "Cloudberry", "Coco de mer", "Coconut", "Crab apple", "Cranberry", "Currant", "Damson",
    "Date", "Dragonfruit", "Durian", "Elderberry", "Feijoa", "Fig", "Finger Lime", "Gac",
    "Goji berry", "Gooseberry", "Grape", "Grapefruit", "Grewia asiatica", "Guava", "Guarana",
    "Hala fruit", "Haws", "Honeyberry", "Huckleberry", "Jabuticaba", "Jackfruit", "Jambul",
    "Japanese plum", "Jostaberry", "Jujube", "Juniper berry", "Kaffir lime", "Kiwano",
    "Kiwifruit", "Kumquat", "Lanzones", "Lemon", "Lime", "Loganberry", "Longan", "Loquat",
    "Lulo", "Lychee", "Magellan Barberry", "Macopa", "Mamey apple", "Mamey Sapote", "Mango",
    "Mangosteen", "Marionberry", "Medlar", "Cantaloupe", "Galia melon", "Honeydew",
    "Mouse melon", "Muskmelon", "Watermelon", "Miracle fruit", "Mohsina", "Momordica fruit",
    "Monstera deliciosa", "Mulberry", "Nance", "Nectarine", "Orange", "Blood orange",
    "Clementine", "Mandarine", "Tangerine", "Papaya", "Passionfruit", "Pawpaw", "Peach",
    "Pear", "Persimmon", "Pineapple", "Pineberry", "Plantain", "Plum", "Prune", "Plumcot",
    "Pomegranate", "Pomelo", "Quince", "Raspberry", "Salmonberry", "Rambutan", "Redcurrant",
    "Rose apple", "Salal berry", "Salak", "Santol", "Sapodilla", "Sapote", "Sarguelas",
    "Saskatoon berry", "Satsuma", "Sloe", "Soursop", "Star apple", "Star fruit", "Strawberry",
    "Sugar apple", "Suriname cherry", "Tamarillo", "Tamarind", "Tangelo", "Tayberry",
    "Thimbleberry", "Ugli fruit", "White currant", "White sapote", "Ximenia", "Yuzu"
  ],
  fr: [
    "Abiu", "Açaí", "Acérola", "Akébie", "Akée", "Citron-cerise africain", "Pomme", "Abricot",
    "Aratiles", "Arazà", "Avocat", "Banane", "Myrtille", "Mûre", "Cassis",
    "Sapotille noire", "Bleuet", "Mûre de Boysen", "Fruit à pain", "Main de Bouddha", "Figue de Barbarie",
    "Canistel", "Catmon", "Cempedak", "Chérimole", "Cerise", "Sapotille", "Cédrat",
    "Chypre", "Coco de mer", "Noix de coco", "Pomme sauvage", "Canneberge", "Groseille", "Prune de Damas",
    "Datte", "Fruit du dragon", "Durian", "Sureau", "Goyave du Brésil", "Figue", "Citron caviar", "Gac",
    "Baie de Goji", "Groseille à maquereau", "Raisin", "Pamplemousse", "Phalsa", "Goyave", "Guarana",
    "Fruit de Hala", "Cenelle", "Camérise", "Airelle", "Jaboticaba", "Jaquier", "Jamelonier",
    "Prune japonaise", "Casseille", "Jujube", "Baie de genièvre", "Combava", "Kiwano",
    "Kiwi", "Kumquat", "Langsat", "Citron", "Lime", "Loganberry", "Longane", "Néflier du Japon",
    "Lulo", "Litchi", "Calafate", "Jamrose", "Abricot des Antilles", "Sapotille mamey", "Mangue",
    "Mangoustan", "Marionberry", "Nèfle", "Cantaloup", "Melon Galia", "Melon miel",
    "Melothria scabra", "Melon brodé", "Melon d'eau", "Fruit miracle", "Mohsina", "Margose",
    "Cériman", "Mûre sauvage", "Nance", "Nectarine", "Orange", "Orange sanguine",
    "Clémentine", "Mandarine", "Tangerine", "Papaye", "Fruit de la passion", "Asimine", "Pêche",
    "Poire", "Kaki", "Ananas", "Fraise blanche", "Banane plantain", "Prune", "Pruneau", "Plumcot",
    "Grenade", "Pomélo", "Coing", "Framboise", "Ronce parviflore", "Ramboutan", "Groseille rouge",
    "Pomme d'eau", "Salal", "Salak", "Santol", "Sapodilla", "Sapote", "Sarguelas",
    "Amélanche", "Satsuma", "Prunelle", "Corossol", "Caïmite", "Carambole", "Fraise",
    "Pomme cannelle", "Cerise de Cayenne", "Tamarillo", "Tamarin", "Tangelo", "Tayberry",
    "Ronce à petites fleurs", "Ugli", "Groseille blanche", "Sapote blanche", "Ximenia", "Yuzu"
  ]
};

// --- OPTIONAL SAMPLE DATA FOR QUICK TESTING ---
const STARTER_DATA = [
  { date: "2026-11-18", fruit: "Persimmon", origin: "Spain", rating: 5, store: "IGA" },
  { date: "2026-11-12", fruit: "Pineapple", origin: "Costa Rica", rating: 4, store: "Metro" },
  { date: "2026-11-09", fruit: "Blueberry", origin: "Peru", rating: 2, store: "Costco" },
  { date: "2026-11-04", fruit: "Clementine", origin: "Morocco", rating: 4, store: "Avril" },
  { date: "2026-10-05", fruit: "Fig", origin: "Greece", rating: 4, store: "Marché Jean-Talon" },
  { date: "2026-08-12", fruit: "Peach", origin: "Ontario", rating: 5, store: "Marché Jean-Talon" },
  { date: "2026-07-08", fruit: "Cherry", origin: "USA", rating: 4, store: "IGA" },
  { date: "2026-05-20", fruit: "Blueberry", origin: "Peru", rating: 3, store: "Metro" },
  { date: "2026-03-15", fruit: "Cantaloupe", origin: "Chile", rating: 4, store: "IGA" },
  { date: "2026-02-15", fruit: "Blueberry", origin: "Chile", rating: 4, store: "Costco" },
  { date: "2026-01-10", fruit: "Blueberry", origin: "Peru", rating: 4, store: "Costco" },
  { date: "2025-11-29", fruit: "Strawberry", origin: "USA", rating: 4, store: "Metro" },
  { date: "2025-11-18", fruit: "Banana", origin: "Ecuador", rating: 5, store: "IGA" },
];

// --- TRANSLATIONS ---
const translations = {
  en: {
    localBadge: "Local • Offline Ready",
    logShort: "Log",
    searchPlaceholder: "Search your fruits...",
    backToAlmanac: "Almanac",
    insightsFor: "Seasonal Insights",
    topPicks: "Top Picks Right Now",
    bestRatedIn: "Highest rated in {region} this month",
    watchOut: "Skip For Now",
    recentLogs: "Recent Tastings",
    seeAll: "See all",
    noTopPicks: "No 3.5+ rated fruits logged for this month yet.",
    noData: "No logs yet. Tap + to record your first tasting!",
    seasonalTrends: "Fruit Almanac",
    bestNow: "Best Now",
    bestAllTime: "All-Time Best",
    alphabetical: "A–Z",
    allLogs: "Tasting Journal",
    filterJournal: "Filter by fruit, origin, store...",
    appPreferences: "The Shed",
    language: "Language",
    currentRegion: "My Region",
    regionHint: "Tags new logs & filters seasonal insights.",
    dataManagement: "Portable Data (CSV)",
    dataHint: "Your data lives 100% on this device. Export a CSV anytime to back it up or move to a cloud app later.",
    exportCSV: "Export CSV Backup",
    importCSV: "Import CSV Data",
    loadStarter: "Load Sample History",
    clearAll: "Clear All Local Data",
    confirmClearTitle: "Clear all local data?",
    confirmClearDesc: "This permanently deletes all logs stored on this device. Export a CSV backup first if you want to keep them.",
    cancel: "Cancel",
    deleteBtn: "Delete",
    logModalTitle: "Log a Fruit",
    fruitName: "Fruit",
    datePurchased: "Date",
    originCountry: "Origin (Country/Region)",
    storeName: "Store (Optional)",
    qualityRating: "Taste Rating",
    saveLog: "Save Locally",
    duplicateWarn: "You already logged this fruit & origin today.",
    invalidFruitWarn: "Select a fruit from the list.",
    bestMonth: "BEST MONTH",
    avgRating: "AVG RATING",
    totalEntries: "entries",
    thisMonthBadge: "this month",
    seasonalTrend: "Seasonal Trend",
    historyForFruit: "Tasting History",
    noOrigin: "No origin noted",
    importModalTitle: "Import CSV",
    importHint: "Upload a .csv file or paste rows below (YYYY-MM-DD, Fruit, Origin, Rating, Store, Region)",
    uploadFile: "Choose .CSV File",
    processData: "Import Entries",
    importSuccess: "Imported {count} entries!",
    importEmpty: "No valid rows found to import.",
    exportedMsg: "CSV backup downloaded!",
    deletedMsg: "Entry deleted",
    clearedMsg: "All local data cleared",
    tabs: { dashboard: "Harvest", trends: "Almanac", list: "Journal", settings: "Shed" }
  },
  fr: {
    localBadge: "Local • Hors-ligne",
    logShort: "Noter",
    searchPlaceholder: "Rechercher un fruit...",
    backToAlmanac: "Almanach",
    insightsFor: "Aperçu de saison",
    topPicks: "Meilleurs Choix",
    bestRatedIn: "Les mieux notés à {region} ce mois-ci",
    watchOut: "À Éviter",
    recentLogs: "Dégustations Récentes",
    seeAll: "Tout voir",
    noTopPicks: "Aucun fruit noté 3.5+ pour ce mois.",
    noData: "Aucune note. Appuyez sur + pour commencer !",
    seasonalTrends: "Almanach",
    bestNow: "Top Ce Mois",
    bestAllTime: "Top Global",
    alphabetical: "A–Z",
    allLogs: "Journal",
    filterJournal: "Filtrer par fruit, origine, magasin...",
    appPreferences: "L'Atelier",
    language: "Langue",
    currentRegion: "Ma Région",
    regionHint: "Identifie vos notes et filtre les tendances locales.",
    dataManagement: "Données Portables (CSV)",
    dataHint: "Vos données sont enregistrées à 100 % sur cet appareil. Exportez un CSV à tout moment pour les sauvegarder.",
    exportCSV: "Exporter en CSV",
    importCSV: "Importer un CSV",
    loadStarter: "Charger des exemples",
    clearAll: "Effacer toutes les données",
    confirmClearTitle: "Tout effacer ?",
    confirmClearDesc: "Cette action supprime définitivement toutes vos notes locales. Pensez à exporter un CSV avant !",
    cancel: "Annuler",
    deleteBtn: "Effacer",
    logModalTitle: "Noter un Fruit",
    fruitName: "Fruit",
    datePurchased: "Date",
    originCountry: "Origine (Pays/Région)",
    storeName: "Magasin (Optionnel)",
    qualityRating: "Note Gustative",
    saveLog: "Enregistrer",
    duplicateWarn: "Déjà noté aujourd'hui avec cette origine.",
    invalidFruitWarn: "Choisissez un fruit dans la liste.",
    bestMonth: "MEILLEUR MOIS",
    avgRating: "NOTE MOYENNE",
    totalEntries: "notes",
    thisMonthBadge: "ce mois",
    seasonalTrend: "Tendance Saisonnière",
    historyForFruit: "Historique des notes",
    noOrigin: "Origine non précisée",
    importModalTitle: "Importer CSV",
    importHint: "Sélectionnez un fichier .csv ou collez vos lignes (AAAA-MM-JJ, Fruit, Origine, Note, Magasin, Région)",
    uploadFile: "Choisir un fichier .CSV",
    processData: "Importer les notes",
    importSuccess: "{count} notes importées !",
    importEmpty: "Aucune ligne valide détectée.",
    exportedMsg: "Sauvegarde CSV téléchargée !",
    deletedMsg: "Note supprimée",
    clearedMsg: "Données locales effacées",
    tabs: { dashboard: "Récolte", trends: "Almanach", list: "Journal", settings: "Atelier" }
  }
};

// --- VISUAL & UTILITY HELPERS ---

const getFruitColorContext = (canonicalName) => {
  if (!canonicalName) return { cardBg: 'bg-emerald-50', accent: '#16a34a' };
  const n = canonicalName.toLowerCase();
  if (['strawberry', 'raspberry', 'apple', 'cherry', 'watermelon', 'pomegranate', 'cranberry', 'redcurrant'].some(k => n.includes(k))) {
    return { cardBg: 'bg-rose-50', accent: '#e11d48' };
  }
  if (['blueberry', 'blackberry', 'plum', 'fig', 'grape', 'blackcurrant', 'acai', 'bilberry'].some(k => n.includes(k))) {
    return { cardBg: 'bg-indigo-50', accent: '#4f46e5' };
  }
  if (['orange', 'mandarine', 'clementine', 'tangerine', 'peach', 'apricot', 'mango', 'papaya', 'cantaloupe', 'persimmon'].some(k => n.includes(k))) {
    return { cardBg: 'bg-orange-50', accent: '#ea580c' };
  }
  if (['banana', 'lemon', 'pineapple', 'star fruit', 'yuzu', 'durian'].some(k => n.includes(k))) {
    return { cardBg: 'bg-amber-50', accent: '#d97706' };
  }
  return { cardBg: 'bg-emerald-50', accent: '#16a34a' };
};

const getFruitIcon = (canonicalName) => {
  if (!canonicalName) return "🍎";
  const n = canonicalName.toLowerCase();
  if (n.includes('strawberry') || n.includes('raspberry')) return '🍓';
  if (n.includes('blueberry') || n.includes('blackberry') || n.includes('bilberry')) return '🫐';
  if (n.includes('grape')) return '🍇';
  if (n.includes('cherry')) return '🍒';
  if (n.includes('banana') || n.includes('plantain')) return '🍌';
  if (n.includes('pineapple')) return '🍍';
  if (n.includes('mango')) return '🥭';
  if (n.includes('kiwi')) return '🥝';
  if (n.includes('lemon') || n.includes('lime') || n.includes('yuzu')) return '🍋';
  if (n.includes('orange') || n.includes('clementine') || n.includes('mandarine') || n.includes('tangerine') || n.includes('grapefruit')) return '🍊';
  if (n.includes('watermelon')) return '🍉';
  if (n.includes('melon') || n.includes('cantaloupe') || n.includes('honeydew')) return '🍈';
  if (n.includes('peach') || n.includes('apricot') || n.includes('nectarine')) return '🍑';
  if (n.includes('pear')) return '🍐';
  if (n.includes('avocado')) return '🥑';
  if (n.includes('coconut')) return '🥥';
  if (n.includes('dragon')) return '🐉';
  return '🍎';
};

// Safely parse YYYY-MM-DD in local noon time so timezones never shift a date to the previous month
const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  const clean = String(dateStr).split('T')[0];
  const parts = clean.split('-');
  if (parts.length === 3) {
    const y = Number(parts[0]);
    const m = Number(parts[1]) - 1;
    const d = Number(parts[2]);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m, d, 12, 0, 0);
    }
  }
  const fallback = new Date(dateStr);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
};

// Normalize any English or French fruit name (with or without accents/case) to a single canonical English key
const getCanonicalName = (name) => {
  if (!name) return "";
  const clean = name.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const idxEn = SUPPORTED_FRUITS.en.findIndex(
    f => f.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === clean
  );
  if (idxEn !== -1) return SUPPORTED_FRUITS.en[idxEn];

  const idxFr = SUPPORTED_FRUITS.fr.findIndex(
    f => f.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === clean
  );
  if (idxFr !== -1) return SUPPORTED_FRUITS.en[idxFr];

  return name.trim().charAt(0).toUpperCase() + name.trim().slice(1);
};

// --- REUSABLE STAR RATING COMPONENT ---
const StarRating = ({ rating, setRating, readonly = false, size = 32 }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={readonly}
        onClick={() => !readonly && setRating(star)}
        className={`focus:outline-none transition-transform duration-150 ${!readonly ? 'hover:scale-110 active:scale-90 p-1.5' : ''}`}
        aria-label={`${star} stars`}
      >
        <Star
          fill={star <= rating ? "#FF9800" : "transparent"}
          size={size}
          className={star <= rating ? 'text-[#FF9800]' : 'text-slate-200'}
          strokeWidth={star <= rating ? 0 : 2}
        />
      </button>
    ))}
  </div>
);

// --- MAIN APPLICATION ---
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logs, setLogs] = useState([]);
  const [myRegion, setMyRegion] = useState(() => localStorage.getItem(STORAGE_KEY_REGION) || 'Quebec');
  const [lang, setLang] = useState(() => localStorage.getItem(STORAGE_KEY_LANG) || 'fr');
  const [viewFruit, setViewFruit] = useState(null); // Canonical English fruit name
  const [trendSort, setTrendSort] = useState('bestNow');

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [journalFilter, setJournalFilter] = useState('');

  // Modals & In-App Notifications (No alert() or confirm())
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Add Log Form State
  const [newLog, setNewLog] = useState({
    fruit: '',
    origin: '',
    store: '',
    rating: 4,
    date: new Date().toISOString().split('T')[0]
  });
  const [fruitSuggestions, setFruitSuggestions] = useState([]);

  // Import CSV State
  const [csvData, setCsvData] = useState('');
  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2800);
  };

  // --- INITIALIZE LOCAL DATA ---
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_LOGS) || '[]');
      const hydrated = saved
        .map(l => ({
          ...l,
          fruit: getCanonicalName(l.fruit),
          dateObj: parseLocalDate(l.date)
        }))
        .sort((a, b) => b.dateObj - a.dateObj);
      setLogs(hydrated);
    } catch (err) {
      console.error("Error reading local logs:", err);
      setLogs([]);
    }
  }, []);

  const persistLogs = (nextLogs) => {
    const sorted = [...nextLogs].sort((a, b) => b.dateObj - a.dateObj);
    setLogs(sorted);
    try {
      const serializable = sorted.map(({ dateObj, ...rest }) => rest);
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(serializable));
    } catch (err) {
      console.error("Failed to persist logs:", err);
    }
  };

  useEffect(() => { localStorage.setItem(STORAGE_KEY_REGION, myRegion); }, [myRegion]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_LANG, lang); }, [lang]);

  // --- TRANSLATION HELPERS ---
  const tf = (name) => {
    if (!name) return "";
    const canonical = getCanonicalName(name);
    const idx = SUPPORTED_FRUITS.en.findIndex(f => f.toLowerCase() === canonical.toLowerCase());
    if (idx !== -1) return SUPPORTED_FRUITS[lang][idx];
    return canonical;
  };

  const t = (path, params = {}) => {
    const keys = path.split('.');
    let val = translations[lang];
    for (const k of keys) val = val?.[k];
    if (typeof val !== 'string') return path;
    Object.keys(params).forEach(k => { val = val.replace(`{${k}}`, params[k]); });
    return val;
  };

  // --- FORM VALIDATION & AUTOCOMPLETE ---
  const isValidFruit = useMemo(() => {
    if (!newLog.fruit.trim()) return false;
    const clean = newLog.fruit.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return (
      SUPPORTED_FRUITS[lang].some(f => f.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === clean) ||
      SUPPORTED_FRUITS.en.some(f => f.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === clean)
    );
  }, [newLog.fruit, lang]);

  const isDuplicateToday = useMemo(() => {
    if (!isValidFruit) return false;
    const canonical = getCanonicalName(newLog.fruit);
    return logs.some(
      l =>
        getCanonicalName(l.fruit) === canonical &&
        l.date === newLog.date &&
        (l.origin || '').toLowerCase().trim() === newLog.origin.toLowerCase().trim()
    );
  }, [newLog.fruit, newLog.date, newLog.origin, logs, isValidFruit]);

  useEffect(() => {
    if (!newLog.fruit.trim()) {
      setFruitSuggestions([]);
      return;
    }
    const term = newLog.fruit.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const matches = SUPPORTED_FRUITS[lang]
      .filter(f => {
        const norm = f.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return norm.includes(term) && norm !== term;
      })
      .slice(0, 6);
    setFruitSuggestions(matches);
  }, [newLog.fruit, lang]);

  // --- CRUD HANDLERS ---
  const handleAddLog = (e) => {
    e.preventDefault();
    if (!isValidFruit) return;
    const canonical = getCanonicalName(newLog.fruit);
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: newLog.date,
      dateObj: parseLocalDate(newLog.date),
      fruit: canonical,
      origin: newLog.origin.trim(),
      store: newLog.store.trim(),
      rating: Number(newLog.rating),
      userRegion: myRegion.trim() || 'Quebec'
    };
    persistLogs([entry, ...logs]);
    setIsAddModalOpen(false);
    setNewLog({
      fruit: '',
      origin: '',
      store: '',
      rating: 4,
      date: new Date().toISOString().split('T')[0]
    });
    showToast(`${getFruitIcon(canonical)} ${tf(canonical)} • ${entry.rating}★`);
  };

  const handleDeleteLog = (id) => {
    persistLogs(logs.filter(l => l.id !== id));
    showToast(t('deletedMsg'));
  };

  const handleClearAll = () => {
    persistLogs([]);
    setIsClearConfirmOpen(false);
    setViewFruit(null);
    showToast(t('clearedMsg'));
  };

  // --- PORTABLE UTF-8 CSV EXPORT / IMPORT ---
  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const header = "Date,Fruit,Origin,Rating,Store,Region\n";
    const escapeCell = (str) => `"${String(str || '').replace(/"/g, '""')}"`;
    const rows = logs
      .map(l =>
        [
          l.date,
          escapeCell(getCanonicalName(l.fruit)),
          escapeCell(l.origin),
          l.rating,
          escapeCell(l.store),
          escapeCell(l.userRegion || myRegion)
        ].join(',')
      )
      .join('\n');

    // UTF-8 BOM (\uFEFF) guarantees French accents open cleanly in Excel & Google Sheets
    const blob = new Blob(["\uFEFF", header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fruity_backup_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(t('exportedMsg'));
  };

  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const handleImportCSV = () => {
    if (!csvData.trim()) return;
    const lines = csvData.split(/\r?\n/).filter(l => l.trim());
    if (lines.length === 0) return;

    const firstRowLower = lines[0].toLowerCase();
    const startIndex = firstRowLower.includes('date') && firstRowLower.includes('fruit') ? 1 : 0;
    const imported = [];

    for (let i = startIndex; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (cols.length >= 2 && cols[1]) {
        const canonical = getCanonicalName(cols[1]);
        const rawDate = cols[0] || new Date().toISOString().split('T')[0];
        const parsedDate = parseLocalDate(rawDate);
        const isoDate = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`;
        const parsedRating = parseInt(cols[3], 10);

        imported.push({
          id: `imp-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          date: isoDate,
          dateObj: parsedDate,
          fruit: canonical,
          origin: cols[2] || '',
          rating: !isNaN(parsedRating) ? Math.min(5, Math.max(1, parsedRating)) : 3,
          store: cols[4] || '',
          userRegion: cols[5] || myRegion
        });
      }
    }

    if (imported.length > 0) {
      persistLogs([...imported, ...logs]);
      showToast(t('importSuccess', { count: imported.length }));
      setCsvData('');
      setIsImportModalOpen(false);
    } else {
      showToast(t('importEmpty'));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (typeof evt.target?.result === 'string') {
        setCsvData(evt.target.result);
      }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  const handleLoadStarter = () => {
    const entries = STARTER_DATA.map((item, idx) => {
      const canonical = getCanonicalName(item.fruit);
      return {
        id: `starter-${Date.now()}-${idx}`,
        date: item.date,
        dateObj: parseLocalDate(item.date),
        fruit: canonical,
        origin: item.origin,
        store: item.store,
        rating: item.rating,
        userRegion: myRegion
      };
    });
    persistLogs([...entries, ...logs]);
    showToast(t('importSuccess', { count: entries.length }));
  };

  // --- SEASONAL ANALYTICS ENGINE ---
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const regionalLogs = logs.filter(
      l => (l.userRegion || 'Quebec').toLowerCase() === myRegion.toLowerCase()
    );
    const fruitGroups = {};

    regionalLogs.forEach(l => {
      const key = getCanonicalName(l.fruit);
      if (!fruitGroups[key]) fruitGroups[key] = [];
      fruitGroups[key].push(l);
    });

    const almanacData = Object.entries(fruitGroups).map(([canonicalName, fLogs]) => {
      const monthLogs = fLogs.filter(l => l.dateObj.getMonth() === currentMonth);

      // Recency-weighted average for the current month
      let weightedSum = 0;
      let totalWeight = 0;
      monthLogs.forEach(l => {
        const weight = Math.max(0.3, 1 - (currentYear - l.dateObj.getFullYear()) * 0.15);
        weightedSum += l.rating * weight;
        totalWeight += weight;
      });

      const avgCurrent = totalWeight > 0 ? weightedSum / totalWeight : 0;
      const avgAll = fLogs.reduce((acc, l) => acc + l.rating, 0) / fLogs.length;

      const seasonalData = Array.from({ length: 12 }).map((_, i) => {
        const mLogs = fLogs.filter(l => l.dateObj.getMonth() === i);
        return {
          name: new Date(2025, i, 1).toLocaleString(lang === 'fr' ? 'fr-CA' : 'en-US', { month: 'short' }),
          rating: mLogs.length
            ? Number((mLogs.reduce((a, b) => a + b.rating, 0) / mLogs.length).toFixed(1))
            : null,
          count: mLogs.length
        };
      });

      let bestMonthIdx = -1;
      let maxRating = -1;
      seasonalData.forEach((d, idx) => {
        if (d.rating !== null && d.rating > maxRating) {
          maxRating = d.rating;
          bestMonthIdx = idx;
        }
      });

      const bestMonthName =
        bestMonthIdx !== -1
          ? new Date(2025, bestMonthIdx, 1).toLocaleString(lang === 'fr' ? 'fr-CA' : 'en-US', { month: 'long' })
          : '--';

      const recentOrigins = Array.from(new Set(monthLogs.map(l => l.origin).filter(Boolean)))
        .slice(0, 2)
        .join(', ');

      return {
        name: canonicalName,
        avgCurrent,
        avgAll,
        count: fLogs.length,
        monthCount: monthLogs.length,
        seasonalData,
        bestMonthName,
        recentOrigins,
        logs: fLogs
      };
    });

    const topPicks = almanacData
      .filter(f => f.avgCurrent >= 3.5)
      .sort((a, b) => b.avgCurrent - a.avgCurrent);

    const avoidPicks = almanacData
      .filter(f => f.avgCurrent > 0 && f.avgCurrent < 3.0)
      .sort((a, b) => a.avgCurrent - b.avgCurrent);

    const sortedAlmanac = [...almanacData].sort((a, b) => {
      if (trendSort === 'bestNow') {
        if (b.avgCurrent !== a.avgCurrent) return b.avgCurrent - a.avgCurrent;
        return b.avgAll - a.avgAll;
      }
      if (trendSort === 'bestAllTime') return b.avgAll - a.avgAll;
      return tf(a.name).localeCompare(tf(b.name), lang);
    });

    return { topPicks, avoidPicks, almanacData: sortedAlmanac, regionalLogs };
  }, [logs, myRegion, trendSort, lang]);

  // Global Header Search Results
  const searchMatches = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const clean = searchTerm.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return stats.almanacData.filter(f => {
      const disp = tf(f.name).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return disp.includes(clean) || f.name.toLowerCase().includes(clean);
    });
  }, [searchTerm, stats.almanacData, lang]);

  // Filtered Journal Logs
  const filteredJournalLogs = useMemo(() => {
    if (!journalFilter.trim()) return logs;
    const term = journalFilter.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return logs.filter(l => {
      const fruitDisp = tf(l.fruit).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const origin = (l.origin || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const store = (l.store || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return fruitDisp.includes(term) || l.fruit.toLowerCase().includes(term) || origin.includes(term) || store.includes(term);
    });
  }, [logs, journalFilter, lang]);

  const openFruitPage = (canonicalName) => {
    setViewFruit(getCanonicalName(canonicalName));
    setActiveTab('fruitDetail');
    setIsSearchOpen(false);
    setSearchTerm('');
  };

  return (
    <div
      className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans pb-28 selection:bg-orange-200"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@500;600;700;800;900&family=Chewy&display=swap');
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-5 py-3 rounded-full text-xs font-extrabold shadow-xl flex items-center gap-2 whitespace-nowrap">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* TOP APP BAR */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/70 sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            onClick={() => { setActiveTab('dashboard'); setViewFruit(null); }}
            className="flex items-center gap-2.5 active:scale-95 transition-transform"
          >
            <div className="h-11 w-11 rounded-2xl overflow-hidden bg-[#FF9800] shadow-sm ring-2 ring-orange-100 shrink-0">
              <img
                src="https://i.imgur.com/wzW4qu9.png"
                alt="Fruity Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <h1 className="text-3xl leading-none text-slate-800 tracking-wide" style={{ fontFamily: "'Chewy', cursive" }}>
                Fruity
              </h1>
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                {t('localBadge')}
              </span>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search"
              className={`p-3 rounded-full transition-colors ${isSearchOpen ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {isSearchOpen ? <X size={20} /> : <Search size={20} />}
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-full shadow-lg shadow-orange-500/25 flex items-center gap-1.5 font-black text-xs uppercase tracking-wider active:scale-95 transition-all"
            >
              <Plus size={18} strokeWidth={3} />
              <span>{t('logShort')}</span>
            </button>
          </div>
        </div>

        {/* EXPANDABLE SEARCH OVERLAY */}
        {isSearchOpen && (
          <div className="max-w-lg mx-auto px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                autoFocus
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-100 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            {searchMatches.length > 0 && (
              <div className="mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 divide-y divide-slate-50 max-h-60 overflow-y-auto">
                {searchMatches.map(f => (
                  <button
                    key={f.name}
                    onClick={() => openFruitPage(f.name)}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-orange-50/60 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getFruitIcon(f.name)}</span>
                      <div>
                        <p className="font-extrabold text-sm text-slate-800">{tf(f.name)}</p>
                        <p className="text-[10px] font-bold text-slate-400">
                          {f.count} {t('totalEntries')}
                        </p>
                      </div>
                    </div>
                    <span className="font-black text-xs text-orange-500">{f.avgAll.toFixed(1)} ★</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-lg mx-auto p-4 space-y-6">

        {/* ==================== TAB 1: HARVEST (DASHBOARD) ==================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Month & Region Header */}
            <div className="flex items-center justify-between px-1">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {t('insightsFor')}
                </p>
                <h2 className="text-2xl font-black text-slate-800 capitalize">
                  {new Date().toLocaleString(lang === 'fr' ? 'fr-CA' : 'en-US', { month: 'long' })}
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('settings')}
                className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-full border border-slate-200/80 shadow-sm active:scale-95 transition-transform"
              >
                <MapPin size={14} className="text-emerald-600" />
                <span className="text-xs font-extrabold text-slate-700">{myRegion}</span>
              </button>
            </div>

            {/* TOP PICKS HERO CARD */}
            <div className="bg-gradient-to-br from-[#2E7D32] to-[#388E3C] rounded-[2.25rem] p-6 text-white shadow-xl shadow-emerald-900/10">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="p-2 bg-white/15 rounded-xl">
                  <Star fill="white" size={20} />
                </div>
                <h3 className="text-xl font-black">{t('topPicks')}</h3>
              </div>
              <p className="text-white/80 text-xs font-bold mb-5">
                {t('bestRatedIn', { region: myRegion })}
              </p>

              {stats.topPicks.length > 0 ? (
                <div className="space-y-2.5">
                  {stats.topPicks.slice(0, 4).map((item, idx) => (
                    <div
                      key={item.name}
                      onClick={() => openFruitPage(item.name)}
                      className="bg-black/15 hover:bg-black/25 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer active:scale-95 transition-all border border-white/10"
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center font-black text-xs">
                          {idx + 1}
                        </span>
                        <span className="text-3xl">{getFruitIcon(item.name)}</span>
                        <div>
                          <p className="font-extrabold text-base leading-tight">{tf(item.name)}</p>
                          {item.recentOrigins && (
                            <p className="text-[11px] text-white/75 font-semibold">{item.recentOrigins}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full">
                        <span className="font-black text-sm">{item.avgCurrent.toFixed(1)}</span>
                        <Star size={12} fill="white" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-black/10 border border-dashed border-white/25 rounded-2xl p-6 text-center">
                  <p className="text-sm font-bold text-white/90">{t('noTopPicks')}</p>
                </div>
              )}
            </div>

            {/* SKIP FOR NOW (LOW-RATED THIS MONTH) */}
            {stats.avoidPicks.length > 0 && (
              <div className="bg-amber-50 border border-amber-200/70 rounded-[2rem] p-5">
                <div className="flex items-center gap-2 text-amber-800 mb-3">
                  <AlertTriangle size={18} />
                  <h3 className="font-black text-xs uppercase tracking-wider">{t('watchOut')}</h3>
                </div>
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                  {stats.avoidPicks.map(item => (
                    <button
                      key={item.name}
                      onClick={() => openFruitPage(item.name)}
                      className="bg-white px-4 py-2.5 rounded-2xl border border-amber-100 flex items-center gap-2.5 shrink-0 shadow-sm active:scale-95"
                    >
                      <span className="text-xl">{getFruitIcon(item.name)}</span>
                      <span className="font-extrabold text-xs text-slate-700">{tf(item.name)}</span>
                      <span className="text-xs font-black text-amber-600">{item.avgCurrent.toFixed(1)}★</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* RECENT TASTINGS CARD */}
            <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-black text-xs uppercase tracking-wider text-slate-400">
                  {t('recentLogs')}
                </h3>
                {stats.regionalLogs.length > 0 && (
                  <button
                    onClick={() => setActiveTab('list')}
                    className="text-xs font-extrabold text-orange-500 flex items-center gap-0.5"
                  >
                    {t('seeAll')} <ChevronRight size={14} />
                  </button>
                )}
              </div>

              {stats.regionalLogs.length > 0 ? (
                <div className="space-y-2.5">
                  {stats.regionalLogs.slice(0, 4).map(log => (
                    <div
                      key={log.id}
                      onClick={() => openFruitPage(log.fruit)}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 hover:bg-slate-100 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{getFruitIcon(log.fruit)}</span>
                        <div>
                          <p className="font-extrabold text-sm text-slate-800">{tf(log.fruit)}</p>
                          <p className="text-[11px] font-bold text-slate-400">
                            {log.date} {log.origin ? `• ${log.origin}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-slate-100 shadow-sm">
                        <span className="font-black text-xs text-orange-500">{log.rating}</span>
                        <Star size={12} fill="#FF9800" className="text-[#FF9800]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center space-y-4">
                  <p className="text-sm font-bold text-slate-400">{t('noData')}</p>
                  <button
                    onClick={handleLoadStarter}
                    className="text-xs font-black bg-emerald-50 text-emerald-700 px-5 py-3 rounded-full hover:bg-emerald-100 active:scale-95 transition-all"
                  >
                    {t('loadStarter')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 2: ALMANAC (TRENDS) ==================== */}
        {activeTab === 'trends' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-2xl font-black text-slate-800">{t('seasonalTrends')}</h2>
              <select
                value={trendSort}
                onChange={(e) => setTrendSort(e.target.value)}
                className="bg-white border border-slate-200 rounded-full px-3.5 py-2 text-xs font-extrabold text-slate-700 outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="bestNow">{t('bestNow')}</option>
                <option value="bestAllTime">{t('bestAllTime')}</option>
                <option value="alphabetical">{t('alphabetical')}</option>
              </select>
            </div>

            {stats.almanacData.length > 0 ? (
              <div className="space-y-4">
                {stats.almanacData.map(f => (
                  <div
                    key={f.name}
                    onClick={() => openFruitPage(f.name)}
                    className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 cursor-pointer hover:border-orange-200 active:scale-[0.99] transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3.5">
                        <div className="text-4xl bg-slate-50 p-2.5 rounded-2xl">{getFruitIcon(f.name)}</div>
                        <div>
                          <h3 className="font-black text-xl text-slate-800 leading-tight">{tf(f.name)}</h3>
                          <div className="mt-1">
                            {f.avgCurrent > 0 ? (
                              <span className="inline-flex items-center bg-[#E8F5E9] text-[#2E7D32] px-2.5 py-0.5 rounded-lg text-xs font-black">
                                {f.avgCurrent.toFixed(1)} {t('thisMonthBadge')}
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-slate-400">
                                {f.avgAll.toFixed(1)} ★ • {f.count} {t('totalEntries')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-full text-slate-400">
                        <TrendingUp size={18} />
                      </div>
                    </div>

                    <div className="h-40 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={f.seasonalData} margin={{ top: 8, right: 8, bottom: 0, left: -14 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                          />
                          <YAxis
                            domain={[1, 5]}
                            ticks={[1, 2, 3, 4, 5]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                          />
                          <Line
                            type="monotone"
                            dataKey="rating"
                            stroke="#388E3C"
                            strokeWidth={3.5}
                            dot={{ r: 4, fill: '#388E3C', strokeWidth: 0 }}
                            connectNulls
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] p-12 text-center border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold text-sm">{t('noData')}</p>
              </div>
            )}
          </div>
        )}

        {/* ==================== FRUIT DETAIL PAGE ==================== */}
        {activeTab === 'fruitDetail' && viewFruit && (
          <div className="space-y-5">
            <button
              onClick={() => { setViewFruit(null); setActiveTab('trends'); }}
              className="inline-flex items-center gap-2 text-slate-600 font-extrabold text-xs bg-white px-4 py-2.5 rounded-full border border-slate-200/80 shadow-sm active:scale-95 transition-transform"
            >
              <ArrowLeft size={16} />
              <span>{t('backToAlmanac')}</span>
            </button>

            {(() => {
              const fData = stats.almanacData.find(f => f.name === viewFruit);
              if (!fData) return null;
              const palette = getFruitColorContext(viewFruit);

              return (
                <>
                  {/* FRUIT HERO CARD */}
                  <div className={`${palette.cardBg} rounded-[2.5rem] p-7 text-center border border-white shadow-sm`}>
                    <div className="text-7xl mb-3">{getFruitIcon(viewFruit)}</div>
                    <h2 className="text-3xl font-black text-slate-800">{tf(viewFruit)}</h2>
                    <p className="text-xs font-extrabold text-slate-500/70 uppercase tracking-widest mt-1 mb-6">
                      {fData.count} {t('totalEntries')} • {myRegion}
                    </p>

                    <div className="space-y-3 text-left">
                      <div className="bg-white rounded-3xl p-5 shadow-sm">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                          {t('bestMonth')}
                        </span>
                        <p className="text-2xl font-black text-slate-800 capitalize">{fData.bestMonthName}</p>
                      </div>
                      <div className="bg-white rounded-3xl p-5 shadow-sm">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                          {t('avgRating')}
                        </span>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-black text-slate-800">{fData.avgAll.toFixed(1)}</p>
                          <Star fill="#FF9800" className="text-[#FF9800]" size={20} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SEASONAL TREND LINE CHART */}
                  <div className="bg-white p-6 rounded-[2.25rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2.5 mb-6">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                        <TrendingUp size={18} />
                      </div>
                      <h3 className="font-black text-lg text-slate-800">{t('seasonalTrend')}</h3>
                    </div>

                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={fData.seasonalData} margin={{ top: 10, right: 12, bottom: 0, left: -14 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }}
                          />
                          <YAxis
                            domain={[1, 5]}
                            ticks={[1, 2, 3, 4, 5]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }}
                          />
                          <Tooltip
                            contentStyle={{
                              borderRadius: '16px',
                              border: 'none',
                              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                              fontWeight: 800
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="rating"
                            stroke="#388E3C"
                            strokeWidth={4}
                            dot={{ r: 5.5, fill: 'white', stroke: '#388E3C', strokeWidth: 3 }}
                            activeDot={{ r: 7.5, fill: '#388E3C' }}
                            connectNulls
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* TASTING HISTORY FOR THIS FRUIT */}
                  <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
                    <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 px-1">
                      {t('historyForFruit')}
                    </h3>
                    {fData.logs.map(l => (
                      <div key={l.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50">
                        <div>
                          <p className="font-extrabold text-sm text-slate-800">{l.date}</p>
                          <p className="text-xs font-bold text-slate-400">
                            {[l.origin, l.store].filter(Boolean).join(' • ') || t('noOrigin')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-sm text-orange-500">{l.rating} ★</span>
                          <button
                            onClick={() => handleDeleteLog(l.id)}
                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                            aria-label="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* ==================== TAB 3: JOURNAL (ALL LOGS) ==================== */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input
                type="text"
                placeholder={t('filterJournal')}
                value={journalFilter}
                onChange={(e) => setJournalFilter(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200/80 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-400 shadow-sm"
              />
              {journalFilter && (
                <button
                  onClick={() => setJournalFilter('')}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="font-black text-lg text-slate-800">{t('allLogs')}</h2>
                <span className="text-xs font-black bg-white border border-slate-200 px-3 py-1 rounded-full text-slate-500">
                  {filteredJournalLogs.length}
                </span>
              </div>

              {filteredJournalLogs.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {filteredJournalLogs.map(log => (
                    <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                      <div
                        onClick={() => openFruitPage(log.fruit)}
                        className="flex items-center gap-3.5 cursor-pointer flex-1 min-w-0"
                      >
                        <span className="text-3xl shrink-0">{getFruitIcon(log.fruit)}</span>
                        <div className="truncate">
                          <p className="font-extrabold text-base text-slate-800 leading-tight truncate">
                            {tf(log.fruit)}
                          </p>
                          <p className="text-[11px] font-bold text-slate-400 mt-0.5 truncate">
                            {log.date} {log.origin ? `• ${log.origin}` : ''} {log.store ? `(${log.store})` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <StarRating rating={log.rating} readonly size={15} />
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-2 text-slate-300 hover:text-rose-500 active:scale-90 transition-all"
                          aria-label="Delete"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 font-bold text-sm">{t('noData')}</div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 4: THE SHED (SETTINGS & CSV) ==================== */}
        {activeTab === 'settings' && (
          <div className="space-y-5">
            {/* Preferences Card */}
            <div className="bg-white rounded-[2.25rem] p-6 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-100 rounded-2xl text-slate-600">
                  <Settings size={22} />
                </div>
                <h2 className="font-black text-xl text-slate-800">{t('appPreferences')}</h2>
              </div>

              {/* Language Switcher */}
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {t('language')}
                </label>
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
                  <button
                    onClick={() => setLang('fr')}
                    className={`py-2.5 rounded-xl text-xs font-black transition-all ${lang === 'fr' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-500'}`}
                  >
                    Français
                  </button>
                  <button
                    onClick={() => setLang('en')}
                    className={`py-2.5 rounded-xl text-xs font-black transition-all ${lang === 'en' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-500'}`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Region Input */}
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {t('currentRegion')}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 text-emerald-600" size={18} />
                  <input
                    type="text"
                    value={myRegion}
                    onChange={(e) => setMyRegion(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-100 rounded-2xl font-extrabold text-sm text-slate-800 outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <p className="text-[11px] font-semibold text-slate-400 mt-1.5 ml-1">{t('regionHint')}</p>
              </div>
            </div>

            {/* Portable Data (CSV) Card */}
            <div className="bg-white rounded-[2.25rem] p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 rounded-2xl text-emerald-600">
                  <Database size={22} />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-800">{t('dataManagement')}</h3>
                </div>
              </div>

              <p className="text-xs font-semibold text-slate-500 leading-relaxed">{t('dataHint')}</p>

              <div className="grid grid-cols-1 gap-3 pt-1">
                <button
                  onClick={handleExportCSV}
                  disabled={logs.length === 0}
                  className="w-full py-4 px-5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md active:scale-95 transition-all"
                >
                  <FileDown size={18} />
                  <span>{t('exportCSV')} ({logs.length})</span>
                </button>

                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="w-full py-4 px-5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 active:scale-95 transition-all"
                >
                  <Upload size={18} />
                  <span>{t('importCSV')}</span>
                </button>

                <button
                  onClick={handleLoadStarter}
                  className="w-full py-3.5 px-5 border-2 border-dashed border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Download size={16} />
                  <span>{t('loadStarter')}</span>
                </button>

                {logs.length > 0 && (
                  <button
                    onClick={() => setIsClearConfirmOpen(true)}
                    className="w-full py-3.5 px-5 text-rose-500 hover:bg-rose-50 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all mt-2"
                  >
                    <Trash2 size={16} />
                    <span>{t('clearAll')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FLOATING BOTTOM NAVIGATION BAR (PIXEL ERGONOMICS) */}
      <nav className="fixed bottom-5 left-4 right-4 max-w-md mx-auto bg-white/95 backdrop-blur-xl border border-slate-200/70 p-2 flex justify-around items-center rounded-full shadow-2xl shadow-slate-900/10 z-30">
        {[
          { id: 'dashboard', icon: <TrendingUp size={20} />, label: t('tabs.dashboard') },
          { id: 'trends', icon: <BarChart2 size={20} />, label: t('tabs.trends') },
          { id: 'list', icon: <List size={20} />, label: t('tabs.list') },
          { id: 'settings', icon: <Settings size={20} />, label: t('tabs.settings') }
        ].map(tab => {
          const isActive = activeTab === tab.id || (tab.id === 'trends' && activeTab === 'fruitDetail');
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setViewFruit(null); }}
              className={`flex flex-col items-center justify-center w-16 h-14 rounded-full transition-all duration-200 ${
                isActive ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30 scale-105' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.icon}
              <span className="text-[9px] font-black uppercase tracking-tight mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ==================== MODAL: LOG A FRUIT ==================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md p-6 sm:p-7 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800">{t('logModalTitle')}</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2.5 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddLog} className="space-y-5">
              {/* Fruit Name with Autocomplete */}
              <div className="relative">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  {t('fruitName')}
                </label>
                <div className="relative">
                  <Search
                    className={`absolute left-4 top-3.5 ${isValidFruit ? 'text-emerald-500' : 'text-slate-400'}`}
                    size={18}
                  />
                  <input
                    autoFocus
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={newLog.fruit}
                    onChange={(e) => setNewLog({ ...newLog, fruit: e.target.value })}
                    className={`w-full pl-11 pr-10 py-3.5 rounded-2xl font-extrabold text-sm outline-none border-2 transition-all ${
                      isValidFruit
                        ? 'border-emerald-300 bg-emerald-50/50 text-slate-800'
                        : 'border-transparent bg-slate-100 focus:border-orange-400 focus:bg-white'
                    }`}
                    required
                  />
                  {isValidFruit && (
                    <CheckCircle2 className="absolute right-3.5 top-3.5 text-emerald-500" size={20} />
                  )}
                </div>

                {/* Autocomplete Chips */}
                {fruitSuggestions.length > 0 && !isValidFruit && (
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    {fruitSuggestions.map(f => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setNewLog({ ...newLog, fruit: f })}
                        className="text-xs bg-orange-50 hover:bg-orange-100 text-orange-700 px-3 py-1.5 rounded-xl font-extrabold flex items-center gap-1.5 transition-colors"
                      >
                        <span>{getFruitIcon(getCanonicalName(f))}</span>
                        <span>{f}</span>
                      </button>
                    ))}
                  </div>
                )}

                {newLog.fruit && !isValidFruit && fruitSuggestions.length === 0 && (
                  <p className="text-[11px] font-bold text-rose-500 mt-1.5 ml-1 flex items-center gap-1">
                    <AlertCircle size={13} /> {t('invalidFruitWarn')}
                  </p>
                )}
              </div>

              {/* Date & Origin */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    {t('datePurchased')}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" size={16} />
                    <input
                      type="date"
                      value={newLog.date}
                      onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                      className="w-full pl-10 pr-3 py-3 bg-slate-100 rounded-2xl font-bold text-xs text-slate-800 outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    {t('originCountry')}
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Peru, Quebec"
                    value={newLog.origin}
                    onChange={(e) => setNewLog({ ...newLog, origin: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-100 rounded-2xl font-bold text-xs text-slate-800 outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>

              {/* Store (Optional) */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  {t('storeName')}
                </label>
                <div className="relative">
                  <Store className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="IGA, Costco, Metro..."
                    value={newLog.store}
                    onChange={(e) => setNewLog({ ...newLog, store: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-2xl font-bold text-xs text-slate-800 outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>

              {/* Star Rating Box */}
              <div
                className={`p-5 rounded-3xl flex flex-col items-center gap-2 transition-all ${
                  isValidFruit ? 'bg-orange-50' : 'bg-slate-100 opacity-50'
                }`}
              >
                <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">
                  {t('qualityRating')}
                </span>
                <StarRating
                  rating={newLog.rating}
                  setRating={(v) => setNewLog({ ...newLog, rating: v })}
                  size={34}
                />
                <span className="font-black text-orange-600 text-lg">{newLog.rating} / 5</span>
              </div>

              {isDuplicateToday && (
                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-center gap-2.5 text-amber-800 text-xs font-bold">
                  <AlertTriangle size={18} className="shrink-0" />
                  <span>{t('duplicateWarn')}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!isValidFruit}
                className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all"
              >
                {t('saveLog')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: IMPORT CSV ==================== */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md p-6 sm:p-7 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800">{t('importModalTitle')}</h2>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-2 bg-slate-100 rounded-full text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-xs font-semibold text-slate-500">{t('importHint')}</p>

            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv,text/csv"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3.5 border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <Upload size={16} />
                <span>{t('uploadFile')}</span>
              </button>
            </div>

            <textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="2026-11-23, Fraise, Quebec, 5, IGA"
              className="w-full h-40 p-4 bg-slate-100 rounded-2xl font-mono text-xs text-slate-700 outline-none focus:ring-2 focus:ring-orange-400"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="flex-1 py-3.5 rounded-2xl font-extrabold text-xs text-slate-500 bg-slate-100"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                disabled={!csvData.trim()}
                onClick={handleImportCSV}
                className="flex-1 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 shadow-md active:scale-95 transition-all"
              >
                {t('processData')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: CONFIRM CLEAR DATA ==================== */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm p-6 rounded-[2rem] shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-800">{t('confirmClearTitle')}</h3>
            <p className="text-xs font-semibold text-slate-500 leading-relaxed">{t('confirmClearDesc')}</p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsClearConfirmOpen(false)}
                className="flex-1 py-3 rounded-xl font-extrabold text-xs bg-slate-100 text-slate-600"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-3 rounded-xl font-black text-xs bg-rose-500 text-white shadow-md active:scale-95"
              >
                {t('deleteBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
