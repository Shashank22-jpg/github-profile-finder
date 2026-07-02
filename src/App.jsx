import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Search, Github, Star, GitFork, AlertCircle, MapPin, Link as LinkIcon,
  Twitter, Building2, Calendar, Users, BookOpen, Sparkles, TrendingUp,
  Copy, Share2, Download, Heart, X, ChevronDown, ArrowUpRight, Clock,
  Zap, Award, Activity, Command, ExternalLink, RefreshCw
} from "lucide-react";

/* ---------------------------------------------------------------------- */
/*  DESIGN TOKENS                                                          */
/* ---------------------------------------------------------------------- */
/*
  Palette
  --ink        #05050f   page base, near-black indigo
  --panel      rgba(255,255,255,.05)   glass panel fill
  --edge       rgba(255,255,255,.10)   glass edge
  --indigo     #6366f1
  --purple     #a855f7
  --cyan       #22d3ee
  --blue       #3b82f6
  Type: display "Poppins" 600/700, body "Inter" 400/500
  Signature: "orbit field" — a slowly drifting constellation of nodes behind
  the hero that a git-commit-graph would produce, tying the visual language
  back to what GitHub actually is: a graph of connected work.
*/

const LANG_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5", Java: "#b07219",
  "C++": "#f34b7d", C: "#555555", "C#": "#178600", Go: "#00ADD8", Rust: "#dea584",
  Ruby: "#701516", PHP: "#4F5D95", Swift: "#F05138", Kotlin: "#A97BFF", HTML: "#e34c26",
  CSS: "#563d7c", Shell: "#89e051", Vue: "#41b883", Dart: "#00B4AB", Jupyter: "#DA5B0B",
  Lua: "#000080", Scala: "#c22d40", default: "#8b8fa3"
};

function langColor(l) { return LANG_COLORS[l] || LANG_COLORS.default; }

