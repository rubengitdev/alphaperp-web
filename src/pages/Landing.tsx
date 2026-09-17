import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SilkBackground } from '../components/SilkBackground';
import alphaPerpLogo from '../assets/alphaperp-logo-preview.png';
import './Landing.css';

const fmt = (n: number) =>
    n.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

/* ---------- logo: one continuous liquid light-sweep, looping ---------- */
function LiquidLogo() {
    return (
        <div
            style={{
                position: 'relative',
                width: 200,
                height: 200,
                margin: '0 auto',
            }}
        >
            <img
                src={alphaPerpLogo}
                alt="AlphaPerp"
                className="lc-base"
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transform: 'scale(1.2)',
                }}
            />
            <img
                src={alphaPerpLogo}
                alt=""
                aria-hidden="true"
                className="lc-sheen"
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transform: 'scale(1.2)',
                }}
            />
            <style>{`
        .lc-sheen {
          -webkit-mask-image: linear-gradient(115deg, transparent 40%, rgba(0,0,0,0.9) 50%, transparent 60%);
          mask-image: linear-gradient(115deg, transparent 40%, rgba(0,0,0,0.9) 50%, transparent 60%);
          -webkit-mask-size: 260% 260%;
          mask-size: 260% 260%;
          filter: brightness(1.6) saturate(1.3);
          animation: lc-sweep 3.6s cubic-bezier(0.45, 0, 0.2, 1) infinite;
          will-change: mask-position;
        }
        @keyframes lc-sweep {
          0%   { -webkit-mask-position: 160% 160%; mask-position: 160% 160%; }
          100% { -webkit-mask-position: -60% -60%; mask-position: -60% -60%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .lc-sheen { display: none; }
        }
      `}</style>
        </div>
    );
}

/* =============================== STATS =============================== */
function CountUp({
    to,
    decimals = 0,
    suffix = '',
}: {
    to: number;
    decimals?: number;
    suffix?: string;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const [value, setValue] = useState(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const reduce = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;
        let frame = 0;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                obs.disconnect();
                if (reduce) {
                    setValue(to);
                    return;
                }
                const start = performance.now();
                const tick = (now: number) => {
                    const p = Math.min((now - start) / 1100, 1);
                    setValue(to * (1 - Math.pow(1 - p, 3)));
                    if (p < 1) frame = requestAnimationFrame(tick);
                };
                frame = requestAnimationFrame(tick);
            },
            { threshold: 0.4 },
        );
        obs.observe(el);
        return () => {
            obs.disconnect();
            cancelAnimationFrame(frame);
        };
    }, [to]);

    return (
        <span ref={ref} className="mono-num">
            {value.toFixed(decimals)}
            {suffix}
        </span>
    );
}

