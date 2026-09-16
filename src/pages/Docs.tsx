import type { FC } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SilkBackground } from '../components/SilkBackground';
import { LogoText } from '../components/Navbar';

const MINT = "#97FCE4";
const INK = "#0A2622";
const CREAM = "#E9F7F0";
const MUT_INK = "rgba(10,38,34,0.62)";

const SERIF = "'Fraunces', Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export const Docs: FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ color: INK, fontFamily: SANS, minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <SilkBackground color={INK} bgColor={CREAM} speed={1.2} intensity={1.5} scale={2.5} />
      
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '800px',
        margin: '0 auto',
        padding: '8rem 2rem 4rem',
        color: INK,
        fontFamily: SANS,
        lineHeight: '1.8'
      }}>
        <div className="glass-panel" style={{ padding: '3rem', borderRadius: '24px', background: '#fff', border: '1px solid rgba(10,38,34,0.08)', boxShadow: '0 10px 40px rgba(10,38,34,0.05)' }}>
          <h1 style={{ fontFamily: SERIF, fontSize: '2.5rem', fontWeight: 400, color: INK, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            <LogoText /> Documentation
          </h1>
          <p style={{ color: MUT_INK, marginBottom: '3rem', fontSize: '1.1rem' }}>
            Learn how to trade options, provide liquidity, and integrate with the <LogoText /> protocol.
          </p>

          <h2 style={{ borderBottom: '1px solid rgba(10,38,34,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: INK, fontFamily: SERIF, fontWeight: 500 }}>
            Overview
          </h2>
          <p style={{ marginBottom: '2rem', color: MUT_INK }}>
            <LogoText /> is a decentralized derivatives protocol built on Solana. It allows users to trade fully-collateralized call and put options on various assets (Crypto and US Stocks) settled entirely in USDC.
          </p>

          <h2 style={{ borderBottom: '1px solid rgba(10,38,34,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: INK, fontFamily: SERIF, fontWeight: 500 }}>
            Trading Options (Buying)
          </h2>
          <p style={{ marginBottom: '1rem', color: MUT_INK }}>
            As an option buyer, you pay a premium upfront to secure the right (but not the obligation) to buy or sell the underlying asset at a specific <strong>Strike Price</strong> before the <strong>Expiry</strong>.
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem', color: MUT_INK }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Call Option:</strong> You profit if the asset price rises above the strike price.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Put Option:</strong> You profit if the asset price falls below the strike price.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Max Loss:</strong> Limited to the premium paid.</li>
          </ul>

          <h2 style={{ borderBottom: '1px solid rgba(10,38,34,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: INK, fontFamily: SERIF, fontWeight: 500 }}>
            Writing Options (Providing Liquidity)
          </h2>
          <p style={{ marginBottom: '1rem', color: MUT_INK }}>
            Users can "Write" options to earn the premium paid by buyers. Writing an option requires fully locking up USDC collateral in an escrow vault until expiry or exercise.
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem', color: MUT_INK }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Covered Calls:</strong> You lock USDC equivalent to the payout if the strike is breached.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Cash-Secured Puts:</strong> You lock USDC equivalent to the strike price.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Profit:</strong> You keep the premium if the option expires out-of-the-money.</li>
          </ul>

          <h2 style={{ borderBottom: '1px solid rgba(10,38,34,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: INK, fontFamily: SERIF, fontWeight: 500 }}>
            Settlement & Oracles
          </h2>
          <p style={{ marginBottom: '2rem', color: MUT_INK }}>
            All markets are settled in <strong>USDC</strong>. The protocol uses the <strong>Pyth Network</strong> as a decentralized oracle to determine the mark price of assets for accurate settlement and payoff calculations.
          </p>

          <div style={{ marginTop: '4rem', textAlign: 'center' }}>
            <Link to="/terminal" style={{
              fontFamily: SANS, fontSize: 16, textDecoration: "none", padding: "15px 34px", borderRadius: 999,
              background: MINT, color: INK,
              border: `1.5px solid ${MINT}`, display: "inline-block", fontWeight: 500,
            }}>
              OPEN TERMINAL
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
