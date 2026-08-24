import React, { useState, useRef, useEffect } from "react";
import {
  Search, Send, Camera, Settings, MessageSquare,
  Users, ShieldCheck, Code2, Sparkles, X, ChevronLeft,
  LogOut, Save, Trash2, KeyRound, Music2, Gamepad2, Palette,
  Bell, MessageCircleWarning, Download, UserCircle2, PlusCircle, Radio, Loader2
} from "lucide-react";
import { supabase } from "./lib/supabaseClient";
import * as api from "./lib/api";

/* ---------------------------------------------------------
   ZESPO — production build. Auth, storage, and all app data
   are backed by Supabase (Postgres + Auth + Storage + Realtime).
--------------------------------------------------------- */

const THEMES = {
  aesthetic: { name: "Aesthetic", accent: "#E0121B", accent2: "#FF6B81", bg: "from-[#150912] via-[#0B0B0F] to-[#0B0B0F]" },
  cool:      { name: "Cool",      accent: "#33E6CC", accent2: "#3B82F6", bg: "from-[#06131A] via-[#0B0B0F] to-[#0B0B0F]" },
  cozy:      { name: "Cozy",      accent: "#E8A33D", accent2: "#C2410C", bg: "from-[#1A1207] via-[#0B0B0F] to-[#0B0B0F]" },
  cute:      { name: "Cute",      accent: "#FF6FB5", accent2: "#B388FF", bg: "from-[#160A16] via-[#0B0B0F] to-[#0B0B0F]" },
};

const SELECTABLE_ROLES = ["amrsg", "amrsj", "none"];
const HERO_ROSTER = [
  "steve","kratos","superman","batman","dr doom","spidey","slayer","hulk",
  "thanos","cap.america","ghost","alex","wonder woman","gwen","mj","billori",
  "topper","batgirl","cap.marvel","iron man","loki","doc.strange","vision",
  "thor","lucix","unknown",
];

const MOD_PROFILE = {
  username: "moderator",
  displayName: "The Moderator",
  bio: "Keeper of the access matrix. Handles invite codes, role requests, and anything broken.",
  pfp: "🛡️",
};

const LOGIC_GLYPHS = ["∀","∃","¬","∧","∨","⊕","⊂","∴","λ","∞","Σ","≠"];
function glyph(seed) { return LOGIC_GLYPHS[seed % LOGIC_GLYPHS.length]; }
function nowStamp() { return new Date().toLocaleString(); }

function Avatar({ url, fallback, size = 36 }) {
  return (
    <div
      className="rounded-full bg-white/10 flex items-center justify-center overflow-hidden shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {url ? <img src={url} alt="" className="w-full h-full object-cover" /> : (fallback || "🙂")}
    </div>
  );
}

/* ----------------------------- Root ----------------------------- */

export default function ZespoApp() {
  const [stage, setStage] = useState("intro"); // intro -> auth -> roleSelect -> app
  const [themeKey, setThemeKey] = useState("aesthetic");
  const theme = THEMES[themeKey];

  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    api.getSession().then((s) => { setSession(s); setAuthChecked(true); });
    return api.onAuthChange((s) => setSession(s));
  }, []);

  useEffect(() => {
    if (!session) { setProfile(null); return; }
    api.getMyProfile(session.user.id).then(setProfile).catch(() => setProfile(null));
  }, [session]);

  useEffect(() => {
    if (!introDone || !authChecked) return;
    if (!session) setStage("auth");
    else if (profile && profile.role === "unset") setStage("roleSelect");
    else if (profile) setStage("app");
  }, [introDone, authChecked, session, profile]);

  async function handleLogout() {
    await api.signOut();
    setStage("intro");
    setIntroDone(false);
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-0 md:p-6">
      <div
        className="relative w-full max-w-[430px] md:max-w-[1080px] h-[860px] md:h-[760px] max-h-[100dvh] overflow-hidden bg-[#0B0B0F] text-[#F3F1EC] rounded-none md:rounded-[1.75rem] shadow-2xl border border-white/5 flex flex-col"
        style={{ fontFamily: "'Space Grotesk', ui-sans-serif, system-ui" }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
          .font-display { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.04em; }
          .font-mono2 { font-family: 'JetBrains Mono', monospace; }
          .scrollbar-thin::-webkit-scrollbar { width: 6px; }
          .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
          @keyframes fadeUp { from{opacity:0; transform:translateY(8px)} to{opacity:1; transform:translateY(0)} }
          @keyframes hopUp {
            0%   { transform: translateY(220px) scale(0.4); opacity: 0; }
            45%  { transform: translateY(-24px) scale(1.14); opacity: 1; }
            62%  { transform: translateY(0px) scale(0.96); }
            78%  { transform: translateY(-8px) scale(1.03); }
            100% { transform: translateY(0px) scale(1); }
          }
          @keyframes shadowPulse {
            0%   { opacity: 0; transform: translateX(-50%) scale(0.3); }
            45%  { opacity: 0.15; transform: translateX(-50%) scale(1.3); }
            62%  { opacity: 0.5; transform: translateX(-50%) scale(1); }
            78%  { opacity: 0.3; transform: translateX(-50%) scale(1.15); }
            100% { opacity: 0.45; transform: translateX(-50%) scale(1); }
          }
          @keyframes signatureIn {
            0%   { opacity: 0; letter-spacing: 0.9em; transform: translateY(6px); }
            100% { opacity: 1; letter-spacing: 0.4em; transform: translateY(0); }
          }
          .anim-hopUp { animation: hopUp 1.15s cubic-bezier(.34,1.1,.4,1) both; }
          .anim-shadowPulse { animation: shadowPulse 1.15s ease both; }
          .anim-signature { animation: signatureIn 1s ease 1.1s both; }
          .anim-fadeUp { animation: fadeUp .5s ease both; }
          @keyframes bubbleIn { 0%{ opacity:0; transform: translateY(10px) scale(0.94); } 100%{ opacity:1; transform: translateY(0) scale(1); } }
          .anim-bubbleIn { animation: bubbleIn .35s cubic-bezier(.2,.8,.25,1) both; }
          @keyframes typingDot { 0%,60%,100%{ transform: translateY(0); opacity:.4 } 30%{ transform: translateY(-3px); opacity:1 } }
          .anim-typingDot { animation: typingDot 1s ease-in-out infinite; }
        `}</style>

        {stage === "intro" && <IntroScreen theme={theme} onDone={() => setIntroDone(true)} />}

        {stage === "auth" && (
          <div key="auth" className="flex-1 flex flex-col min-h-0 anim-fadeUp">
            <AuthScreen theme={theme} />
          </div>
        )}

        {stage === "roleSelect" && profile && (
          <div key="roleSelect" className="flex-1 flex flex-col min-h-0 anim-fadeUp">
            <RoleSelectScreen
              theme={theme}
              onPick={async (role) => {
                await api.setRole(session.user.id, role);
                setProfile((p) => ({ ...p, role }));
                setStage("app");
              }}
            />
          </div>
        )}

        {stage === "app" && profile && (
          <div key="app" className="flex-1 flex flex-col min-h-0 anim-fadeUp">
            <MainApp
              theme={theme}
              themeKey={themeKey}
              setThemeKey={setThemeKey}
              currentUser={profile}
              setCurrentUser={setProfile}
              onLogout={handleLogout}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- Intro ----------------------------- */

function IntroScreen({ theme, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden" onClick={onDone}>
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 55%, ${theme.accent}33, transparent 65%)` }} />
      <div className="relative text-center">
        <div className="anim-hopUp font-display text-[8rem] leading-none" style={{ color: theme.accent, textShadow: `0 0 50px ${theme.accent}77` }}>Z</div>
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[-6px] w-16 h-3 rounded-full bg-black anim-shadowPulse" style={{ boxShadow: `0 0 20px 4px ${theme.accent}55` }} />
      </div>
      <div className="absolute bottom-28 font-display tracking-[0.4em] text-xl anim-signature" style={{ color: theme.accent2 || theme.accent }}>ZESPO</div>
      <div className="absolute bottom-10 text-[10px] font-mono2 text-white/25 anim-fadeUp" style={{ animationDelay: "1.4s" }}>tap to skip</div>
    </div>
  );
}

