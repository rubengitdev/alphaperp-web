import { useState } from 'react';
import type { FC } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useStableperpProgram } from '../../hooks/useStableperpProgram';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';

import { getOrCreateATAInstruction } from '../../utils/token';
import { TxModal } from '../common/TxModal';

interface WriteOptionProps {
  market: any | null;
  optionType?: 'call' | 'put';
}

export const WriteOption: FC<WriteOptionProps> = ({ market, optionType = 'call' }) => {
  const [qty, setQty] = useState('');
  const [premium, setPremium] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'info'; title: string; message: string; txSignature?: string }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const program = useStableperpProgram();

  const handleWrite = async (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = Math.floor(parseFloat(qty) * 10 ** 6);
    const premiumPrice = parseFloat(premium) * 10 ** 6;
    
    if (isNaN(quantity) || quantity <= 0 || isNaN(premiumPrice) || premiumPrice <= 0) {
      setModalState({ isOpen: true, type: 'error', title: 'Invalid Input', message: 'Please enter a valid quantity and premium.' });
      return;
    }
    if (!publicKey || !program) {
      setModalState({ isOpen: true, type: 'error', title: 'Wallet Not Connected', message: 'Please connect your wallet first.' });
      return;
    }
    setLoading(true);

    try {
      if (!market) throw new Error("No market selected.");

      const marketPubkey = new PublicKey(market.id || PublicKey.unique().toBase58());
      const optionMint = new PublicKey(market.optionMint || PublicKey.unique().toBase58());
      const underlyingMint = new PublicKey(market.underlyingMint || PublicKey.unique().toBase58());
      
      const [writerPosition] = PublicKey.findProgramAddressSync(
        [Buffer.from('writer'), marketPubkey.toBuffer(), publicKey.toBuffer()],
        program.programId
      );
      
      // escrowOptionVault is an ATA owned by the writerPosition PDA

      // Create ATAs if they don't exist
      const { ata: writerUnderlyingAta, instruction: createWriterUnderlyingAtaIx } = await getOrCreateATAInstruction(
        connection,
        publicKey,
        underlyingMint,
        publicKey // owner is the writer
      );

      const { ata: collateralVault, instruction: createCollateralVaultIx } = await getOrCreateATAInstruction(
        connection,
        publicKey,
        underlyingMint,
        marketPubkey // owner is the market PDA
      );

      const { ata: escrowOptionVault, instruction: createEscrowOptionVaultIx } = await getOrCreateATAInstruction(
        connection,
        publicKey,
        optionMint,
        writerPosition // owner is the writerPosition PDA
      );

      // We should check if the option mint exists, but we assume MarketList provided it correctly

      const transaction = new anchor.web3.Transaction();
      if (createWriterUnderlyingAtaIx) transaction.add(createWriterUnderlyingAtaIx);
      if (createCollateralVaultIx) transaction.add(createCollateralVaultIx);
      if (createEscrowOptionVaultIx) transaction.add(createEscrowOptionVaultIx);

      // AUTO-MINT LOGIC (For Admin/Deployer only)
      // If selling a Call on a synthetic asset, the admin needs the underlying token.
      const underlyingMintInfo = await connection.getAccountInfo(underlyingMint);
      const tokenProgramId = underlyingMintInfo?.owner || new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

      if (optionType === 'call' && market.isSynthetic) {
        try {
          const { createMintToInstruction } = await import('@solana/spl-token');
          let currentBalance = 0;
          try {
            const bal = await connection.getTokenAccountBalance(writerUnderlyingAta);
            currentBalance = bal.value.uiAmount || 0;
          } catch (e) {
            // ATA probably doesn't exist yet, balance is 0
          }
          
          let collateralNeededUi = parseFloat(qty);
          try {
            const onchainMarket = await (program.account as any).market.fetch(marketPubkey);
            if (onchainMarket.isSynthetic) {
              const payoutCap = onchainMarket.payoutCap.toNumber() / 1e6; // e.g., 500,000
              collateralNeededUi = parseFloat(qty) * payoutCap;
            }
          } catch (e) {
            console.error("Failed to fetch onchain market for payout cap", e);
            collateralNeededUi = parseFloat(qty) * 500000; // Fallback
          }

          if (currentBalance < collateralNeededUi) {
            const amountToMintUi = collateralNeededUi - currentBalance + 100; // 100 buffer
            // Mint tokens automatically to the admin so they have enough collateral
            const mintIx = createMintToInstruction(
              underlyingMint,
              writerUnderlyingAta,
              publicKey, // Must be the mint authority (admin)
              Math.ceil(amountToMintUi * 10 ** 6),
              [],
              tokenProgramId
            );
            transaction.add(mintIx);
            console.log(`✨ Auto-minting ${Math.ceil(amountToMintUi)} synthetic tokens to admin for collateral...`);
          }
        } catch (err) {
          console.error('Failed to add auto-mint instruction', err);
        }
      }

      const writeOptionIx = await program.methods.writeOption(
        new anchor.BN(quantity), 
        new anchor.BN(premiumPrice)
      ).accounts({
        market: marketPubkey,
        writerPosition,
        collateralVault,
        writerUnderlyingAta,
        optionMint,
        escrowOptionVault,
        writer: publicKey,
        underlyingMint,
        tokenProgram: tokenProgramId,
        associatedTokenProgram: new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'),
        systemProgram: SystemProgram.programId,
      }).instruction();

      transaction.add(writeOptionIx);

      const signature = await program.provider.sendAndConfirm!(transaction, []);
      console.log('✅ Transaction successful! TX Signature:', signature);
      setModalState({ 
        isOpen: true, 
        type: 'success', 
        title: 'Transaction Successful', 
        message: 'Your option has been successfully written and the market pool has been funded!', 
        txSignature: signature 
      });
      setQty('');
      setPremium('');
    } catch (err: any) {
      console.error('❌ Transaction error details:', err.message || err);
      if (err.logs) {
        console.error('❌ Program Logs:', err.logs);
      } else if (typeof err.getLogs === 'function') {
        try {
          const logs = await err.getLogs();
          console.error('❌ Program Logs:', logs);
        } catch(e) {}
      }

      let errorMessage = 'Transaction failed! Please ensure you have sufficient Collateral (Asset) and Solana for gas fees.';
      const logsStr = err.logs ? err.logs.join(' ') : '';
      const errString = (err.message || '') + JSON.stringify(err) + logsStr;
      
      if (errString.includes('0x1')) {
          errorMessage = 'Insufficient Token Balance! You do not have enough of the required collateral asset in your wallet to complete this transaction.';
      } else if (errString.includes('0xbbf') || errString.includes('AccountOwnedByWrongProgram')) {
          errorMessage = 'Account Owned By Wrong Program (0xbbf). This usually means the market data is outdated. Please refresh the page.';
      } else if (errString.includes('User rejected')) {
          errorMessage = 'Transaction was rejected by the user.';
      }

      setModalState({ 
        isOpen: true, 
        type: 'error', 
        title: 'Transaction Failed', 
        message: errorMessage 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleWrite} style={{ fontFamily: "'Space Mono', monospace" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ color: '#A3A3A3', fontSize: '0.875rem' }}>Strike</span>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '120px', justifyContent: 'space-between' }}>
          <span style={{ color: '#FFF' }}>{market ? market.strike : '-'}</span>
          <span style={{ color: '#A3A3A3', fontSize: '0.6rem' }}>▼</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span style={{ color: '#A3A3A3', fontSize: '0.875rem' }}>Expiry</span>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '120px', justifyContent: 'space-between' }}>
          <span style={{ color: '#FFF' }}>{market ? market.expiry : '-'}</span>
          <span style={{ color: '#A3A3A3', fontSize: '0.6rem' }}>▼</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span style={{ color: '#A3A3A3', fontSize: '0.875rem' }}>Contracts</span>
        <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
          <button type="button" onClick={() => setQty(String(Math.max(0, Number(qty || 0) - 1)))} style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', border: 'none', color: '#A3A3A3', cursor: 'pointer', borderRight: '1px solid rgba(255,255,255,0.1)' }}>-</button>
          <input type="number" step="1" placeholder="0" value={qty} onChange={(e) => setQty(e.target.value)} style={{ width: '60px', textAlign: 'center', backgroundColor: 'transparent', border: 'none', color: '#FFF', outline: 'none', fontFamily: "'Space Mono', monospace" }} />
          <button type="button" onClick={() => setQty(String(Number(qty || 0) + 1))} style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', border: 'none', color: '#A3A3A3', cursor: 'pointer', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>+</button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span style={{ color: '#A3A3A3', fontSize: '0.875rem' }}>Ask Premium</span>
        <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
          <input type="number" step="0.1" placeholder="e.g. 5" value={premium} onChange={(e) => setPremium(e.target.value)} style={{ width: '80px', textAlign: 'center', backgroundColor: 'transparent', border: 'none', color: '#FFF', outline: 'none', fontFamily: "'Space Mono', monospace" }} />
          <span style={{ padding: '0.5rem', borderLeft: '1px solid rgba(255,255,255,0.1)', color: '#A3A3A3', fontSize: '0.75rem' }}>USDC</span>
        </div>
      </div>

      <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ color: '#A3A3A3', fontSize: '0.75rem' }}>Premium Revenue</span>
          <span style={{ color: '#5EEAD4', fontSize: '0.75rem' }}>${((Number(qty) || 0) * (Number(premium) || 0)).toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ color: '#A3A3A3', fontSize: '0.75rem' }}>Collateral Required</span>
          <span style={{ color: '#FFF', fontSize: '0.75rem' }}>{((Number(qty) || 0) * (market?.isSynthetic ? 500000 : 1)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {market?.symbol?.split('/')[0]}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ color: '#A3A3A3', fontSize: '0.75rem' }}>Max profit</span>
          <span style={{ color: '#5EEAD4', fontSize: '0.75rem' }}>${((Number(qty) || 0) * (Number(premium) || 0)).toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ color: '#A3A3A3', fontSize: '0.75rem' }}>Max loss</span>
          <span style={{ color: '#F87171', fontSize: '0.75rem' }}>Unlimited</span>
        </div>
      </div>

      <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem', position: 'relative', height: '140px' }}>
         <div style={{ color: '#A3A3A3', fontSize: '0.75rem', position: 'absolute', top: '1rem', left: '1rem' }}>Payoff at expiry</div>
         <div style={{ color: '#A3A3A3', fontSize: '0.75rem', position: 'absolute', top: '1rem', right: '1rem' }}>BE ${market ? (market.strike + (optionType === 'call' ? (Number(premium) || 0) : -(Number(premium) || 0))).toFixed(2) : '-'}</div>
         
         <div style={{ position: 'absolute', bottom: '1.5rem', left: '1rem', right: '1rem', height: '60px', borderBottom: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
               {optionType === 'call' ? (
                 <>
                   <polygon points="0,30 50,30 50,50 0,50" fill="rgba(94, 234, 212, 0.2)" />
                   <polygon points="50,50 100,100 100,50" fill="rgba(248, 113, 113, 0.2)" />
                   <polyline points="0,30 50,30 100,80" fill="none" stroke="#5EEAD4" strokeWidth="2" />
                 </>
               ) : (
                 <>
                   <polygon points="50,30 100,30 100,50 50,50" fill="rgba(94, 234, 212, 0.2)" />
                   <polygon points="0,100 50,50 0,50" fill="rgba(248, 113, 113, 0.2)" />
                   <polyline points="0,80 50,30 100,30" fill="none" stroke="#5EEAD4" strokeWidth="2" />
                 </>
               )}
               <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.2)" strokeDasharray="4" />
            </svg>
         </div>
      </div>

      <button type="submit" disabled={loading || !market || Number(qty) <= 0 || Number(premium) <= 0} style={{
        width: '100%',
        padding: '1rem',
        backgroundColor: '#5EEAD4',
        color: '#0A0A0A',
        border: 'none',
        borderRadius: '8px',
        fontFamily: "'Space Mono', monospace",
        fontWeight: 'bold',
        fontSize: '0.9rem',
        cursor: (loading || !market || Number(qty) <= 0 || Number(premium) <= 0) ? 'not-allowed' : 'pointer',
        opacity: (loading || !market || Number(qty) <= 0 || Number(premium) <= 0) ? 0.5 : 1,
        transition: 'all 0.2s',
      }}>
        {loading ? 'WAITING FOR WALLET...' : `Sell ${qty || 0} ${market?.symbol?.split('/')[0] || ''} ${market?.strike || ''} ${optionType === 'call' ? 'Call' : 'Put'}`}
      </button>

      <TxModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        txSignature={modalState.txSignature}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
      />
    </form>
  );
};
