import type { FC } from 'react';
import { LogoText } from '../components/Navbar';

export const Privacy: FC = () => {
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
                    Privacy policy
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
                        1. Information we do not collect
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        As a decentralized application (dApp), <LogoText />{' '}
                        respects your privacy. We do not require you to
                        create an account, provide an email address, or
                        submit KYC (Know Your Customer) information to
                        interact with our smart contracts.
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
                        2. Blockchain data
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        By using the <LogoText /> protocol, you understand
                        that all transaction data — including your public
                        wallet address and trading history — is permanently
                        recorded on the Solana blockchain, which is a public
                        and immutable ledger. We have no control over this
                        data.
                    </p>
                </section>

                <section
                    style={{
                        paddingTop: '2.5rem',
                        borderTop: '1px solid rgba(247,244,237,0.1)',
                    }}
                >
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                        3. Local storage
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Our website may use local storage or session storage
                        within your browser to save UI preferences (e.g.,
                        active tabs, RPC network preferences). This data is
                        stored locally on your device and is not
                        transmitted to any centralized servers.
                    </p>
                </section>
            </div>
        </div>
    );
};
