import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogoText } from '../components/Navbar';
import './Docs.css';

const SECTIONS = [
    { id: 'overview', label: 'Overview' },
    { id: 'trading-options', label: 'Trading options' },
    { id: 'writing-options', label: 'Writing options' },
    { id: 'settlement', label: 'Settlement & oracles' },
];

export const Docs: FC = () => {
    const [active, setActive] = useState(SECTIONS[0].id);
    const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const obs = new IntersectionObserver(
            (entries) => {
                const visible = entries.find((e) => e.isIntersecting);
                if (visible) setActive(visible.target.id);
            },
            { rootMargin: '-20% 0px -70% 0px' },
        );
        SECTIONS.forEach((s) => {
            const el = sectionRefs.current[s.id];
            if (el) obs.observe(el);
        });
        return () => obs.disconnect();
    }, []);

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'var(--color-bg)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-display)',
            }}
        >
            <div
                style={{
                    maxWidth: 1080,
                    margin: '0 auto',
                    padding: '8rem 2rem 6rem',
                    display: 'grid',
                    gridTemplateColumns: '220px 1fr',
                    gap: '4rem',
                    alignItems: 'start',
                }}
                className="docs-layout"
            >
                <nav
                    aria-label="On this page"
                    style={{
                        position: 'sticky',
                        top: 'calc(var(--navbar-height) + 32px)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                    }}
                >
                    <span
                        className="label-uppercase"
                        style={{ color: 'var(--color-text-muted)' }}
                    >
                        On this page
                    </span>
                    {SECTIONS.map((s) => (
                        <a
                            key={s.id}
                            href={`#${s.id}`}
                            className="docs-nav-link"
                            data-active={active === s.id}
                        >
                            {s.label}
                        </a>
                    ))}
                </nav>

                <div style={{ minWidth: 0 }}>
                    <h1
                        style={{
                            fontSize: '2.5rem',
                            marginBottom: '0.75rem',
                        }}
                    >
                        <LogoText /> documentation
                    </h1>
                    <p
                        style={{
                            color: 'var(--color-text-muted)',
                            marginBottom: '4rem',
                            fontSize: '1.1rem',
                            lineHeight: 1.7,
                            maxWidth: '68ch',
                        }}
                    >
                        How to trade options, provide liquidity, and integrate
                        with the <LogoText /> protocol.
                    </p>

                    <section
                        id="overview"
                        ref={(el) => {
                            sectionRefs.current.overview = el;
                        }}
                        style={{ marginBottom: '4rem' }}
                    >
                        <h2 style={{ fontSize: '1.375rem', marginBottom: '1rem' }}>
                            Overview
                        </h2>
                        <p
                            style={{
                                color: 'var(--color-text-muted)',
                                lineHeight: 1.7,
                                maxWidth: '68ch',
                            }}
                        >
                            <LogoText /> is a decentralized derivatives
                            protocol built on Solana. It lets you trade
                            fully-collateralized call and put options on
                            crypto and US stocks, settled entirely in USDC.
                        </p>
                    </section>

                    <section
                        id="trading-options"
                        ref={(el) => {
                            sectionRefs.current['trading-options'] = el;
                        }}
                        style={{ marginBottom: '4rem' }}
                    >
                        <h2 style={{ fontSize: '1.375rem', marginBottom: '1rem' }}>
                            Trading options (buying)
                        </h2>
                        <p
                            style={{
                                color: 'var(--color-text-muted)',
                                lineHeight: 1.7,
                                maxWidth: '68ch',
                                marginBottom: '1.5rem',
                            }}
                        >
                            As a buyer, you pay a premium upfront for the
                            right — not the obligation — to buy or sell the
                            underlying asset at a specific strike price before
                            expiry.
                        </p>
                        <ul
                            style={{
                                paddingLeft: '1.25rem',
                                color: 'var(--color-text-muted)',
                                lineHeight: 1.8,
                                maxWidth: '68ch',
                                marginBottom: '1.5rem',
                            }}
                        >
                            <li>
                                <strong style={{ color: 'var(--color-text)' }}>
                                    Call option:
                                </strong>{' '}
                                profits if the asset price rises above the
                                strike.
                            </li>
                            <li>
                                <strong style={{ color: 'var(--color-text)' }}>
                                    Put option:
                                </strong>{' '}
                                profits if the asset price falls below the
                                strike.
                            </li>
                        </ul>
                        <div className="surface-data">
                            <span
                                className="label-uppercase"
                                style={{ color: 'var(--color-text-muted)' }}
                            >
                                Max loss, as buyer
                            </span>
                            <div
                                className="mono-num"
                                style={{
                                    fontSize: '1.25rem',
                                    marginTop: '0.35rem',
                                    color: 'var(--color-text)',
                                }}
                            >
                                Limited to the premium paid
                            </div>
                        </div>
                    </section>

                    <section
                        id="writing-options"
                        ref={(el) => {
                            sectionRefs.current['writing-options'] = el;
                        }}
                        style={{ marginBottom: '4rem' }}
                    >
                        <h2 style={{ fontSize: '1.375rem', marginBottom: '1rem' }}>
                            Writing options (providing liquidity)
                        </h2>
                        <p
                            style={{
                                color: 'var(--color-text-muted)',
                                lineHeight: 1.7,
                                maxWidth: '68ch',
                                marginBottom: '1.5rem',
                            }}
                        >
                            Writers earn the premium buyers pay, by fully
                            locking USDC collateral in an escrow vault until
                            expiry or exercise.
                        </p>
                        <div
                            className="surface-data"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1.5rem',
                            }}
                        >
                            <div>
                                <span
                                    className="label-uppercase"
                                    style={{ color: 'var(--color-text-muted)' }}
                                >
                                    Covered calls
                                </span>
                                <div
                                    className="mono-num"
                                    style={{
                                        fontSize: '1.25rem',
                                        marginTop: '0.35rem',
                                        color: 'var(--color-primary)',
                                    }}
                                >
                                    100% notional
                                </div>
                                <p
                                    style={{
                                        marginTop: '0.35rem',
                                        fontSize: '0.875rem',
                                        color: 'var(--color-text-muted)',
                                    }}
                                >
                                    USDC locked equal to the payout if strike
                                    is breached.
                                </p>
                            </div>
                            <div>
                                <span
                                    className="label-uppercase"
                                    style={{ color: 'var(--color-text-muted)' }}
                                >
                                    Cash-secured puts
                                </span>
                                <div
                                    className="mono-num"
                                    style={{
                                        fontSize: '1.25rem',
                                        marginTop: '0.35rem',
                                        color: 'var(--color-primary)',
                                    }}
                                >
                                    100% strike
                                </div>
                                <p
                                    style={{
                                        marginTop: '0.35rem',
                                        fontSize: '0.875rem',
                                        color: 'var(--color-text-muted)',
                                    }}
                                >
                                    USDC locked equal to the strike price.
                                </p>
                            </div>
                        </div>
                        <p
                            style={{
                                color: 'var(--color-text-muted)',
                                lineHeight: 1.7,
                                maxWidth: '68ch',
                                marginTop: '1.5rem',
                            }}
                        >
                            You keep the premium if the option expires
                            out-of-the-money.
                        </p>
                    </section>

                    <section
                        id="settlement"
                        ref={(el) => {
                            sectionRefs.current.settlement = el;
                        }}
                        style={{ marginBottom: '4rem' }}
                    >
                        <h2 style={{ fontSize: '1.375rem', marginBottom: '1rem' }}>
                            Settlement & oracles
                        </h2>
                        <p
                            style={{
                                color: 'var(--color-text-muted)',
                                lineHeight: 1.7,
                                maxWidth: '68ch',
                            }}
                        >
                            Every market settles in USDC. The protocol uses
                            the Pyth Network as its oracle to mark assets for
                            accurate settlement and payoff calculations.
                        </p>
                    </section>

                    <Link to="/terminal" className="btn-primary">
                        Open terminal
                    </Link>
                </div>
            </div>
        </div>
    );
};
