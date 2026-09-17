import type { FC } from 'react';

export const KYCDisclaimer: FC = () => {
  return (
    <div style={{
      marginTop: '2rem',
      padding: '1rem',
      borderTop: '1px solid rgba(247, 244, 237, 0.1)',
      textAlign: 'center',
      fontSize: '0.75rem',
      color: 'rgba(247, 244, 237, 0.45)',
      fontFamily: "'Satoshi', -apple-system, system-ui, sans-serif"
    }}>
      <p style={{ margin: 0 }}>
        <strong>DISCLAIMER:</strong> Trading synthetic US Stock Options requires identity verification (KYC/AML).
        This platform does not offer services to persons in restricted jurisdictions (including but not limited to the United States).
        By connecting your wallet and trading on AlphaPerp, you confirm you are legally permitted to do so.
      </p>
    </div>
  );
};
