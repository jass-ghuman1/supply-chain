import { useState, useMemo, useEffect, useCallback } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Area, AreaChart,
} from "recharts";

/* ── THEME ─────────────────────────────────────────────────────────────────── */
const C = {
  gold:"#F5C842", goldDim:"#b8941e", red:"#FF4C4C", green:"#00E676",
  blue:"#2979FF", cyan:"#00E5FF", purple:"#BB44FF", orange:"#FF6D00",
  teal:"#1DE9B6", pink:"#FF4081", lime:"#C6FF00", amber:"#FFB300",
  bg:"#020A10", bgCard:"#051220", border:"#0C3354",
  text:"#C2D8EC", dim:"#4E7290",
};

const fmt = (n) => {
  if (!n && n !== 0) return "—";
  if (n >= 1e9)  return `$${(n/1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n/1e6).toFixed(2)}M`;
  if (n >= 1e3)  return `$${(n/1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
};

/* ── TICKER MASTER DATABASE ─────────────────────────────────────────────────── */
const ALL_TICKERS = [
  {t:"NVDA", name:"Nvidia",                cat:"AI Hardware",     cagr:25, risk:"Med",   color:C.gold,   note:"CUDA moat. Irreplaceable AI compute platform + software ecosystem."},
  {t:"AMD",  name:"Advanced Micro Devices",cat:"AI Hardware",     cagr:18, risk:"Med",   color:C.gold,   note:"MI300X competing with H100. Growing AI market share."},
  {t:"INTC", name:"Intel",                 cat:"AI Hardware",     cagr:10, risk:"High",  color:C.gold,   note:"Turnaround play. Foundry + Gaudi AI chips. Deep contrarian."},
  {t:"ANET", name:"Arista Networks",       cat:"Networking",      cagr:22, risk:"Low",   color:C.cyan,   note:"AI cluster fabric of choice. Hyperscaler network dominant."},
  {t:"MRVL", name:"Marvell Technology",    cat:"Custom Silicon",  cagr:23, risk:"Med",   color:C.cyan,   note:"ASIC design for AWS/Google/MSFT. 5nm custom AI chips."},
  {t:"COHR", name:"Coherent Corp",         cat:"Optical",         cagr:22, risk:"Med",   color:C.teal,   note:"Co-packaged optics. Replaces copper inside AI racks."},
  {t:"MU",   name:"Micron Technology",     cat:"Memory/HBM",      cagr:20, risk:"Med",   color:C.cyan,   note:"Only US HBM maker. HBM4 ramp secular demand story."},
  {t:"VRT",  name:"Vertiv Holdings",       cat:"Power & Cooling", cagr:28, risk:"Low",   color:C.green,  note:"Liquid cooling for every AI data center. Pure play."},
  {t:"ETN",  name:"Eaton Corp",            cat:"Power & Cooling", cagr:18, risk:"Low",   color:C.green,  note:"Power management + UPS systems for grid and datacenter."},
  {t:"CARR", name:"Carrier Global",        cat:"Power & Cooling", cagr:15, risk:"Low",   color:C.green,  note:"HVAC and cooling systems. AI rack cooling expansion."},
  {t:"SMCI", name:"Super Micro Computer",  cat:"AI Servers",      cagr:18, risk:"High",  color:C.orange, note:"NVDA GPU servers. Fastest to market. Audit risk fading."},
  {t:"TSM",  name:"TSMC ADR",              cat:"Advanced Fab",    cagr:18, risk:"Med",   color:C.purple, note:"Manufactures for NVDA/AMD/AAPL/GOOGL. Fab near-monopoly."},
  {t:"AMKR", name:"Amkor Technology",      cat:"Packaging",       cagr:20, risk:"Med",   color:C.purple, note:"CoWoS advanced packaging. Every AI chip passes through."},
  {t:"FCX",  name:"Freeport-McMoRan",      cat:"Raw Materials",   cagr:16, risk:"Med",   color:C.amber,  note:"Largest copper miner. Every AI cable and transformer."},
  {t:"ALB",  name:"Albemarle Corp",        cat:"Raw Materials",   cagr:20, risk:"Med",   color:C.amber,  note:"#1 lithium producer. Data center UPS + EV batteries."},
  {t:"MP",   name:"MP Materials",          cat:"Raw Materials",   cagr:28, risk:"High",  color:C.amber,  note:"ONLY US rare earth miner. National security play."},
  {t:"LTHM", name:"Arcadium Lithium",      cat:"Raw Materials",   cagr:22, risk:"Med",   color:C.amber,  note:"Direct lithium extraction. Lower cost cleaner process."},
  {t:"SCCO", name:"Southern Copper",       cat:"Raw Materials",   cagr:14, risk:"Med",   color:C.amber,  note:"World's largest copper reserves. 100-year mine life."},
  {t:"RIO",  name:"Rio Tinto ADR",         cat:"Raw Materials",   cagr:13, risk:"Low",   color:C.amber,  note:"Iron ore + copper + lithium + aluminum. Diversified play."},
  {t:"WOLF", name:"Wolfspeed",             cat:"Raw Materials",   cagr:25, risk:"High",  color:C.amber,  note:"Pure-play silicon carbide for AI power electronics."},
  {t:"PWR",  name:"Quanta Services",       cat:"Construction",    cagr:22, risk:"Low",   color:C.lime,   note:"Builds power grid + fiber + data center infra. #1 pick."},
  {t:"FLR",  name:"Fluor Corporation",     cat:"Construction",    cagr:16, risk:"Med",   color:C.lime,   note:"Large-scale EPC for data centers and power plants."},
  {t:"ACM",  name:"AECOM",                cat:"Construction",    cagr:15, risk:"Low",   color:C.lime,   note:"Engineering giant. Designs and manages data center campuses."},
  {t:"EMR",  name:"Emerson Electric",      cat:"Construction",    cagr:15, risk:"Low",   color:C.lime,   note:"Process automation + building management for AI campuses."},
  {t:"CLS",  name:"Celestica",             cat:"Construction",    cagr:20, risk:"Med",   color:C.lime,   note:"Builds AI hardware racks and data center assemblies."},
  {t:"JCI",  name:"Johnson Controls",      cat:"Construction",    cagr:14, risk:"Low",   color:C.lime,   note:"HVAC, security, and building AI for data centers."},
  {t:"CEG",  name:"Constellation Energy",  cat:"Nuclear/Power",   cagr:18, risk:"Med",   color:C.orange, note:"Largest nuclear operator. TMI restart deal with MSFT."},
  {t:"VST",  name:"Vistra Corp",           cat:"Nuclear/Power",   cagr:16, risk:"Med",   color:C.orange, note:"Texas power + nuclear. AI data center power contracts."},
  {t:"BWX",  name:"BWX Technologies",      cat:"Nuclear/Power",   cagr:20, risk:"Med",   color:C.orange, note:"Builds nuclear reactors for US Navy + SMRs."},
  {t:"NRG",  name:"NRG Energy",            cat:"Nuclear/Power",   cagr:14, risk:"Med",   color:C.orange, note:"Power gen + retail energy. Data center PPA pipeline."},
  {t:"EQIX", name:"Equinix",               cat:"DC REIT",         cagr:14, risk:"Low",   color:C.pink,   note:"World's largest data center REIT. 260+ facilities globally."},
  {t:"DLR",  name:"Digital Realty",        cat:"DC REIT",         cagr:13, risk:"Low",   color:C.pink,   note:"300+ data centers. AI hyperscaler colocation anchor."},
  {t:"IRM",  name:"Iron Mountain",         cat:"DC REIT",         cagr:15, risk:"Low",   color:C.pink,   note:"Storage REIT converting to AI data centers."},
  {t:"AMT",  name:"American Tower",        cat:"Tower REIT",      cagr:12, risk:"Low",   color:C.pink,   note:"220K+ towers. Edge AI compute on existing infrastructure."},
  {t:"CCI",  name:"Crown Castle",          cat:"Tower REIT",      cagr:11, risk:"Low",   color:C.pink,   note:"40K towers + 85K miles of fiber. 5G + AI edge backbone."},
  {t:"PLD",  name:"Prologis",              cat:"Industrial RE",   cagr:12, risk:"Low",   color:C.pink,   note:"1B sq ft logistics. AI robot fulfillment conversion."},
  {t:"LLY",  name:"Eli Lilly",             cat:"Big Pharma",      cagr:18, risk:"Med",   color:C.teal,   note:"GLP-1 + AI drug discovery. Best-in-class pipeline."},
  {t:"REGN", name:"Regeneron",             cat:"Big Pharma",      cagr:16, risk:"Med",   color:C.teal,   note:"Antibody platform + AI. EYLEA, Dupixent franchise."},
  {t:"VRTX", name:"Vertex Pharma",         cat:"Big Pharma",      cagr:18, risk:"Med",   color:C.teal,   note:"CF monopoly + AI pain/kidney pipeline. Deep moat."},
  {t:"ABBV", name:"AbbVie",               cat:"Big Pharma",      cagr:14, risk:"Low",   color:C.teal,   note:"Post-Humira pivot. Immunology + neuro AI pipeline."},
  {t:"GILD", name:"Gilead Sciences",       cat:"Big Pharma",      cagr:13, risk:"Low",   color:C.teal,   note:"HIV/oncology moat + AI small molecule programs."},
  {t:"BMY",  name:"Bristol Myers Squibb",  cat:"Big Pharma",      cagr:12, risk:"Med",   color:C.teal,   note:"Immuno-oncology leader. AI target ID for next pipeline."},
  {t:"MRNA", name:"Moderna",               cat:"mRNA Platform",   cagr:22, risk:"High",  color:C.teal,   note:"mRNA platform beyond COVID: cancer, HIV, flu vaccines."},
  {t:"BNTX", name:"BioNTech",              cat:"mRNA Platform",   cagr:20, risk:"High",  color:C.teal,   note:"AI-personalized cancer vaccines. Neoantigen targets."},
  {t:"ISRG", name:"Intuitive Surgical",    cat:"Robotic Surgery", cagr:16, risk:"Low",   color:C.teal,   note:"Da Vinci monopoly. AI layer on 8K+ installed robots."},
  {t:"SYK",  name:"Stryker",               cat:"Robotic Surgery", cagr:14, risk:"Low",   color:C.teal,   note:"MAKO robotic joint replacement. Expanding AI imaging."},
  {t:"ILMN", name:"Illumina",              cat:"Genomics",        cagr:14, risk:"Med",   color:C.teal,   note:"Sequencing duopoly. Every genomics lab uses their machines."},
  {t:"PACB", name:"Pacific Biosciences",   cat:"Genomics",        cagr:22, risk:"High",  color:C.teal,   note:"Long-read sequencing. AI needs full genome context."},
  {t:"TMO",  name:"Thermo Fisher",         cat:"Life Sciences HW",cagr:14, risk:"Low",   color:C.teal,   note:"Lab instruments + reagents. Picks and shovels for biotech."},
  {t:"DHR",  name:"Danaher Corp",          cat:"Life Sciences HW",cagr:14, risk:"Low",   color:C.teal,   note:"Cytiva + genomics tools. Biopharma manufacturing infra."},
  {t:"RXRX", name:"Recursion Pharma",      cat:"AI Drug Disc",    cagr:35, risk:"High",  color:C.teal,   note:"AI-first drug co. NVDA partnership. 50+ AI programs."},
  {t:"SDGR", name:"Schrodinger",           cat:"AI Drug Disc",    cagr:28, risk:"High",  color:C.teal,   note:"Physics-based molecular AI simulation platform."},
  {t:"ABCL", name:"AbCellera Bio",         cat:"AI Drug Disc",    cagr:25, risk:"High",  color:C.teal,   note:"AI antibody discovery. Partners: Lilly, Pfizer, AZ."},
  {t:"TEM",  name:"Tempus AI",             cat:"AI Diagnostics",  cagr:30, risk:"High",  color:C.teal,   note:"Largest real-world oncology dataset. AI diagnostics platform."},
  {t:"EXAS", name:"Exact Sciences",        cat:"AI Diagnostics",  cagr:18, risk:"Med",   color:C.teal,   note:"Cologuard + AI pathology. Non-invasive cancer detection."},
  {t:"MASI", name:"Masimo",                cat:"AI Diagnostics",  cagr:16, risk:"Med",   color:C.teal,   note:"AI vitals + sepsis prediction. ICU monitoring leader."},
  {t:"CRSP", name:"CRISPR Therapeutics",   cat:"Gene Editing",    cagr:35, risk:"High",  color:C.teal,   note:"Casgevy approved Dec 2023. First CRISPR drug on market."},
  {t:"BEAM", name:"Beam Therapeutics",     cat:"Gene Editing",    cagr:38, risk:"V.High",color:C.teal,   note:"Base editing — 100x more precise than CRISPR. AI-guided."},
  {t:"NTLA", name:"Intellia Therapeutics", cat:"Gene Editing",    cagr:32, risk:"High",  color:C.teal,   note:"In-vivo CRISPR editing. TTR data best-in-class results."},
  {t:"EDIT", name:"Editas Medicine",       cat:"Gene Editing",    cagr:30, risk:"V.High",color:C.teal,   note:"CRISPR pioneer. First in-body trial success in eye disease."},
  {t:"VEEV", name:"Veeva Systems",         cat:"BioTech Platform",cagr:18, risk:"Low",   color:C.teal,   note:"Cloud OS for pharma/biotech. AI features driving upsell."},
  {t:"IQVIA",name:"IQVIA Holdings",        cat:"CRO/Data",        cagr:15, risk:"Low",   color:C.teal,   note:"1B+ patient records. AI clinical trial analytics platform."},
  {t:"CRL",  name:"Charles River Labs",    cat:"CRO/Preclinical", cagr:14, risk:"Med",   color:C.teal,   note:"Preclinical drug testing. Every pharma uses them."},
  {t:"TTEK", name:"Tetra Tech",            cat:"Construction",    cagr:17, risk:"Low",   color:C.lime,   note:"Water and power infrastructure for AI data centers."},
];

/* ── PRICE FETCHING VIA ANTHROPIC API ────────────────────────────────────────── */
const TICKER_SYMBOLS = ALL_TICKERS.map(t => t.t);

async function fetchAllPrices(onProgress) {
  // Split tickers into two batches for efficiency
  const batch1 = TICKER_SYMBOLS.slice(0, 32);
  const batch2 = TICKER_SYMBOLS.slice(32);

  const systemPrompt = `You are a financial data assistant. Return ONLY a valid JSON object mapping stock tickers to their current price (number, USD) and daily change percentage (number). 
Format EXACTLY like this with no markdown, no explanation, no extra text:
{"NVDA":{"price":123.45,"chg":2.1},"AMD":{"price":98.32,"chg":-0.5}}
Use web search to get today's real prices. If a ticker is unavailable, use null for both fields.`;

  const fetchBatch = async (symbols) => {
    const prompt = `Get current stock prices and today's % change for these tickers: ${symbols.join(", ")}
Return ONLY the JSON object, nothing else.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      // Collect all text blocks
      const text = (data.content || [])
        .filter(b => b.type === "text")
        .map(b => b.text)
        .join("");
      // Extract JSON
      const match = text.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
    } catch (e) { console.error("Price fetch error:", e); }
    return {};
  };

  onProgress && onProgress("Searching live prices — batch 1 of 2…");
  const r1 = await fetchBatch(batch1);
  onProgress && onProgress("Searching live prices — batch 2 of 2…");
  const r2 = await fetchBatch(batch2);
  return { ...r1, ...r2 };
}

/* ── UI HELPERS ─────────────────────────────────────────────────────────────── */
const Card = ({ children, color, style = {} }) => (
  <div style={{ background: C.bgCard, border: `1px solid ${color ? color + "44" : C.border}`, borderRadius: 12, padding: "20px 22px", ...style }}>
    {children}
  </div>
);

const SecTitle = ({ icon, title, sub }) => (
  <div style={{ marginBottom: 26, borderLeft: `3px solid ${C.gold}`, paddingLeft: 14 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 3 }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <h2 style={{ color: C.gold, fontFamily: "Georgia,serif", fontSize: 19, fontWeight: 700, margin: 0, letterSpacing: "0.06em", textTransform: "uppercase" }}>{title}</h2>
    </div>
    {sub && <p style={{ color: C.dim, fontSize: 11, margin: 0, fontFamily: "monospace" }}>{sub}</p>}
  </div>
);

const Tag = ({ label, color = C.gold }) => (
  <span style={{ background: `${color}18`, border: `1px solid ${color}44`, color, padding: "2px 8px", borderRadius: 9, fontSize: 10, fontFamily: "monospace", marginRight: 4, whiteSpace: "nowrap", display: "inline-block" }}>{label}</span>
);

const Barz = ({ value, color, h = 6 }) => (
  <div style={{ height: h, background: "#0C3354", borderRadius: 3, overflow: "hidden" }}>
    <div style={{ width: `${Math.min(value, 100)}%`, height: "100%", background: color, borderRadius: 3 }} />
  </div>
);

const Risk = ({ r }) => {
  const col = r === "Low" ? C.green : r === "Med" ? C.amber : r === "High" ? C.orange : C.red;
  return <Tag label={r} color={col} />;
};

/* ── PRICE PILL ─────────────────────────────────────────────────────────────── */
const PricePill = ({ ticker, prices, loading }) => {
  const data = prices[ticker];
  if (loading) return <span style={{ background: "#0C3354", color: C.dim, padding: "2px 10px", borderRadius: 9, fontFamily: "monospace", fontSize: 11, display: "inline-block" }}>loading…</span>;
  if (!data || data.price == null) return <span style={{ color: C.dim, fontFamily: "monospace", fontSize: 11 }}>—</span>;
  const up = data.chg >= 0;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#040E1A", border: `1px solid ${up ? C.green : C.red}44`, borderRadius: 9, padding: "2px 10px" }}>
      <span style={{ color: "#fff", fontFamily: "monospace", fontSize: 12, fontWeight: 700 }}>${data.price.toFixed(2)}</span>
      <span style={{ color: up ? C.green : C.red, fontFamily: "monospace", fontSize: 10 }}>{up ? "▲" : "▼"}{Math.abs(data.chg).toFixed(2)}%</span>
    </span>
  );
};

const TTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#061525", border: `1px solid ${C.border}`, padding: "10px 14px", borderRadius: 8 }}>
      <p style={{ color: C.gold, fontFamily: "monospace", fontSize: 12, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || C.text, fontSize: 11, fontFamily: "monospace", margin: "2px 0" }}>
          {p.name}: {typeof p.value === "number" ? `$${p.value}B` : p.value}
        </p>
      ))}
    </div>
  );
};

/* ── HARDWARE DATA ─────────────────────────────────────────────────────────── */
const hardwareData = [
  { name: "GPUs / AI Accelerators",      pct: 28, spend: "$420B", color: C.gold,    ticker: "NVDA, AMD, INTC",        note: "Training + inference — non-negotiable" },
  { name: "High-Bandwidth Memory (HBM)", pct: 14, spend: "$210B", color: C.cyan,    ticker: "MU, SK Hynix, Samsung",  note: "HBM3E bottleneck — supply constrained 2025–27" },
  { name: "Data Center Networking",      pct: 11, spend: "$165B", color: C.orange,  ticker: "ANET, MRVL, CSCO, COHR", note: "400G→800G InfiniBand & Ethernet" },
  { name: "Power & Cooling Infra",       pct: 9,  spend: "$135B", color: C.green,   ticker: "VRT, ETN, CARR, JCI",    note: "Liquid cooling mandatory — 1 MW+ per AI rack" },
  { name: "Advanced Packaging / CoWoS",  pct: 8,  spend: "$120B", color: C.purple,  ticker: "TSM, AMKR, ASE",         note: "TSMC CoWoS capacity gating NVDA shipments" },
  { name: "Storage (NVMe / Flash)",      pct: 8,  spend: "$120B", color: C.blue,    ticker: "WDC, STX, MU",           note: "AI datasets drive petabyte-scale NVMe demand" },
  { name: "Custom Silicon / ASICs",      pct: 7,  spend: "$105B", color: C.red,     ticker: "MRVL, GOOGL TPU, AMZN",  note: "Hyperscalers reducing NVDA dependency" },
  { name: "Optical Interconnects",       pct: 5,  spend: "$75B",  color: C.teal,    ticker: "COHR, IIVI, LITE",       note: "Co-packaged optics replacing copper at scale" },
  { name: "Edge AI Chips / NPUs",        pct: 5,  spend: "$75B",  color: C.goldDim, ticker: "QCOM, MRVL, MTSI",       note: "On-device inference — phones, cars, robots" },
  { name: "AI Servers & OEM",            pct: 5,  spend: "$75B",  color: C.pink,    ticker: "SMCI, HPE, DELL, CLS",   note: "SMCI biggest beneficiary of GPU server demand" },
];

const marketSizeData = [
  { year: "2024", hardware: 210, software: 80,  services: 60,  bioai: 15,  rawmat: 180, realestate: 45 },
  { year: "2025", hardware: 310, software: 140, services: 95,  bioai: 28,  rawmat: 240, realestate: 62 },
  { year: "2026", hardware: 420, software: 220, services: 150, bioai: 52,  rawmat: 310, realestate: 84 },
  { year: "2027", hardware: 520, software: 330, services: 220, bioai: 90,  rawmat: 390, realestate: 108 },
  { year: "2028", hardware: 600, software: 470, services: 310, bioai: 150, rawmat: 480, realestate: 140 },
  { year: "2029", hardware: 680, software: 640, services: 420, bioai: 240, rawmat: 560, realestate: 175 },
  { year: "2030", hardware: 750, software: 860, services: 580, bioai: 370, rawmat: 650, realestate: 215 },
];

const radarData = [
  { s: "Conviction", NVDA: 95, MU: 80, ANET: 88, RXRX: 72, VRT: 90, FCX: 75, PWR: 85, EQIX: 82 },
  { s: "Growth",     NVDA: 92, MU: 72, ANET: 78, RXRX: 88, VRT: 85, FCX: 65, PWR: 80, EQIX: 68 },
  { s: "Moat",       NVDA: 95, MU: 65, ANET: 82, RXRX: 50, VRT: 75, FCX: 70, PWR: 72, EQIX: 88 },
  { s: "Valuation",  NVDA: 45, MU: 78, ANET: 55, RXRX: 82, VRT: 68, FCX: 80, PWR: 72, EQIX: 62 },
  { s: "TAM Size",   NVDA: 95, MU: 80, ANET: 75, RXRX: 90, VRT: 70, FCX: 85, PWR: 82, EQIX: 78 },
  { s: "Mgmt",       NVDA: 95, MU: 78, ANET: 90, RXRX: 70, VRT: 82, FCX: 75, PWR: 85, EQIX: 88 },
];

const YEARS = [1, 3, 5, 7, 10, 15, 20, 25];

/* ── CALCULATOR ─────────────────────────────────────────────────────────────── */
function Calculator({ prices, pricesLoading }) {
  const [amount, setAmount] = useState("10000");
  const [yrs, setYrs] = useState(10);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");

  const CATS = useMemo(() => {
    const s = new Set(ALL_TICKERS.map(t => t.cat));
    return ["All", ...Array.from(s).sort()];
  }, []);

  const principal = Math.max(0, parseFloat(amount) || 0);
  const proj = (cagr) => principal * Math.pow(1 + cagr / 100, yrs);
  const roi = (cagr) => (proj(cagr) / Math.max(principal, 1) - 1) * 100;

  const filtered = useMemo(() => ALL_TICKERS.filter(tk => {
    const mc = catFilter === "All" || tk.cat === catFilter;
    const ms = !search || tk.t.toLowerCase().includes(search.toLowerCase()) || tk.name.toLowerCase().includes(search.toLowerCase()) || tk.cat.toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  }), [catFilter, search]);

  const top12 = filtered.slice(0, 12);
  const chartData = top12.map(tk => ({ name: tk.t, value: Math.round(proj(tk.cagr)), color: tk.color }));

  return (
    <div>
      <SecTitle icon="💰" title="Investment Projection Calculator" sub="Enter dollar amount. Select year horizon. See projected value per ticker with live current prices and estimated CAGRs." />

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "flex-start" }}>
          <div>
            <div style={{ color: C.dim, fontFamily: "monospace", fontSize: 10, marginBottom: 6 }}>INVESTMENT AMOUNT</div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ background: "#0C3354", padding: "9px 13px", borderRadius: "8px 0 0 8px", color: C.gold, fontFamily: "monospace", fontSize: 18, fontWeight: 700 }}>$</span>
              <input value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                style={{ background: "#040E1A", border: "1px solid #0C3354", borderLeft: "none", padding: "9px 13px", color: "#fff", fontFamily: "monospace", fontSize: 18, width: 150, borderRadius: "0 8px 8px 0", outline: "none" }}
                placeholder="10000" />
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 10 }}>
              {[1000, 5000, 10000, 25000, 50000, 100000, 500000, 1000000].map(v => (
                <button key={v} onClick={() => setAmount(String(v))}
                  style={{ padding: "3px 10px", borderRadius: 7, cursor: "pointer", fontFamily: "monospace", fontSize: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.dim }}>
                  {v >= 1e6 ? "$1M" : v >= 1000 ? `$${v / 1000}K` : `$${v}`}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ color: C.dim, fontFamily: "monospace", fontSize: 10, marginBottom: 6 }}>PROJECTION HORIZON</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {YEARS.map(y => (
                <button key={y} onClick={() => setYrs(y)}
                  style={{ padding: "8px 14px", borderRadius: 7, cursor: "pointer", fontFamily: "monospace", fontWeight: 700, fontSize: 13, border: `1px solid ${yrs === y ? C.gold : C.border}`, background: yrs === y ? `${C.gold}1A` : "transparent", color: yrs === y ? C.gold : C.dim, transition: "all 0.15s" }}>
                  {y}yr
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ color: C.dim, fontFamily: "monospace", fontSize: 10, marginBottom: 4 }}>SCENARIO</div>
            <div style={{ color: C.gold, fontFamily: "monospace", fontSize: 22, fontWeight: 700 }}>{fmt(principal)}</div>
            <div style={{ color: C.dim, fontFamily: "monospace", fontSize: 13 }}>→ {yrs} year projection</div>
          </div>
        </div>
      </Card>

      {principal > 0 && chartData.length > 0 && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ color: C.gold, fontFamily: "monospace", fontSize: 13, marginBottom: 14 }}>
            📊 TOP {top12.length} RESULTS — {fmt(principal)} PROJECTED @ {yrs} YEARS
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0C3354" />
              <XAxis dataKey="name" tick={{ fill: C.dim, fontSize: 10, fontFamily: "monospace" }} />
              <YAxis tick={{ fill: C.dim, fontSize: 9, fontFamily: "monospace" }} tickFormatter={v => v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(0)}K` : `$${v}`} />
              <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                <div style={{ background: "#061525", border: `1px solid ${C.border}`, padding: "10px 14px", borderRadius: 8 }}>
                  <p style={{ color: C.gold, fontFamily: "monospace", fontSize: 12, margin: 0 }}>{label}</p>
                  <p style={{ color: C.green, fontFamily: "monospace", fontSize: 16, fontWeight: 700, margin: "4px 0 0" }}>{fmt(payload[0].value)}</p>
                  <p style={{ color: C.dim, fontFamily: "monospace", fontSize: 10, margin: "2px 0 0" }}>from {fmt(principal)} in {yrs} yrs</p>
                </div>
              ) : null} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>{chartData.map((d, i) => <Cell key={i} fill={d.color} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ticker, name, sector…"
          style={{ background: "#040E1A", border: `1px solid ${C.border}`, padding: "7px 13px", color: "#fff", fontFamily: "monospace", fontSize: 12, borderRadius: 8, outline: "none", width: 220 }} />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          style={{ background: "#040E1A", border: `1px solid ${C.border}`, padding: "7px 11px", color: C.dim, fontFamily: "monospace", fontSize: 11, borderRadius: 8, outline: "none" }}>
          {CATS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <span style={{ color: C.dim, fontFamily: "monospace", fontSize: 11 }}>{filtered.length} tickers</span>
        {pricesLoading && <span style={{ color: C.amber, fontFamily: "monospace", fontSize: 11 }}>⏳ fetching live prices…</span>}
        {!pricesLoading && Object.keys(prices).length > 0 && <span style={{ color: C.green, fontFamily: "monospace", fontSize: 11 }}>✓ live prices loaded</span>}
      </div>

      <Card>
        <div style={{ color: C.gold, fontFamily: "monospace", fontSize: 13, marginBottom: 4 }}>📋 FULL PROJECTION TABLE — {filtered.length} TICKERS WITH LIVE PRICES</div>
        <div style={{ color: C.dim, fontFamily: "monospace", fontSize: 10, marginBottom: 14 }}>⚠️ CAGRs are research estimates. Not financial advice.</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "monospace", fontSize: 11, minWidth: 1100 }}>
            <thead>
              <tr>{["Ticker", "Name", "Sector", "Live Price", "Day Chg", "CAGR", "Risk", `${yrs}yr Value`, "ROI", "1yr", "3yr", "5yr", "10yr", "20yr", "Thesis"].map(h => (
                <th key={h} style={{ color: C.gold, padding: "7px 9px", textAlign: "left", borderBottom: `1px solid ${C.border}`, fontSize: 10, whiteSpace: "nowrap", background: C.bg }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map((tk, i) => {
                const pv = proj(tk.cagr);
                const r = roi(tk.cagr);
                const rc = pv > principal * 5 ? C.green : pv > principal * 2 ? C.teal : pv > principal ? C.gold : C.red;
                const pd = prices[tk.t];
                const up = pd && pd.chg >= 0;
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}22`, background: i % 2 === 0 ? "transparent" : "#04101A" }}>
                    <td style={{ padding: "8px 9px", color: tk.color, fontWeight: 700 }}>{tk.t}</td>
                    <td style={{ padding: "8px 9px", color: "#fff", whiteSpace: "nowrap", fontSize: 10 }}>{tk.name}</td>
                    <td style={{ padding: "8px 9px" }}><Tag label={tk.cat} color={tk.color} /></td>
                    <td style={{ padding: "8px 9px", whiteSpace: "nowrap" }}>
                      {pricesLoading ? <span style={{ color: C.dim, fontSize: 10 }}>…</span>
                        : pd?.price ? <span style={{ color: "#fff", fontWeight: 700 }}>${pd.price.toFixed(2)}</span>
                        : <span style={{ color: C.dim }}>—</span>}
                    </td>
                    <td style={{ padding: "8px 9px", whiteSpace: "nowrap" }}>
                      {pd?.chg != null ? (
                        <span style={{ color: up ? C.green : C.red, fontWeight: 700 }}>
                          {up ? "▲" : "▼"}{Math.abs(pd.chg).toFixed(2)}%
                        </span>
                      ) : <span style={{ color: C.dim }}>—</span>}
                    </td>
                    <td style={{ padding: "8px 9px" }}>
                      <span style={{ color: tk.cagr >= 30 ? C.green : tk.cagr >= 20 ? C.cyan : C.amber, fontWeight: 700 }}>{tk.cagr}%</span>
                    </td>
                    <td style={{ padding: "8px 9px" }}><Risk r={tk.risk} /></td>
                    <td style={{ padding: "8px 9px", color: rc, fontWeight: 700, whiteSpace: "nowrap" }}>{principal > 0 ? fmt(pv) : "—"}</td>
                    <td style={{ padding: "8px 9px", minWidth: 80 }}>
                      {principal > 0 ? (
                        <div>
                          <div style={{ color: rc, fontWeight: 700, marginBottom: 3 }}>{r.toFixed(0)}%</div>
                          <Barz value={Math.min(r / 20, 100)} color={rc} h={4} />
                        </div>
                      ) : "—"}
                    </td>
                    {[1, 3, 5, 10, 20].map(y => (
                      <td key={y} style={{ padding: "8px 9px", color: y === yrs ? C.gold : C.dim, whiteSpace: "nowrap", fontWeight: y === yrs ? 700 : 400, fontSize: y === yrs ? 12 : 10 }}>
                        {principal > 0 ? fmt(principal * Math.pow(1 + tk.cagr / 100, y)) : "—"}
                      </td>
                    ))}
                    <td style={{ padding: "8px 9px", color: C.dim, fontSize: 10, minWidth: 160 }}>{tk.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ── LIVE PRICE TICKER BAR ───────────────────────────────────────────────────── */
function TickerBar({ prices, loading }) {
  const highlights = ["NVDA", "AMD", "ANET", "VRT", "MU", "PWR", "EQIX", "FCX", "MP", "RXRX", "CEG", "ISRG", "LLY", "MRNA", "TSM"];
  return (
    <div style={{ background: "#040E1A", borderBottom: `1px solid ${C.border}`, padding: "6px 28px", display: "flex", gap: 0, overflowX: "auto", alignItems: "center", flexWrap: "nowrap" }}>
      {loading ? (
        <span style={{ color: C.amber, fontFamily: "monospace", fontSize: 11, letterSpacing: "0.1em" }}>⏳ Fetching live market prices via AI web search…</span>
      ) : highlights.map((t, i) => {
        const d = prices[t];
        const up = d && d.chg >= 0;
        return (
          <span key={t} style={{ whiteSpace: "nowrap", marginRight: 24, fontFamily: "monospace", fontSize: 11 }}>
            <span style={{ color: C.gold, fontWeight: 700 }}>{t} </span>
            {d?.price ? (
              <>
                <span style={{ color: "#fff" }}>${d.price.toFixed(2)} </span>
                <span style={{ color: up ? C.green : C.red }}>{up ? "▲" : "▼"}{Math.abs(d.chg).toFixed(2)}%</span>
              </>
            ) : <span style={{ color: C.dim }}>—</span>}
          </span>
        );
      })}
    </div>
  );
}

/* ── MAIN APP ────────────────────────────────────────────────────────────────── */
export default function App() {
  const [tab, setTab] = useState("calc");
  const [activePie, setActivePie] = useState(null);
  const [prices, setPrices] = useState({});
  const [pricesLoading, setPricesLoading] = useState(false);
  const [pricesStatus, setPricesStatus] = useState("");
  const [pricesError, setPricesError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadPrices = useCallback(async () => {
    setPricesLoading(true);
    setPricesError(null);
    setPricesStatus("Starting live price search…");
    try {
      const data = await fetchAllPrices((msg) => setPricesStatus(msg));
      setPrices(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) {
      setPricesError("Failed to load prices. Check console.");
    } finally {
      setPricesLoading(false);
      setPricesStatus("");
    }
  }, []);

  useEffect(() => { loadPrices(); }, []);

  const TABS = [
    { id: "calc",  label: "💰 Calculator" },
    { id: "hw",    label: "⚙️ AI Hardware" },
    { id: "road",  label: "🗺️ 10-Year Roadmap" },
    { id: "size",  label: "📈 Market Sizing" },
  ];

  const s = {
    app:  { background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "Georgia,serif", paddingBottom: 60 },
    hdr:  { background: "linear-gradient(135deg,#020A10 0%,#051220 60%,#020A10 100%)", borderBottom: `1px solid ${C.border}`, padding: "22px 28px 16px", position: "relative", overflow: "hidden" },
    tabs: { display: "flex", gap: 4, padding: "10px 26px", background: "#030C15", borderBottom: `1px solid ${C.border}`, overflowX: "auto", flexWrap: "wrap", alignItems: "center" },
    tab:  (a) => ({ padding: "7px 15px", borderRadius: 6, cursor: "pointer", fontFamily: "monospace", fontSize: 12, border: `1px solid ${a ? C.gold : C.border}`, background: a ? `${C.gold}18` : "transparent", color: a ? C.gold : C.dim, whiteSpace: "nowrap", transition: "all 0.15s" }),
    body: { padding: "26px 26px", maxWidth: 1340, margin: "0 auto" },
    g2:   { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16, marginBottom: 18 },
  };

  return (
    <div style={s.app}>
      {/* ── HEADER ── */}
      <div style={s.hdr}>
        <div style={{ position: "absolute", top: 0, right: 0, width: 300, height: "100%", background: "radial-gradient(ellipse at 100% 50%,#F5C84212 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: "clamp(14px,2.8vw,28px)", fontWeight: 700, color: "#fff", margin: "0 0 4px", letterSpacing: "0.04em" }}>
              AI · BIOTECH · MATERIALS · REAL ESTATE — INVESTMENT ATLAS
            </h1>
            <p style={{ color: C.dim, fontSize: 11, fontFamily: "monospace", margin: 0 }}>
              62 Tickers · Live Prices · $5T+ TAM · 2025–2034 · Silicon Valley · 20-Year Wall St. Perspective
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <button onClick={loadPrices} disabled={pricesLoading}
              style={{ background: pricesLoading ? "#0C3354" : `${C.gold}20`, border: `1px solid ${pricesLoading ? C.border : C.gold}`, color: pricesLoading ? C.dim : C.gold, padding: "6px 16px", borderRadius: 8, fontFamily: "monospace", fontSize: 12, cursor: pricesLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              {pricesLoading ? "⏳ fetching…" : "🔄 Refresh Prices"}
            </button>
            {lastUpdated && !pricesLoading && (
              <span style={{ color: C.green, fontFamily: "monospace", fontSize: 10 }}>✓ updated {lastUpdated}</span>
            )}
            {pricesStatus && pricesLoading && (
              <span style={{ color: C.amber, fontFamily: "monospace", fontSize: 10 }}>{pricesStatus}</span>
            )}
            {pricesError && <span style={{ color: C.red, fontFamily: "monospace", fontSize: 10 }}>{pricesError}</span>}
          </div>
        </div>
        <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 4 }}>
          {["Live Prices", "20Y Wall St.", "Silicon Valley", "AI Hardware", "Raw Materials", "BioTech", "Gene Editing", "DC REITs", "Nuclear Power", "Construction"].map(b => (
            <span key={b} style={{ background: `${C.gold}14`, border: `1px solid ${C.gold}30`, color: C.gold, padding: "2px 8px", borderRadius: 9, fontSize: 10, fontFamily: "monospace" }}>{b}</span>
          ))}
        </div>
      </div>

      {/* ── LIVE TICKER BAR ── */}
      <TickerBar prices={prices} loading={pricesLoading} />

      {/* ── TABS ── */}
      <div style={s.tabs}>
        {TABS.map(t => <button key={t.id} style={s.tab(tab === t.id)} onClick={() => setTab(t.id)}>{t.label}</button>)}
        <span style={{ marginLeft: "auto", color: C.dim, fontFamily: "monospace", fontSize: 10 }}>
          {Object.keys(prices).length > 0 && `${Object.keys(prices).filter(k => prices[k]?.price).length} live prices`}
        </span>
      </div>

      <div style={s.body}>

        {/* ══ CALCULATOR ══════════════════════════════════════════════════════ */}
        {tab === "calc" && <Calculator prices={prices} pricesLoading={pricesLoading} />}

        {/* ══ HARDWARE ════════════════════════════════════════════════════════ */}
        {tab === "hw" && (
          <>
            <SecTitle icon="⚙️" title="AI Hardware Stack — The Picks & Shovels Play" sub="Every AI model needs this hardware. You own the road, not the car." />

            <Card style={{ marginBottom: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10 }}>
                {[{ l: "Total AI HW TAM 2030", v: "$1.5T", c: C.gold }, { l: "GPU Market CAGR", v: "38%", c: C.cyan }, { l: "HBM Supply Gap", v: "2025–27", c: C.red }, { l: "New DC Power Need", v: "35 GW", c: C.green }, { l: "CoWoS Crunch", v: "Gating NVDA", c: C.orange }, { l: "AI Server CAGR", v: "42%", c: C.purple }].map(x => (
                  <div key={x.l} style={{ background: "#040E1A", border: `1px solid ${x.c}30`, borderRadius: 8, padding: "12px 14px", textAlign: "center" }}>
                    <div style={{ color: x.c, fontFamily: "monospace", fontSize: 20, fontWeight: 700 }}>{x.v}</div>
                    <div style={{ color: C.dim, fontSize: 10, fontFamily: "monospace", marginTop: 3 }}>{x.l}</div>
                  </div>
                ))}
              </div>
            </Card>

            <div style={s.g2}>
              <Card>
                <div style={{ color: C.gold, fontFamily: "monospace", fontSize: 13, marginBottom: 12 }}>📊 HARDWARE SPEND ALLOCATION</div>
                <ResponsiveContainer width="100%" height={270}>
                  <PieChart>
                    <Pie data={hardwareData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} dataKey="pct"
                      onMouseEnter={(_, i) => setActivePie(i)} onMouseLeave={() => setActivePie(null)}>
                      {hardwareData.map((e, i) => <Cell key={i} fill={e.color} opacity={activePie === null || activePie === i ? 1 : 0.4} />)}
                    </Pie>
                    <Tooltip content={({ active, payload }) => active && payload?.length ? (
                      <div style={{ background: "#061525", border: `1px solid ${payload[0].payload.color}`, padding: "10px 14px", borderRadius: 8 }}>
                        <p style={{ color: payload[0].payload.color, fontFamily: "monospace", fontSize: 11, margin: 0 }}>{payload[0].payload.name}</p>
                        <p style={{ color: C.gold, fontFamily: "monospace", fontSize: 18, fontWeight: 700, margin: "4px 0 0" }}>{payload[0].value}%</p>
                        <p style={{ color: C.dim, fontFamily: "monospace", fontSize: 10, margin: "2px 0 0" }}>{payload[0].payload.spend}/yr est.</p>
                      </div>
                    ) : null} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <div style={{ color: C.gold, fontFamily: "monospace", fontSize: 13, marginBottom: 12 }}>💰 ANNUAL SPEND 2026 ($B)</div>
                <ResponsiveContainer width="100%" height={270}>
                  <BarChart data={hardwareData.map(d => ({ name: d.name.split(" ")[0], spend: parseInt(d.spend), color: d.color }))} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#0C3354" />
                    <XAxis type="number" tick={{ fill: C.dim, fontSize: 9, fontFamily: "monospace" }} tickFormatter={v => `$${v}B`} />
                    <YAxis dataKey="name" type="category" tick={{ fill: C.dim, fontSize: 9, fontFamily: "monospace" }} width={65} />
                    <Tooltip content={<TTip />} />
                    <Bar dataKey="spend" radius={[0, 4, 4, 0]}>{hardwareData.map((d, i) => <Cell key={i} fill={d.color} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card>
              <div style={{ color: C.gold, fontFamily: "monospace", fontSize: 13, marginBottom: 14 }}>🔬 HARDWARE BREAKDOWN WITH LIVE PRICES</div>
              {hardwareData.map((item, i) => {
                const primaryTicker = item.ticker.split(",")[0].trim().replace(" (ADR)", "");
                return (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: `1px solid ${C.border}22` }}>
                    <div style={{ minWidth: 48, height: 48, borderRadius: "50%", border: `3px solid ${item.color}`, display: "flex", alignItems: "center", justifyContent: "center", color: item.color, fontFamily: "monospace", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{item.pct}%</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 7, marginBottom: 4 }}>
                        <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{item.name}</span>
                        <Tag label={item.spend + "/yr"} color={item.color} />
                        <PricePill ticker={primaryTicker} prices={prices} loading={pricesLoading} />
                      </div>
                      <div style={{ color: C.gold, fontFamily: "monospace", fontSize: 11, marginBottom: 2 }}>📌 {item.ticker}</div>
                      <div style={{ color: C.dim, fontFamily: "monospace", fontSize: 11 }}>{item.note}</div>
                    </div>
                  </div>
                );
              })}
            </Card>
          </>
        )}

        {/* ══ ROADMAP ═════════════════════════════════════════════════════════ */}
        {tab === "road" && (
          <>
            <SecTitle icon="🗺️" title="10-Year Investment Roadmap — 2025 to 2034" sub="Think in waves. Size in early. Smart money enters 12–18 months before each inflection." />

            {[
              { yr: "2025–26", theme: "AI Infrastructure Buildout",    color: C.gold,   conv: 95, invest: ["NVDA", "ANET", "VRT", "SMCI", "PWR", "CEG"],            catalyst: "Hyperscaler capex $500B+; power grid upgrades; HBM3E ramp", risk: "NVDA valuation; China export controls" },
              { yr: "2026–27", theme: "Raw Materials Supercycle",       color: C.amber,  conv: 85, invest: ["FCX", "MP", "ALB", "SCCO", "WOLF", "RIO"],              catalyst: "Copper deficit widens; rare earth China restrictions", risk: "Commodity cycle volatility" },
              { yr: "2027–28", theme: "Memory & Networking Arms Race",  color: C.cyan,   conv: 88, invest: ["MU", "MRVL", "COHR", "AMKR", "TSM"],                    catalyst: "HBM4 ramp; 800G→1.6T networking; AI PC wave", risk: "DRAM cycle; Taiwan geopolitics" },
              { yr: "2027–29", theme: "Data Center REIT Maturation",    color: C.pink,   conv: 82, invest: ["EQIX", "DLR", "IRM", "AMT", "PLD"],                     catalyst: "20-year lease signings; AI land scarcity", risk: "Rate sensitivity; hyperscaler internalization" },
              { yr: "2028–30", theme: "BioAI Inflection Point",         color: C.teal,   conv: 82, invest: ["RXRX", "SDGR", "ILMN", "CRSP", "EXAS", "TEM"],         catalyst: "FDA AI drug approvals; CRISPR Phase 3 readouts", risk: "Clinical failure binary events" },
              { yr: "2029–31", theme: "Physical AI & Robotics",         color: C.purple, conv: 85, invest: ["ISRG", "MP", "TER", "ABB"],                             catalyst: "Humanoid robots; AI surgical suites globally", risk: "Hardware costs; liability frameworks" },
              { yr: "2031–35", theme: "AI-Native Healthcare OS",        color: C.green,  conv: 78, invest: ["VEEV", "IQVIA", "BEAM", "NTLA", "MRNA", "BNTX"],        catalyst: "Gene editing combos; mRNA cancer vaccines", risk: "10-yr clinical timelines; patent cliffs" },
            ].map((p, i) => (
              <Card key={i} color={p.color} style={{ marginBottom: 12, borderLeft: `4px solid ${p.color}` }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
                      <Tag label={p.yr} color={p.color} />
                      <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{p.theme}</span>
                    </div>
                    <div style={{ marginBottom: 8, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4 }}>
                      <span style={{ color: C.dim, fontFamily: "monospace", fontSize: 10 }}>TOP PLAYS: </span>
                      {p.invest.map(t => (
                        <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: `${p.color}15`, border: `1px solid ${p.color}33`, borderRadius: 8, padding: "2px 8px", fontFamily: "monospace", fontSize: 11, marginRight: 2 }}>
                          <span style={{ color: p.color, fontWeight: 700 }}>{t}</span>
                          {prices[t]?.price && <span style={{ color: "#fff" }}>${prices[t].price.toFixed(0)}</span>}
                          {prices[t]?.chg != null && <span style={{ color: prices[t].chg >= 0 ? C.green : C.red, fontSize: 9 }}>{prices[t].chg >= 0 ? "▲" : "▼"}{Math.abs(prices[t].chg).toFixed(1)}%</span>}
                        </span>
                      ))}
                    </div>
                    <div style={{ color: C.green, fontFamily: "monospace", fontSize: 11, marginBottom: 4 }}>🚀 {p.catalyst}</div>
                    <div style={{ color: C.red, fontFamily: "monospace", fontSize: 11 }}>⚠️ {p.risk}</div>
                  </div>
                  <div style={{ textAlign: "center", minWidth: 86 }}>
                    <div style={{ color: C.dim, fontFamily: "monospace", fontSize: 9, marginBottom: 5 }}>CONVICTION</div>
                    <div style={{ width: 74, height: 74, borderRadius: "50%", border: `4px solid ${p.color}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", background: `${p.color}10` }}>
                      <span style={{ color: p.color, fontFamily: "monospace", fontWeight: 700, fontSize: 20 }}>{p.conv}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            <Card>
              <div style={{ color: C.gold, fontFamily: "monospace", fontSize: 13, marginBottom: 14 }}>🎯 MULTI-SECTOR COMPARISON RADAR</div>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke={C.border} />
                  <PolarAngleAxis dataKey="s" tick={{ fill: C.dim, fontSize: 11, fontFamily: "monospace" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: C.dim, fontSize: 9 }} />
                  {[["NVDA", C.gold], ["MU", C.cyan], ["ANET", C.purple], ["RXRX", C.teal], ["VRT", C.orange], ["FCX", C.amber], ["PWR", C.lime], ["EQIX", C.pink]].map(([k, c]) => (
                    <Radar key={k} name={k} dataKey={k} stroke={c} fill={c} fillOpacity={0.08} />
                  ))}
                  <Legend formatter={v => <span style={{ color: C.dim, fontSize: 11, fontFamily: "monospace" }}>{v}</span>} />
                  <Tooltip content={<TTip />} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </>
        )}

        {/* ══ MARKET SIZING ═══════════════════════════════════════════════════ */}
        {tab === "size" && (
          <>
            <SecTitle icon="📈" title="Market Sizing — The $5 Trillion AI Economy by 2030" sub="Layer-by-layer growth across hardware, software, services, biotech, raw materials, and real estate." />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 18 }}>
              {[{ l: "AI Hardware 2030", v: "$750B", c: C.gold }, { l: "AI Software 2030", v: "$860B", c: C.cyan }, { l: "BioAI 2030", v: "$370B", c: C.teal }, { l: "Raw Materials", v: "$650B", c: C.amber }, { l: "DC Real Estate", v: "$215B", c: C.pink }, { l: "TOTAL TAM", v: "~$5T", c: C.green }].map(x => (
                <Card key={x.l} color={x.c} style={{ textAlign: "center", padding: "14px" }}>
                  <div style={{ color: x.c, fontFamily: "monospace", fontSize: 20, fontWeight: 700 }}>{x.v}</div>
                  <div style={{ color: C.dim, fontSize: 10, fontFamily: "monospace", marginTop: 3 }}>{x.l}</div>
                </Card>
              ))}
            </div>
            <Card style={{ marginBottom: 18 }}>
              <div style={{ color: C.gold, fontFamily: "monospace", fontSize: 13, marginBottom: 14 }}>📊 AI ECOSYSTEM MARKET SIZE ($B) — 2024–2030</div>
              <ResponsiveContainer width="100%" height={360}>
                <AreaChart data={marketSizeData}>
                  <defs>
                    {[[C.gold, "hw"], [C.cyan, "sw"], [C.purple, "sv"], [C.teal, "bio"], [C.amber, "rm"], [C.pink, "re"]].map(([c, id]) => (
                      <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={c} stopOpacity={0.22} />
                        <stop offset="95%" stopColor={c} stopOpacity={0.02} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0C3354" />
                  <XAxis dataKey="year" tick={{ fill: C.dim, fontSize: 11, fontFamily: "monospace" }} />
                  <YAxis tick={{ fill: C.dim, fontSize: 10, fontFamily: "monospace" }} tickFormatter={v => `$${v}B`} />
                  <Tooltip content={<TTip />} />
                  <Legend formatter={v => <span style={{ color: C.dim, fontSize: 11, fontFamily: "monospace" }}>{v}</span>} />
                  <Area type="monotone" dataKey="hardware"    name="AI Hardware"    stroke={C.gold}   fill="url(#hw)"  strokeWidth={2} />
                  <Area type="monotone" dataKey="software"    name="AI Software"    stroke={C.cyan}   fill="url(#sw)"  strokeWidth={2} />
                  <Area type="monotone" dataKey="services"    name="AI Services"    stroke={C.purple} fill="url(#sv)"  strokeWidth={2} />
                  <Area type="monotone" dataKey="bioai"       name="BioAI"          stroke={C.teal}   fill="url(#bio)" strokeWidth={2} />
                  <Area type="monotone" dataKey="rawmat"      name="Raw Materials"  stroke={C.amber}  fill="url(#rm)"  strokeWidth={2} />
                  <Area type="monotone" dataKey="realestate"  name="DC Real Estate" stroke={C.pink}   fill="url(#re)"  strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <div style={{ color: C.gold, fontFamily: "monospace", fontSize: 13, marginBottom: 4 }}>🏆 MASTER WATCHLIST — 62 TICKERS WITH LIVE PRICES</div>
              <div style={{ color: C.dim, fontFamily: "monospace", fontSize: 10, marginBottom: 14 }}>Sorted by CAGR. Live price + daily change shown for each.</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "monospace", fontSize: 11, minWidth: 750 }}>
                  <thead>
                    <tr>{["Ticker", "Name", "Sector", "Live Price", "Day %", "CAGR", "Risk", "Thesis"].map(h => (
                      <th key={h} style={{ color: C.gold, padding: "7px 9px", textAlign: "left", borderBottom: `1px solid ${C.border}`, fontSize: 10, whiteSpace: "nowrap", background: C.bg }}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {[...ALL_TICKERS].sort((a, b) => b.cagr - a.cagr).map((tk, i) => {
                      const pd = prices[tk.t];
                      const up = pd && pd.chg >= 0;
                      return (
                        <tr key={i} style={{ borderBottom: `1px solid ${C.border}22`, background: i % 2 === 0 ? "transparent" : "#04101A" }}>
                          <td style={{ padding: "7px 9px", color: tk.color, fontWeight: 700 }}>{tk.t}</td>
                          <td style={{ padding: "7px 9px", color: "#fff", whiteSpace: "nowrap", fontSize: 10 }}>{tk.name}</td>
                          <td style={{ padding: "7px 9px" }}><Tag label={tk.cat} color={tk.color} /></td>
                          <td style={{ padding: "7px 9px", whiteSpace: "nowrap" }}>
                            {pricesLoading ? <span style={{ color: C.dim }}>…</span>
                              : pd?.price ? <span style={{ color: "#fff", fontWeight: 700 }}>${pd.price.toFixed(2)}</span>
                              : <span style={{ color: C.dim }}>—</span>}
                          </td>
                          <td style={{ padding: "7px 9px", whiteSpace: "nowrap" }}>
                            {pd?.chg != null ? (
                              <span style={{ color: up ? C.green : C.red, fontWeight: 700 }}>{up ? "▲" : "▼"}{Math.abs(pd.chg).toFixed(2)}%</span>
                            ) : <span style={{ color: C.dim }}>—</span>}
                          </td>
                          <td style={{ padding: "7px 9px" }}><span style={{ color: tk.cagr >= 30 ? C.green : tk.cagr >= 20 ? C.cyan : C.amber, fontWeight: 700 }}>{tk.cagr}%</span></td>
                          <td style={{ padding: "7px 9px" }}><Risk r={tk.risk} /></td>
                          <td style={{ padding: "7px 9px", color: C.text, fontSize: 10 }}>{tk.note}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {/* Disclaimer */}
        <div style={{ background: "#0A1820", border: `1px solid ${C.gold}33`, borderRadius: 8, padding: "12px 16px", marginTop: 26, color: C.dim, fontSize: 10, fontFamily: "monospace", lineHeight: 1.8 }}>
          ⚠️ <strong style={{ color: C.gold }}>CRITICAL DISCLAIMER:</strong> Live prices are fetched via AI web search and may be delayed or approximate. All CAGR estimates are forward-looking research constructs. Nothing herein constitutes financial, legal, or investment advice. All investments carry risk including <strong style={{ color: C.red }}>total loss of principal</strong>. Consult a licensed financial advisor before investing. <strong style={{ color: C.gold }}>This is a map. You drive the car.</strong>
        </div>
      </div>
    </div>
  );
}
