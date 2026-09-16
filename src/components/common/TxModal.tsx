import type { FC } from 'react';
import { useNetwork } from '../../contexts/NetworkContext';

interface TxModalProps {
  isOpen: boolean;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  txSignature?: string;
  onClose: () => void;
}

export const TxModal: FC<TxModalProps> = ({ isOpen, type, title, message, txSignature, onClose }) => {
  const { network } = useNetwork();
  
  if (!isOpen) return null;

  const handleCopy = () => {
    if (txSignature) {
      navigator.clipboard.writeText(txSignature);
      alert('Transaction signature copied to clipboard!'); // Keep this native alert small
    }
  };

  const colorMap = {
    success: '#10B981', // Emerald
    error: '#EF4444', // Red
    info: '#3B82F6', // Blue
  };

  const activeColor = colorMap[type];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        backgroundColor: '#1E1E1E',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '450px',
        width: '90%',
        border: `1px solid ${activeColor}55`,
        boxShadow: `0 4px 20px ${activeColor}22`,
        textAlign: 'center',
      }}>
        <h2 style={{ margin: '0 0 1rem 0', color: activeColor, fontSize: '1.5rem', fontWeight: 600 }}>
          {title}
        </h2>
        
        <p style={{ color: '#E5E5E5', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          {message}
        </p>

        {txSignature && (
          <div style={{
            backgroundColor: '#0F0F0F',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            wordBreak: 'break-all',
            color: '#A3A3A3',
            fontSize: '0.875rem',
            fontFamily: "'Space Mono', monospace",
          }}>
            <div style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#FFF' }}>Transaction Signature:</div>
            {txSignature}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                onClick={handleCopy}
                style={{
                  background: '#2A2A2A',
                  border: '1px solid #404040',
                  color: '#FFF',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'background 0.2s',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                Copy
              </button>
              <a
                href={`https://solscan.io/tx/${txSignature}${network === 'mainnet-beta' ? '' : `?cluster=${network}`}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: activeColor,
                  border: 'none',
                  color: '#FFF',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  display: 'block',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                View Explorer
              </a>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: `1px solid ${activeColor}`,
            color: activeColor,
            padding: '0.75rem 2rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            transition: 'all 0.2s',
            width: '100%'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = `${activeColor}22`;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          {type === 'error' ? 'Close' : 'Awesome!'}
        </button>
      </div>
    </div>
  );
};
