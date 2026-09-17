import { useState } from 'react';
import type { FC } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Link } from 'react-router-dom';
import { useNetwork } from '../contexts/NetworkContext';
import alphaPerpLogo from '../assets/alphaperp-logo-preview.png';
import './Navbar.css';

interface NavbarProps {
    variant?: 'landing' | 'terminal';
}

export const LogoText: FC = () => (
    <span
        className="logo-text"
        style={{
            letterSpacing: '-0.01em',
            display: 'inline-flex',
            alignItems: 'baseline',
        }}
    >
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
            Alpha
        </span>
        <span
            style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
                color: 'var(--color-text-muted)',
            }}
        >
            Perp
        </span>
    </span>
);

export const Navbar: FC<NavbarProps> = ({ variant = 'landing' }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const isTerminal = variant === 'terminal';
    const { network, setNetwork } = isTerminal
        ? useNetwork()
        : { network: 'devnet', setNetwork: () => {} };

    return (
        <>
            <nav
                className={`navbar-container ${isTerminal ? 'navbar-terminal' : 'navbar-landing'}`}
            >
                <Link
                    to="/"
                    className="navbar-logo-link"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                    <div className="navbar-logo">
                        <img src={alphaPerpLogo} alt="AlphaPerp" />
                        <div className="navbar-logo-text">
                            <LogoText />
                        </div>
                        {isTerminal && (
                            <span className="navbar-badge">TERMINAL</span>
                        )}
                    </div>
                </Link>
                {!isTerminal && (
                    <div className="navbar-links">
                        <Link to="/terminal">Trade</Link>
                        <Link to="/#ownership">Ownership</Link>
                        <Link to="/#flagship">Platform</Link>
                        <Link to="/docs">Docs</Link>
                        <Link to="/#stack">The Stack</Link>
                    </div>
                )}
                {isTerminal && (
                    <div
                        className="network-toggle network-toggle--centered"
                        role="group"
                        aria-label="Network"
                    >
                        <button
                            type="button"
                            onClick={() => setNetwork('mainnet-beta')}
                            aria-pressed={network === 'mainnet-beta'}
                            className={`network-toggle-btn${
                                network === 'mainnet-beta'
                                    ? ' network-toggle-btn--active'
                                    : ''
                            }`}
                        >
                            Mainnet
                        </button>
                        <button
                            type="button"
                            onClick={() => setNetwork('devnet')}
                            aria-pressed={network === 'devnet'}
                            className={`network-toggle-btn${
                                network === 'devnet'
                                    ? ' network-toggle-btn--active'
                                    : ''
                            }`}
                        >
                            Devnet
                        </button>
                    </div>
                )}
                <div className="navbar-actions">
                    <a
                        href="https://x.com/stableperp"
                        target="_blank"
                        rel="noreferrer"
                        className="navbar-x-link"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                    </a>
                    <WalletMultiButton
                        // the wallet-adapter library's Button component only
                        // reads the style and onClick props (see Button.tsx),
                        // so hover has to be done in CSS via .wallet-adapter-button
                        style={{
                            backgroundColor: 'var(--color-primary)',
                            color: 'var(--color-bg)',
                            fontFamily: 'var(--font-display)',
                            fontWeight: 600,
                            borderRadius: 8,
                            height: 48,
                            padding: '0 24px',
                            fontSize: '0.9rem',
                            border: 'none',
                            transition: 'opacity 0.15s ease',
                        }}
                    />
                    {!isTerminal && (
                        <button
                            className="hamburger-btn"
                            onClick={() =>
                                setIsMobileMenuOpen(!isMobileMenuOpen)
                            }
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                {isMobileMenuOpen ? (
                                    <>
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </>
                                ) : (
                                    <>
                                        <line x1="3" y1="12" x2="21" y2="12" />
                                        <line x1="3" y1="6" x2="21" y2="6" />
                                        <line x1="3" y1="18" x2="21" y2="18" />
                                    </>
                                )}
                            </svg>
                        </button>
                    )}
                </div>
            </nav>

            {!isTerminal && isMobileMenuOpen && (
                <div className="mobile-menu-overlay">
                    <div className="mobile-menu-content">
                        <Link
                            to="/#ownership"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Ownership
                        </Link>
                        <Link
                            to="/#flagship"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Platform
                        </Link>
                        <Link
                            to="/docs"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Documentation
                        </Link>
                        <Link
                            to="/#stack"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            The Stack
                        </Link>
                        <Link
                            to="/terminal"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Trade
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
};
