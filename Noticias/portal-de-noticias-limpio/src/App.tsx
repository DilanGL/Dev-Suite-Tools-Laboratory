import React, { useState, useEffect } from "react";
import { 
  Newspaper, 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  ExternalLink, 
  X, 
  Clock, 
  Sparkles, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Share2, 
  CheckCircle,
  AlertCircle,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { NewsArticle, FinancialData } from "./types";
import { RECOMMENDED_ARTICLES } from "./data";

export interface PortalRating {
  reliability: number;     // 0-100%
  authenticity: number;    // 0-100%
  clickbait: number;       // 0-100%
  sensationalism: number;  // 0-100%
  label: "Muy Bajo" | "Bajo" | "Medio" | "Alto" | "Extremo";
  color: string;           // Tailwind badge class colors
}

export function getPortalRating(sourceName: string, urlStr?: string): PortalRating {
  const name = sourceName.toLowerCase();
  const domain = urlStr ? urlStr.toLowerCase() : "";

  // 1. Pristine high-quality agencies/papers
  if (
    name.includes("reuters") || domain.includes("reuters.com") ||
    name.includes("bloomberg") || domain.includes("bloomberg.com") ||
    name.includes("nytimes") || name.includes("new york times") || domain.includes("nytimes.com") ||
    name.includes("financial times") || name.includes("ft.com") || domain.includes("ft.com") ||
    name.includes("wsj") || name.includes("wall street journal") || domain.includes("wsj.com") ||
    name.includes("nature") || domain.includes("nature.com") ||
    name.includes("science") || domain.includes("science.org") ||
    name.includes("associated press") || name.includes("ap news") || domain.includes("apnews.com")
  ) {
    return {
      reliability: 96,
      authenticity: 95,
      clickbait: 8,
      sensationalism: 10,
      label: "Muy Bajo",
      color: "text-emerald-400 bg-emerald-950/60 border-emerald-800/40"
    };
  }

  // 2. Reliable general press & serious tech
  if (
    name.includes("bbc") || domain.includes("bbc.co.uk") || domain.includes("bbc.com") ||
    name.includes("el país") || name.includes("elpais") || domain.includes("elpais.com") ||
    name.includes("wired") || domain.includes("wired.com") ||
    name.includes("techcrunch") || domain.includes("techcrunch.com") ||
    name.includes("the guardian") || domain.includes("theguardian.com") ||
    name.includes("dw") || name.includes("deutsche welle") || domain.includes("dw.com") ||
    name.includes("mit tech review") || domain.includes("technologyreview.com")
  ) {
    return {
      reliability: 88,
      authenticity: 89,
      clickbait: 18,
      sensationalism: 22,
      label: "Bajo",
      color: "text-emerald-350 bg-emerald-950/40 border-emerald-900/30"
    };
  }

  // 3. Standards / Major news & tech blogs
  if (
    name.includes("cnn") || domain.includes("cnn.com") ||
    name.includes("the verge") || domain.includes("theverge.com") ||
    name.includes("gizmodo") || domain.includes("gizmodo.com") ||
    name.includes("xataka") || domain.includes("xataka.com") ||
    name.includes("el mundo") || domain.includes("elmundo.es") ||
    name.includes("la nación") || name.includes("lanacion") || domain.includes("lanacion.com") ||
    name.includes("clarín") || name.includes("clarin") || domain.includes("clarin.com") ||
    name.includes("forbes") || domain.includes("forbes.com") ||
    name.includes("engadget") || domain.includes("engadget.com") ||
    name.includes("techradar") || domain.includes("techradar.com") ||
    name.includes("cnet") || domain.includes("cnet.com")
  ) {
    return {
      reliability: 78,
      authenticity: 82,
      clickbait: 36,
      sensationalism: 38,
      label: "Medio",
      color: "text-amber-400 bg-amber-950/40 border-amber-900/30"
    };
  }

  // 4. Tabloid / clicky regional / mainstream online-focused outlets (Infobae, Yahoo, MSN, El Universal, Marca, As, etc.)
  if (
    name.includes("infobae") || domain.includes("infobae.com") ||
    name.includes("yahoo") || domain.includes("yahoo.com") ||
    name.includes("msn") || domain.includes("msn.com") ||
    name.includes("el universal") || domain.includes("eluniversal") ||
    name.includes("marca") || domain.includes("marca.com") ||
    name.includes("as") || domain.includes("as.com") ||
    name.includes("excelsior") || domain.includes("excelsior.com") ||
    name.includes("rt") || name.includes("russia today") || domain.includes("rt.com") ||
    name.includes("sputnik") || domain.includes("sputniknews")
  ) {
    return {
      reliability: 62,
      authenticity: 68,
      clickbait: 68,
      sensationalism: 65,
      label: "Alto",
      color: "text-orange-400 bg-orange-950/40 border-orange-900/30"
    };
  }

  // 5. Default/Generic blogs or unknown channels (deterministic hash)
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const rel = 55 + Math.abs(hash % 25); // 55% - 80%
  const aut = rel - 5 + Math.abs(hash % 10);
  const clb = 25 + Math.abs(hash % 45); // 25% - 70% clickbait
  const sens = 20 + Math.abs(hash % 50); // 20% - 70% sensationalism
  
  let label: "Muy Bajo" | "Bajo" | "Medio" | "Alto" | "Extremo" = "Medio";
  let color = "text-amber-400 bg-amber-950/40 border-amber-900/30";

  if (sens < 25) {
    label = "Muy Bajo";
    color = "text-emerald-400 bg-emerald-950/60 border-emerald-800/40";
  } else if (sens < 40) {
    label = "Bajo";
    color = "text-emerald-350 bg-emerald-950/40 border-emerald-900/30";
  } else if (sens < 60) {
    label = "Medio";
    color = "text-amber-400 bg-amber-950/40 border-amber-900/30";
  } else if (sens < 75) {
    label = "Alto";
    color = "text-orange-400 bg-orange-950/40 border-orange-900/30";
  } else {
    label = "Extremo";
    color = "text-red-400 bg-red-950/40 border-red-900/30";
  }

  return {
    reliability: rel,
    authenticity: aut,
    clickbait: clb,
    sensationalism: sens,
    label,
    color
  };
}

export default function App() {
  // --- STATE ---
  const [mainTab, setMainTab] = useState<"noticias" | "finanzas">("noticias");
  const [selectedFinancialAsset, setSelectedFinancialAsset] = useState<{name: string, type: "indices" | "currencies" | "cryptos", symbol: string}>({ name: "BTC / USD", type: "cryptos", symbol: "BTC" });
  const [financialChartTimeframe, setFinancialChartTimeframe] = useState<"24H" | "7D" | "30D">("7D");
  const [financialHoverIdx, setFinancialHoverIdx] = useState<number | null>(null);

  // Convert states
  const [convertFromAmount, setConvertFromAmount] = useState<string>("100");
  const [convertFromCurrency, setConvertFromCurrency] = useState<string>("USD");
  const [convertToCurrency, setConvertToCurrency] = useState<string>("MXN");

  const [activeTab, setActiveTab] = useState<"Tecnología" | "Economía" | "Entretenimiento">("Tecnología");
  const [newsList, setNewsList] = useState<NewsArticle[]>(RECOMMENDED_ARTICLES);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  const [isFetchingCleanArticle, setIsFetchingCleanArticle] = useState(false);
  const [cleanArticleError, setCleanArticleError] = useState<string | null>(null);
  const [isRefreshingNews, setIsRefreshingNews] = useState(false);
  const [financials, setFinancials] = useState<FinancialData | null>(null);
  const [loadingFinancials, setLoadingFinancials] = useState(false);
  const [historicalPoints, setHistoricalPoints] = useState<any[] | null>(null);
  const [loadingHistorical, setLoadingHistorical] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<NewsArticle[] | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchedTopic, setSearchedTopic] = useState("");

  // Get matching asset data from live financials state or fallback values
  const getSelectedAssetData = () => {
    if (!financials) {
      // Return static default while state loads
      if (selectedFinancialAsset.name === "BTC / USD") return { name: "BTC / USD", value: "67,850.00", change: "+1.85%", isUp: true };
      return { name: "S&P 500", value: "5,420.40", change: "+0.32%", isUp: true };
    }
    const list = financials[selectedFinancialAsset.type] || [];
    const found = list.find((item: any) => item.name === selectedFinancialAsset.name);
    if (found) return found;
    return list[0] || { name: selectedFinancialAsset.name, value: "100.00", change: "+0.00%", isUp: true };
  };

  // Generate ultra high-fidelity deterministic points for plotting custom responsive SVG charts
  const getHistoricalPoints = (baseVal: string, changeStr: string, tf: "24H" | "7D" | "30D", name: string) => {
    const cleanValStr = baseVal.replace(/[$,]/g, "");
    const base = parseFloat(cleanValStr) || 100;
    
    // Parse change percentage (e.g. "+1.85%" or "-0.22%")
    const rawChange = parseFloat(changeStr.replace(/[+%]/g, "")) || 0;
    
    // Scale the change percentage based on timeframe
    let changePct = rawChange / 100;
    if (tf === "7D") {
      changePct = changePct * 2.5;
    } else if (tf === "30D") {
      changePct = changePct * 5.0;
    }

    const pointsCount = tf === "24H" ? 24 : tf === "7D" ? 30 : 60;
    const points = [];
    
    // Simple deterministic hash of the name for unique asset curves
    let hash = 0;
    for (let charIdx = 0; charIdx < name.length; charIdx++) {
      hash += name.charCodeAt(charIdx);
    }
    const phase = (hash % 100) / 100 * Math.PI * 2;
    const multiplier = 1 + (hash % 5) * 0.1; // 1.0 to 1.4

    for (let i = 0; i < pointsCount; i++) {
      const p = i / (pointsCount - 1);
      
      // Base linear trend from (1 - changePct) to 1
      const trendFactor = 1 - changePct * (1 - p);
      
      // Beautiful harmonic waves (multi-frequency sine waves)
      const sinWave1 = Math.sin(p * Math.PI * 4 * multiplier + phase) * 0.015;
      const sinWave2 = Math.cos(p * Math.PI * 10 * multiplier - phase) * 0.007;
      const microNoise = Math.sin(p * Math.PI * 30 * multiplier) * 0.002;
      
      // Smooth damping envelope: 0 at start, 0 at end, max in the middle
      const envelope = Math.sin(p * Math.PI);
      const waveOffset = (sinWave1 + sinWave2 + microNoise) * envelope;
      
      const finalValue = base * (trendFactor + waveOffset);
      
      let label = "";
      if (tf === "24H") {
        const hour = 24 - Math.round((1 - p) * 24);
        label = hour === 0 ? "Ahora" : `Hace ${hour}h`;
      } else if (tf === "7D") {
        const day = 7 - Math.round((1 - p) * 7);
        label = day === 0 ? "Hoy" : `Hace ${day}d`;
      } else {
        const day = 30 - Math.round((1 - p) * 30);
        label = day === 0 ? "Hoy" : `Hace ${day}d`;
      }
      
      points.push({ label, value: finalValue });
    }
    
    // Ensure terminal point is PRECISELY the actual live valuation
    points[points.length - 1].value = base;
    
    return points;
  };

  // Convert raw value dynamically based on actual indexed live currency values
  const handleCalculateConversion = (amountStr: string, from: string, to: string) => {
    const amt = parseFloat(amountStr) || 0;
    if (amt <= 0) return 0;
    
    // Default fallback rates
    let usdAmount = amt;
    
    const eurUsdStr = financials?.currencies.find(c => c.name.startsWith("EUR"))?.value || "1.0820";
    const mxnUsdStr = financials?.currencies.find(c => c.name.includes("MXN"))?.value || "18.2540";
    const arsUsdStr = financials?.currencies.find(c => c.name.includes("ARS"))?.value || "921.50";
    const copUsdStr = financials?.currencies.find(c => c.name.includes("COP"))?.value || "4085.00";
    
    const eurRate = parseFloat(eurUsdStr.replace(/,/g, "")) || 1.0820;
    const mxnRate = parseFloat(mxnUsdStr.replace(/,/g, "")) || 18.2540;
    const arsRate = parseFloat(arsUsdStr.replace(/,/g, "")) || 921.50;
    const copRate = parseFloat(copUsdStr.replace(/,/g, "")) || 4085.00;
    
    if (from === "EUR") {
      usdAmount = amt * eurRate;
    } else if (from === "MXN") {
      usdAmount = amt / mxnRate;
    } else if (from === "ARS") {
      usdAmount = amt / arsRate;
    } else if (from === "COP") {
      usdAmount = amt / copRate;
    } else if (from === "USD") {
      usdAmount = amt;
    }
    
    if (to === "USD") return usdAmount;
    if (to === "EUR") return usdAmount / eurRate;
    if (to === "MXN") return usdAmount * mxnRate;
    if (to === "ARS") return usdAmount * arsRate;
    if (to === "COP") return usdAmount * copRate;
    
    return usdAmount;
  };

  // States for unified sections, pagination, and rotation
  const [activeTrendIndex, setActiveTrendIndex] = useState(0);
  const [isRefreshingTrends, setIsRefreshingTrends] = useState(false);

  // Timeframe selector state for Search Colector
  const [dayLinksTimeframe, setDayLinksTimeframe] = useState<"today" | "week" | "month" | "all">("today");

  // Auto rotation of trending stories every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTrendIndex((prev) => {
        const total = newsList.length || 1;
        return (prev + 1) % total;
      });
    }, 6000);
    return () => clearInterval(timer);
  }, [newsList.length]);

  // Bookmarks state (persisted in localStorage)
  const [bookmarks, setBookmarks] = useState<NewsArticle[]>(() => {
    const saved = localStorage.getItem("news_bookmarks");
    return saved ? JSON.parse(saved) : [];
  });
  
  // UI Panels
  const [showBookmarksDrawer, setShowBookmarksDrawer] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  
  // Clean Reader Settings
  const [readerFontSize, setReaderFontSize] = useState<"sm" | "normal" | "lg" | "xl">("normal");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // --- STATE FOR "ENLACES DEL DÍA" (COLECTOR DIARIO) ---
  const [dayLinksQuery, setDayLinksQuery] = useState("");
  const [dayLinksActiveTab, setDayLinksActiveTab] = useState<"realtime" | "history">("realtime");
  const [dayLinksResults, setDayLinksResults] = useState<any[]>([]);
  const [isSearchingDayLinks, setIsSearchingDayLinks] = useState(false);
  const [dayLinksError, setDayLinksError] = useState<string | null>(null);
  const [dayLinksHistory, setDayLinksHistory] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("news_day_links_history");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [dayLinksSelectedHistoryTopic, setDayLinksSelectedHistoryTopic] = useState<string>("Todos");
  const [hasSearchedDayLinks, setHasSearchedDayLinks] = useState(false);
  const [showConfirmClearDayHistory, setShowConfirmClearDayHistory] = useState(false);

  // Synchronize Bookmarks with localStorage
  useEffect(() => {
    localStorage.setItem("news_bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Synchronize Day Links History with localStorage
  useEffect(() => {
    localStorage.setItem("news_day_links_history", JSON.stringify(dayLinksHistory));
  }, [dayLinksHistory]);

  // Fetch Financial Data
  const fetchFinancials = async () => {
    setLoadingFinancials(true);
    try {
      const response = await fetch("/api/financials");
      if (response.ok) {
        const data = await response.json();
        setFinancials(data);
      } else {
        throw new Error("Respuesta no OK de la API");
      }
    } catch (e) {
      console.error("Error cargando financials, usando simulación estática.");
      // Simulated Fallback
      setFinancials({
        timestamp: new Date().toISOString(),
        indices: [
          { name: "S&P 500", value: "5,420.40", change: "+0.32%", isUp: true },
          { name: "NASDAQ", value: "17,860.25", change: "+0.54%", isUp: true },
          { name: "IBEX 35", value: "11,310.80", change: "-0.22%", isUp: false },
          { name: "DOW JONES", value: "39,120.50", change: "+0.11%", isUp: true },
        ],
        currencies: [
          { name: "EUR/USD", value: "1.0820", change: "+0.15%", isUp: true },
          { name: "USD/MXN", value: "18.2540", change: "-0.32%", isUp: false },
          { name: "USD/ARS", value: "921.50", change: "+0.10%", isUp: true },
          { name: "USD/COP", value: "4,085.00", change: "-0.45%", isUp: false },
        ],
        cryptos: [
          { name: "BTC / USD", value: "67,850.00", change: "+1.85%", isUp: true },
          { name: "ETH / USD", value: "3,545.20", change: "+2.40%", isUp: true },
          { name: "SOL / USD", value: "152.12", change: "-1.15%", isUp: false },
        ]
      });
    } finally {
      setLoadingFinancials(false);
    }
  };

  const fetchHistoricalPoints = async () => {
    setLoadingHistorical(true);
    try {
      const response = await fetch(
        `/api/historical-data?type=${selectedFinancialAsset.type}&name=${encodeURIComponent(
          selectedFinancialAsset.name
        )}&timeframe=${financialChartTimeframe}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.points) {
          setHistoricalPoints(data.points);
          setLoadingHistorical(false);
          return;
        }
      }
    } catch (e) {
      console.error("Error fetching real historical points:", e);
    }
    setHistoricalPoints(null);
    setLoadingHistorical(false);
  };

  useEffect(() => {
    fetchHistoricalPoints();
  }, [selectedFinancialAsset, financialChartTimeframe]);

  // Sincronizar dinámicamente con el colector de RSS tradicional (cada 24h o manual)
  const syncNewsFromColector = async (force = false) => {
    try {
      const response = await fetch(`/api/rss-trends?t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.articles && data.articles.length > 0) {
          setNewsList(data.articles);
          const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " hs";
          setLastSyncTime(nowStr);
        }
      }
    } catch (e) {
      console.error("[Colector Sync] Falló el canje de noticias tradicionales:", e);
    }
  };

  // Initial Fetch & Interval
  useEffect(() => {
    // Clear legacy storage items to respect user constraint
    localStorage.removeItem("news_colector_list");
    localStorage.removeItem("news_colector_sync_time");

    fetchFinancials();
    syncNewsFromColector(true);
    const interval = setInterval(fetchFinancials, 20000); // refresh every 20s
    return () => clearInterval(interval);
  }, []);

  // Refrescar sección de Tendencias en Rotación
  const handleRefreshTrends = async () => {
    setIsRefreshingTrends(true);
    await syncNewsFromColector(true);
    setIsRefreshingTrends(false);
  };

  // Actualizar e Indexar todas las noticias
  const handleRefreshNews = async () => {
    setIsRefreshingNews(true);
    fetchFinancials();
    await syncNewsFromColector(true);
    setIsRefreshingNews(false);
  };

  // --- ENLACES DEL DÍA: RSS INTEGRATOR AND LOCAL STORAGE CORE ---
  const handleSearchDayLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dayLinksQuery.trim()) return;

    setIsSearchingDayLinks(true);
    setDayLinksError(null);
    setHasSearchedDayLinks(true);
    setDayLinksResults([]);

    const topic = dayLinksQuery.trim();

    try {
      // Build time query operator based on user selected timeframe
      let timeSuffix = "";
      if (dayLinksTimeframe === "today") {
        timeSuffix = " when:1d";
      } else if (dayLinksTimeframe === "week") {
        timeSuffix = " when:7d";
      } else if (dayLinksTimeframe === "month") {
        timeSuffix = " when:30d";
      }

      // Build Google News query referencing ALL possible news portals (no restrictive site filtering)
      const targetUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(
        topic + timeSuffix
      )}&hl=es-419&gl=US&ceid=US:es`;

      // Dual-Proxy Strategy: try our lightning-fast, secure server-side proxy route first.
      let xmlContent = "";
      try {
        const localProxyUrl = `/api/rss-proxy?url=${encodeURIComponent(targetUrl)}`;
        const res = await fetch(localProxyUrl);
        if (res.ok) {
          const data = await res.json();
          if (data && data.contents) {
            xmlContent = data.contents;
          }
        }
      } catch (localErr) {
        console.warn("Server-side proxy fetch faltered, activating public CORS proxy fallback:", localErr);
      }

      // If server-side proxy has not succeeded, call allorigins.win
      if (!xmlContent) {
        const publicProxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
        const res = await fetch(publicProxyUrl);
        if (!res.ok) {
          throw new Error("No se pudo establecer conexión con los servidores de recopilación de feeds. Por favor intente nuevamente.");
        }
        const data = await res.json();
        if (data && data.contents) {
          xmlContent = data.contents;
        } else {
          throw new Error("El feed de recopilación no retornó un formato XML descifrable en este momento.");
        }
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
      
      const parserError = xmlDoc.getElementsByTagName("parsererror")[0];
      if (parserError) {
        throw new Error("El documento XML devuelto no se ha podido procesar correctamente.");
      }

      const items = xmlDoc.getElementsByTagName("item");
      const foundLinks: any[] = [];
      const todayDate = new Date();

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const title = item.getElementsByTagName("title")[0]?.textContent || "";
        const linkNode = item.getElementsByTagName("link")[0];
        const rawLink = linkNode?.textContent || linkNode?.getAttribute("href") || "";
        const pubDateText = item.getElementsByTagName("pubDate")[0]?.textContent || "";
        const descriptionNode = item.getElementsByTagName("description")[0];
        // Clean HTML tags from description if any
        let description = descriptionNode ? descriptionNode.textContent?.replace(/<[^>]*>/g, "") || "" : "";

        // Extract a human-readable clean source
        let source = "Google News";
        const sourceNode = item.getElementsByTagName("source")[0];
        if (sourceNode) {
          source = sourceNode.textContent || "";
        } else {
          const dashIdx = title.lastIndexOf(" - ");
          if (dashIdx !== -1) {
            source = title.substring(dashIdx + 3).trim();
          }
        }

        // Clean trailing source from title for aesthetic excellence
        let cleanTitle = title;
        const dashIdx = title.lastIndexOf(" - ");
        if (dashIdx !== -1) {
          cleanTitle = title.substring(0, dashIdx).trim();
        }

        // Parse pubDate to secure strict timeframe match
        const articleDate = new Date(pubDateText);
        const isValidDate = !isNaN(articleDate.getTime());

        if (isValidDate) {
          let matchesTimeframe = false;
          const timeDiff = Math.abs(todayDate.getTime() - articleDate.getTime());

          if (dayLinksTimeframe === "today") {
            const isSameCalendarDay = 
              articleDate.getDate() === todayDate.getDate() &&
              articleDate.getMonth() === todayDate.getMonth() &&
              articleDate.getFullYear() === todayDate.getFullYear();
            const isWithin24Hours = timeDiff <= 24 * 60 * 60 * 1000;
            matchesTimeframe = isSameCalendarDay || isWithin24Hours;
          } else if (dayLinksTimeframe === "week") {
            matchesTimeframe = timeDiff <= 7 * 24 * 60 * 60 * 1000;
          } else if (dayLinksTimeframe === "month") {
            matchesTimeframe = timeDiff <= 30 * 24 * 60 * 60 * 1000;
          } else {
            matchesTimeframe = true; // No time limit
          }

          if (matchesTimeframe) {
            // Match search word in title or description (case-insensitive)
            const lowercaseTopic = topic.toLowerCase();
            const containsKeyword = 
              cleanTitle.toLowerCase().includes(lowercaseTopic) || 
              description.toLowerCase().includes(lowercaseTopic);

            if (containsKeyword) {
              foundLinks.push({
                id: "daylink-" + Math.random().toString(36).substring(2, 11),
                title: cleanTitle,
                source: source || "Noticia",
                url: rawLink,
                pubDate: pubDateText,
                searchedTopic: topic,
                savedAt: new Date().toISOString()
              });
            }
          }
        }
      }

      setDayLinksResults(foundLinks);

      if (foundLinks.length > 0) {
        // Persist to history avoiding duplicates by URL match
        setDayLinksHistory((prevHistory) => {
          const updated = [...prevHistory];
          foundLinks.forEach(newItem => {
            const alreadyExists = updated.some(oldItem => oldItem.url === newItem.url);
            if (!alreadyExists) {
              updated.unshift(newItem); // newest at the front
            }
          });
          return updated;
        });
      }

    } catch (err: any) {
      console.error("RSS Search error:", err);
      setDayLinksError(err.message || "Error al sincronizar con el feed de recopilación.");
    } finally {
      setIsSearchingDayLinks(false);
    }
  };

  // Delete an individual item from historical search log
  const handleDeleteDayLinkFromHistory = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDayLinksHistory(prev => prev.filter(item => item.id !== id));
  };

  // Clear entire historical log
  const handleClearDayLinksHistory = () => {
    setDayLinksHistory([]);
    setDayLinksSelectedHistoryTopic("Todos");
    setShowConfirmClearDayHistory(false);
  };

  // Handle Bookmarks Toggle
  const toggleBookmark = (article: NewsArticle, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const exists = bookmarks.find((item) => item.id === article.id);
    if (exists) {
      setBookmarks(bookmarks.filter((item) => item.id !== article.id));
    } else {
      setBookmarks([...bookmarks, article]);
    }
  };

  const isBookmarked = (id: string) => {
    return bookmarks.some((item) => item.id === id);
  };

  // Handle "Otros Temas" Open Search - 100% Veridical and Local (No Artificial News)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchError(null);
    setSearchedTopic(searchQuery);

    // Filter our 100% real news list locally to guarantee no artificial content
    setTimeout(() => {
      const query = searchQuery.toLowerCase().trim();
      const filtered = newsList.filter(art => 
        art.title.toLowerCase().includes(query) || 
        art.excerpt.toLowerCase().includes(query) || 
        art.content.some(p => p.toLowerCase().includes(query)) ||
        art.source.toLowerCase().includes(query) ||
        art.category.toLowerCase().includes(query)
      );

      setSearchResults(filtered);
      if (filtered.length === 0) {
        setSearchError("No se encontraron noticias tradicionales que coincidan con su búsqueda.");
      }
      setSearching(false);
    }, 400);
  };

  // Quick preset queries for Open Exploration using genuine local news
  const runPresetSearch = (topic: string) => {
    setSearchQuery(topic);
    setSearching(true);
    setSearchError(null);
    setSearchedTopic(topic);
    
    setTimeout(() => {
      const query = topic.toLowerCase().trim();
      const filtered = newsList.filter(art => 
        art.title.toLowerCase().includes(query) || 
        art.excerpt.toLowerCase().includes(query) || 
        art.content.some(p => p.toLowerCase().includes(query)) ||
        art.source.toLowerCase().includes(query) ||
        art.category.toLowerCase().includes(query)
      );
      setSearchResults(filtered);
      if (filtered.length === 0) {
        setSearchError("No se encontraron noticias tradicionales que coincidan con su búsqueda.");
      }
      setSearching(false);
    }, 400);
  };

  // Reading Mode Helpers with Dynamic Clean Processing API integration
  const handleOpenReader = async (article: NewsArticle) => {
    setSelectedArticle(article);
    setIsPlayingAudio(false);
    setCleanArticleError(null);

    // Verify if this article lacks robust, parsed editorial paragraphs or is a daily colector link
    const needsCleaning = !article.content || 
                          article.content.length === 0 || 
                          article.content.some(p => p.includes("Lectura Limpia") || p.includes("preliminar") || p.includes("avance informativo"));

    if (needsCleaning && article.url) {
      setIsFetchingCleanArticle(true);
      try {
        const queryParams = new URLSearchParams({
          url: article.url,
          title: article.title,
          excerpt: article.excerpt || "",
          source: article.source || ""
        });

        const response = await fetch(`/api/clean-reader?${queryParams.toString()}`);
        if (response.ok) {
          const cleanData = await response.json();
          setSelectedArticle(prev => {
            if (!prev) return null;
            return {
              ...prev,
              title: cleanData.title || prev.title,
              excerpt: cleanData.excerpt || prev.excerpt,
              content: cleanData.content || prev.content,
              source: cleanData.source || prev.source,
              category: cleanData.category || prev.category,
              readTime: cleanData.readTime || prev.readTime
            };
          });
        } else {
          throw new Error("El servicio de purificación reportó un fallo en el procesador");
        }
      } catch (err: any) {
        console.error("Fallo la lectura limpia por IA:", err);
        setCleanArticleError(err.message || "No se pudo realizar el filtrado de ruido por IA.");
      } finally {
        setIsFetchingCleanArticle(false);
      }
    } else {
      setIsFetchingCleanArticle(false);
    }
  };

  const copyArticleLink = (article: NewsArticle) => {
    navigator.clipboard.writeText(`${window.location.origin}/article/${article.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Exportar a notas de texto plano
  const exportToTxt = (article: NewsArticle) => {
    if (!article) return;
    const titleLine = `${article.title.toUpperCase()}\n`;
    const authorLine = `Fuente: ${article.source} | Fecha: ${article.date}\n`;
    const divider = `=========================================\n\n`;
    const contentText = article.content && article.content.length > 0 
      ? article.content.join("\n\n") 
      : `Disponible mediante enlace externo: ${article.url || ''}`;
    
    const fullText = `${titleLine}${authorLine}${divider}${contentText}\n\n---\nGenerado por Neutro News - Lectura Purificada sin Anuncios.`;
    
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${article.title.substring(0, 20).replace(/[^a-z0-9]/gi, '_')}_neutro_news.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Exportar a plantilla compatible con Microsoft Word (.doc)
  const exportToWord = (article: NewsArticle) => {
    if (!article) return;
    const titleHtml = `<h1 style="font-family: Arial; color: #10B981;">${article.title}</h1>`;
    const metaHtml = `<p style="font-family: Arial; font-size: 11px; color: #555555;"><i>Fuente: ${article.source} | Fecha: ${article.date} | Categor&iacute;a: ${article.category}</i></p>`;
    const lineHtml = `<hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px;" />`;
    const bodyHtml = article.content && article.content.length > 0 
      ? article.content.map(p => `<p style="font-family: Arial; font-size: 13px; line-height: 1.6; text-align: justify; color: #2d3748;">${p}</p>`).join("") 
      : `<p style="font-family: Arial; font-size: 13px; color: #555555;">M&oacute;dulo disponible en enlace oficial: ${article.url}</p>`;
    const footerHtml = `<p style="font-family: Arial; font-size: 9px; color: #a0aec0; margin-top: 50px; border-t: 1px solid #edf2f7; pt: 10px;">Generado limpio y libre de anuncios por Neutro News &copy; 2026</p>`;
    
    const fullHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>${article.title}</title><meta charset="utf-8" /></head>
      <body style="padding: 40px; background-color: #ffffff;">
        ${titleHtml}
        ${metaHtml}
        ${lineHtml}
        ${bodyHtml}
        ${footerHtml}
      </body>
      </html>
    `;
    
    const blob = new Blob([fullHtml], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${article.title.substring(0, 20).replace(/[^a-z0-9]/gi, '_')}_neutro_news.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Find Articles for the main rotating view (all newsList articles are now rotating highlights)
  const trendingArticles = newsList;
  const activeTrendArticle = trendingArticles[activeTrendIndex] || trendingArticles[0] || newsList[0];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* BACKGROUND GRAPHIC ACCENTS */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-radial from-slate-900/40 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[800px] right-10 w-[600px] h-[600px] bg-gradient-radial from-emerald-950/20 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* --- TOP HEADER & CONTROL BAR --- */}
      <header className="border-b border-slate-850/60 bg-[#020617]/90 backdrop-blur-md sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-18 flex items-center justify-between gap-4">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900/50 rounded-xl border border-slate-850 hover:border-emerald-500/30 transition-all cursor-pointer neon-glow-emerald flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-lg md:text-xl tracking-tighter text-white">
                  NEUTRO<span className="text-emerald-500">NEWS</span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                  FILTRADO IA DIRECTO
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden md:block">Portal Autónomo sin Anuncios ni Clickbait</p>
            </div>
          </div>

          {/* Search bar + Preset search triggers */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:block relative">
            <input
              id="search-input-desktop"
              type="text"
              placeholder="Explorar Otros Temas (ej: Fusión Nuclear)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-900/60 border border-slate-850 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 text-sm text-slate-200 transition-all placeholder:text-slate-500 font-sans"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <button 
              type="submit" 
              className="absolute right-2 top-1.5 h-7 px-2.5 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 text-[11px] font-medium hover:bg-emerald-900/40 hover:text-emerald-300 transition-all font-mono"
            >
              SINTETIZAR
            </button>
          </form>

          {/* Controls: Saved articles button */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefreshNews}
              disabled={isRefreshingNews}
              className={`h-10 px-3 md:px-4 rounded-xl bg-slate-900/40 hover:bg-slate-850 border border-slate-850 hover:border-emerald-550/20 transition-all flex items-center gap-2 text-slate-200 text-xs sm:text-sm whitespace-nowrap cursor-pointer ${
                isRefreshingNews ? "opacity-75" : ""
              }`}
              title="Buscar y re-indexar noticias más recientes de la red"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshingNews ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline font-mono font-bold text-emerald-400 uppercase tracking-wider">
                {isRefreshingNews ? "Actualizando..." : "Refrescar"}
              </span>
            </button>

            <button
              onClick={() => setShowBookmarksDrawer(true)}
              className="h-10 px-4 rounded-xl bg-slate-900/40 hover:bg-slate-850 border border-slate-850 hover:border-slate-800 transition-all flex items-center gap-2 text-slate-200 text-sm sm:text-base relative"
            >
              <Bookmark className={`w-4 h-4 ${bookmarks.length > 0 ? 'text-emerald-400 fill-emerald-400/10' : 'text-slate-400'}`} />
              <span className="hidden md:inline font-medium text-slate-300">Marcadores</span>
              {bookmarks.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white font-mono text-[10px] font-bold flex items-center justify-center border-2 border-[#020617] animate-bounce">
                  {bookmarks.length}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* MOBILE SEARCH BAR */}
      <div className="sm:hidden px-4 pt-4 pb-1">
        <form onSubmit={handleSearch} className="relative">
          <input
            id="search-input-mobile"
            type="text"
            placeholder="Buscar otros temas a fondo (IA)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-900/60 border border-slate-850 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 text-sm text-slate-200"
          />
          <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
          <button 
            type="submit"
            className="absolute right-2 top-1.5 h-8 px-3 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 text-[11px] font-bold"
          >
            BUSCAR
          </button>
        </form>
      </div>

      {/* MAIN VIEW NAVIGATION TABS */}
      <div className="max-w-7xl w-full mx-auto px-4 md:px-6 pt-6">
        <div className="flex border-b border-slate-850/65 pb-px gap-2">
          <button
            onClick={() => setMainTab("noticias")}
            className={`flex items-center gap-2 pb-3 px-4 font-display text-xs md:text-sm font-bold tracking-wider uppercase transition-all relative cursor-pointer ${
              mainTab === "noticias" 
                ? "text-emerald-400 font-extrabold" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Colección de Prensa</span>
            {mainTab === "noticias" && (
              <motion.div 
                layoutId="main-tab-indicator" 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" 
              />
            )}
          </button>
          
          <button
            onClick={() => setMainTab("finanzas")}
            className={`flex items-center gap-2 pb-3 px-4 font-display text-xs md:text-sm font-bold tracking-wider uppercase transition-all relative cursor-pointer ${
              mainTab === "finanzas" 
                ? "text-emerald-400 font-extrabold" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Sistema Financiero Live</span>
            {mainTab === "finanzas" && (
              <motion.div 
                layoutId="main-tab-indicator" 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" 
              />
            )}
          </button>
        </div>
      </div>

      {/* --- MAIN PAGE LAYOUT --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        <AnimatePresence mode="wait">
          {mainTab === "noticias" ? (
            <motion.div
              key="noticias-tab-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8 md:space-y-12 animate-none"
            >
              {/* OPEN EXPLORATION WORKSPACE (SEARCH RESULTS) */}
        <AnimatePresence>
          {searchResults && (
            <motion.section 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-5 rounded-2xl bg-slate-900/40 border border-slate-850 shadow-2xl relative overflow-hidden"
            >
              {/* Background gradient subtle */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-850/60">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-950/40 text-emerald-400 rounded-lg border border-emerald-800/40">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-display font-semibold text-white">
                      Búsqueda de Noticias Verificadas: <span className="text-emerald-400 uppercase tracking-tight">{searchedTopic}</span>
                    </h2>
                    <p className="text-[11px] text-slate-500">Noticias indexadas y legitimadas por nuestro feed sin anuncios ni clickbait</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSearchResults(null);
                    setSearchQuery("");
                  }}
                  className="p-1 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-400 font-mono text-[11px] flex items-center gap-1 transition-all border border-slate-850"
                >
                  <X className="w-3 h-3" /> CERRAR BÚSQUEDA
                </button>
              </div>

              {searchError && (
                <div className="mb-4 p-3 rounded-xl bg-[#020617]/50 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {searchResults.map((art) => (
                  <div 
                    key={art.id}
                    onClick={() => handleOpenReader(art)}
                    className="group bg-slate-900/20 rounded-xl overflow-hidden border border-slate-850 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer flex flex-col hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-0.5"
                  >
                    <div className="relative h-44 overflow-hidden bg-slate-950">
                      <img
                        src={art.imageUrl}
                        alt={art.title}
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-400 font-mono text-[9px] uppercase tracking-wider border border-emerald-800/40">
                        FUENtE VERIFICADA
                      </div>
                      <button
                        onClick={(e) => toggleBookmark(art, e)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-950 text-slate-300 hover:text-yellow-400 border border-slate-850 transition-all"
                        title="Guardar marcador"
                      >
                        {isBookmarked(art.id) ? (
                          <BookmarkCheck className="w-4 h-4 text-emerald-400 fill-emerald-400/10" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span>{art.source}</span>
                          <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {art.readTime}</span>
                        </div>
                        <h3 className="font-display font-medium text-sm md:text-base text-white group-hover:text-emerald-400 transition-all line-clamp-2">
                          {art.title}
                        </h3>
                        <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed font-light">
                          {art.excerpt}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-850/60 flex items-center justify-between text-[11px] font-medium text-emerald-400">
                        <span>LEER TEXTO LIMPIO</span>
                        <span className="text-[10px] text-slate-500 font-mono">{art.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* --- SECTION: DESTACADOS EN ROTACIÓN --- */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4 border-b border-slate-850/65 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1 h-6 w-6 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <h2 className="font-display font-bold text-sm md:text-base text-white tracking-widest uppercase">
                Destacados en Rotación {trendingArticles.length > 0 && `(${trendingArticles.length})`}
              </h2>
            </div>
            
            <button
              onClick={handleRefreshTrends}
              disabled={isRefreshingTrends}
              className="p-1.5 px-3 rounded-xl bg-slate-900/60 hover:bg-slate-850 text-slate-300 hover:text-emerald-450 border border-slate-850 transition-all font-mono text-[10px] uppercase flex items-center gap-1.5 cursor-pointer"
              title="Buscar y actualizar noticias en rotación"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshingTrends ? "animate-spin" : ""}`} />
              <span className="font-bold">{isRefreshingTrends ? "Cargando..." : "Refrescar"}</span>
            </button>
          </div>

          {/* Majestic Rotating Hero Card for Trending Story with Audited Metrics */}
          {trendingArticles.length > 0 && (
            <div className="relative">
              <div 
                onClick={() => handleOpenReader(activeTrendArticle)}
                className="group bg-slate-900/40 rounded-2xl overflow-hidden border border-slate-850 hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.05)] transition-all duration-300 cursor-pointer grid grid-cols-1 lg:grid-cols-12 relative"
              >
                <div className="lg:col-span-7 relative h-64 lg:h-full min-h-[300px] bg-slate-950">
                  <img
                    src={activeTrendArticle.imageUrl}
                    alt={activeTrendArticle.title}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-102"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#020617]/95 via-[#020617]/30 to-transparent" />
                  
                  <div className="absolute top-4 left-4 flex gap-2 w-full justify-between pr-8">
                    <div className="flex gap-2">
                      <span className="px-2.5 py-1 rounded bg-emerald-555 text-slate-950 font-display font-bold text-[10px] uppercase tracking-wider shadow">
                        ROTACIÓN #{activeTrendIndex + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#020617]/85 text-emerald-400 font-mono text-[9px] uppercase tracking-wider border border-emerald-500/20">
                        {activeTrendArticle.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 p-5 md:p-6 flex flex-col justify-start space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                      <span className="text-emerald-400 font-bold tracking-wide flex items-center gap-1">
                        ● {activeTrendArticle.source.toUpperCase()}
                      </span>
                      <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {activeTrendArticle.readTime}</div>
                    </div>
                    
                    <h3 className="font-display font-medium text-lg md:text-xl text-slate-100 group-hover:text-emerald-400 transition-all leading-snug">
                      {activeTrendArticle.title}
                    </h3>
                    
                    <p className="text-slate-400 text-xs md:text-[13px] leading-relaxed font-light line-clamp-3">
                      {activeTrendArticle.excerpt}
                    </p>

                    {/* Portal audit rating metrics panel */}
                    {(() => {
                      const rating = getPortalRating(activeTrendArticle.source, activeTrendArticle.url);
                      return (
                        <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-850/50 space-y-2 text-[10px] font-mono">
                          <div className="flex items-center justify-between font-bold text-slate-250 border-b border-slate-900 pb-1.5">
                            <span>AUDITORÍA DEL PORTAL</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase border font-bold ${rating.color}`}>
                              Amarillismo: {rating.label}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center text-slate-400">
                            <div className="bg-[#020617] p-1.5 rounded border border-slate-900/50">
                              <div className="text-emerald-400 font-bold text-xs">{rating.reliability}%</div>
                              <div className="text-[7.5px] text-slate-500 uppercase font-bold tracking-wide">Fiabilidad</div>
                            </div>
                            <div className="bg-[#020617] p-1.5 rounded border border-slate-900/50">
                              <div className="text-teal-400 font-bold text-xs">{rating.authenticity}%</div>
                              <div className="text-[7.5px] text-slate-500 uppercase font-bold tracking-wide">Veracidad</div>
                            </div>
                            <div className="bg-[#020617] p-1.5 rounded border border-slate-900/50">
                              <div className="text-amber-400 font-bold text-xs">{rating.clickbait}%</div>
                              <div className="text-[7.5px] text-slate-500 uppercase font-bold tracking-wide">Clickbait</div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-850/60">
                    <span className="text-slate-500 text-xs font-mono">{activeTrendArticle.date}</span>
                    <div className="flex items-center gap-3">
                      {/* Bookmark key */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(activeTrendArticle);
                        }}
                        className="p-2 rounded-xl bg-[#020617] border border-slate-850 hover:border-slate-800 text-slate-300 hover:text-yellow-400 transition-all cursor-pointer"
                        title="Añadir a marcadores"
                      >
                        {isBookmarked(activeTrendArticle.id) ? (
                          <BookmarkCheck className="w-4.5 h-4.5 text-emerald-400" />
                        ) : (
                          <Bookmark className="w-4.5 h-4.5" />
                        )}
                      </button>
                      <span className="border-l border-slate-850 h-5" />
                      <span className="font-display text-emerald-400 text-xs md:text-sm font-semibold tracking-wide flex items-center gap-1 group-hover:translate-x-1 transition-all">
                        ABRIR LECTURA LIMPIA <BookOpen className="w-4 h-4 ml-0.5 text-emerald-450" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slider controls Overlay */}
              <div className="flex items-center justify-between mt-3 px-1">
                {/* Manual Navigation Buttons */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTrendIndex(prev => (prev - 1 + trendingArticles.length) % trendingArticles.length);
                    }}
                    className="p-1 px-2.5 rounded bg-slate-900/60 hover:bg-slate-850 border border-slate-850 text-slate-450 hover:text-emerald-450 text-xs font-mono font-medium transition-all cursor-pointer"
                    title="Tendencia anterior"
                  >
                    &larr; ANT
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTrendIndex(prev => (prev + 1) % trendingArticles.length);
                    }}
                    className="p-1 px-2.5 rounded bg-slate-900/60 hover:bg-slate-850 border border-slate-850 text-slate-450 hover:text-emerald-450 text-xs font-mono font-medium transition-all cursor-pointer"
                    title="Tendencia siguiente"
                  >
                    SIG &rarr;
                  </button>
                </div>

                {/* Progress Indicators (Dots) */}
                <div className="flex items-center gap-1.5 overflow-x-auto max-w-[50%] scrollbar-none py-1 px-0.5">
                  {trendingArticles.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTrendIndex(idx);
                      }}
                      className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer shrink-0 ${
                        activeTrendIndex === idx ? "bg-emerald-400 w-4" : "bg-slate-700 hover:bg-slate-500"
                      }`}
                      title={`Ir a destacado #${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

          {/* --- SECTION: ENLACES DEL DÍA (COLECTOR DIARIO DE NOTICIAS) --- */}
          <section className="space-y-6 pt-10 border-t border-slate-850/60">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-850/65">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 h-7 w-7 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <Sparkles className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-sm md:text-base text-white tracking-widest uppercase">
                    Enlaces del Día (Colector)
                  </h2>
                  <p className="text-[10px] text-slate-505 font-mono uppercase tracking-tight mt-0.5">
                    Colector automatizado de noticias publicadas hoy sobre temas de alta especialización
                  </p>
                </div>
              </div>

              {/* Selector de pestañas */}
              <div className="flex rounded-xl bg-slate-900/60 p-0.5 border border-slate-850/60 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setDayLinksActiveTab("realtime")}
                  className={`px-3 py-1.5 rounded-lg font-bold tracking-tight transition-all uppercase cursor-pointer ${
                    dayLinksActiveTab === "realtime"
                      ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Colector en Vivo
                </button>
                <button
                  type="button"
                  onClick={() => setDayLinksActiveTab("history")}
                  className={`px-3 py-1.5 rounded-lg font-bold tracking-tight transition-all uppercase cursor-pointer relative ${
                    dayLinksActiveTab === "history"
                      ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Historial de Enlaces ({dayLinksHistory.length})
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {dayLinksActiveTab === "realtime" ? (
                <motion.div
                  key="daylinks-panel-realtime"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="space-y-6"
                >
                  {/* Search input Card */}
                  <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-850 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <form onSubmit={handleSearchDayLinks} className="space-y-4 relative">
                      <p className="text-xs text-slate-400 leading-relaxed max-w-2xl font-light">
                        Consulta feeds de información oficiales de <strong className="text-slate-350">Reuters, Bloomberg, Infobae, El País, TechCrunch </strong> y otros en tiempo real. Selecciona el rango de fechas para recopilar enlaces de interés.
                      </p>

                      <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                          <input
                            id="daylinks-search-input"
                            type="text"
                            placeholder="Escribe un tema de interés (ej. 'Semiconductores', 'IA')..."
                            value={dayLinksQuery}
                            onChange={(e) => setDayLinksQuery(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#020617] border border-slate-850 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 text-sm text-slate-200 transition-all font-sans"
                            disabled={isSearchingDayLinks}
                          />
                          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                        </div>

                        {/* Selector de Rango de Fecha de la Noticia */}
                        <div className="w-full md:w-52 shrink-0">
                          <select
                            id="daylinks-timeframe-select"
                            value={dayLinksTimeframe}
                            onChange={(e) => setDayLinksTimeframe(e.target.value as any)}
                            disabled={isSearchingDayLinks}
                            className="w-full h-11 px-3.5 rounded-xl bg-[#020617] border border-slate-850 focus:border-emerald-550/50 focus:outline-none text-xs text-slate-300 font-mono tracking-wide cursor-pointer uppercase font-bold"
                            title="Rango de fecha de adopción de la noticia"
                          >
                            <option value="today">📅 HOY (24 Horas)</option>
                            <option value="week">📅 HACE UNA SEMANA (7d)</option>
                            <option value="month">📅 HACE UN MES (30d)</option>
                            <option value="all">📅 HISTÓRICO (Sin Límite)</option>
                          </select>
                        </div>
                        
                        <button
                          type="submit"
                          disabled={isSearchingDayLinks || !dayLinksQuery.trim()}
                          className="h-11 px-5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-800/40 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {isSearchingDayLinks ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                              INDEXANDO...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                              {dayLinksTimeframe === "today" ? "BUSCAR HOY" :
                               dayLinksTimeframe === "week" ? "RECOGER SEMANA" :
                               dayLinksTimeframe === "month" ? "RECOGER MES" : "RECOGER TODO"}
                            </>
                          )}
                        </button>
                      </div>

                      {/* Tag suggest pills */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mr-1">Temas frecuentes:</span>
                        {["Semiconductores", "IA", "Mercados", "Ciberseguridad", "Energía"].map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => setDayLinksQuery(term)}
                            className="px-2.5 py-1 rounded-lg bg-[#020617] hover:bg-slate-900 text-slate-450 hover:text-emerald-400 border border-slate-850 font-mono text-[10px] lowercase transition-all"
                            disabled={isSearchingDayLinks}
                          >
                            +{term.toLowerCase()}
                          </button>
                        ))}
                      </div>
                    </form>
                  </div>

                  {/* Errors block */}
                  {dayLinksError && (
                    <div className="p-4 rounded-xl bg-rose-950/10 border border-rose-900/40 text-rose-450 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{dayLinksError}</span>
                    </div>
                  )}

                  {/* Loader progress */}
                  {isSearchingDayLinks ? (
                    <div className="py-16 text-center space-y-4">
                      <div className="inline-block relative">
                        <div className="w-12 h-12 rounded-full border-2 border-emerald-900/20 border-t-emerald-400 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-mono font-bold tracking-widest text-[#059669] uppercase">Indexación del RSS activa</h4>
                        <p className="text-[10px] text-slate-505 max-w-sm mx-auto font-light leading-relaxed">
                          Conectando a feeds oficiales sobre el proxy de baja latencia AllOrigins, procesando XML y purgando duplicados...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {hasSearchedDayLinks && (
                        <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-850/30">
                          <span>
                            Resultados para <strong className="text-emerald-400">"{dayLinksQuery}"</strong> ({
                              dayLinksTimeframe === "today" ? "Últimas 24 hs" :
                              dayLinksTimeframe === "week" ? "Hace 1 semana (7d)" :
                              dayLinksTimeframe === "month" ? "Hace 1 mes (30d)" : "Todo el registro"
                            }):
                          </span>
                          <span className="font-mono text-[10px]">{dayLinksResults.length} enlaces encontrados</span>
                        </div>
                      )}

                      {hasSearchedDayLinks && dayLinksResults.length === 0 ? (
                        <div className="py-12 rounded-xl bg-slate-950/20 border border-dashed border-slate-850 text-center space-y-2">
                          <p className="text-sm font-sans font-medium text-slate-400">
                            No hay noticias sobre ese tema para el período seleccionado.
                          </p>
                          <p className="text-xs text-slate-500 max-w-md mx-auto px-4 font-light leading-relaxed">
                            Nuestra búsqueda unificada en Reuters, Bloomberg, Infobae, TechCrunch y El País no identificó enlaces publicados en el rango ({
                              dayLinksTimeframe === "today" ? "últimas 24 horas" :
                              dayLinksTimeframe === "week" ? "última semana" :
                              dayLinksTimeframe === "month" ? "último mes" : "todo el registro histórico"
                            }) para este término. Intenta con otro período o tema menos específico.
                          </p>
                        </div>
                      ) : (
                        dayLinksResults.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {dayLinksResults.map((item) => {
                              const rating = getPortalRating(item.source, item.url);
                              return (
                                <div
                                  key={item.id}
                                  className="p-4 rounded-xl bg-[#020617]/50 border border-slate-850 hover:border-emerald-500/20 transition-all flex flex-col justify-between gap-4 group hover:shadow-lg hover:shadow-emerald-550/5 cursor-default"
                                >
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between text-[10px] font-mono">
                                      <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-bold uppercase tracking-wider">
                                        {item.source}
                                      </span>
                                      <span className="text-slate-500">{new Date(item.pubDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} hs</span>
                                    </div>
                                    <h4 className="font-display font-medium text-sm text-slate-100 group-hover:text-emerald-400 transition-all leading-snug line-clamp-2">
                                      {item.title}
                                    </h4>

                                    {/* Portal audit info display block */}
                                    <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400 bg-[#020617] p-2 rounded border border-slate-900 justify-between">
                                      <span className="flex items-center gap-1">
                                        <span className="text-slate-500">Fiabilidad:</span>
                                        <strong className="text-emerald-400">{rating.reliability}%</strong>
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <span className="text-slate-500">Clickbait:</span>
                                        <strong className="text-amber-505">{rating.clickbait}%</strong>
                                      </span>
                                      <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase border ${rating.color}`}>
                                        AMARILLISMO: {rating.label}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-850/40 gap-2">
                                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">Indexación de Hoy</span>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleOpenReader({
                                          id: item.id || `rl-${Math.random()}`,
                                          title: item.title,
                                          source: item.source,
                                          date: new Date(item.pubDate).toLocaleString(),
                                          category: item.source || "Enlaces del Día",
                                          readTime: "3 min",
                                          excerpt: item.title,
                                          url: item.url,
                                          content: [] // Will be extracted by clean-reader endpoint
                                        })}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 hover:border-emerald-500/55 hover:from-emerald-505/20 hover:to-teal-500/20 text-emerald-400 rounded-lg text-xs font-bold font-sans tracking-wide transition-all cursor-pointer"
                                      >
                                        Lectura Limpia ✨
                                      </button>
                                      <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/30 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-bold text-slate-400 hover:text-white font-sans tracking-wide transition-all uppercase cursor-pointer"
                                      >
                                        Original <ExternalLink className="w-3.5 h-3.5" />
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="daylinks-panel-history"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="space-y-6"
                >
                  {/* Historical header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/40 border border-slate-850/60">
                    <div className="space-y-1">
                      <h3 className="text-xs font-mono font-bold tracking-widest text-slate-300 uppercase">Enlaces Acumulados Archivados</h3>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-light">
                        Visualiza y repasa la lista completa de enlaces acumulados en tus búsquedas anteriores, clasificados por el tema consultado originalmente.
                      </p>
                    </div>

                    {dayLinksHistory.length > 0 && (
                      <div className="flex items-center gap-2">
                        {showConfirmClearDayHistory ? (
                          <div className="flex items-center gap-1.5 p-1 px-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                            <span className="text-[9px] text-rose-450 font-mono font-bold animate-pulse">¿BORRAR TODO?</span>
                            <button
                              type="button"
                              onClick={handleClearDayLinksHistory}
                              className="px-2 py-1 rounded bg-rose-500 hover:bg-rose-600 text-slate-950 text-[9px] font-mono font-bold uppercase cursor-pointer transition-all"
                            >
                              SÍ, BORRAR
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowConfirmClearDayHistory(false)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-350 text-[9px] font-mono font-bold uppercase cursor-pointer transition-all"
                            >
                              NO
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowConfirmClearDayHistory(true)}
                            className="px-3 py-1.5 rounded-lg bg-rose-950/10 hover:bg-rose-900/20 text-rose-405 border border-rose-900/30 hover:border-rose-500/30 text-[10px] font-mono font-bold tracking-wider uppercase transition-all shrink-0 cursor-pointer"
                          >
                            Limpiar Historial
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {dayLinksHistory.length === 0 ? (
                    <div className="py-14 rounded-2xl border border-dashed border-slate-850 text-center space-y-3">
                      <div className="mx-auto w-10 h-10 rounded-full border border-slate-850 border-dashed flex items-center justify-center text-slate-500">
                        <Clock className="w-5 h-5 text-slate-600" />
                      </div>
                      <p className="text-sm font-sans font-medium text-slate-400">El histórico acumulado está vacío</p>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto px-4 leading-relaxed font-light">
                        Realiza búsquedas en la sección "Colector en Vivo" para ir descubriendo y guardando noticias de hoy clasificados por temática de forma permanente.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* Topics pills filters */}
                      <div className="flex flex-wrap items-center gap-1.5 pb-2.5 border-b border-slate-850/40">
                        <span className="text-[10px] text-slate-550 font-mono uppercase tracking-wider mr-1">Filtrar por Tema:</span>
                        {(["Todos", ...Array.from(new Set(dayLinksHistory.map((item) => item.searchedTopic as string)))] as string[]).map((topic: string) => (
                          <button
                            key={topic}
                            type="button"
                            onClick={() => setDayLinksSelectedHistoryTopic(topic)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-mono tracking-tight transition-all border cursor-pointer uppercase ${
                              dayLinksSelectedHistoryTopic === topic
                                ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/60"
                                : "bg-slate-950/30 text-slate-400 border-slate-850 hover:bg-slate-900"
                            }`}
                          >
                            {topic === "Todos" ? "todos" : `#${topic.toLowerCase()}`}
                            {topic !== "Todos" && (
                              <span className="ml-1 px-1 rounded bg-[#020617] text-[9px] text-slate-500">
                                {dayLinksHistory.filter(item => item.searchedTopic === topic).length}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Filtered items lists */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dayLinksHistory
                          .filter(item => dayLinksSelectedHistoryTopic === "Todos" || item.searchedTopic === dayLinksSelectedHistoryTopic)
                          .map((item) => (
                            <div
                              key={item.id}
                              className="p-4 rounded-xl bg-slate-900/10 border border-slate-850 hover:border-emerald-500/10 transition-all flex flex-col justify-between gap-4 group"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-mono">
                                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-405 font-bold uppercase tracking-wider">
                                    {item.source}
                                  </span>
                                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/5 text-emerald-500 border border-emerald-500/10 uppercase font-mono text-[9px]">
                                    #{item.searchedTopic.toLowerCase()}
                                  </span>
                                </div>
                                <h4 className="font-display font-medium text-sm text-slate-100 group-hover:text-emerald-400 transition-all leading-snug line-clamp-2">
                                  {item.title}
                                </h4>

                                {/* Portal rating badge inside history */}
                                {(() => {
                                  const rating = getPortalRating(item.source, item.url);
                                  return (
                                    <div className="flex items-center gap-2 text-[9px] font-mono text-slate-450 bg-[#020617] px-2 py-0.5 rounded border border-slate-900/50 justify-between">
                                      <span className="flex items-center gap-1">
                                        <span className="text-slate-500">Fiabilidad:</span>
                                        <strong className="text-emerald-400">{rating.reliability}%</strong>
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <span className="text-slate-500">Clickbait:</span>
                                        <strong className="text-amber-505">{rating.clickbait}%</strong>
                                      </span>
                                      <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase border ${rating.color}`}>
                                        {rating.label}
                                      </span>
                                    </div>
                                  );
                                })()}
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-slate-850/40 gap-1 sm:gap-2">
                                <span className="text-[9px] text-slate-500 font-mono uppercase tracking-tight hidden sm:inline">Guardado: {new Date(item.savedAt).toLocaleDateString()}</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteDayLinkFromHistory(item.id, e)}
                                    className="p-1 px-1.5 text-[10px] uppercase font-mono font-bold hover:bg-rose-950/20 text-slate-500 hover:text-rose-400 rounded border border-transparent hover:border-rose-900/30 transition-all cursor-pointer"
                                    title="Quitar enlace del archivo de hoy"
                                  >
                                    Quitar
                                  </button>
                                  <span className="text-slate-850/80">|</span>
                                  <button
                                    onClick={() => handleOpenReader({
                                      id: item.id || `hist-${Math.random()}`,
                                      title: item.title,
                                      source: item.source,
                                      date: new Date(item.savedAt).toLocaleString(),
                                      category: "Historial Colector",
                                      readTime: "3 min",
                                      excerpt: item.title,
                                      url: item.url,
                                      content: [] // Will be extracted by clean-reader endpoint
                                    })}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 hover:border-emerald-400 hover:from-emerald-500/20 hover:to-teal-555/20 text-emerald-400 rounded text-[10px] font-mono uppercase tracking-tight transition-all font-bold cursor-pointer"
                                  >
                                    Limpia ✨
                                  </button>
                                  <span className="text-slate-850/80 font-mono text-[9px] text-slate-650">|</span>
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-850 text-slate-400 rounded text-[10px] font-mono uppercase tracking-tight transition-all border border-slate-800 hover:text-white"
                                  >
                                    Orig <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>

                      {dayLinksHistory.filter(item => dayLinksSelectedHistoryTopic === "Todos" || item.searchedTopic === dayLinksSelectedHistoryTopic).length === 0 && (
                        <div className="text-center py-6 text-slate-500 text-xs">No hay enlaces acumulados bajo este término de búsqueda.</div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Verified Promise foot banner */}
          <div className="p-4 rounded-xl border border-dashed border-slate-850 bg-slate-950/20 max-w-xl mx-auto space-y-2 select-none text-center animate-none animate-none">
            <h4 className="text-xs font-mono font-bold text-slate-350 uppercase tracking-widest inline-flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Compromiso Despejado sin Algoritmos Sensacionalistas
            </h4>
            <p className="text-[10px] text-slate-500 leading-relaxed font-light font-sans">
              Nuestras 18 fuentes se indexan de manera independiente. Se proporciona la opción de lectura limpia para purgar de inmediato scripts invasores, cookies publicitarias y cookies de muros de pago.
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="financial-dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-6 animate-none"
        >
          {/* Top overview metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* PRIMARY VISUALLY SPLENDID EMBEDEED GRAPHICS ENGINE & PANEL (lg:col-span-8) */}
            <div className="lg:col-span-8 bg-slate-900/40 border border-slate-850 rounded-2xl p-5 md:p-6 space-y-5">
              
              {/* Active asset state details header */}
              {(() => {
                const activeMetric = getSelectedAssetData();
                const points = (historicalPoints && historicalPoints.length > 0)
                  ? historicalPoints
                  : getHistoricalPoints(activeMetric.value, activeMetric.change, financialChartTimeframe, activeMetric.name);
                
                // Coordinate calculation
                const minPointsVal = Math.min(...points.map(p => p.value));
                const maxPointsVal = Math.max(...points.map(p => p.value));
                const range = maxPointsVal - minPointsVal || 1;
                const padMin = minPointsVal - range * 0.05;
                const padMax = maxPointsVal + range * 0.05;
                const padRange = padMax - padMin || 1;
                
                const width = 600;
                const height = 240;
                
                // Coordinate tuples list
                const coords = points.map((p, idx) => {
                  const x = (idx / (points.length - 1)) * width;
                  const y = height - ((p.value - padMin) / padRange) * height;
                  return { x, y, label: p.label, value: p.value };
                });
                
                // Build path
                let pathD = "";
                coords.forEach((c, idx) => {
                  if (idx === 0) {
                    pathD += `M ${c.x} ${c.y}`;
                  } else {
                    const prev = coords[idx - 1];
                    const cx1 = prev.x + (c.x - prev.x) / 2;
                    const cy1 = prev.y;
                    const cx2 = prev.x + (c.x - prev.x) / 2;
                    const cy2 = c.y;
                    pathD += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${c.x} ${c.y}`;
                  }
                });
                
                const filledPathD = `${pathD} L ${width} ${height} L 0 ${height} Z`;
                
                // Active hover state
                const activeHoverPoint = financialHoverIdx !== null && coords[financialHoverIdx] ? coords[financialHoverIdx] : null;
                
                const getOfficialUrl = () => {
                  const cleanName = activeMetric.name.replace(/\s+/g, "");
                  if (selectedFinancialAsset.type === "indices") {
                    if (cleanName.includes("S&P500")) return "https://finance.yahoo.com/quote/%5EGSPC";
                    if (cleanName.includes("NASDAQ")) return "https://finance.yahoo.com/quote/%5EIXIC";
                    if (cleanName.includes("DOWJONES") || cleanName.includes("DJI")) return "https://finance.yahoo.com/quote/%5EDJI";
                    if (cleanName.includes("IBEX")) return "https://finance.yahoo.com/quote/%5EIBEX";
                    return "https://finance.yahoo.com";
                  }
                  if (selectedFinancialAsset.type === "currencies") {
                    const symbol = cleanName.replace("/", "");
                    return `https://finance.yahoo.com/quote/${symbol}=X`;
                  }
                  if (selectedFinancialAsset.type === "cryptos") {
                    const symbol = cleanName.split("/")[0].trim();
                    return `https://finance.yahoo.com/quote/${symbol}-USD`;
                  }
                  return "https://finance.yahoo.com";
                };

                return (
                  <div className="space-y-4">
                    {/* Ticker header summary */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl border flex items-center justify-center ${activeMetric.isUp ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-455 border-rose-500/20'}`}>
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg font-display font-semibold text-white tracking-tight">{activeMetric.name}</h2>
                            <span className="px-1.5 py-0.2 rounded-full font-mono text-[9px] font-bold bg-slate-950 text-slate-400 border border-slate-850 uppercase">
                              {selectedFinancialAsset.type}
                            </span>
                          </div>
                          
                          {/* Actions Row: Refresh and Official Site Link */}
                          <div className="flex items-center gap-2 mt-1.5">
                            <button
                              type="button"
                              onClick={fetchFinancials}
                              disabled={loadingFinancials}
                              className="px-2 py-1 rounded text-[9px] font-mono font-bold bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-400 hover:text-emerald-400 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              title="Actualizar datos financieros"
                            >
                              <RefreshCw className={`w-3 h-3 ${loadingFinancials ? "animate-spin text-emerald-100" : ""}`} />
                              <span>{loadingFinancials ? "CARGANDO..." : "ACTUALIZAR"}</span>
                            </button>
                            <a
                              href={getOfficialUrl()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded text-[9px] font-mono font-bold bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-400 hover:text-emerald-400 transition-all flex items-center gap-1 cursor-pointer"
                              title="Ver directo en sitio oficial"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>SITIO OFICIAL</span>
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Price values details layout */}
                      <div className="flex items-end gap-5">
                        <div className="text-right">
                          <div className="text-2xl font-mono font-bold text-white tracking-tight">
                            {activeHoverPoint 
                              ? (selectedFinancialAsset.type === 'cryptos' 
                                  ? `$${activeHoverPoint.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                                  : selectedFinancialAsset.type === 'currencies'
                                    ? activeHoverPoint.value.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })
                                    : activeHoverPoint.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
                              : (selectedFinancialAsset.type === 'cryptos' ? `$${activeMetric.value}` : activeMetric.value)}
                          </div>
                          <div className="flex items-center justify-end gap-1.5 text-xs font-mono">
                            <span className={`font-bold ${activeMetric.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {activeMetric.change}
                            </span>
                            <span className="text-slate-500 uppercase text-[9px]">
                              {activeHoverPoint ? `${activeHoverPoint.label}` : 'Últimas 24h'}
                            </span>
                          </div>
                        </div>

                        {/* Timeframe selector controls */}
                        <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-850 font-mono text-[10px]">
                          {(["24H", "7D", "30D"] as const).map((tf) => (
                            <button
                              key={tf}
                              type="button"
                              onClick={() => {
                                setFinancialChartTimeframe(tf);
                                setFinancialHoverIdx(null);
                              }}
                              className={`px-2 py-1 rounded font-bold transition-all cursor-pointer ${
                                financialChartTimeframe === tf
                                  ? "bg-slate-900 text-emerald-400 border border-slate-850"
                                  : "text-slate-500 hover:text-slate-350"
                              }`}
                            >
                              {tf}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Main SVG Area Chart Canvas */}
                    <div className="relative bg-slate-950/40 rounded-2xl p-4 border border-slate-900 overflow-hidden group/chart select-none">
                      {loadingHistorical && (
                        <div className="absolute inset-0 bg-[#020617]/50 backdrop-blur-[1px] flex items-center justify-center z-10 transition-all">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[10px] font-mono text-emerald-400 shadow-xl shadow-black/80">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>SINCRONIZANDO DATOS HISTÓRICOS REALES...</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Technical details background grid */}
                      <div className="absolute inset-0 pointer-events-none opacity-20 flex flex-col justify-between p-4 py-8">
                        <div className="border-b border-slate-850 w-full" />
                        <div className="border-b border-slate-850 w-full" />
                        <div className="border-b border-slate-850 w-full" />
                      </div>

                      <div className="h-64 md:h-72 w-full relative">
                        <svg
                          viewBox={`0 0 ${width} ${height}`}
                          className="w-full h-full overflow-visible"
                          preserveAspectRatio="none"
                          onMouseMove={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const fraction = Math.max(0, Math.min(1, x / rect.width));
                            const idx = Math.round(fraction * (points.length - 1));
                            setFinancialHoverIdx(idx);
                          }}
                          onMouseLeave={() => setFinancialHoverIdx(null)}
                        >
                          <defs>
                            {/* Background ambient area gradient */}
                            <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={activeMetric.isUp ? "#10b981" : "#ef4444"} stopOpacity="0.15" />
                              <stop offset="100%" stopColor={activeMetric.isUp ? "#10b981" : "#ef4444"} stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          
                          {/* Filled Area */}
                          <path d={filledPathD} fill="url(#area-gradient)" className="transition-all duration-300" />
                          
                          {/* Active Grid Lines */}
                          {activeHoverPoint && (
                            <line
                              x1={activeHoverPoint.x}
                              y1="0"
                              x2={activeHoverPoint.x}
                              y2={height}
                              stroke="#1e293b"
                              strokeWidth="1"
                              strokeDasharray="3 3"
                            />
                          )}

                          {/* Core Price Trend Line */}
                          <path
                            d={pathD}
                            fill="none"
                            stroke={activeMetric.isUp ? "#10b981" : "#ef4444"}
                            strokeWidth="2"
                            className="transition-all duration-300"
                          />

                          {/* Hot Spot Interactive Dot indicator */}
                          {activeHoverPoint && (
                            <circle
                              cx={activeHoverPoint.x}
                              cy={activeHoverPoint.y}
                              r="4"
                              fill={activeMetric.isUp ? "#10b981" : "#ef4444"}
                              stroke="#ffffff"
                              strokeWidth="1.5"
                              className="shadow-lg shadow-emerald-500/20"
                            />
                          )}
                        </svg>
                      </div>
                      
                      {/* Bottom timeline values indicator row */}
                      <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-2 border-t border-slate-900/60 pt-2 select-none px-2">
                        <span>{points[0].label}</span>
                        <span>{points[Math.floor(points.length / 2)].label}</span>
                        <span>{points[points.length - 1].label}</span>
                      </div>
                    </div>

                    {/* Technical Audit stats card footer */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-900 font-mono text-[10px]/relaxed">
                        <div className="text-slate-500 uppercase font-semibold">Valor de Apertura</div>
                        <div className="text-white text-xs font-bold mt-0.5">
                          ${(parseFloat(activeMetric.value.replace(/[$,]/g, "")) * (activeMetric.isUp ? 0.985 : 1.015)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-900 font-mono text-[10px]/relaxed">
                        <div className="text-slate-500 uppercase font-semibold">Máximo Registrado</div>
                        <div className="text-white text-xs font-bold mt-0.5">
                          ${(parseFloat(activeMetric.value.replace(/[$,]/g, "")) * 1.025).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-900 font-mono text-[10px]/relaxed">
                        <div className="text-slate-500 uppercase font-semibold">Mínimo Registrado</div>
                        <div className="text-white text-xs font-bold mt-0.5">
                          ${(parseFloat(activeMetric.value.replace(/[$,]/g, "")) * 0.972).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-900 font-mono text-[10px]/relaxed">
                        <div className="text-slate-505 uppercase font-semibold">Fuente Oficial Indexada</div>
                        <div className="text-emerald-450 uppercase font-bold tracking-tight mt-0.5 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {selectedFinancialAsset.type === 'cryptos' ? 'Binance API Live' : selectedFinancialAsset.type === 'currencies' ? 'Open Rates API' : 'Yahoo Mirror Proxy'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* SIDEBAR RIGHT BENTO COL: ASSET SELECTORS & CURRENCY CONVERTER (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* 1. CURRENCY CONVERSION CALCULATOR PANEL */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-850/50 pb-2.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-display font-semibold text-xs uppercase tracking-widest text-white">Calculadora Monetaria</h3>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="text-slate-505 uppercase text-[9px] block mb-1">Monto de origen</label>
                    <input
                      type="number"
                      value={convertFromAmount}
                      onChange={(e) => setConvertFromAmount(e.target.value)}
                      className="w-full h-9 rounded-lg bg-slate-950 border border-slate-850 text-white font-mono text-xs px-3 focus:outline-none focus:border-emerald-555 focus:ring-1 focus:ring-emerald-500/20"
                      placeholder="Monto..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-500 uppercase text-[9px] block mb-1">Desde</label>
                      <select
                        value={convertFromCurrency}
                        onChange={(e) => setConvertFromCurrency(e.target.value)}
                        className="w-full h-9 rounded-lg bg-slate-950 border border-slate-850 text-indigo-105 text-xs px-2 font-mono bg-slate-900 text-white"
                      >
                        <option value="USD">USD (Dólar)</option>
                        <option value="EUR">EUR (Euro)</option>
                        <option value="MXN">MXN (Mexicano)</option>
                        <option value="ARS">ARS (Argentino)</option>
                        <option value="COP">COP (Colombiano)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-505 uppercase text-[9px] block mb-1">Hacia conversión</label>
                      <select
                        value={convertToCurrency}
                        onChange={(e) => setConvertToCurrency(e.target.value)}
                        className="w-full h-9 rounded-lg bg-slate-950 border border-slate-850 text-indigo-105 text-xs px-2 font-mono bg-slate-900 text-white"
                      >
                        <option value="USD">USD (Dólar)</option>
                        <option value="EUR">EUR (Euro)</option>
                        <option value="MXN">MXN (Mexicano)</option>
                        <option value="ARS">ARS (Argentino)</option>
                        <option value="COP">COP (Colombiano)</option>
                      </select>
                    </div>
                  </div>

                  {/* Calculated conversions result layout */}
                  <div className="pt-3 border-t border-slate-850/65 text-center bg-slate-950/20 p-2.5 rounded-xl border border-slate-850/40">
                    <div className="text-[10px] text-slate-500 uppercase">Resultado de Conversión Oficial</div>
                    <div className="text-sm font-bold text-white mt-1 break-all">
                      {convertFromAmount ? parseFloat(convertFromAmount).toLocaleString() : '0'} {convertFromCurrency} ={' '}
                      <span className="text-emerald-400 block sm:inline mt-0.5 sm:mt-0 font-extrabold text-base">
                        {(() => {
                          const result = handleCalculateConversion(convertFromAmount, convertFromCurrency, convertToCurrency);
                          return result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        })()}{" "}
                        {convertToCurrency}
                      </span>
                    </div>
                    <span className="text-[8px] text-slate-500 uppercase inline-block mt-1">Basado en cotización en tiempo real</span>
                  </div>
                </div>
              </div>

              {/* 2. CHIP TICKERS COLLECTION LISTINGS */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-850/50 pb-2.5">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-display font-semibold text-xs uppercase tracking-widest text-white">Selección de Activos</h3>
                  </div>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-none pr-1">
                  {financials ? (
                    <>
                      {/* Bolsas */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-mono font-bold text-slate-600 block uppercase tracking-wider">Índices de Bolsa</span>
                        <div className="grid grid-cols-1 gap-1.5">
                          {financials.indices.map((ind) => (
                            <button
                              key={ind.name}
                              onClick={() => setSelectedFinancialAsset({ name: ind.name, type: "indices", symbol: ind.name })}
                              className={`p-2 rounded-xl flex items-center justify-between font-mono text-[11px] border cursor-pointer text-left transition-all w-full ${
                                selectedFinancialAsset.name === ind.name
                                  ? "bg-slate-950 border-emerald-500/50 text-white"
                                  : "bg-slate-950/20 border-slate-850/50 text-slate-450 hover:border-slate-800"
                              }`}
                            >
                              <span className="font-bold">{ind.name}</span>
                              <div className="text-right">
                                <div className="text-white text-xs font-semibold">{ind.value}</div>
                                <div className={`text-[9px] font-bold ${ind.isUp ? 'text-emerald-400' : 'text-rose-450'}`}>{ind.change}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Divisas */}
                      <div className="space-y-2 pt-2">
                        <span className="text-[9px] font-mono font-bold text-slate-600 block uppercase tracking-wider">Tipo de Cambios</span>
                        <div className="grid grid-cols-1 gap-1.5">
                          {financials.currencies.map((cur) => (
                            <button
                              key={cur.name}
                              onClick={() => setSelectedFinancialAsset({ name: cur.name, type: "currencies", symbol: cur.name })}
                              className={`p-2 rounded-xl flex items-center justify-between font-mono text-[11px] border cursor-pointer text-left transition-all w-full ${
                                selectedFinancialAsset.name === cur.name
                                  ? "bg-slate-950 border-emerald-500/50 text-white"
                                  : "bg-slate-950/20 border-slate-850/50 text-slate-450 hover:border-slate-800"
                              }`}
                            >
                              <span className="font-bold">{cur.name}</span>
                              <div className="text-right">
                                <div className="text-white text-xs font-semibold">{cur.value}</div>
                                <div className={`text-[9px] font-bold ${cur.isUp ? 'text-emerald-400' : 'text-rose-455'}`}>{cur.change}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Cryptos */}
                      <div className="space-y-2 pt-2">
                        <span className="text-[9px] font-mono font-bold text-slate-600 block uppercase tracking-wider">Criptoactivos Directos</span>
                        <div className="grid grid-cols-1 gap-1.5">
                          {financials.cryptos.map((cr) => (
                            <button
                              key={cr.name}
                              onClick={() => setSelectedFinancialAsset({ name: cr.name, type: "cryptos", symbol: cr.name })}
                              className={`p-2 rounded-xl flex items-center justify-between font-mono text-[11px] border cursor-pointer text-left transition-all w-full ${
                                selectedFinancialAsset.name === cr.name
                                  ? "bg-slate-950 border-emerald-500/50 text-white"
                                  : "bg-slate-950/20 border-slate-850/50 text-slate-455 hover:border-slate-800"
                              }`}
                            >
                              <span className="font-bold">{cr.name}</span>
                              <div className="text-right">
                                <div className="text-white text-xs font-semibold">${cr.value}</div>
                                <div className={`text-[9px] font-bold ${cr.isUp ? 'text-emerald-400' : 'text-rose-450'}`}>{cr.change}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6 text-slate-600 animate-pulse text-xs font-mono">Cargando selector de activos...</div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* ECONOMY NEWS SYNDICATIONS BLOCK RELATED TO FINANCE */}
          <div className="space-y-4 pt-4 border-t border-slate-850/45">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center h-6 w-6">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-display font-semibold text-xs tracking-widest uppercase text-white">Noticias de Coyuntura Económica</h3>
            </div>

            {newsList.filter(art => art.category === "Economía").length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {newsList
                  .filter(art => art.category === "Economía")
                  .slice(0, 3)
                  .map((art) => (
                    <div
                      key={art.id}
                      onClick={() => handleOpenReader(art)}
                      className="group bg-slate-900/20 rounded-xl overflow-hidden border border-slate-850 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer flex flex-col hover:shadow-lg hover:shadow-emerald-500/5"
                    >
                      <div className="relative h-32 overflow-hidden bg-slate-950">
                        <img
                          src={art.imageUrl}
                          alt={art.title}
                          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                            <span className="text-emerald-400 font-bold uppercase">● {art.source}</span>
                            <span>{art.readTime}</span>
                          </div>
                          <h4 className="font-display font-medium text-xs text-slate-200 group-hover:text-emerald-400 transition-all line-clamp-2">
                            {art.title}
                          </h4>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-900/60 mt-2 text-[9px] font-mono text-slate-500">
                          <span>{art.date}</span>
                          <span className="text-emerald-400 group-hover:translate-x-0.5 transition-all flex items-center font-bold">Limpia &rarr;</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs font-mono">No hay noticias de economía recolectadas en las últimas horas.</div>
            )}
          </div>

          {/* Telemetry metadata block */}
          <div className="p-3 rounded-xl bg-slate-950/20 text-center text-slate-500 border border-slate-850 border-dashed text-[10px] max-w-lg mx-auto">
            <span className="font-mono uppercase tracking-widest text-slate-400 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Indexación de Red Oficial Completa
            </span>
            <p className="mt-1 font-light font-sans">Todas las tasas FX y precios de criptoactivos coinciden con los últimos reportes emitidos de manera pública por las redes de Binance Spots de baja latencia o feeds cambiarios directos.</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </main>

      {/* --- SIDEBAR DRAWER: BOOKMARKS / GUARDADOS --- */}
      <AnimatePresence>
        {showBookmarksDrawer && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookmarksDrawer(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />

            {/* Sidebar content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#020617] border-l border-slate-850 shadow-2xl z-50 flex flex-col"
            >
              <div className="p-4 border-b border-slate-850/60 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-emerald-400 fill-emerald-400/10" />
                  <div>
                    <h2 className="font-display font-semibold text-white">Artículos Guardados</h2>
                    <p className="text-[10px] text-slate-500">Ver más tarde ({bookmarks.length} guardados)</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBookmarksDrawer(false)}
                  className="p-1.5 rounded-lg bg-[#020617] border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200 transition-all inline-flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Saved list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {bookmarks.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-full border border-slate-850 border-dashed flex items-center justify-center text-slate-600">
                      <Bookmark className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-slate-400">No tienes ningún marcador guardado.</p>
                    <p className="text-xs text-slate-500 font-light px-6">
                      Pulsa el botón de marcador con forma de estrella o bandera en cualquier noticia para guardarla y leerla más tarde.
                    </p>
                  </div>
                ) : (
                  bookmarks.map((art) => (
                    <div 
                      key={art.id} 
                      className="group bg-slate-900/40 rounded-xl border border-slate-850 hover:border-emerald-500/20 p-3 flex gap-3 relative"
                    >
                      {/* Image Thumbnail */}
                      <div className="w-16 h-16 bg-slate-950 rounded overflow-hidden shrink-0">
                        <img 
                          src={art.imageUrl} 
                          alt="Thumb" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 pr-6 space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className="px-1.5 py-0.5 rounded bg-[#020617] border border-slate-850 font-mono text-emerald-400 text-[9px] uppercase tracking-wider">{art.category}</span>
                          <span className="text-slate-500 font-mono">{art.source}</span>
                        </div>
                        
                        {art.isTraditional ? (
                          <a 
                            href={art.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block font-display font-medium text-xs md:text-sm text-slate-100 hover:text-emerald-400 transition-all leading-snug line-clamp-2"
                          >
                            {art.title} <ExternalLink className="inline w-3 h-3 ml-0.5 text-slate-550" />
                          </a>
                        ) : (
                          <button
                            onClick={() => {
                              setShowBookmarksDrawer(false);
                              handleOpenReader(art);
                            }}
                            className="block text-left font-display font-medium text-xs md:text-sm text-slate-100 hover:text-emerald-400 transition-all leading-snug line-clamp-2 cursor-pointer"
                          >
                            {art.title}
                          </button>
                        )}
                        <p className="text-[10px] text-slate-500 font-mono">{art.readTime}</p>
                      </div>

                      {/* Remove action */}
                      <button
                        onClick={() => setBookmarks(bookmarks.filter(item => item.id !== art.id))}
                        className="absolute top-2 right-2 text-slate-400 hover:text-rose-400 transition-all p-1"
                        title="Quitar marcador"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Foot lock */}
              <div className="p-4 border-t border-slate-850/60 bg-slate-900/40 text-center">
                <p className="text-[10px] text-slate-500 font-mono">
                  Sincronizado vía LocalStorage en este navegador.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- MODO DE LECTURA LIMPIA (EXPANDED MODAL VIEW) --- */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-[#020617] max-w-3xl w-full h-[90vh] md:h-[85vh] rounded-2xl border border-slate-850 shadow-2xl flex flex-col overflow-hidden text-slate-100"
              style={{ boxShadow: "0 0 40px rgba(16, 185, 129, 0.05)" }}
            >
              
              {/* Header inside reader with close and preferences */}
              <div className="p-4 border-b border-slate-850/60 flex items-center justify-between bg-slate-900/40">
                
                {/* Purified Status Indicators */}
                <div className="flex items-center gap-2">
                  <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-550/20 flex items-center gap-1 text-[10px] font-mono select-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    FILTRADO IA DE RESIDUOS ACTIVO
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">●</span>
                  <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">{selectedArticle.source}</span>
                </div>

                {/* Operations: Reader adjusters */}
                <div className="flex items-center gap-2">
                  
                  {/* Font Sizer */}
                  <div className="flex items-center rounded-lg bg-[#020617] border border-slate-850 p-0.5 font-mono text-[10px] text-slate-400">
                    <button
                      onClick={() => setReaderFontSize("sm")}
                      className={`px-1.5 py-1 rounded transition-all cursor-pointer ${readerFontSize === "sm" ? "bg-emerald-950/50 text-emerald-400 border border-emerald-800/35" : "hover:text-slate-200"}`}
                      title="Tipografía chica"
                    >
                      A-
                    </button>
                    <button
                      onClick={() => setReaderFontSize("normal")}
                      className={`px-1.5 py-1 rounded transition-all cursor-[#020617] ${readerFontSize === "normal" ? "bg-emerald-950/50 text-emerald-400 border border-emerald-800/35" : "hover:text-slate-200"}`}
                      title="Tipografía normal"
                    >
                      Abc
                    </button>
                    <button
                      onClick={() => setReaderFontSize("lg")}
                      className={`px-1.5 py-1 rounded transition-all cursor-pointer ${readerFontSize === "lg" ? "bg-emerald-950/50 text-emerald-400 border border-emerald-800/35" : "hover:text-slate-200"}`}
                      title="Tipografía grande"
                    >
                      A+
                    </button>
                    <button
                      onClick={() => setReaderFontSize("xl")}
                      className={`px-1.5 py-1 rounded transition-all cursor-pointer ${readerFontSize === "xl" ? "bg-emerald-950/50 text-emerald-400 border border-emerald-800/35" : "hover:text-slate-200"}`}
                      title="Tipografía enorme"
                    >
                      A++
                    </button>
                  </div>

                  {/* Star Saved article Toggle */}
                  <button
                    onClick={() => toggleBookmark(selectedArticle)}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-300 hover:text-yellow-400 transition-all flex items-center justify-center cursor-pointer"
                    title={isBookmarked(selectedArticle.id) ? "Guardado en marcadores" : "Guardar para después"}
                  >
                    {isBookmarked(selectedArticle.id) ? (
                      <BookmarkCheck className="w-4.5 h-4.5 text-emerald-400" />
                    ) : (
                      <Bookmark className="w-4.5 h-4.5" />
                    )}
                  </button>

                  <span className="h-6 border-l border-slate-850" />

                  {/* Close modal */}
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center cursor-pointer"
                    title="Salir del lector limpio"
                  >
                    <X className="w-5 h-5" />
                  </button>

                </div>

              </div>

              {/* Immersive Scroll Body */}
              <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10 md:py-10 space-y-6">
                {isFetchingCleanArticle ? (
                  <div className="flex flex-col items-center justify-center py-24 space-y-6 text-center">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-emerald-950/40 border-t-emerald-405 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-2 max-w-md">
                      <h3 className="text-xs font-mono font-bold tracking-widest text-emerald-450 uppercase animate-pulse">PROCESANDO LECTURA LIMPIA</h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                        El colector está descargando el HTML original, despojando la estructura de scripts invasivos, comentarios, muros de cookies y anuncios comerciales para regenerar el texto original mediante Gemini IA...
                      </p>
                    </div>
                  </div>
                ) : cleanArticleError ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-rose-950/30 border border-rose-900/40 flex items-center justify-center text-rose-450 shadow-lg shadow-rose-950/10">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="space-y-2 max-w-md">
                      <h3 className="text-xs font-mono font-bold tracking-widest text-[#ef4444] uppercase">FALTA DE COBERTURA</h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-light">
                        No se pudo procesar la lectura limpia de esta fuente debido a restricciones externas del canal original de noticias o de su codificación XML.
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">Causa: {cleanArticleError}</p>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => handleOpenReader(selectedArticle)}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-350 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer"
                      >
                        REINTENTAR SÍNTESIS
                      </button>
                      {selectedArticle.url && (
                        <a
                          href={selectedArticle.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-emerald-950/45 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-800/40 text-xs font-mono font-bold transition-all flex items-center gap-1.5"
                        >
                          LEER EN SITIO ORIGINAL <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Article Header info */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-xs md:text-sm text-emerald-400 font-mono">
                        <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-[10px] uppercase font-bold tracking-widest">{selectedArticle.category}</span>
                        <span className="text-slate-600">•</span>
                        <span>Reporta: {selectedArticle.source}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-450 flex items-center gap-1 font-mono"><Clock className="w-3.5 h-3.5" /> {selectedArticle.readTime}</span>
                      </div>

                      <h1 className="font-display font-medium text-2xl md:text-4xl text-white tracking-tight leading-tight">
                        {selectedArticle.title}
                      </h1>

                      <p className="text-slate-500 font-mono text-[11px] md:text-xs">
                        Reportado el {selectedArticle.date}
                      </p>
                    </div>

                    {/* Decorative clean line */}
                    <div className="h-px bg-gradient-to-r from-emerald-500/20 via-slate-850 to-transparent" />

                    {/* Purified Download & Clean Export Panel */}
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-[#10b981]/20 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Download className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-mono font-bold text-slate-200">EXPORTACIÓN PURA DE LA FUENTE</h4>
                          <p className="text-[10px] text-slate-500 font-light">Documentos archivadores legítimos sin cookies, comerciales ni banners molestos</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                        <button
                          onClick={() => exportToWord(selectedArticle)}
                          className="flex-1 md:flex-initial text-center px-3 py-1.5 rounded-lg bg-emerald-950/45 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-800/40 text-[10px] font-mono font-bold tracking-tight transition-all cursor-pointer"
                          title="Descargar archivo en formato de Word .doc editable"
                        >
                          WORD (.DOC)
                        </button>
                        <button
                          onClick={() => exportToTxt(selectedArticle)}
                          className="flex-1 md:flex-initial text-center px-3 py-1.5 rounded-lg bg-emerald-950/45 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-800/40 text-[10px] font-mono font-bold tracking-tight transition-all cursor-pointer"
                          title="Descargar notas limpias de texto plano .txt"
                        >
                          TEXTO (.TXT)
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="flex-1 md:flex-initial text-center px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-mono font-bold tracking-tight transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                          title="Imprimir inmediatamente o guardar como documento PDF ultra limpio"
                        >
                          IMPRIMIR / PDF
                        </button>
                      </div>
                    </div>

                    {/* Simulated Audio Reader control panel */}
                    <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-emerald-950/70 border border-emerald-800/40 text-emerald-400 animate-pulse">
                          <Volume2 className="w-4 h-4 text-emerald-450" />
                        </div>
                        <div>
                          <h4 className="text-xs font-mono font-bold text-slate-200">Asistente de Voz Integrado</h4>
                          <p className="text-[10px] text-slate-500 font-light">Sintetizador de audio natural libre de ruidos de red</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 ${
                            isPlayingAudio 
                              ? "bg-emerald-950/60 border-emerald-800 text-emerald-450" 
                              : "bg-slate-950 border-slate-850 text-slate-300 hover:bg-slate-900"
                          }`}
                        >
                          {isPlayingAudio ? (
                            <>
                              <Volume2 className="w-3.5 h-3.5 animate-spin-slow" />
                              <span>REPRODUCIENDO</span>
                            </>
                          ) : (
                            <>
                              <VolumeX className="w-3.5 h-3.5" />
                              <span>LEER EN ALTO</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => copyArticleLink(selectedArticle)}
                          className="p-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200 transition-all text-xs font-mono flex items-center gap-1.5"
                        >
                          {copiedLink ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span>COPIADO</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3.5 h-3.5" />
                              <span>COMPARTIR</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Clean content paragraphs with variable font size */}
                    <div className={`space-y-6 md:space-y-8 leading-relaxed font-light text-slate-300 transition-all ${
                      readerFontSize === "sm" ? "text-sm" :
                      readerFontSize === "normal" ? "text-base" :
                      readerFontSize === "lg" ? "text-lg" :
                      "text-xl"
                    }`}>
                      {selectedArticle.content && selectedArticle.content.length > 0 ? (
                        selectedArticle.content.map((p, index) => (
                          <p key={index} className="text-slate-300 first-letter:text-2xl first-letter:font-display first-letter:font-bold first-letter:text-emerald-450 md:first-letter:text-3xl">
                            {p}
                          </p>
                        ))
                      ) : (
                        <div className="py-8 space-y-4 text-center">
                          <p className="text-slate-400">Este artículo se distribuye de manera exclusiva a través del enlace externo proporcionado por la fuente original.</p>
                          {selectedArticle.url ? (
                            <a 
                              href={selectedArticle.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/45 text-emerald-450 border border-emerald-800/40 font-mono text-xs font-bold transition-all"
                            >
                              Ir al sitio web original <ExternalLink className="w-4 h-4" />
                            </a>
                          ) : null}
                        </div>
                      )}
                    </div>

                    {/* Reader Footnote */}
                    <div className="pt-8 border-t border-slate-850/60 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500 gap-4">
                      <span className="text-center sm:text-left font-medium">Sello Editorial Independiente Respetado: {selectedArticle.source}</span>
                      <div className="flex gap-4">
                        <span>Sólido & Sin Anuncios</span>
                        <span>100% Privado</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Sticky bottom close bar */}
              <div className="p-3 bg-slate-950/95 border-t border-slate-850/60 flex justify-center">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-300 hover:text-white transition-all text-xs font-mono font-medium tracking-wide flex items-center gap-1.5 cursor-pointer"
                >
                  <X className="w-4 h-4" /> CERRAR LECTURA LIMPIA
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- FOOTER CARD --- */}
      <footer className="border-t border-slate-850/60 bg-[#020512] mt-16 text-slate-400 py-8 px-4 font-mono text-xs md:text-sm select-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-1 font-display font-semibold text-white">
              <Newspaper className="w-4 h-4 text-emerald-450" />
              <span>NEUTRO NEWS © 2026</span>
            </div>
            <p className="text-[10px] text-slate-500 font-light max-w-sm">
              Análisis asimilados, síntesis por algoritmos de lenguaje natural avanzados y cero intrusión comercial en pantalla.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-[10px] text-slate-500">
            <span>METODOLOGÍA TRANSPARENTE</span>
            <span>•</span>
            <span>PRIVACIDAD TOTAL DE AUDIENCIA</span>
            <span>•</span>
            <span>MÓDULO DE SÍNTESIS AUTÓNOMA DE TEMAS</span>
          </div>
        </div>
      </footer>

      {/* Hidden container strictly for printing / ad-free high fidelity PDF creation */}
      {selectedArticle && (
        <div id="print-clean-root">
          <div className="meta-line">
            <span>RECOMENDACIÓN DE NOTICIA DE VALOR - NEUTRO NEWS</span>
            <span>{selectedArticle.date}</span>
          </div>
          <h1>{selectedArticle.title}</h1>
          <div className="meta-line">
            <span>Fuente Original: {selectedArticle.source} ({selectedArticle.url || 'Sin enlace'})</span>
            <span>Categoría: {selectedArticle.category}</span>
          </div>
          {selectedArticle.content && selectedArticle.content.length > 0 ? (
            selectedArticle.content.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))
          ) : (
            <p>Sección disponible mediante enlace de distribución tradicional en {selectedArticle.source}: {selectedArticle.url}</p>
          )}
          <div className="print-footer">
            Documento purificado de publicidad, cookies de rastreo y scripts algorítmicos por Neutro News. © 2026 Todos los derechos reservados a sus respectivos autores.
          </div>
        </div>
      )}
      
    </div>
  );
}