/* ----------------------------- Auth ----------------------------- */

function AuthScreen({ theme }) {
  const [mode, setMode] = useState("login");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginP, setLoginP] = useState("");

  const [realName, setRealName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function doLogin() {
    setErr(""); setBusy(true);
    try {
      await api.signIn({ email: loginEmail.trim(), password: loginP });
    } catch (e) {
      setErr(e.message || "Couldn't log in.");
    } finally { setBusy(false); }
  }
async function doRegister() {
    setErr("");
    if (!realName.trim() || !username.trim() || !email.trim() || !password) {
      setErr("Fill in every field first."); return;
    }
    if (password.length < 8) { setErr("Password needs to be at least 8 characters."); return; }
    setBusy(true);
    try {
      await api.signUp({ email: email.trim(), password, realName, username });
  
    } catch (e) {
      setErr(e.message || "Couldn't create that account.");
    } finally { setBusy(false); }
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto scrollbar-thin px-6 pt-10 pb-8" style={{ background: `radial-gradient(circle at 50% -10%, ${theme.accent}22, transparent 60%)` }}>
      <div className="font-display text-4xl mb-1" style={{ color: theme.accent }}>ZESPO</div>
      <div className="text-white/40 text-xs font-mono2 mb-8">access requires clearance</div>

      <div className="flex bg-white/5 rounded-xl p-1 mb-6">
        <button onClick={() => { setMode("login"); setErr(""); }}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${mode === "login" ? "bg-white/10 text-white" : "text-white/40"}`}>Log in</button>
        <button onClick={() => { setMode("register"); setErr(""); }}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${mode === "register" ? "bg-white/10 text-white" : "text-white/40"}`}>Register</button>
      </div>

      {mode === "login" ? (
        <div className="flex flex-col gap-3">
          <Field label="Email" value={loginEmail} onChange={setLoginEmail} placeholder="you@example.com" />
          <Field label="Password" value={loginP} onChange={setLoginP} placeholder="••••••••" type="password" onEnter={doLogin} />
          {err && <div className="text-xs text-red-400 font-mono2">{err}</div>}
          <button type="button" disabled={busy} onClick={doLogin} className="mt-2 rounded-xl py-3 font-semibold text-black active:opacity-80 active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: theme.accent }}>
            {busy && <Loader2 size={14} className="animate-spin" />} Enter Zespo
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Field label="Real name" value={realName} onChange={setRealName} placeholder="Full name" />
          <Field label="Email" value={email} onChange={setEmail} placeholder="you@example.com" />
          <Field label="Username" value={username} onChange={setUsername} placeholder="pick a username" />
          <Field label="Password" value={password} onChange={setPassword} placeholder="8+ characters" type="password" onEnter={doRegister} />
          {err && <div className="text-xs text-red-400 font-mono2">{err}</div>}
          <button type="button" disabled={busy} onClick={doRegister} className="mt-2 rounded-xl py-3 font-semibold text-black active:opacity-80 active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: theme.accent }}>
            {busy && <Loader2 size={14} className="animate-spin" />} Create account
          </button>
        </div>
      )}
    </div>
  );
}