function StatsBand() {
    const stats = [
        {
            value: <CountUp to={0.4} decimals={1} suffix="s" />,
            label: 'Block time on Solana',
        },
        { value: <CountUp to={20} suffix="+" />, label: 'US stocks to trade' },
        { value: 'Pyth', label: 'Price oracle' },
        { value: 'USDC', label: 'Settlement currency' },
    ];
    return (
        <section className="lp-stats" aria-label="AlphaPerp at a glance">
            <div className="lp-stats-inner">
                {stats.map((s) => (
                    <div className="lp-stat" key={s.label}>
                        <div className="lp-stat-value">{s.value}</div>
                        <div className="lp-stat-label">{s.label}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ============================ TRADE BUILDER ============================ */
type Side = 'call' | 'put';

const MARKETS = [
    {
        symbol: 'NVDA',
        name: 'NVIDIA',
        spot: 223.96,
        chain: [
            [17.13, 225, 17.45],
            [13.86, 230, 21.16],
            [11.06, 235, 25.34],
            [8.7, 240, 29.95],
        ],
    },
    {
        symbol: 'TSLA',
        name: 'Tesla',
        spot: 173.44,
        chain: [
            [8.12, 175, 10.45],
            [6.34, 180, 14.2],
            [4.9, 185, 19.34],
            [3.7, 190, 24.95],
        ],
    },
    {
        symbol: 'AAPL',
        name: 'Apple',
        spot: 165.23,
        chain: [
            [5.1, 165, 4.85],
            [3.45, 170, 7.1],
            [2.1, 175, 10.3],
            [1.15, 180, 14.95],
        ],
    },
    {
        symbol: 'COIN',
        name: 'Coinbase',
        spot: 254.1,
        chain: [
            [10.2, 250, 8.9],
            [8.15, 255, 12.3],
            [6.4, 260, 15.45],
            [4.8, 265, 19.2],
        ],
    },
];

function PayoffChart({
    side,
    strike,
    premium,
    qty,
    spot,
}: {
    side: Side;
    strike: number;
    premium: number;
    qty: number;
    spot: number;
}) {
    const W = 360;
    const H = 150;
    const PAD = 14;
    const lo = strike * 0.8;
    const hi = strike * 1.2;
    const pnl = (s: number) =>
        ((side === 'call' ? Math.max(s - strike, 0) : Math.max(strike - s, 0)) -
            premium) *
        qty;

    const samples = Array.from({ length: 61 }, (_, i) => {
        const s = lo + ((hi - lo) * i) / 60;
        return [s, pnl(s)] as const;
    });
    const values = samples.map((p) => p[1]);
    const yMin = Math.min(...values);
    const yMax = Math.max(...values);
    const x = (s: number) => PAD + ((s - lo) / (hi - lo)) * (W - 2 * PAD);
    const y = (v: number) => PAD + ((yMax - v) / (yMax - yMin)) * (H - 2 * PAD);

    const line = samples
        .map(
            ([s, v], i) =>
                `${i ? 'L' : 'M'}${x(s).toFixed(1)},${y(v).toFixed(1)}`,
        )
        .join(' ');
    const zeroY = y(0);
    const area = `${line} L${x(hi).toFixed(1)},${zeroY.toFixed(1)} L${x(lo).toFixed(1)},${zeroY.toFixed(1)} Z`;
    const breakeven = side === 'call' ? strike + premium : strike - premium;

    return (
        <svg
            className="lp-payoff"
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={`Profit and loss at expiry. Breakeven at $${fmt(breakeven)}.`}
        >
            <defs>
                <clipPath id="lp-payoff-profit">
                    <rect x="0" y="0" width={W} height={zeroY} />
                </clipPath>
                <clipPath id="lp-payoff-loss">
                    <rect x="0" y={zeroY} width={W} height={H - zeroY} />
                </clipPath>
                <linearGradient id="lp-payoff-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                        offset="0%"
                        style={{
                            stopColor: 'var(--color-primary)',
                            stopOpacity: 0.4,
                        }}
                    />
                    <stop
                        offset="100%"
                        style={{
                            stopColor: 'var(--color-primary)',
                            stopOpacity: 0,
                        }}
                    />
                </linearGradient>
            </defs>
            <path
                d={area}
                fill="url(#lp-payoff-fill)"
                clipPath="url(#lp-payoff-profit)"
            />
            <line
                className="lp-payoff-zero"
                x1={PAD}
                x2={W - PAD}
                y1={zeroY}
                y2={zeroY}
            />
            <line
                className="lp-payoff-spot"
                x1={x(spot)}
                x2={x(spot)}
                y1={PAD}
                y2={H - PAD}
            />
            <text className="lp-payoff-tag" x={x(spot) + 5} y={PAD + 8}>
                Spot
            </text>
            <path
                d={line}
                className="lp-payoff-line lp-payoff-line--loss"
                clipPath="url(#lp-payoff-loss)"
            />
            <path
                d={line}
                className="lp-payoff-line"
                clipPath="url(#lp-payoff-profit)"
            />
            <circle
                className="lp-payoff-be"
                cx={x(breakeven)}
                cy={zeroY}
                r="4"
            />
        </svg>
    );
}

function TradeBuilder() {
    const [assetIdx, setAssetIdx] = useState(0);
    const [side, setSide] = useState<Side>('call');
    const [row, setRow] = useState(0);
    const [qty, setQty] = useState(1);

    const market = MARKETS[assetIdx];
    const [callPrem, strike, putPrem] = market.chain[row];
    const premium = side === 'call' ? callPrem : putPrem;
    const breakeven = side === 'call' ? strike + premium : strike - premium;
    const maxProfit =
        side === 'call' ? 'Unlimited' : `$${fmt((strike - premium) * qty)}`;
    const sideLabel = side === 'call' ? 'call' : 'put';

    // index of the first strike above spot, where the spot marker row goes
    const spotRow = market.chain.findIndex((r) => r[1] > market.spot);

    const pick = (nextSide: Side, nextRow: number) => {
        setSide(nextSide);
        setRow(nextRow);
    };

    return (
        <div className="lp-demo">
            <div
                className="lp-demo-tabs"
                role="tablist"
                aria-label="Underlying stock"
            >
                {MARKETS.map((m, i) => (
                    <button
                        key={m.symbol}
                        type="button"
                        role="tab"
                        aria-selected={i === assetIdx}
                        className="lp-demo-tab"
                        onClick={() => setAssetIdx(i)}
                    >
                        <span className="lp-demo-tab-symbol">{m.symbol}</span>
                        <span className="lp-demo-tab-price">
                            ${fmt(m.spot)}
                        </span>
                    </button>
                ))}
            </div>

            <div className="lp-demo-body">
                <div className="lp-chain">
                    <div className="lp-chain-head">
                        <span>Calls</span>
                        <span>Strike</span>
                        <span>Puts</span>
                    </div>
                    {market.chain.map(([c, k, p], i) => (
                        <div key={k}>
                            {i === spotRow && (
                                <div className="lp-chain-spot">
                                    <span>
                                        {market.symbol} ${fmt(market.spot)}
                                    </span>
                                </div>
                            )}
                            <div className="lp-chain-row">
                                <button
                                    type="button"
                                    className={`lp-chain-cell${k < market.spot ? ' is-itm' : ''}`}
                                    aria-pressed={side === 'call' && row === i}
                                    aria-label={`Call, strike ${k}, premium $${fmt(c)}`}
                                    onClick={() => pick('call', i)}
                                >
                                    ${fmt(c)}
                                </button>
                                <span className="lp-chain-strike">{k}</span>
                                <button
                                    type="button"
                                    className={`lp-chain-cell lp-chain-cell--put${k > market.spot ? ' is-itm' : ''}`}
                                    aria-pressed={side === 'put' && row === i}
                                    aria-label={`Put, strike ${k}, premium $${fmt(p)}`}
                                    onClick={() => pick('put', i)}
                                >
                                    ${fmt(p)}
                                </button>
                            </div>
                        </div>
                    ))}
                    {spotRow === -1 && (
                        <div className="lp-chain-spot">
                            <span>
                                {market.symbol} ${fmt(market.spot)}
                            </span>
                        </div>
                    )}
                    <p className="lp-chain-hint">
                        Pick a premium to build the trade. Shaded prices are in
                        the money.
                    </p>
                </div>

                <div className="lp-ticket" aria-live="polite">
                    <div className="lp-ticket-title">
                        <span>
                            Buy {market.symbol} ${strike} {sideLabel}
                        </span>
                        <div className="lp-stepper" aria-label="Contracts">
                            <button
                                type="button"
                                aria-label="Fewer contracts"
                                onClick={() =>
                                    setQty((q) => Math.max(1, q - 1))
                                }
                                disabled={qty === 1}
                            >
                                −
                            </button>
                            <output>{qty}</output>
                            <button
                                type="button"
                                aria-label="More contracts"
                                onClick={() =>
                                    setQty((q) => Math.min(10, q + 1))
                                }
                                disabled={qty === 10}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <dl className="lp-ticket-figures">
                        <div>
                            <dt>Total cost</dt>
                            <dd className="is-primary">
                                ${fmt(premium * qty)}
                            </dd>
                        </div>
                        <div>
                            <dt>Breakeven</dt>
                            <dd>${fmt(breakeven)}</dd>
                        </div>
                        <div>
                            <dt>Max loss</dt>
                            <dd>${fmt(premium * qty)}</dd>
                        </div>
                        <div>
                            <dt>Max profit</dt>
                            <dd>{maxProfit}</dd>
                        </div>
                    </dl>

                    <PayoffChart
                        side={side}
                        strike={strike}
                        premium={premium}
                        qty={qty}
                        spot={market.spot}
                    />

                    <Link
                        className="lp-btn lp-btn--block"
                        to={`/terminal?action=buy_${side}`}
                    >
                        Open in terminal
                    </Link>
                    <p className="lp-ticket-note">
                        Sample prices for illustration. Live quotes are in the
                        terminal.
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ============================== STACK ============================== */
type Module = { id: string; name: string; desc: string };
type Layer = {
    id: string;
    name: string;
    modules: Module[];
    runsOn: string[];
    flagship?: boolean;
};

const LAYERS: Layer[] = [
    {
        id: 'ecosystem',
        name: 'Ecosystem',
        runsOn: ['core', 'solana'],
        modules: [
            {
                id: 'vaults',
                name: 'Vaults',
                desc: 'Hold option writers’ USDC in escrow until the option expires or is exercised.',
            },
            {
                id: 'collateral',
                name: 'Collateral',
                desc: 'Every option on AlphaPerp is fully collateralized in USDC.',
            },
            {
                id: 'positions',
                name: 'Positions',
                desc: 'Track the calls and puts each wallet holds or has written.',
            },
            {
                id: 'corp',
                name: 'Corporate actions',
                desc: 'Keep stock options accurate when the underlying company splits or changes its shares.',
            },
            {
                id: 'copilot',
                name: 'Copilot / MCP',
                desc: 'Give AI agents a way to read markets and act on them.',
            },
            {
                id: 'more',
                name: 'And more',
                desc: 'Any app that needs performance, liquidity and programmability can build on the same core.',
            },
        ],
    },
    {
        id: 'apps',
        name: 'Flagship apps',
        flagship: true,
        runsOn: ['core', 'solana'],
        modules: [
            {
                id: 'options',
                name: 'Options',
                desc: 'Buy or write calls and puts on US stocks and crypto, settled in USDC.',
            },
            {
                id: 'perps',
                name: 'Perps',
                desc: 'Perpetual markets built natively on AlphaPerp Core, next to options.',
            },
        ],
    },
    {
        id: 'core',
        name: 'AlphaPerp Core',
        runsOn: ['solana'],
        modules: [
            {
                id: 'oracles',
                name: 'Oracles',
                desc: 'Pyth supplies the mark price used to price and settle every market.',
            },
            {
                id: 'settlement',
                name: 'Settlement',
                desc: 'Payoffs are calculated onchain and paid out in USDC.',
            },
            {
                id: 'factory',
                name: 'Factory',
                desc: 'Creates a market for each asset, strike and expiry.',
            },
        ],
    },
    {
        id: 'solana',
        name: 'Solana',
        runsOn: [],
        modules: [
            {
                id: 'state',
                name: 'One unified state',
                desc: 'The core runs as one unified state on Solana, so every app built on it shares the same prices, collateral and settlement.',
            },
        ],
    },
];

// LAYERS is already ordered top-down the way the stack is actually built:
// Ecosystem sits on Flagship apps, which sit on Core, which sits on Solana.
const FLOW_PULSES = 3;

function StackFlow() {
    const [selected, setSelected] = useState('options');
    const layer = LAYERS.find((l) => l.modules.some((m) => m.id === selected))!;
    const module = layer.modules.find((m) => m.id === selected)!;
    const path = [
        layer,
        ...layer.runsOn.map((id) => LAYERS.find((l) => l.id === id)!),
    ];
    const litIds = new Set(path.map((l) => l.id));

    // The spine's lit segment reaches from Solana up to whichever layer in
    // the current path sits highest in the stack — everything below that is
    // part of the route this module depends on.
    const topLitIndex = Math.min(
        ...LAYERS.map((l, i) => (litIds.has(l.id) ? i : Infinity)),
    );
    const litHeightPct =
        ((LAYERS.length - 1 - topLitIndex) / (LAYERS.length - 1)) * 100;

    const flowRef = useRef<HTMLDivElement>(null);
    const [entered, setEntered] = useState(false);

    useEffect(() => {
        const el = flowRef.current;
        if (!el) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setEntered(true);
            return;
        }
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setEntered(true);
                    obs.disconnect();
                }
            },
            { threshold: 0.35 },
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <div className="lp-stack">
            <div
                ref={flowRef}
                className={`lp-flow${entered ? ' is-entered' : ''}`}
                aria-hidden="false"
            >
                <div className="lp-flow-trunk" aria-hidden="true">
                    <div
                        className="lp-flow-trunk-lit"
                        style={{ height: `${litHeightPct}%` }}
                    />
                    {Array.from({ length: FLOW_PULSES }, (_, i) => (
                        <span
                            key={i}
                            className="lp-flow-pulse"
                            style={{
                                animationDelay: `${(-i * 5.5) / FLOW_PULSES}s`,
                            }}
                        />
                    ))}
                </div>

                {LAYERS.map((l) => {
                    const lit = litIds.has(l.id);
                    return (
                        <div
                            key={l.id}
                            className={`lp-flow-layer${lit ? ' is-lit' : ''}`}
                        >
                            <div
                                className={`lp-flow-plate${l.flagship ? ' lp-flow-plate--flagship' : ''}`}
                            >
                                <span className="lp-flow-plate-label">
                                    {l.name}
                                </span>
                                <div className="lp-plate-modules">
                                    {l.modules.map((m) => (
                                        <button
                                            key={m.id}
                                            type="button"
                                            className={`lp-node${l.flagship ? ' lp-node--flagship' : ''}`}
                                            aria-pressed={m.id === selected}
                                            onClick={() => setSelected(m.id)}
                                        >
                                            {m.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="lp-stack-detail" aria-live="polite">
                <div className="lp-stack-detail-layer">{layer.name}</div>
                <h3 key={module.id} className="lp-stack-detail-name">
                    {module.name}
                </h3>
                <p className="lp-stack-detail-desc">{module.desc}</p>
                <div className="lp-stack-path" aria-label="Runs on">
                    {path.map((l) => (
                        <span key={l.id}>{l.name}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ============================ OWNERSHIP ============================ */
function Ownership() {
    const ca = import.meta.env.VITE_CA as string | undefined;
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        if (!ca) return;
        try {
            await navigator.clipboard.writeText(ca);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            setCopied(false);
        }
    };

    return (
        <section id="ownership" className="lp-section lp-own">
            <div className="lp-own-inner">
                <div>
                    <h2 className="lp-h2">Own a piece of AlphaPerp.</h2>
                    <p className="lp-lede">
                        $APERP is the protocol’s native token. Anyone who holds
                        it can own and govern AlphaPerp.
                    </p>
                </div>
                <div className="lp-own-actions">
                    <div className="lp-own-buttons">
                        <Link className="lp-btn" to="/terminal">
                            Start trading
                        </Link>
                        <Link className="lp-btn lp-btn--ghost" to="/docs">
                            Read the docs
                        </Link>
                    </div>
                    <div className="lp-ca">
                        <span className="lp-ca-label">$APERP contract</span>
                        {ca ? (
                            <button
                                type="button"
                                className="lp-ca-value"
                                onClick={copy}
                            >
                                <span className="lp-ca-address">{ca}</span>
                                <span className="lp-ca-action">
                                    {copied ? 'Copied' : 'Copy'}
                                </span>
                            </button>
                        ) : (
                            <span className="lp-ca-soon">
                                Address coming soon
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ============================== FOOTER ============================== */
function Footer() {
    const ca = import.meta.env.VITE_CA as string | undefined;
    return (
        <footer className="lp-footer">
            <div className="lp-footer-top">
                <div className="lp-footer-brand">
                    <img src={alphaPerpLogo} alt="" aria-hidden="true" />
                    <span>
                        <b>Alpha</b>Perp
                    </span>
                </div>
                <nav className="lp-footer-links" aria-label="Footer">
                    <div>
                        <h4>Product</h4>
                        <Link to="/terminal">Trade</Link>
                        <Link to="/docs">Docs</Link>
                    </div>
                    <div>
                        <h4>Legal</h4>
                        <Link to="/terms">Terms</Link>
                        <Link to="/privacy">Privacy</Link>
                    </div>
                    <div>
                        <h4>Community</h4>
                        <a
                            href="https://x.com/stableperp"
                            target="_blank"
                            rel="noreferrer"
                        >
                            X
                        </a>
                        {ca && (
                            <a
                                href={`https://pump.fun/${ca}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                $APERP on pump.fun
                            </a>
                        )}
                    </div>
                </nav>
            </div>
            <p className="lp-footer-legal">
                Derivatives involve risk. Access is restricted by jurisdiction.
                Nothing here is financial advice.
            </p>
        </footer>
    );
}

export default function AlphaPerpLanding() {
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
        <div
            style={{
                color: 'var(--color-text)',
                fontFamily: 'var(--font-display)',
            }}
        >
            {/* SilkBackground renders to a WebGL canvas and parses these as
                raw hex for its shader uniforms, so it can't consume a CSS
                custom property here — kept in sync with index.css by hand. */}
            <SilkBackground
                color="#20D9C5"
                bgColor="#0B0B0B"
                speed={0.8}
                intensity={0.35}
                scale={2.4}
            />
            <link rel="preconnect" href="https://api.fontshare.com" />
            <link
                href="https://api.fontshare.com/v2/css?f[]=satoshi@700,500,400&display=swap"
                rel="stylesheet"
            />

            {/* HERO — the one choreographed motion moment on this page: the
                logo, tag, headline and subtitle rise in sequence on load. */}
            <section
                style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'transparent',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '120px 20px',
                }}
            >
                <div
                    className="hero-sequence"
                    style={{
                        position: 'relative',
                        maxWidth: 900,
                        margin: '0 auto',
                        textAlign: 'center',
                    }}
                >
                    <div
                        style={{
                            marginBottom: 40,
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <LiquidLogo />
                    </div>
                    <p
                        style={{
                            fontWeight: 700,
                            letterSpacing: '-0.01em',
                            fontSize: 20,
                            color: 'var(--color-primary)',
                            margin: '0 0 18px',
                        }}
                    >
                        Two flows. One edge.
                    </p>
                    <h1
                        style={{
                            fontWeight: 600,
                            fontSize: 'clamp(46px, 9vw, 104px)',
                            letterSpacing: '-0.02em',
                            margin: '10px 0 0',
                            lineHeight: 1.05,
                        }}
                    >
                        The edge flows
                        <br />
                        onchain.
                    </h1>
                    <p
                        style={{
                            fontWeight: 400,
                            fontSize: 18,
                            color: 'var(--color-text-muted)',
                            maxWidth: 540,
                            margin: '26px auto 0',
                            lineHeight: 1.6,
                        }}
                    >
                        Options on real US stocks, priced by Pyth and settled in
                        USDC. Built on Solana.
                    </p>
                    {import.meta.env.VITE_CA && (
                        <div style={{ marginTop: 20 }}>
                            <a
                                href={`https://pump.fun/${import.meta.env.VITE_CA}`}
                                target="_blank"
                                rel="noreferrer"
                                className="lp-ca-badge mono-num"
                            >
                                CA: {import.meta.env.VITE_CA}
                            </a>
                        </div>
                    )}
                </div>
            </section>

            <StatsBand />

            {/* FLAGSHIP */}
            <section id="flagship" className="lp-section">
                <div className="lp-container">
                    <div className="lp-section-head">
                        <h2 className="lp-h2">
                            The premier onchain options venue
                        </h2>
                        <p className="lp-lede">
                            Build a trade below. Choose a stock, pick a strike,
                            and see exactly what you pay and what you can make.
                        </p>
                    </div>

                    <TradeBuilder />

                    <ul className="lp-points">
                        <li>
                            <h3>Low fees</h3>
                            <p>
                                Zero gas and cheap fills on every trade, priced
                                onchain.
                            </p>
                        </li>
                        <li>
                            <h3>Transparent</h3>
                            <p>
                                Pricing, collateral and settlement are all
                                verifiable on Solana.
                            </p>
                        </li>
                        <li>
                            <h3>Real US equities</h3>
                            <p>
                                Calls and puts on NVDA, TSLA, AAPL and more,
                                priced live by Pyth.
                            </p>
                        </li>
                    </ul>
                </div>
            </section>

            {/* STACK */}
            <section id="stack" className="lp-section lp-section--surface">
                <div className="lp-container">
                    <div className="lp-section-head">
                        <h2 className="lp-h2">The AlphaPerp stack</h2>
                        <p className="lp-lede">
                            Options and perps are the flagship markets, but they
                            are just the tip of the iceberg. Select any part of
                            the stack to see what it does and what it runs on.
                        </p>
                    </div>
                    <StackFlow />
                </div>
            </section>

            <Ownership />
            <Footer />
        </div>
    );
}
