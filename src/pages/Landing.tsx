/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogoText } from '../components/Navbar';

/* =============================================================================
   STABLEPERP — landing page in the Hyperliquid (hyperfoundation.org) design
   language, themed for <LogoText />, Signature: interactive isometric
   "The <LogoText /> Stack". Self-contained single file, no external assets.
============================================================================= */

const MINT = "#97FCE4";
const INK = "#0A2622";
const FOREST = "#0A2320";
const FOREST2 = "#061C19";
const CREAM = "#E9F7F0";
const CREAM2 = "#F2FBF7";
const ON_DARK = "#E8F7F1";
const MUT_DARK = "rgba(232,247,241,0.60)";
const MUT_INK = "rgba(10,38,34,0.62)";

const SERIF = "'Fraunces', Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, 'SF Mono', Menlo, monospace";

const Wordmark = ({ color = INK, size = 22 }: any) => (
  <span style={{ fontFamily: SERIF, fontSize: size, color, letterSpacing: "-0.01em" }}>
    Stable<i>perp</i>
  </span>
);

function Logo({ size = 26, glow = true }: any) {
  return (
    <img 
      src="/logo.png" 
      alt="Stableperp Logo" 
      style={{ 
        height: size, 
        width: 'auto', 
        display: "block", 
        filter: glow ? "drop-shadow(0 0 5px rgba(94,234,212,0.6))" : "none" 
      }} 
    />
  );
}

