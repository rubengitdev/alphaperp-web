import { useState } from 'react';
import type { FC } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Link } from 'react-router-dom';
import { useNetwork } from '../contexts/NetworkContext';
import './Navbar.css';

interface NavbarProps {
  variant?: 'landing' | 'terminal';
}

export const LogoText: FC = () => (
  <span className="logo-text" style={{ letterSpacing: '-0.5px', display: 'inline-flex', alignItems: 'baseline' }}>
    <span style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontWeight: 300 }}>Stable</span>
    <span style={{ fontFamily: 'Garamond, "Times New Roman", serif', fontStyle: 'italic', fontWeight: 300, fontSize: '1.05em', WebkitFontSmoothing: 'antialiased' }}>perp</span>
  </span>
);

export const Navbar: FC<NavbarProps> = ({ variant = 'landing' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isTerminal = variant === 'terminal';
  const { network, setNetwork } = isTerminal ? useNetwork() : { network: 'devnet', setNetwork: () => {} };

  return (
    <>
      <nav className={`navbar-container ${isTerminal ? 'navbar-terminal' : 'navbar-landing'}`}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <div className="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.png" alt="Stableperp Logo" style={{ height: '32px' }} />
          <div style={{ fontSize: '1.5rem', color: isTerminal ? '#FFFFFF' : '#081A16' }}>
            <LogoText />
          </div>
          {isTerminal && <span className="navbar-badge">TERMINAL</span>}
        </div>
      </Link>
      {!isTerminal && (
        <div className="navbar-links">
          <Link to="/#ownership" style={{ textDecoration: 'none' }}>Ownership</Link>
          <Link to="/#flagship" style={{ textDecoration: 'none' }}>Platform</Link>
          <Link to="/docs" style={{ textDecoration: 'none' }}>Docs</Link>
          <Link to="/#stack" style={{ textDecoration: 'none' }}>The Stack</Link>
        </div>
      )}
      <div className="navbar-actions">
        {isTerminal && (
          <div style={{ 
            display: 'flex', 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            borderRadius: '8px', 
            padding: '0.25rem',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <span 
              onClick={() => setNetwork('mainnet-beta')}
              style={{ 
                padding: '0.25rem 0.75rem', 
                fontSize: '0.75rem', 
                fontFamily: "'Space Mono', monospace", 
                color: network === 'mainnet-beta' ? '#5EEAD4' : '#A3A3A3', 
                backgroundColor: network === 'mainnet-beta' ? 'rgba(94, 234, 212, 0.1)' : 'transparent',
                borderRadius: '4px',
                cursor: 'pointer' 
              }}>
              Mainnet
            </span>
            <span 
              onClick={() => setNetwork('devnet')}
              style={{ 
                padding: '0.25rem 0.75rem', 
                fontSize: '0.75rem', 
                fontFamily: "'Space Mono', monospace", 
                color: network === 'devnet' ? '#5EEAD4' : '#A3A3A3', 
                backgroundColor: network === 'devnet' ? 'rgba(94, 234, 212, 0.1)' : 'transparent',
                borderRadius: '4px',
                cursor: 'pointer' 
              }}>
              Devnet
            </span>
          </div>
        )}
        <a 
          href="https://x.com/stableperp" 
          target="_blank" 
          rel="noreferrer" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: isTerminal ? '#FFFFFF' : '#081A16',
            marginRight: '12px',
            opacity: 0.8,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>
        <WalletMultiButton className="wallet-adapter-button" style={{ backgroundColor: isTerminal ? '#5EEAD4' : '#97FCE4', color: isTerminal ? '#0A0A0A' : '#0A2622', fontFamily: isTerminal ? "'Space Mono', monospace" : "-apple-system, system-ui, sans-serif", borderRadius: '999px', height: '42px', padding: '0 1.5rem', fontWeight: 500, fontSize: '0.95rem', border: isTerminal ? 'none' : '1.5px solid #97FCE4' }} />
        {!isTerminal && (
          <button 
            className="hamburger-btn" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <Link to="/#ownership" onClick={() => setIsMobileMenuOpen(false)}>Ownership</Link>
          <Link to="/#flagship" onClick={() => setIsMobileMenuOpen(false)}>Platform</Link>
          <Link to="/docs" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none' }}>Documentation</Link>
          <Link to="/#stack" onClick={() => setIsMobileMenuOpen(false)}>The Stack</Link>
        </div>
      </div>
    )}
    </>
  );
};
