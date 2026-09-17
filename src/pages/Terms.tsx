import type { FC } from 'react';
import { LogoText } from '../components/Navbar';

export const Terms: FC = () => {
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
                    maxWidth: '68ch',
                    margin: '0 auto',
                    padding: '8rem 2rem 6rem',
                    lineHeight: 1.7,
                }}
            >
                <h1 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>
                    Terms & conditions
                </h1>
                <p
                    className="mono-num"
                    style={{
                        color: 'var(--color-text-muted)',
                        fontSize: '0.875rem',
                        marginBottom: '1.5rem',
                    }}
                >
                    Last updated: August 2026
                </p>
                <div
                    style={{
                        borderTop: '1px solid rgba(247,244,237,0.1)',
                        marginBottom: '2.5rem',
                    }}
                />

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                        1. Introduction
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Welcome to <LogoText />. By accessing or using our
                        decentralized protocol and website, you agree to be
                        bound by these Terms & Conditions. If you do not
                        agree to all the terms and conditions, then you may
                        not access the protocol.
                    </p>
                </section>

                <section
                    style={{
                        marginBottom: '2.5rem',
                        paddingTop: '2.5rem',
                        borderTop: '1px solid rgba(247,244,237,0.1)',
                    }}
                >
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                        2. Decentralized protocol
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        <LogoText /> is a decentralized application (dApp)
                        built on the Solana blockchain. We do not hold your
                        funds, take custody of your assets, or execute
                        trades on your behalf. All transactions are
                        peer-to-peer and governed entirely by smart
                        contracts.
                    </p>
                </section>

                <section
                    style={{
                        paddingTop: '2.5rem',
                        borderTop: '1px solid rgba(247,244,237,0.1)',
                    }}
                >
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                        3. Risk assumption
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Trading synthetic derivatives involves significant
                        risk of capital loss. Options and perpetual
                        contracts can expire worthless. By using this
                        protocol, you acknowledge that you are fully aware
                        of these risks and solely responsible for any
                        losses incurred.
                    </p>
                </section>
            </div>
        </div>
    );
};