function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const secs = Math.floor((Date.now() - d.getTime()) / 1000);
  const table = [["year", 31536000], ["month", 2592000], ["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [label, s] of table) {
    const v = Math.floor(secs / s);
    if (v >= 1) return `${v} ${label}${v > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

/* ---------------------------------------------------------------------- */
/*  BACKGROUND — animated gradient blobs + orbit field                     */
/* ---------------------------------------------------------------------- */

function Backdrop() {
  const nodes = useMemo(() => {
    return Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      r: 1 + Math.random() * 2,
      dur: 14 + Math.random() * 16,
      delay: Math.random() * -20,
    }));
  }, []);
  const edges = useMemo(() => {
    const arr = [];
    for (let i = 0; i < nodes.length; i++) {
      const j = (i + 3) % nodes.length;
      if (Math.random() > 0.45) arr.push([nodes[i], nodes[j]]);
    }
    return arr;
  }, [nodes]);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
      <div className="blob" style={{ background: "radial-gradient(circle,#6366f1,transparent 70%)", top: "-10%", left: "-8%", animationDuration: "22s" }} />
      <div className="blob" style={{ background: "radial-gradient(circle,#a855f7,transparent 70%)", top: "40%", right: "-12%", animationDuration: "28s", animationDelay: "-6s" }} />
      <div className="blob" style={{ background: "radial-gradient(circle,#22d3ee,transparent 70%)", bottom: "-15%", left: "20%", animationDuration: "26s", animationDelay: "-12s" }} />
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.35 }}>
        {edges.map(([a, b], i) => (
          <line key={i} x1={`${a.x}%`} y1={`${a.y}%`} x2={`${b.x}%`} y2={`${b.y}%`} stroke="url(#edgeGrad)" strokeWidth="1" />
        ))}
        <defs>
          <linearGradient id="edgeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      {nodes.map((n) => (
        <div key={n.id} className="node" style={{
          left: `${n.x}%`, top: `${n.y}%`, width: n.r * 3, height: n.r * 3,
          animationDuration: `${n.dur}s`, animationDelay: `${n.delay}s`
        }} />
      ))}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(5,5,15,0) 0%, rgba(5,5,15,.4) 60%, #05050f 100%)" }} />
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  SMALL UI PRIMITIVES                                                    */
/* ---------------------------------------------------------------------- */

function GlassCard({ children, style, className = "", glow = false }) {
  return (
    <div className={`glass-card ${glow ? "glow-border" : ""} ${className}`} style={style}>
      {children}
    </div>
  );
}

function Counter({ value, duration = 1000 }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let start = null;
    const target = Number(value) || 0;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setN(Math.floor(p * target));
      if (p < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(ref.current);
  }, [value, duration]);
  return <span>{n.toLocaleString()}</span>;
}

function Skeleton({ h = 16, w = "100%", r = 8 }) {
  return <div className="skel" style={{ height: h, width: w, borderRadius: r }} />;
}

function Meter({ label, value, icon: Icon, color }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#b6b8d1" }}>
          <Icon size={14} style={{ color }} /> {label}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#f1f2fb" }}>{Math.round(value)}%</span>
      </div>
      <div className="meter-track">
        <div className="meter-fill" style={{ width: `${Math.min(value, 100)}%`, background: `linear-gradient(90deg, ${color}, #22d3ee)` }} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  DONUT + BAR CHARTS (hand-rolled SVG, no external chart lib needed)     */
/* ---------------------------------------------------------------------- */

function Donut({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let acc = 0;
  const R = 60, C = 2 * Math.PI * R;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
      <svg width="150" height="150" viewBox="0 0 150 150">
        <g transform="translate(75,75) rotate(-90)">
          <circle r={R} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="16" />
          {data.map((d, i) => {
            const frac = d.value / total;
            const dash = frac * C;
            const el = (
              <circle key={i} r={R} fill="none" stroke={langColor(d.name)} strokeWidth="16"
                strokeDasharray={`${dash} ${C - dash}`} strokeDashoffset={-acc}
                strokeLinecap="butt" className="donut-seg" style={{ animationDelay: `${i * 90}ms` }} />
            );
            acc += dash;
            return el;
          })}
        </g>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 140 }}>
        {data.slice(0, 6).map((d) => (
          <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: langColor(d.name), flexShrink: 0 }} />
            <span style={{ color: "#d6d8f0", flex: 1 }}>{d.name}</span>
            <span style={{ color: "#8b8fbf" }}>{((d.value / total) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 160, padding: "0 4px" }}>
      {data.map((d, i) => (
        <div key={d.name} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: "#b6b8d1" }}>{d.value}</span>
          <div className="bar" style={{
            height: `${(d.value / max) * 110}px`, width: "100%", maxWidth: 34,
            background: `linear-gradient(180deg, #22d3ee, #6366f1)`,
            animationDelay: `${i * 80}ms`
          }} />
          <span style={{ fontSize: 10, color: "#8b8fbf", textAlign: "center", maxWidth: 60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  REPO CARD                                                              */
/* ---------------------------------------------------------------------- */

function RepoCard({ repo, index }) {
  return (
    <a href={repo.html_url} target="_blank" rel="noreferrer" className="repo-card" style={{ animationDelay: `${index * 40}ms` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <BookOpen size={15} style={{ color: "#8b8fbf", flexShrink: 0 }} />
          <span className="repo-name">{repo.name}</span>
        </div>
        <ArrowUpRight size={16} style={{ color: "#8b8fbf", flexShrink: 0 }} />
      </div>
      <p className="repo-desc">{repo.description || "No description provided."}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 12, fontSize: 12.5, color: "#9a9dc2" }}>
        {repo.language && (
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: langColor(repo.language) }} />
            {repo.language}
          </span>
        )}
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Star size={13} />{repo.stargazers_count}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><GitFork size={13} />{repo.forks_count}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={13} />{repo.open_issues_count}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}><Clock size={13} />{timeAgo(repo.updated_at)}</span>
      </div>
    </a>
  );
}

/* ---------------------------------------------------------------------- */
/*  MAIN APP                                                               */
/* ---------------------------------------------------------------------- */

const PER_PAGE = 6;

export default function App() {
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("stars");
  const [page, setPage] = useState(1);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const showToast = (msg, icon = Sparkles) => {
    setToast({ msg, icon });
    setTimeout(() => setToast(null), 2600);
  };

  const search = useCallback(async (name) => {
    const uname = (name ?? query).trim();
    if (!uname) return;
    setLoading(true);
    setError("");
    setUser(null);
    setRepos([]);
    setPage(1);
    try {
      const [uRes, rRes] = await Promise.all([
        fetch(`https://api.github.com/users/${uname}`),
        fetch(`https://api.github.com/users/${uname}/repos?per_page=100`)
      ]);
      if (uRes.status === 404) {
        setError("notfound");
        setLoading(false);
        return;
      }
      if (!uRes.ok) throw new Error("network");
      const uData = await uRes.json();
      const rData = rRes.ok ? await rRes.json() : [];
      setUser(uData);
      setRepos(Array.isArray(rData) ? rData : []);
      setHistory((h) => [uname, ...h.filter((x) => x.toLowerCase() !== uname.toLowerCase())].slice(0, 6));
      showToast(`Loaded ${uData.login}'s profile`, Sparkles);
    } catch (e) {
      setError("network");
    } finally {
      setLoading(false);
    }
  }, [query]);

  const sortedRepos = useMemo(() => {
    const arr = [...repos];
    if (sortBy === "stars") arr.sort((a, b) => b.stargazers_count - a.stargazers_count);
    else if (sortBy === "updated") arr.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    else if (sortBy === "name") arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, [repos, sortBy]);

  const pageCount = Math.max(1, Math.ceil(sortedRepos.length / PER_PAGE));
  const pagedRepos = sortedRepos.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const langData = useMemo(() => {
    const map = {};
    repos.forEach((r) => { if (r.language) map[r.language] = (map[r.language] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [repos]);

  const starData = useMemo(() => {
    return [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 6)
      .map((r) => ({ name: r.name, value: r.stargazers_count }));
  }, [repos]);

  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const totalForks = repos.reduce((s, r) => s + r.forks_count, 0);

  const analytics = useMemo(() => {
    if (!user) return null;
    const popularity = Math.min(100, (totalStars / 5) + (user.followers / 3));
    const activity = Math.min(100, repos.filter((r) => (Date.now() - new Date(r.updated_at)) / 86400000 < 180).length * 12);
    const contribution = Math.min(100, (user.public_repos * 2) + (totalStars / 10));
    const followerGrowth = Math.min(100, (user.followers / (user.following + 1)) * 20);
    const score = (popularity + activity + contribution + followerGrowth) / 4;
    let level = "Newcomer";
    if (score > 75) level = "Legendary";
    else if (score > 55) level = "Expert";
    else if (score > 35) level = "Builder";
    else if (score > 15) level = "Explorer";
    return { popularity, activity, contribution, followerGrowth, level, score };
  }, [user, repos, totalStars]);

  const isFav = user && favorites.includes(user.login);
  const toggleFav = () => {
    if (!user) return;
    setFavorites((f) => isFav ? f.filter((x) => x !== user.login) : [...f, user.login]);
    showToast(isFav ? "Removed from favorites" : "Added to favorites", Heart);
  };

  const copyLink = () => {
    if (!user) return;
    navigator.clipboard?.writeText(user.html_url);
    showToast("Profile link copied", Copy);
  };

  const exportSummary = () => {
    if (!user) return;
    const lines = [
      `GitHub Profile Summary — ${user.login}`,
      `Name: ${user.name || "—"}`,
      `Bio: ${user.bio || "—"}`,
      `Followers: ${user.followers}  Following: ${user.following}`,
      `Public repos: ${user.public_repos}  Public gists: ${user.public_gists}`,
      `Location: ${user.location || "—"}`,
      `Company: ${user.company || "—"}`,
      `Joined: ${new Date(user.created_at).toDateString()}`,
      `Profile: ${user.html_url}`,
      "",
      "Top repositories:",
      ...sortedRepos.slice(0, 10).map((r) => ` - ${r.name} (★ ${r.stargazers_count}, ${r.language || "—"})`)
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${user.login}-github-summary.txt`; a.click();
    URL.revokeObjectURL(url);
    showToast("Summary exported", Download);
  };

  return (
    <div style={{ position: "relative", minHeight: "100%", background: "#05050f", color: "#f1f2fb", fontFamily: "Inter, sans-serif", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .display { font-family: 'Poppins', sans-serif; }
        ::selection { background: #6366f1; color: white; }
        input::placeholder { color: #6b6f96; }

        @keyframes drift {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(30px,-20px) scale(1.08); }
          66% { transform: translate(-20px,25px) scale(0.95); }
        }
        .blob { position: absolute; width: 46vw; height: 46vw; border-radius: 50%; filter: blur(70px); opacity: .55; animation: drift ease-in-out infinite; }

        @keyframes floaty { 0%,100% { transform: translateY(0); opacity:.5;} 50% { transform: translateY(-14px); opacity:1;} }
        .node { position: absolute; border-radius: 50%; background: radial-gradient(circle, #22d3ee, #6366f1); animation: floaty ease-in-out infinite; box-shadow: 0 0 8px #6366f1aa; }

        .glass-card {
          background: rgba(255,255,255,0.045);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 22px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.35);
        }
        .glow-border { position: relative; }
        .glow-border::before {
          content: ""; position: absolute; inset: -1px; border-radius: 22px; padding: 1px;
          background: conic-gradient(from var(--a,0deg), #6366f1, #a855f7, #22d3ee, #3b82f6, #6366f1);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          animation: spin 6s linear infinite; opacity: .55; pointer-events: none;
        }
        @keyframes spin { to { --a: 360deg; } }
        @property --a { syntax: '<angle>'; inherits: false; initial-value: 0deg; }

        .hover-lift { transition: transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s; }
        .hover-lift:hover { transform: translateY(-6px); box-shadow: 0 20px 45px rgba(99,102,241,0.25); }

        .grad-text { background: linear-gradient(90deg,#818cf8,#c084fc,#22d3ee); -webkit-background-clip: text; background-clip: text; color: transparent; }

        .search-wrap { position: relative; }
        .search-input {
          width: 100%; padding: 18px 130px 18px 54px; border-radius: 18px; font-size: 16px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); color: #fff;
          outline: none; transition: border-color .25s, box-shadow .25s;
        }
        .search-input:focus { border-color: #818cf8; box-shadow: 0 0 0 4px rgba(99,102,241,0.18); }
        .search-btn {
          position: absolute; right: 8px; top: 8px; bottom: 8px; padding: 0 20px; border-radius: 12px; border: none;
          background: linear-gradient(90deg,#6366f1,#a855f7); color: white; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; gap: 6px; transition: transform .2s, filter .2s;
        }
        .search-btn:hover { filter: brightness(1.12); transform: translateY(-1px); }
        .search-btn:active { transform: scale(.96); }

        .chip { padding: 7px 14px; border-radius: 999px; font-size: 12.5px; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.04); color: #c7c9e6; cursor: pointer; transition: all .2s; }
        .chip:hover { border-color: #818cf8; color: #fff; background: rgba(99,102,241,.15); }

        .repo-card {
          display: block; text-decoration: none; color: inherit; padding: 18px 20px; border-radius: 18px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          animation: fadein .5s cubic-bezier(.2,.8,.2,1) both; transition: transform .3s, border-color .3s, background .3s;
        }
        .repo-card:hover { transform: translateY(-4px); border-color: rgba(129,140,248,.5); background: rgba(255,255,255,0.065); }
        .repo-name { font-weight: 600; font-size: 15px; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .repo-desc { font-size: 13px; color: #9a9dc2; margin: 8px 0 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 34px; }

        @keyframes fadein { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeInUp .6s cubic-bezier(.2,.8,.2,1) both; }

        .skel { background: linear-gradient(90deg, rgba(255,255,255,.05) 25%, rgba(255,255,255,.12) 37%, rgba(255,255,255,.05) 63%); background-size: 400% 100%; animation: shimmer 1.4s ease infinite; }
        @keyframes shimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }

        .meter-track { height: 8px; border-radius: 999px; background: rgba(255,255,255,.07); overflow: hidden; }
        .meter-fill { height: 100%; border-radius: 999px; transition: width 1.1s cubic-bezier(.2,.8,.2,1); }

        .donut-seg { animation: growarc .9s cubic-bezier(.2,.8,.2,1) both; }
        @keyframes growarc { from { opacity: 0; } to { opacity: 1; } }
        .bar { border-radius: 8px 8px 3px 3px; animation: growbar .7s cubic-bezier(.2,.8,.2,1) both; transform-origin: bottom; }
        @keyframes growbar { from { transform: scaleY(0); opacity: 0; } to { transform: scaleY(1); opacity: 1; } }

        .avatar-ring { position: relative; border-radius: 50%; padding: 4px; background: conic-gradient(#6366f1,#a855f7,#22d3ee,#3b82f6,#6366f1); animation: spin 8s linear infinite; }
        @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(99,102,241,.5);} 50% { box-shadow: 0 0 0 10px rgba(99,102,241,0);} }

        .icon-btn { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); color: #c7c9e6; cursor: pointer; transition: all .2s; }
        .icon-btn:hover { background: rgba(99,102,241,.2); border-color: #818cf8; color: #fff; transform: translateY(-2px); }
        .icon-btn.active { background: linear-gradient(135deg,#6366f1,#a855f7); color: #fff; border-color: transparent; }

        .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); padding: 12px 20px; border-radius: 14px; background: rgba(20,20,35,.9); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,.12); display: flex; align-items: center; gap: 8px; font-size: 13.5px; z-index: 50; animation: toastIn .35s cubic-bezier(.2,.8,.2,1); box-shadow: 0 10px 30px rgba(0,0,0,.4); }
        @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(14px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

        .stat-num { font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 26px; background: linear-gradient(90deg,#fff,#c7c9e6); -webkit-background-clip: text; background-clip: text; color: transparent; }

        .page-dot { width: 30px; height: 30px; border-radius: 9px; border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.04); color: #c7c9e6; font-size: 12.5px; cursor: pointer; transition: all .2s; }
        .page-dot.active { background: linear-gradient(135deg,#6366f1,#a855f7); color: #fff; border-color: transparent; }
        .page-dot:hover:not(.active) { border-color: #818cf8; }

        .badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; background: linear-gradient(135deg, rgba(99,102,241,.25), rgba(34,211,238,.2)); border: 1px solid rgba(129,140,248,.35); color: #d8d9ff; }

        select.sort-select { background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.12); color: #e6e7fb; border-radius: 10px; padding: 8px 12px; font-size: 13px; outline: none; }

        @media (max-width: 720px) {
          .search-input { padding-right: 96px; font-size: 14px; }
          .search-btn span { display: none; }
        }
      `}</style>

      <Backdrop />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1080, margin: "0 auto", padding: "28px 20px 80px" }}>

        {/* ---------- HEADER ---------- */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg,#6366f1,#22d3ee)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Github size={20} color="#05050f" />
            </div>
            <span className="display" style={{ fontWeight: 600, fontSize: 17 }}>Orbit</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: "#8b8fbf" }}>
            <Command size={14} /> <span>Ctrl + K to search</span>
          </div>
        </div>

        {/* ---------- HERO ---------- */}
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 40 }}>
          <div className="badge" style={{ marginBottom: 18 }}>
            <Sparkles size={13} /> Explore any developer's universe
          </div>
          <h1 className="display grad-text" style={{ fontSize: "clamp(32px,6vw,54px)", fontWeight: 700, margin: "0 0 14px", lineHeight: 1.1 }}>
            GitHub Profile Finder
          </h1>
          <p style={{ color: "#a3a6cc", fontSize: 16, maxWidth: 560, margin: "0 auto 32px", lineHeight: 1.6 }}>
            Search any GitHub user and explore repositories, followers, contributions and developer statistics.
          </p>

          <div className="search-wrap" style={{ maxWidth: 560, margin: "0 auto" }}>
            <Search size={18} style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", color: "#8b8fbf" }} />
            <input
              ref={inputRef}
              className="search-input"
              placeholder="Search a GitHub username, e.g. torvalds"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
            />
            <button className="search-btn" onClick={() => search()}>
              <Search size={15} /> <span>Search</span>
            </button>
          </div>

          {history.length > 0 && (
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 18 }}>
              {history.map((h) => (
                <button key={h} className="chip" onClick={() => { setQuery(h); search(h); }}>{h}</button>
              ))}
            </div>
          )}
        </div>

        {/* ---------- LOADING ---------- */}
        {loading && (
          <div className="fade-up" style={{ display: "grid", gap: 24 }}>
            <GlassCard style={{ padding: 28 }}>
              <div style={{ display: "flex", gap: 20 }}>
                <Skeleton h={90} w={90} r={45} />
                <div style={{ flex: 1 }}>
                  <Skeleton h={20} w="40%" />
                  <div style={{ height: 10 }} />
                  <Skeleton h={14} w="60%" />
                  <div style={{ height: 16 }} />
                  <Skeleton h={14} w="90%" />
                </div>
              </div>
            </GlassCard>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 18 }}>
              {[0, 1, 2].map((i) => <GlassCard key={i} style={{ padding: 20, height: 100 }}><Skeleton h={16} w="50%" /><div style={{ height: 10 }} /><Skeleton h={26} w="30%" /></GlassCard>)}
            </div>
          </div>
        )}

        {/* ---------- ERROR STATES ---------- */}
        {!loading && error === "notfound" && (
          <div className="fade-up" style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>🛰️</div>
            <h3 className="display" style={{ fontSize: 22, marginBottom: 8 }}>No developer found in this galaxy</h3>
            <p style={{ color: "#8b8fbf" }}>Double-check the username and try searching again.</p>
          </div>
        )}
        {!loading && error === "network" && (
          <div className="fade-up" style={{ textAlign: "center", padding: "60px 20px" }}>
            <AlertCircle size={48} style={{ color: "#f87171", marginBottom: 12 }} />
            <h3 className="display" style={{ fontSize: 22, marginBottom: 8 }}>Connection lost</h3>
            <p style={{ color: "#8b8fbf", marginBottom: 18 }}>We couldn't reach GitHub's servers. Please try again.</p>
            <button className="chip" onClick={() => search()} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><RefreshCw size={13} /> Retry</button>
          </div>
        )}
        {!loading && !user && !error && (
          <div className="fade-up" style={{ textAlign: "center", padding: "50px 20px", color: "#6b6f96" }}>
            <Users size={40} style={{ marginBottom: 10, opacity: .6 }} />
            <p>Try searching a username like <b style={{ color: "#a3a6cc" }}>torvalds</b>, <b style={{ color: "#a3a6cc" }}>gaearon</b> or <b style={{ color: "#a3a6cc" }}>sindresorhus</b>.</p>
          </div>
        )}

        {/* ---------- PROFILE ---------- */}
        {!loading && user && (
          <div style={{ display: "grid", gap: 26 }}>
            <GlassCard glow className="fade-up hover-lift" style={{ padding: 30 }}>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
                <div className="avatar-ring">
                  <img src={user.avatar_url} alt={user.login} style={{ width: 88, height: 88, borderRadius: "50%", display: "block", border: "3px solid #05050f" }} />
                </div>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <h2 className="display" style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>{user.name || user.login}</h2>
                    <span className="badge"><Award size={12} /> {analytics.level}</span>
                  </div>
                  <a href={user.html_url} target="_blank" rel="noreferrer" style={{ color: "#818cf8", fontSize: 14, textDecoration: "none" }}>@{user.login}</a>
                  {user.bio && <p style={{ color: "#c7c9e6", fontSize: 14.5, margin: "10px 0 0", lineHeight: 1.6, maxWidth: 560 }}>{user.bio}</p>}
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 14, fontSize: 13, color: "#9a9dc2" }}>
                    {user.company && <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Building2 size={13} />{user.company}</span>}
                    {user.location && <span style={{ display: "flex", alignItems: "center", gap: 5 }}><MapPin size={13} />{user.location}</span>}
                    {user.blog && <a href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, color: "#9a9dc2", textDecoration: "none" }}><LinkIcon size={13} />{user.blog}</a>}
                    {user.twitter_username && <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Twitter size={13} />@{user.twitter_username}</span>}
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Calendar size={13} />Joined {new Date(user.created_at).toDateString().slice(4)}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className={`icon-btn ${isFav ? "active" : ""}`} onClick={toggleFav} title="Favorite"><Heart size={16} /></button>
                  <button className="icon-btn" onClick={copyLink} title="Copy link"><Copy size={16} /></button>
                  <button className="icon-btn" onClick={exportSummary} title="Export summary"><Download size={16} /></button>
                  <a className="icon-btn" href={user.html_url} target="_blank" rel="noreferrer" title="Open on GitHub"><ExternalLink size={16} /></a>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 14, marginTop: 28, borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 22 }}>
                {[
                  { label: "Followers", value: user.followers, icon: Users },
                  { label: "Following", value: user.following, icon: TrendingUp },
                  { label: "Repositories", value: user.public_repos, icon: BookOpen },
                  { label: "Gists", value: user.public_gists, icon: Zap },
                  { label: "Total stars", value: totalStars, icon: Star },
                  { label: "Total forks", value: totalForks, icon: GitFork },
                ].map((s) => (
                  <div key={s.label}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#8b8fbf", fontSize: 12, marginBottom: 4 }}>
                      <s.icon size={13} /> {s.label}
                    </div>
                    <div className="stat-num"><Counter value={s.value} /></div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* ---------- ANALYTICS ---------- */}
            <div style={{ display: "grid", gridTemplateColumns: "minmax(260px,1fr) minmax(260px,1fr)", gap: 24 }}>
              <GlassCard className="fade-up hover-lift" style={{ padding: 26 }}>
                <h3 className="display" style={{ fontSize: 16, margin: "0 0 18px", display: "flex", alignItems: "center", gap: 8 }}><Activity size={16} style={{ color: "#22d3ee" }} /> Profile analytics</h3>
                <Meter label="Popularity" value={analytics.popularity} icon={Star} color="#a855f7" />
                <Meter label="Activity score" value={analytics.activity} icon={Zap} color="#22d3ee" />
                <Meter label="Contribution score" value={analytics.contribution} icon={TrendingUp} color="#6366f1" />
                <Meter label="Follower growth" value={analytics.followerGrowth} icon={Users} color="#3b82f6" />
              </GlassCard>

              <GlassCard className="fade-up hover-lift" style={{ padding: 26 }}>
                <h3 className="display" style={{ fontSize: 16, margin: "0 0 18px", display: "flex", alignItems: "center", gap: 8 }}><Sparkles size={16} style={{ color: "#a855f7" }} /> Language distribution</h3>
                {langData.length > 0 ? <Donut data={langData} /> : <p style={{ color: "#8b8fbf", fontSize: 13 }}>No language data available.</p>}
              </GlassCard>
            </div>

            <GlassCard className="fade-up hover-lift" style={{ padding: 26 }}>
              <h3 className="display" style={{ fontSize: 16, margin: "0 0 18px", display: "flex", alignItems: "center", gap: 8 }}><Star size={16} style={{ color: "#f59e0b" }} /> Top repositories by stars</h3>
              {starData.length > 0 ? <BarChart data={starData} /> : <p style={{ color: "#8b8fbf", fontSize: 13 }}>No repositories to chart yet.</p>}
            </GlassCard>

            {/* ---------- REPOS ---------- */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                <h3 className="display" style={{ fontSize: 18, margin: 0 }}>Repositories <span style={{ color: "#6b6f96", fontWeight: 400, fontSize: 14 }}>({repos.length})</span></h3>
                <select className="sort-select" value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}>
                  <option value="stars">Sort by stars</option>
                  <option value="updated">Recently updated</option>
                  <option value="name">Name (A–Z)</option>
                </select>
              </div>

              {pagedRepos.length === 0 ? (
                <GlassCard style={{ padding: 40, textAlign: "center", color: "#8b8fbf" }}>This user has no public repositories yet.</GlassCard>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
                  {pagedRepos.map((r, i) => <RepoCard key={r.id} repo={r} index={i} />)}
                </div>
              )}

              {pageCount > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 26 }}>
                  {Array.from({ length: pageCount }).map((_, i) => (
                    <button key={i} className={`page-dot ${page === i + 1 ? "active" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------- FOOTER ---------- */}
        <div style={{ marginTop: 90, paddingTop: 26, borderTop: "1px solid rgba(255,255,255,.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, color: "#6b6f96", fontSize: 13 }}>
          <span>Built with the GitHub REST API</span>
          <div style={{ display: "flex", gap: 10 }}>
            <a className="icon-btn" href="https://github.com" target="_blank" rel="noreferrer"><Github size={15} /></a>
            <a className="icon-btn" href="https://linkedin.com" target="_blank" rel="noreferrer"><LinkIcon size={15} /></a>
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast">
          <toast.icon size={15} style={{ color: "#22d3ee" }} />
          {toast.msg}
        </div>
      )}
    </div>
  );
}