const Field = React.memo(function Field({ label, value, onChange, placeholder, type = "text", onEnter }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-wide text-white/40 font-mono2">{label}</span>
      <input
        value={value}
        type={type}
        autoComplete={type === "password" ? "new-password" : "off"}
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && onEnter) onEnter(); }}
        placeholder={placeholder}
        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30 transition placeholder:text-white/25 text-white"
        style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
      />
    </label>
  );
});

/* ----------------------------- Role Select ----------------------------- */

function RoleSelectScreen({ theme, onPick }) {
  const [focused, setFocused] = useState(null);
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin px-5 pt-8 pb-8">
      <div className="font-mono2 text-[11px] text-white/40 mb-1">SYSTEM // ACCESS_MATRIX.exe</div>
      <div className="font-display text-3xl mb-1" style={{ color: theme.accent }}>define your clearance</div>
      <div className="text-white/50 text-sm mb-6 leading-relaxed">
        Pick a lane. Most of the roster is gated behind logic, not
        locks — everything marked <span className="font-mono2">¬∃</span> means
        <span className="text-white/70"> "does not exist for you yet."</span> Talk to the moderator if you want in.
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8 max-w-2xl">
        {SELECTABLE_ROLES.map((r, i) => (
          <button key={r} onClick={() => onPick(r)}
            className="anim-fadeUp rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 active:scale-95 transition p-4 flex flex-col items-center gap-2"
            style={{ boxShadow: `inset 0 0 0 1px ${theme.accent}22`, animationDelay: `${i * 60}ms` }}>
            <span className="text-xl font-mono2" style={{ color: theme.accent }}>{glyph(i)}</span>
            <span className="text-xs font-semibold capitalize">{r}</span>
          </button>
        ))}
      </div>

      <div className="text-[11px] uppercase tracking-wide text-white/30 font-mono2 mb-2">Rest of the roster</div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 mb-4 max-w-3xl">
        {HERO_ROSTER.map((r, i) => (
          <button key={r} onClick={() => setFocused(r)}
            className="anim-fadeUp rounded-xl border border-white/5 bg-white/[0.03] p-3 flex flex-col items-center gap-1.5 text-white/50 hover:text-white/80 hover:border-white/15 active:scale-95 transition"
            style={{ animationDelay: `${180 + i * 35}ms` }}>
            <span className="font-mono2 text-sm">{glyph(i + 3)}</span>
            <span className="text-[10px] capitalize text-center leading-tight">{r}</span>
          </button>
        ))}
      </div>

      {focused && (
        <div className="rounded-2xl border p-4 anim-fadeUp" style={{ borderColor: `${theme.accent}55`, background: `${theme.accent}0f` }}>
          <div className="flex items-center gap-2 mb-2 font-mono2 text-xs" style={{ color: theme.accent }}>
            <span>{glyph(7)}</span><span>ACCESS DENIED — role reserved</span>
          </div>
          <div className="text-sm text-white/70 mb-3">
            <span className="capitalize font-semibold">{focused}</span> isn't self-serve. Contact the moderator to request it.
          </div>
          <div className="flex items-center gap-3 bg-black/30 rounded-xl p-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg">{MOD_PROFILE.pfp}</div>
            <div>
              <div className="text-sm font-semibold">{MOD_PROFILE.displayName}</div>
              <div className="text-[11px] text-white/40 font-mono2">@{MOD_PROFILE.username}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------- Main App Shell ----------------------------- */

function MainApp(props) {
  const { theme, currentUser, onLogout } = props;
  const [tab, setTab] = useState("chats");
  const [openChatUser, setOpenChatUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const isPrivileged = ["admin", "developer", "admin+developer"].includes(currentUser.role);

  useEffect(() => {
    api.listAnnouncements().then(setAnnouncements).catch(() => {});
    return api.subscribeToAnnouncements((a) => setAnnouncements((prev) => [a, ...prev]));
  }, []);

  const tabs = [
    { key: "chats", label: "Chats", icon: MessageSquare },
    { key: "moderator", label: "Mod bot", icon: ShieldCheck },
    { key: "stories", label: "Stories", icon: Radio },
    { key: "lens", label: "AR lens", icon: Camera },
    { key: "suggest", label: "Suggest", icon: Sparkles },
    { key: "profile", label: "Profile", icon: UserCircle2 },
    ...(isPrivileged ? [{ key: "dev", label: "Dev", icon: Code2 }] : []),
  ];

  const sharedProps = { ...props, announcements, pushAnnouncement: (t, k) => api.postAnnouncement(t, k) };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-0">
      <SideNav theme={theme} tabs={tabs} tab={tab} setTab={(t) => { setTab(t); setOpenChatUser(null); }} currentUser={currentUser} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-h-0">
        <TopBar theme={theme} tab={tab} announcementsCount={announcements.length} onLogout={onLogout} />
        <div key={tab} className="flex-1 min-h-0 anim-fadeUp">
          {tab === "chats" && <ChatsTab {...sharedProps} openChatUser={openChatUser} setOpenChatUser={setOpenChatUser} />}
          {tab === "moderator" && <ModeratorTab {...sharedProps} />}
          {tab === "stories" && <StoriesTab {...sharedProps} />}
          {tab === "lens" && <ARLensTab {...sharedProps} />}
          {tab === "suggest" && <SuggestTab {...sharedProps} />}
          {tab === "profile" && <ProfileTab {...sharedProps} setTab={setTab} />}
          {tab === "dev" && isPrivileged && <DeveloperTab {...sharedProps} />}
        </div>
        <BottomNav theme={theme} tabs={tabs} tab={tab} setTab={(t) => { setTab(t); setOpenChatUser(null); }} />
      </div>
    </div>
  );
}

function TopBar({ theme, tab, announcementsCount, onLogout }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/30 md:hidden">
      <div className="flex items-center gap-2">
        <span className="font-display text-xl" style={{ color: theme.accent }}>Z</span>
        <span className="text-xs text-white/40 font-mono2 capitalize">{tab}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Bell size={16} className="text-white/50" />
          {announcementsCount > 0 && <span className="absolute -top-1.5 -right-1.5 text-[9px] bg-red-500 rounded-full w-3.5 h-3.5 flex items-center justify-center">{Math.min(9, announcementsCount)}</span>}
        </div>
        <button onClick={onLogout} title="Log out"><LogOut size={16} className="text-white/40" /></button>
      </div>
    </div>
  );
}

function BottomNav({ theme, tabs, tab, setTab }) {
  return (
    <div className="flex md:hidden items-center justify-around border-t border-white/5 bg-black/40 py-2 px-1">
      {tabs.map(t => {
        const Icon = t.icon;
        const active = tab === t.key;
        return (
          <button key={t.key} onClick={() => setTab(t.key)} className="flex flex-col items-center gap-0.5 px-2 py-1 active:scale-90 transition-transform">
            <Icon size={18} color={active ? theme.accent : "#8B8B99"} />
            <span className="text-[9px]" style={{ color: active ? theme.accent : "#8B8B99" }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function SideNav({ theme, tabs, tab, setTab, currentUser, onLogout }) {
  return (
    <div className="hidden md:flex flex-col w-56 border-r border-white/5 bg-black/30 py-5 px-3">
      <div className="flex items-center gap-2 px-2 mb-6">
        <span className="font-display text-2xl" style={{ color: theme.accent }}>Z</span>
        <span className="font-display text-lg tracking-widest text-white/70">ESPO</span>
      </div>
      <div className="flex items-center gap-2 px-2 mb-6">
        <Avatar url={currentUser.pfp_url} size={32} />
        <div className="min-w-0">
          <div className="text-xs font-medium truncate">{currentUser.real_name}</div>
          <div className="text-[10px] text-white/40 font-mono2 truncate">@{currentUser.username}</div>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
              style={{ background: active ? `${theme.accent}1f` : "transparent", color: active ? theme.accent : "#8B8B99" }}>
              <Icon size={16} />{t.label}
            </button>
          );
        })}
      </div>
      <button onClick={onLogout} className="mt-auto flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/70">
        <LogOut size={16} /> Log out
      </button>
    </div>
  );
}

/* ----------------------------- Chats ----------------------------- */

function ChatsTab({ theme, currentUser, pushAnnouncement, openChatUser, setOpenChatUser }) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [myConnections, setMyConnections] = useState([]);
  const [sentTo, setSentTo] = useState(new Set());

  async function refresh() {
    const [all, reqs, conns] = await Promise.all([
      api.listProfiles(),
      api.listIncomingRequests(currentUser.id),
      api.listMyConnections(currentUser.id),
    ]);
    setUsers(all.filter(u => u.id !== currentUser.id));
    setIncoming(reqs);
    setMyConnections(conns);
  }

  useEffect(() => { refresh(); }, [currentUser.id]);

  const filtered = users.filter(u => u.username.toLowerCase().includes(query.toLowerCase()) || u.real_name.toLowerCase().includes(query.toLowerCase()));

  async function sendRequest(target) {
    await api.sendMessageRequest(currentUser.id, target.id);
    setSentTo(prev => new Set(prev).add(target.id));
    pushAnnouncement(`${currentUser.username} sent a message request to ${target.username}.`, "request");
  }

  async function acceptRequest(req) {
    await api.acceptMessageRequest(req.id, req.from_id, currentUser.id);
    refresh();
  }

  const listPane = (
    <div className={`${openChatUser ? "hidden" : "flex"} md:flex flex-col h-full w-full md:w-80 md:border-r md:border-white/5 overflow-y-auto scrollbar-thin px-4 py-4`}>
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 mb-4">
        <Search size={14} className="text-white/40" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search every username on Zespo"
          className="bg-transparent outline-none text-sm flex-1 placeholder:text-white/30" />
      </div>

      {incoming.length > 0 && (
        <div className="mb-4">
          <div className="text-[11px] uppercase text-white/30 font-mono2 mb-2">Message requests</div>
          {incoming.map(r => (
            <div key={r.id} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2 mb-1.5 anim-bubbleIn">
              <span className="text-sm">@{r.from_profile?.username}</span>
              <button onClick={() => acceptRequest(r)} className="text-xs px-2.5 py-1 rounded-lg active:scale-95 transition-transform" style={{ background: theme.accent, color: "#000" }}>Accept</button>
            </div>
          ))}
        </div>
      )}

      <div className="text-[11px] uppercase text-white/30 font-mono2 mb-2">People</div>
      <div className="flex flex-col gap-1.5">
        {filtered.map(u => {
          const connected = myConnections.includes(u.id);
          const requested = sentTo.has(u.id);
          const active = openChatUser?.id === u.id;
          return (
            <div key={u.id} className="flex items-center justify-between rounded-xl px-3 py-2.5 transition"
              style={{ background: active ? `${theme.accent}1a` : "rgba(255,255,255,0.03)" }}>
              <button className="flex items-center gap-3 text-left" onClick={() => connected && setOpenChatUser(u)}>
                <Avatar url={u.pfp_url} size={36} />
                <div>
                  <div className="text-sm font-medium">{u.real_name}</div>
                  <div className="text-[11px] text-white/40 font-mono2">@{u.username} · {u.role}</div>
                </div>
              </button>
              {!connected && (
                <button disabled={requested} onClick={() => sendRequest(u)}
                  className="text-[11px] px-2.5 py-1.5 rounded-lg border border-white/15 text-white/60 disabled:opacity-40 active:scale-95 transition-transform">
                  {requested ? "Requested" : "Message"}
                </button>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <div className="text-xs text-white/30 mt-4">Nobody matches that search.</div>}
      </div>
    </div>
  );

  const threadPane = openChatUser ? (
    <div className="flex md:flex flex-col h-full flex-1">
      <ChatThread theme={theme} me={currentUser} other={openChatUser} onBack={() => setOpenChatUser(null)} />
    </div>
  ) : (
    <div className="hidden md:flex flex-col items-center justify-center flex-1 text-white/20 text-sm gap-2">
      <MessageSquare size={22} /> Pick someone to chat with
    </div>
  );

  return <div className="h-full flex">{listPane}{threadPane}</div>;
}

function ChatThread({ theme, me, other, onBack }) {
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    let alive = true;
    api.fetchThread(me.id, other.id).then((rows) => { if (alive) setMsgs(rows); });
    const unsub = api.subscribeToThread(me.id, other.id, (m) => setMsgs((prev) => [...prev, m]));
    return () => { alive = false; unsub(); };
  }, [me.id, other.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs.length]);

  async function send() {
    if (!text.trim()) return;
    const body = text.trim();
    setText("");
    await api.sendMessage(me.id, other.id, body);
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
        <button onClick={onBack}><ChevronLeft size={18} /></button>
        <Avatar url={other.pfp_url} size={32} />
        <div className="text-sm font-medium">@{other.username}</div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3 flex flex-col gap-2">
        {msgs.length === 0 && <div className="text-xs text-white/30 text-center mt-6">Say hi to @{other.username}.</div>}
        {msgs.map((m) => (
          <div key={m.id} className={`anim-bubbleIn max-w-[75%] px-3 py-2 rounded-2xl text-sm ${m.from_id === me.id ? "self-end text-black" : "self-start bg-white/10"}`}
            style={m.from_id === me.id ? { background: theme.accent } : {}}>
            {m.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center gap-2 p-3 border-t border-white/5">
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Message..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none" />
        <button onClick={send} className="p-2.5 rounded-xl" style={{ background: theme.accent }}><Send size={16} className="text-black" /></button>
      </div>
    </div>
  );
}

/* ----------------------------- Moderator Bot ----------------------------- */

function ModeratorTab({ theme, currentUser, pushAnnouncement }) {
  const [log, setLog] = useState([
    { from: "bot", text: `Hey @${currentUser.username}. I'm the moderator bot — I can point you to how invite codes and roles work, or log a custom issue for the team. What do you need?` },
  ]);
  const [issueText, setIssueText] = useState("");
  const [showIssueBox, setShowIssueBox] = useState(false);
  const [working, setWorking] = useState(false);

  function say(text, from = "bot") { setLog(l => [...l, { from, text }]); }

  function handleOption(opt) {
    say(opt, "me");
    if (opt === "Invite codes") {
      say("Invite codes are issued by an admin, one at a time — I don't have the ability to hand them out myself. Ask an admin directly.");
    } else if (opt === "Role selection") {
      say("Pick amrsg, amrsj, or none yourself on the role screen. Anything from the hero roster is reserved — tell me which one and why, and I'll flag it for review.");
    } else if (opt === "Custom issue") {
      setShowIssueBox(true);
      say("Describe what's broken and I'll route it to the team.");
    }
  }

  async function submitIssue() {
    if (!issueText.trim()) return;
    say(issueText, "me");
    const submitted = issueText.trim();
    setIssueText(""); setShowIssueBox(false); setWorking(true);
    await pushAnnouncement(`Custom issue from @${currentUser.username}: "${submitted}"`, "issue");
    try {
      await api.fileReport(currentUser.id, submitted, "Filed by the moderator bot — awaiting developer review.");
      say("Filed a report for the developers. They'll follow up if it needs more.");
    } catch {
      say("Couldn't file that just now — try again in a bit.");
    } finally { setWorking(false); }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-lg">{MOD_PROFILE.pfp}</div>
        <div>
          <div className="text-sm font-semibold">{MOD_PROFILE.displayName}</div>
          <div className="text-[11px] text-white/40 font-mono2">limited-option assistant</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3 flex flex-col gap-2">
        {log.map((m, i) => (
          <div key={i} className={`anim-bubbleIn max-w-[80%] px-3 py-2 rounded-2xl text-sm ${m.from === "me" ? "self-end text-black" : "self-start bg-white/10"}`}
            style={m.from === "me" ? { background: theme.accent } : {}}>{m.text}</div>
        ))}
        {working && (
          <div className="anim-bubbleIn self-start flex items-center gap-1.5 bg-white/10 rounded-2xl px-3 py-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white/50 anim-typingDot" style={{ animationDelay: "0s" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-white/50 anim-typingDot" style={{ animationDelay: ".15s" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-white/50 anim-typingDot" style={{ animationDelay: ".3s" }} />
          </div>
        )}
      </div>
      {showIssueBox && (
        <div className="px-4 pb-2 flex gap-2">
          <input value={issueText} onChange={e => setIssueText(e.target.value)} placeholder="What's going wrong?"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none" />
          <button onClick={submitIssue} className="px-3 rounded-xl text-sm" style={{ background: theme.accent, color: "#000" }}>Send</button>
        </div>
      )}
      <div className="px-4 py-3 border-t border-white/5 flex gap-2 flex-wrap">
        {["Invite codes", "Role selection", "Custom issue"].map(o => (
          <button key={o} onClick={() => handleOption(o)} className="text-xs px-3 py-2 rounded-full border border-white/15 text-white/70 hover:bg-white/5">{o}</button>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- Stories ----------------------------- */

function StoriesTab({ theme }) {
  const [users, setUsers] = useState([]);
  const [stories, setStories] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [openProfile, setOpenProfile] = useState(null);
  const holdTimer = useRef(null);

  useEffect(() => {
    api.listProfiles().then(setUsers);
    api.listStories().then(setStories);
  }, []);

  function storiesFor(u) { return stories.filter(s => s.owner_id === u.id); }
  function startHold(u) { holdTimer.current = setTimeout(() => setOpenProfile(u), 480); }
  function endHold() { clearTimeout(holdTimer.current); }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin px-4 md:px-8 py-4 md:max-w-3xl md:mx-auto">
      <div className="text-[11px] uppercase text-white/30 font-mono2 mb-3">Tap a face for their story · hold for their profile</div>
      <div className="flex gap-4 flex-wrap">
        {users.map(u => {
          const hasStory = storiesFor(u).length > 0;
          return (
            <button key={u.id}
              onMouseDown={() => startHold(u)} onMouseUp={endHold} onMouseLeave={endHold}
              onTouchStart={() => startHold(u)} onTouchEnd={endHold}
              onClick={() => hasStory && setViewing(u)}
              className="flex flex-col items-center gap-1.5 w-16">
              <div className="rounded-full" style={{ boxShadow: hasStory ? `0 0 0 2.5px ${theme.accent}` : "0 0 0 2px rgba(255,255,255,0.1)" }}>
                <Avatar url={u.pfp_url} size={56} />
              </div>
              <span className="text-[10px] text-white/50 truncate w-full text-center">{u.username}</span>
            </button>
          );
        })}
      </div>

      {viewing && (
        <Modal onClose={() => setViewing(null)}>
          <div className="text-sm font-semibold mb-2">@{viewing.username}'s story</div>
          <div className="flex flex-col gap-2">
            {storiesFor(viewing).map(s => (
              <img key={s.id} src={s.image_url} className="rounded-xl w-full aspect-[9/16] object-cover bg-white/5" />
            ))}
          </div>
        </Modal>
      )}

      {openProfile && (
        <Modal onClose={() => setOpenProfile(null)}>
          <PublicProfileCard u={openProfile} theme={theme} />
        </Modal>
      )}
    </div>
  );
}

function PublicProfileCard({ u, theme }) {
  return (
    <div>
      <div className="h-20 rounded-xl mb-[-28px]" style={{ background: u.banner?.value || theme.accent }} />
      <Avatar url={u.pfp_url} size={56} />
      <div className="mt-2">
        <div className="text-base font-semibold">{u.real_name}</div>
        <div className="text-xs text-white/40 font-mono2">@{u.username} · {u.role}</div>
        {u.song && <div className="text-xs text-white/50 mt-2 flex items-center gap-1.5"><Music2 size={12} /> {u.song}</div>}
        {u.playing && <div className="text-xs text-white/50 mt-1 flex items-center gap-1.5"><Gamepad2 size={12} /> {u.playing}</div>}
      </div>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70" onClick={onClose}>
      <div className="bg-[#14141b] w-full sm:w-[380px] rounded-t-2xl sm:rounded-2xl p-5 max-h-[80%] overflow-y-auto scrollbar-thin" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="float-right text-white/40"><X size={16} /></button>
        {children}
      </div>
    </div>
  );
}

/* ----------------------------- AR Lens ----------------------------- */

function ARLensTab({ currentUser, theme }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const [shotBlob, setShotBlob] = useState(null);
  const [shotUrl, setShotUrl] = useState(null);
  const [lens, setLens] = useState("sparkle");
  const [saving, setSaving] = useState(false);

  useEffect(() => () => stopCamera(), []);

  async function startCamera() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setStreaming(true);
    } catch {
      setError("Camera access wasn't granted — check your browser's site permissions.");
    }
  }

  function stopCamera() {
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStreaming(false);
  }

  function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    // simple lens tint overlays; swap for real filters/WebGL as needed
    const tints = { sparkle: "rgba(255,255,255,0.08)", flame: "rgba(255,90,0,0.15)", frost: "rgba(120,200,255,0.15)", glitch: "rgba(150,0,255,0.15)" };
    ctx.fillStyle = tints[lens] || "transparent";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      setShotBlob(blob);
      setShotUrl(URL.createObjectURL(blob));
    }, "image/png");
  }

  async function saveToStory() {
    if (!shotBlob) return;
    setSaving(true);
    try {
      const url = await api.uploadStoryImage(currentUser.id, shotBlob);
      await api.postStory(currentUser.id, url);
      setShotBlob(null); setShotUrl(null);
    } catch {
      setError("Couldn't save that story — try again.");
    } finally { setSaving(false); }
  }

  return (
    <div className="h-full flex flex-col px-4 py-4">
      <div className="text-[11px] text-white/40 font-mono2 mb-3">
        Camera only turns on while you're on this tab, only for you, and nothing is sent anywhere unless you save it.
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <div className="relative flex-1 rounded-2xl bg-black/60 border border-white/10 overflow-hidden flex items-center justify-center mb-3">
        {streaming ? (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        ) : (
          <div className="text-center px-6">
            <Camera size={28} className="mx-auto mb-2 text-white/30" />
            <div className="text-xs text-white/40">{error || "Camera preview appears here once enabled."}</div>
          </div>
        )}
        {shotUrl && <img src={shotUrl} className="absolute inset-0 w-full h-full object-cover" />}
      </div>

      <div className="flex gap-2 mb-3">
        {["sparkle", "flame", "frost", "glitch"].map(l => (
          <button key={l} onClick={() => setLens(l)}
            className="flex-1 py-2 rounded-xl text-xs capitalize border"
            style={{ borderColor: lens === l ? theme.accent : "rgba(255,255,255,0.1)", color: lens === l ? theme.accent : "#8B8B99" }}>
            {l}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {!streaming && !shotUrl && <button onClick={startCamera} className="flex-1 py-3 rounded-xl font-semibold text-black active:scale-[0.98] transition-transform" style={{ background: theme.accent }}>Enable camera</button>}
        {streaming && !shotUrl && (
          <>
            <button onClick={capture} className="flex-1 py-3 rounded-xl font-semibold text-black active:scale-[0.98] transition-transform" style={{ background: theme.accent }}>Capture</button>
            <button onClick={stopCamera} className="px-4 py-3 rounded-xl border border-white/15 text-sm">Stop</button>
          </>
        )}
        {shotUrl && (
          <>
            <button disabled={saving} onClick={saveToStory} className="flex-1 py-3 rounded-xl font-semibold text-black active:scale-[0.98] transition-transform disabled:opacity-50" style={{ background: theme.accent }}>{saving ? "Saving…" : "Save to story"}</button>
            <button onClick={() => { setShotBlob(null); setShotUrl(null); }} className="px-4 py-3 rounded-xl border border-white/15 text-sm">Discard</button>
          </>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- Suggestions ----------------------------- */

function SuggestTab({ theme, currentUser }) {
  const [text, setText] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => { api.listSuggestions().then(setSuggestions); }, []);

  async function submit() {
    if (!text.trim()) return;
    const body = text.trim();
    setText("");
    await api.postSuggestion(currentUser.id, body);
    setSuggestions(s => [{ id: `local-${Date.now()}`, text: body, created_at: new Date().toISOString(), profiles: { username: currentUser.username } }, ...s]);
  }

  return (
    <div className="h-full flex flex-col px-4 md:px-8 py-4 md:max-w-2xl md:mx-auto w-full">
      <div className="text-[11px] uppercase text-white/30 font-mono2 mb-3">Everyone can post here — it's how Zespo gets better</div>
      <div className="flex gap-2 mb-4">
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Suggest something..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none" />
        <button onClick={submit} className="px-3 rounded-xl" style={{ background: theme.accent, color: "#000" }}><PlusCircle size={16} /></button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin flex flex-col gap-2">
        {suggestions.map(s => (
          <div key={s.id} className="bg-white/[0.04] rounded-xl px-3 py-2.5">
            <div className="text-sm">{s.text}</div>
            <div className="text-[10px] text-white/30 font-mono2 mt-1">@{s.profiles?.username} · {new Date(s.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- Profile ----------------------------- */

function ProfileTab({ theme, themeKey, setThemeKey, currentUser, setCurrentUser, setTab, onLogout }) {
  const [realName, setRealName] = useState(currentUser.real_name);
  const [username, setUsername] = useState(currentUser.username);
  const [song, setSong] = useState(currentUser.song || "");
  const [playing, setPlaying] = useState(currentUser.playing || "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [resetErr, setResetErr] = useState("");
  const [resetOk, setResetOk] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const bannerFileRef = useRef(null);

  async function saveBasics() {
    const patch = { real_name: realName, username, song, playing };
    await api.updateProfile(currentUser.id, patch);
    setCurrentUser(u => ({ ...u, ...patch }));
  }

  async function onPfpFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await api.uploadAvatar(currentUser.id, file);
      await api.updateProfile(currentUser.id, { pfp_url: url });
      setCurrentUser(u => ({ ...u, pfp_url: url }));
    } finally { setUploading(false); }
  }

  async function setBanner(value) {
    await api.updateProfile(currentUser.id, { banner: { type: "static", value } });
    setCurrentUser(u => ({ ...u, banner: { type: "static", value } }));
  }

  const BANNER_PRESETS = [
    { label: "Signal", value: `linear-gradient(135deg, ${theme.accent}, #111)` },
    { label: "Aurora", value: "linear-gradient(135deg,#33E6CC,#B388FF)" },
    { label: "Ember", value: "linear-gradient(135deg,#E8A33D,#C2410C)" },
    { label: "Void", value: "linear-gradient(135deg,#1c1c24,#000)" },
  ];

  async function doReset() {
    setResetErr(""); setResetOk(false);
    if (!newPass || newPass.length < 8) { setResetErr("New password needs to be at least 8 characters."); return; }
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) { setResetErr(error.message); return; }
    setResetOk(true);
    setNewPass("");
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin px-4 md:px-8 py-4 md:max-w-xl md:mx-auto w-full">
      <div className="h-24 rounded-2xl mb-[-30px]" style={{ background: currentUser.banner?.value }} />
      <button onClick={() => bannerFileRef.current?.click()} className="text-[10px] text-white/50 float-right mt-1 mr-1 relative z-10">edit banner</button>
      <input ref={bannerFileRef} type="file" accept="image/*" hidden />
      <Avatar url={currentUser.pfp_url} size={64} />
      <button onClick={() => fileRef.current?.click()} disabled={uploading} className="text-[10px] text-white/50 mb-4 block mt-1">{uploading ? "uploading…" : "change pfp"}</button>
      <input ref={fileRef} type="file" accept="image/*" onChange={onPfpFile} hidden />

      <div className="grid grid-cols-2 gap-2 mb-4">
        {BANNER_PRESETS.map(b => (
          <button key={b.label} onClick={() => setBanner(b.value)}
            className="h-10 rounded-xl text-[11px] font-semibold flex items-center justify-center" style={{ background: b.value }}>{b.label}</button>
        ))}
      </div>

      <div className="flex flex-col gap-3 mb-5">
        <Field label="Display name" value={realName} onChange={setRealName} />
        <Field label="Username" value={username} onChange={setUsername} />
        <Field label="Profile song" value={song} onChange={setSong} placeholder="track name or link" />
        <Field label="Currently playing" value={playing} onChange={setPlaying} placeholder="a game" />
        <button onClick={saveBasics} className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-black active:scale-[0.98] transition-transform" style={{ background: theme.accent }}><Save size={14} /> Save changes</button>
      </div>

      <div className="mb-5">
        <div className="text-[11px] uppercase text-white/30 font-mono2 mb-2 flex items-center gap-1.5"><Palette size={12} /> UI theme</div>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(THEMES).map(([key, t]) => (
            <button key={key} onClick={() => setThemeKey(key)}
              className="rounded-xl h-12 flex items-center justify-center text-[10px] font-semibold border-2"
              style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`, borderColor: themeKey === key ? "#fff" : "transparent" }}>
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-5">
        <button onClick={() => setShowReset(s => !s)} className="flex items-center gap-2 text-sm text-white/70 bg-white/5 rounded-xl px-3 py-2.5"><KeyRound size={14} /> Reset password</button>
        {showReset && (
          <div className="bg-white/[0.04] rounded-xl p-3 flex flex-col gap-2">
            <Field label="New password" type="password" value={newPass} onChange={setNewPass} />
            {resetErr && <div className="text-[11px] text-red-400">{resetErr}</div>}
            {resetOk && <div className="text-[11px] text-green-400">Password updated.</div>}
            <button onClick={doReset} className="py-2 rounded-lg text-sm font-semibold text-black active:scale-[0.98] transition-transform" style={{ background: theme.accent }}>Update password</button>
          </div>
        )}
        <button onClick={() => setTab("moderator")} className="flex items-center gap-2 text-sm text-white/70 bg-white/5 rounded-xl px-3 py-2.5"><MessageCircleWarning size={14} /> Support</button>
      </div>

      <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-xl px-3 py-2.5 mb-6 active:scale-[0.98] transition-transform"><Trash2 size={14} /> Delete account</button>

      {confirmDelete && (
        <Modal onClose={() => setConfirmDelete(false)}>
          <div className="text-sm mb-3">
            Delete your account for good? This can't be undone. Since account deletion needs an elevated
            server permission Supabase doesn't expose to the browser, this signs you out and files a
            deletion request — an admin (or your deletion edge function, see README) finishes it.
          </div>
          <div className="flex gap-2">
            <button onClick={async () => { await api.fileReport(currentUser.id, "ACCOUNT DELETION REQUEST", "User requested account deletion from the Profile tab."); await onLogout(); }} className="flex-1 py-2 rounded-xl bg-red-500 text-sm font-semibold">Delete</button>
            <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2 rounded-xl border border-white/15 text-sm">Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ----------------------------- Developer / Admin ----------------------------- */

function DeveloperTab({ theme }) {
  const [sub, setSub] = useState("log");
  const [users, setUsers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    api.listProfiles().then(rows => setUsers([...rows].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))));
    api.listAnnouncements().then(setAnnouncements);
    api.listReports().then(setReports);
  }, []);

  function downloadReport(r) {
    const blob = new Blob(
      [`ZESPO — INCIDENT REPORT\nFiled: ${r.created_at}\nFrom: @${r.profiles?.username}\n\nIssue:\n${r.issue}\n\nModerator/AI summary:\n${r.summary || ""}\n`],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `zespo-report-${r.id}.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex gap-2 px-4 pt-3">
        {[["log", "User log"], ["alerts", "Announcements"], ["reports", "Reports"]].map(([key, label]) => (
          <button key={key} onClick={() => setSub(key)}
            className="text-xs px-3 py-1.5 rounded-full"
            style={{ background: sub === key ? theme.accent : "rgba(255,255,255,0.06)", color: sub === key ? "#000" : "#8B8B99" }}>
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3">
        {sub === "log" && (
          <div className="flex flex-col gap-2">
            {users.map(u => (
              <div key={u.id} className="bg-white/[0.04] rounded-xl px-3 py-2.5">
                <div className="text-sm font-medium">{u.real_name} <span className="text-white/40">· @{u.username}</span></div>
                <div className="text-[11px] text-white/40 font-mono2">role: {u.role}</div>
                <div className="text-[10px] text-white/25 font-mono2 mt-1">{new Date(u.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
        {sub === "alerts" && (
          <div className="flex flex-col gap-2">
            {announcements.length === 0 && <div className="text-xs text-white/30">Nothing yet.</div>}
            {announcements.map(a => (
              <div key={a.id} className="bg-white/[0.04] rounded-xl px-3 py-2.5">
                <div className="text-sm">{a.text}</div>
                <div className="text-[10px] text-white/25 font-mono2 mt-1">{new Date(a.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
        {sub === "reports" && (
          <div className="flex flex-col gap-2">
            {reports.length === 0 && <div className="text-xs text-white/30">No reports filed yet.</div>}
            {reports.map(r => (
              <div key={r.id} className="bg-white/[0.04] rounded-xl px-3 py-2.5">
                <div className="text-sm">{r.issue}</div>
                <div className="text-[11px] text-white/50 mt-1">{r.summary}</div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-[10px] text-white/25 font-mono2">@{r.profiles?.username} · {new Date(r.created_at).toLocaleString()}</div>
                  <button onClick={() => downloadReport(r)} className="text-[11px] flex items-center gap-1 px-2 py-1 rounded-lg border border-white/15"><Download size={11} /> Report</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
