import type { FC } from 'react';

export const KYCDisclaimer: FC = () => {
  return (
    <div style={{
      marginTop: '2rem',
      padding: '1rem',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      textAlign: 'center',
      fontSize: '0.75rem',
      color: '#737373',
      fontFamily: "'Space Mono', monospace"
    }}>
      <p style={{ margin: 0 }}>
        <strong>DISCLAIMER:</strong> Trading synthetic US Stock Options requires identity verification (KYC/AML).
        This platform does not offer services to persons in restricted jurisdictions (including but not limited to the United States).
        By connecting your wallet and trading on Stableperp, you confirm you are legally permitted to do so.
      </p>
    </div>
  );
};