/* ---------- high-quality animated topographic background (canvas) ---------- */
function AnimatedContours({ color = INK, lines = 9, baseAlpha = 0.11 }: any) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let raf = 0, W = 0, H = 0;
    const ctx = (canvas as any).getContext("2d");
    const reduce = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = (canvas as any).clientWidth; H = (canvas as any).clientHeight;
      (canvas as any).width = Math.max(1, W * dpr); (canvas as any).height = Math.max(1, H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H * 0.46;
      const R = Math.max(W, H);
      const step = R / (lines * 1.5);
      for (let i = 0; i < lines; i++) {
        const rBase = step * 0.4 + i * step;
        const amp = step * 0.32;
        const drift = t * 0.00022 * (1 + i * 0.05) + i * 0.55;
        ctx.beginPath();
        for (let a = 0; a <= 360; a += 3) {
          const th = (a * Math.PI) / 180;
          const r = rBase + amp * Math.sin(3 * th + drift) + amp * 0.35 * Math.cos(2 * th - drift * 0.7);
          const x = cx + r * Math.cos(th);
          const y = cy + r * 0.6 * Math.sin(th);
          a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.globalAlpha = Math.max(0.035, baseAlpha - i * 0.006);
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    if (reduce) draw(0);
    else raf = requestAnimationFrame(draw);

    const vis = () => {
      if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
      else if (!reduce && !raf) raf = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", vis);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [color, lines, baseAlpha]);

  return <canvas ref={ref} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

/* ---------- concentric-circle feature icon ---------- */
const Concentric = ({ variant = 0 }: any) => (
  <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
    {variant === 1 ? (
      <>
        <ellipse cx="26" cy="26" rx="24" ry="14" fill="none" stroke={INK} strokeWidth="1.2" opacity="0.5" />
        <ellipse cx="26" cy="26" rx="14" ry="9" fill="none" stroke={INK} strokeWidth="1.2" opacity="0.7" />
        <circle cx="26" cy="26" r="4" fill={INK} opacity="0.8" />
      </>
    ) : variant === 2 ? (
      <>
        <path d="M26 6 C10 6 4 20 4 26 C4 32 10 46 26 46 C42 46 48 32 48 26 C48 20 42 6 26 6Z" fill="none" stroke={INK} strokeWidth="1.2" opacity="0.5" />
        <circle cx="26" cy="26" r="10" fill="none" stroke={INK} strokeWidth="1.2" opacity="0.7" />
        <circle cx="26" cy="26" r="3.5" fill={INK} opacity="0.8" />
      </>
    ) : (
      <>
        <circle cx="26" cy="26" r="22" fill="none" stroke={INK} strokeWidth="1.2" opacity="0.45" />
        <circle cx="26" cy="26" r="14" fill="none" stroke={INK} strokeWidth="1.2" opacity="0.65" />
        <circle cx="26" cy="26" r="6" fill="none" stroke={INK} strokeWidth="1.4" opacity="0.85" />
      </>
    )}
  </svg>
);

/* ================= interactive isometric stack ================= */
const TILE = 54, TILEH = 27;
const iso = (gx: number, gy: number, gz: number) => ({ x: (gx - gy) * TILE, y: (gx + gy) * TILEH - gz });

const STACK = [
  // Left Platform (Core - High gy, Low gx to shift left)
  { id: "perps", label: "Perps", gx: 0, gy: 3.5, h: 110, flag: true },
  { id: "options", label: "Options", gx: 1.5, gy: 3.5, h: 140, flag: true },
  { id: "oracles", label: "Oracles", gx: 0, gy: 5, h: 90 },
  { id: "settlement", label: "Settlement", gx: 1.5, gy: 5, h: 70 },
  { id: "factory", label: "Factory", gx: 0.75, gy: 6.5, h: 80 },
  
  // Right Platform (Ecosystem - High gx, Low gy to shift right)
  { id: "vault", label: "Vaults", gx: 3.5, gy: 0, h: 120 },
  { id: "collateral", label: "Collateral", gx: 5, gy: 0, h: 90 },
  { id: "copilot", label: "Copilot / MCP", gx: 6.5, gy: 0, h: 130 },
  { id: "positions", label: "Positions", gx: 4.25, gy: 1.5, h: 100 },
  { id: "corp", label: "Corp. Actions", gx: 5.75, gy: 1.5, h: 80 },
  { id: "more", label: "And More", gx: 5, gy: 3, h: 110 },
];

function Box({ item }: any) {
  const { gx, gy, h, flag } = item;
  const top = h, base = 0;
  const w = 1.0;
  const A = iso(gx, gy, top), B = iso(gx + w, gy, top), C = iso(gx + w, gy + w, top), D = iso(gx, gy + w, top);
  const B2 = iso(gx + w, gy, base), C2 = iso(gx + w, gy + w, base), D2 = iso(gx, gy + w, base);
  const topC = flag ? MINT : "#245045";
  const rightC = flag ? "#5FD9BE" : "#1B3E36";
  const leftC = flag ? "#37B79A" : "#132E28";
  const poly = (pts: any, fill: any) => <polygon points={pts.map((p: any) => `${p.x},${p.y}`).join(" ")} fill={fill} stroke="rgba(151,252,228,0.22)" strokeWidth={0.8} />;
  const rf = [B, C, C2, B2], lf = [D, C, C2, D2];
  return (
    <g>
      {poly(lf, leftC)}{poly(rf, rightC)}{poly([A, B, C, D], topC)}
    </g>
  );
}

function Platform({ x0, y0, x1, y1, z, color, label, align }: any) {
  const A = iso(x0, y0, z), B = iso(x1, y0, z), C = iso(x1, y1, z), D = iso(x0, y1, z);
  const thick = label === 'SOLANA' ? 40 : 20;
  const B2 = iso(x1, y0, z - thick), C2 = iso(x1, y1, z - thick), D2 = iso(x0, y1, z - thick);
  const top = [A, B, C, D], right = [B, C, C2, B2], left = [D, C, C2, D2];
  
  let tx = 0, ty = 0, rot = 0;
  if (align === 'left') {
    tx = (D.x + C.x)/2 - 35; ty = (D.y + C.y)/2 + 25; rot = 26.5;
  } else if (align === 'right') {
    tx = (B.x + C.x)/2 + 35; ty = (B.y + C.y)/2 + 25; rot = -26.5;
  } else {
    tx = (D.x + C.x)/2; ty = (D.y + C.y)/2 + 45; rot = 26.5;
  }

  return (
    <g>
      <polygon points={right.map(p => `${p.x},${p.y}`).join(" ")} fill="#0A201C" stroke="rgba(151,252,228,0.15)" />
      <polygon points={left.map(p => `${p.x},${p.y}`).join(" ")} fill="#081A16" stroke="rgba(151,252,228,0.15)" />
      <polygon points={top.map(p => `${p.x},${p.y}`).join(" ")} fill={color} stroke="rgba(151,252,228,0.2)" />
      {label && <text x={tx} y={ty} transform={`rotate(${rot} ${tx} ${ty})`} textAnchor="middle" fill="rgba(232,247,241,0.50)" fontSize="13" fontFamily={MONO} letterSpacing="0.2em" fontWeight="600">{label}</text>}
    </g>
  );
}

function StableperpStack() {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 1100, margin: "0 auto", padding: "20px 0" }}>
      <svg viewBox="0 0 1100 760" width="100%" style={{ display: "block", overflow: "visible" }}>
        {/* Connecting Lines (drawn behind) */}
        <g stroke="#2C5F53" strokeWidth="1.5" fill="none">
          {/* Top Left -> Options/Perps */}
          <polyline points="290,110 360,110 420,170" />
          {/* Bottom Left -> Core Platform Base */}
          <polyline points="290,320 330,320 380,370" />
          {/* Right -> Ecosystem Blocks */}
          <polyline points="850,150 780,150 710,220" />
        </g>
        
        {/* Base Layer & Blocks */}
        <g transform="translate(550, 200)">
          <Platform x0={-1} y0={-1} x1={8.5} y1={8.5} z={-40} color="#081A16" label="SOLANA" align="center" />
          
          <Platform x0={-0.5} y0={3} x1={3} y1={8} z={0} color="#0C2A25" label="STABLEPERP CORE" align="left" />
          <Platform x0={3} y0={-0.5} x1={8} y1={4.5} z={0} color="#0C2A25" label="ECOSYSTEM" align="right" />

          {[...STACK].sort((a, b) => a.gx + a.gy - (b.gx + b.gy)).map((it) => (
            <Box key={it.id} item={it} />
          ))}
        </g>
        
        {/* HTML Text overlays via foreignObject */}
        <foreignObject x="40" y="30" width="240" height="150">
          <div style={{ color: "rgba(232,247,241,0.9)", fontFamily: SANS, fontSize: 14, lineHeight: 1.5 }}>
            Options and perps are the flagship applications built natively on <LogoText /> Core. But they are just the tip of the iceberg.
          </div>
        </foreignObject>


        <foreignObject x="860" y="90" width="240" height="200">
          <div style={{ color: "rgba(232,247,241,0.9)", fontFamily: SANS, fontSize: 14, lineHeight: 1.5 }}>
            High performance applications are built natively. The core exists as one unified state on Solana, unlocking applications that simultaneously require performance, liquidity, and programmability.
          </div>
        </foreignObject>

      </svg>
    </div>
  );
}

/* ---------- animated fade-in row ---------- */
function FadeInRow({ children, delay }: any) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setVisible(true);
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(40px)',
      transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`
    }}>
      {children}
    </div>
  );
}

/* ---------- phone mockup (mini terminal) ---------- */
function Phone({ symbol = "NVDA", price = "223.96", color = MINT, rows = [["17.13", "225", "17.45"], ["13.86", "230", "21.16"], ["11.06", "235", "25.34"], ["8.70", "240", "29.95"]] }: any) {
  return (
    <div style={{ width: 280, margin: "0 auto", borderRadius: 40, border: "10px solid #0A2320", background: "#0A0A0A", padding: "14px 12px 18px", boxShadow: "0 30px 60px rgba(10,35,32,0.35)", textAlign: "left" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontFamily: MONO, fontSize: 11, color: color, letterSpacing: "0.15em" }}>STABLEPERP</span>
        <span style={{ fontFamily: MONO, fontSize: 9, color: color, border: `1px solid ${color}55`, borderRadius: 4, padding: "2px 5px" }}>MAINNET</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <span style={{ fontFamily: MONO, fontSize: 18, color: "#fff", fontWeight: 700 }}>{symbol}</span>
        <span style={{ fontFamily: MONO, fontSize: 15, color: color }}>${price}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <span style={{ color: color }}>CALLS</span><span style={{ textAlign: "center" }}>STRIKE</span><span style={{ textAlign: "right" }}>PUTS</span>
      </div>
      {rows.map((r: any, i: number) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", fontFamily: MONO, fontSize: 12, padding: "8px 0", background: i === 0 ? "rgba(255,255,255,0.07)" : "transparent" }}>
          <span style={{ color: color }}>{r[0]}</span>
          <span style={{ textAlign: "center", color: i === 0 ? color : "#fff", fontWeight: 700 }}>{r[1]}</span>
          <span style={{ textAlign: "right", color: "rgba(255,255,255,0.8)" }}>{r[2]}</span>
        </div>
      ))}
      <div style={{ marginTop: 12, textAlign: "center", background: color, color: INK, borderRadius: 999, padding: "10px 0", fontFamily: MONO, fontSize: 12, fontWeight: 700 }}>
        Buy 1 {symbol} {rows[0][1]} Call
      </div>
    </div>
  );
}

const Pill = ({ children, filled, to = "#" }: any) => (
  <Link to={to} style={{
    fontFamily: SANS, fontSize: 16, textDecoration: "none", padding: "15px 34px", borderRadius: 999,
    background: filled ? MINT : "transparent", color: INK,
    border: `1.5px solid ${filled ? MINT : "rgba(10,38,34,0.25)"}`, display: "inline-block", fontWeight: 500,
  }}>{children}</Link>
);

function LiquidLogo() {
  return (
    <div style={{
      position: 'relative', width: 90, height: 200,
      margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="liquid-goo" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
            <feColorMatrix in="blur" mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
              result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div style={{
        filter: 'url(#liquid-goo)',
        width: '100%', height: '100%',
        position: 'absolute',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Main blob A — top ↔ bottom */}
        <div className="ll-a" style={{
          position: 'absolute', width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(145deg, #7EEEFF 0%, #00BFDE 100%)',
        }} />
        {/* Bridge blob — stays at center, permanently connects A & B */}
        <div style={{
          position: 'absolute', width: 18, height: 18, borderRadius: '50%',
          background: '#00CCEC',
          animation: 'll-bridge 9s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
        }} />
        {/* Main blob B — bottom ↔ top */}
        <div className="ll-b" style={{
          position: 'absolute', width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(145deg, #00D4F0 0%, #00A8C8 100%)',
        }} />
      </div>

      <style>{`
        /* 
          Smoothest possible CSS animation: only 2 keyframes + alternate direction.
          Browser interpolates a perfect sine curve between start and end.
          ll-a goes top→bottom, ll-b is the mirror via alternate-reverse.
          No intermediate stops = zero jitter/jerk.
        */
        .ll-a { animation: ll-move 8s ease-in-out infinite alternate; }
        .ll-b { animation: ll-move 8s ease-in-out infinite alternate-reverse; }

        @keyframes ll-move {
          from { transform: translateY(-50px); }
          to   { transform: translateY(50px);  }
        }

        /* Bridge just breathes gently */
        @keyframes ll-bridge {
          0%, 100% { transform: scale(1.0); }
          50%       { transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

export default function StableperpLanding() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location]);

  return (
    <div style={{ background: CREAM, color: INK, fontFamily: SANS }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400;1,9..144,500&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes sp-enter {
          0%   { opacity: 0; transform: scale(0.4); }
          60%  { opacity: 1; }
          100% { opacity: 1; transform: scale(1); }
        }
        .sp-enter   { display:inline-block; transform-origin:center; animation: sp-enter 1s cubic-bezier(.2,.8,.3,1.2) both; }
        @media (prefers-reduced-motion: reduce) { .sp-enter, .sp-elastic { animation: none; } }
      `}</style>

      {/* HERO */}
      <section style={{ position: "relative", overflow: "hidden", background: CREAM, padding: "120px 20px 130px" }}>
        <AnimatedContours />
        <div style={{ position: "relative", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div style={{ marginBottom: 40, display: "flex", justifyContent: "center" }}>
            <span className="sp-enter">
              <LiquidLogo />
            </span>
          </div>
          <p style={{ fontFamily: SANS, fontSize: 19, lineHeight: 1.5, color: INK, margin: "0 0 8px" }}>
            No brokers. No settlement delays.<br />No market hours to wait for.
          </p>
          <h1 style={{ fontFamily: SERIF, fontSize: "clamp(58px, 11vw, 128px)", fontWeight: 400, letterSpacing: "-0.02em", margin: "10px 0 0", lineHeight: 1 }}>
            Onchain First.
          </h1>
          <p style={{ fontFamily: SANS, fontSize: 18, color: MUT_INK, maxWidth: 540, margin: "26px auto 0", lineHeight: 1.6 }}>
            Options on real US stocks, priced by Pyth and settled in USDC. Built on Solana.
          </p>
          {import.meta.env.VITE_CA && (
            <div style={{ marginTop: 20 }}>
              <a 
                href={`https://pump.fun/${import.meta.env.VITE_CA}`} 
                target="_blank" 
                rel="noreferrer"
                style={{ 
                  display: "inline-block", fontFamily: MONO, fontSize: 13, color: INK, 
                  background: "rgba(10,38,34,0.06)", border: "1px solid rgba(10,38,34,0.15)", 
                  padding: "8px 16px", borderRadius: 999, textDecoration: "none", letterSpacing: "0.05em",
                  transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "rgba(10,38,34,0.1)")}
                onMouseOut={(e) => (e.currentTarget.style.background = "rgba(10,38,34,0.06)")}
              >
                CA: {import.meta.env.VITE_CA}
              </a>
            </div>
          )}
        </div>
      </section>

      {/* OWNERSHIP */}
      <section id="ownership" style={{ background: CREAM2, padding: "110px 20px", textAlign: "center" }}>
        <h2 style={{ fontFamily: SERIF, fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 400, lineHeight: 1.28, maxWidth: 900, margin: "0 auto", color: MUT_INK, letterSpacing: "-0.01em" }}>
          Anyone can own and govern <LogoText /> through{" "}
          <span style={{ color: INK }}>$SPERP</span>, the protocol&rsquo;s native token.
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 17, color: INK, marginTop: 30 }}>Own a piece of <LogoText /> today.</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 26, flexWrap: "wrap" }}>
          <Pill filled to="/terminal">Start Trading</Pill>
          <Pill to="/docs">Start Building</Pill>
        </div>
      </section>

      {/* FLAGSHIP */}
      <section id="flagship" style={{ background: CREAM, padding: "110px 20px", overflowX: "hidden" }}>
        <div style={{ maxWidth: 1250, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontFamily: SANS, fontSize: 17, color: MUT_INK, margin: 0 }}>The Flagship Application:</p>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(32px, 6vw, 62px)", fontWeight: 400, letterSpacing: "-0.02em", margin: "14px 0 54px" }}>
            The Premier Onchain <span style={{ fontStyle: "italic" }}>Options</span> Venue
          </h2>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "nowrap", alignItems: "flex-start" }}>
            <FadeInRow delay={0}><Phone symbol="NVDA" price="223.96" color={MINT} rows={[["17.13", "225", "17.45"], ["13.86", "230", "21.16"], ["11.06", "235", "25.34"], ["8.70", "240", "29.95"]]} /></FadeInRow>
            <FadeInRow delay={0.2}><Phone symbol="TSLA" price="173.44" color={MINT} rows={[["8.12", "175", "10.45"], ["6.34", "180", "14.20"], ["4.90", "185", "19.34"], ["3.70", "190", "24.95"]]} /></FadeInRow>
            <FadeInRow delay={0.4}><Phone symbol="AAPL" price="165.23" color={MINT} rows={[["5.10", "165", "4.85"], ["3.45", "170", "7.10"], ["2.10", "175", "10.30"], ["1.15", "180", "14.95"]]} /></FadeInRow>
            <FadeInRow delay={0.6}><Phone symbol="COIN" price="254.10" color={MINT} rows={[["10.20", "250", "8.90"], ["8.15", "255", "12.30"], ["6.40", "260", "15.45"], ["4.80", "265", "19.20"]]} /></FadeInRow>
          </div>
        </div>

        <div style={{ maxWidth: 780, margin: "70px auto 0" }}>
          {[
            [0, "Low fees", "Zero gas and cheap fills on every trade, priced onchain."],
            [1, "Transparent", "Fully onchain. Pricing, collateral and settlement are all verifiable on Solana."],
            [2, "Real US equities", "Calls and puts on NVDA, TSLA, AAPL and more, priced live by Pyth."],
          ].map(([v, t, d], i) => (
            <div key={t} style={{ display: "flex", gap: 26, alignItems: "flex-start", padding: "30px 0", borderTop: i === 0 ? "none" : "1px solid rgba(10,38,34,0.12)" }}>
              <div style={{ flexShrink: 0 }}><Concentric variant={v} /></div>
              <div>
                <h3 style={{ fontFamily: SERIF, fontSize: 27, fontWeight: 400, margin: "2px 0 8px" }}>{t}</h3>
                <p style={{ fontFamily: SANS, fontSize: 16.5, lineHeight: 1.55, color: MUT_INK, margin: 0 }}>{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STACK (dark) */}
      <section id="stack" style={{ background: FOREST, color: ON_DARK, padding: "100px 20px 110px" }}>
        <h2 style={{ fontFamily: SERIF, fontSize: "clamp(34px, 6vw, 62px)", fontWeight: 400, textAlign: "center", letterSpacing: "-0.01em", margin: "0 0 20px" }}>
          The <LogoText /> Stack
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 17, color: MUT_DARK, textAlign: "center", maxWidth: 620, margin: "0 auto 40px", lineHeight: 1.6 }}>
          Options and perps are the flagship markets. But they are just the tip of the iceberg.
        </p>

        <StableperpStack />

        {/* stats */}
        <div style={{ maxWidth: 860, margin: "70px auto 0", border: "1px solid rgba(151,252,228,0.18)", borderRadius: 22, padding: "34px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 30 }}>
          {[["Block time", "0.4s"], ["Underlyings", "20+ US stocks"], ["Oracle", "Pyth"], ["Settlement", "USDC"]].map(([l, v]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: SANS, fontSize: 13, color: MUT_DARK, letterSpacing: "0.08em", marginBottom: 10 }}>{l}</div>
              <div style={{ fontFamily: SERIF, fontSize: 30, color: ON_DARK }}>{v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: FOREST2, color: MUT_DARK, padding: "44px 22px", display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <Logo size={24} glow />
          <Wordmark color={ON_DARK} size={20} />
          <a 
            href="https://x.com/stableperp" 
            target="_blank" 
            rel="noreferrer" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'rgba(255,255,255,0.7)',
              marginLeft: '16px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
        </span>
        <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.14em" }}>
          $SPERP · {import.meta.env.VITE_CA ? (
            <a 
              href={`https://pump.fun/${import.meta.env.VITE_CA}`} 
              target="_blank" 
              rel="noreferrer"
              style={{ color: MINT, textDecoration: "none" }}
            >
              CA: {import.meta.env.VITE_CA.slice(0, 4)}...{import.meta.env.VITE_CA.slice(-4)}
            </a>
          ) : "CA SOON"}
        </span>
        <span style={{ fontFamily: SANS, fontSize: 12, maxWidth: 360, textAlign: "right", lineHeight: 1.5 }}>
          Derivatives involve risk. Access is restricted by jurisdiction. Nothing here is financial advice.
        </span>
      </footer>
    </div>
  );
}
