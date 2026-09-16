import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import type { Idl } from '@coral-xyz/anchor';
import { useMemo } from 'react';
import stableperpIdl from '../idl/stableperp.json';
import { PublicKey } from '@solana/web3.js';
import { useNetwork } from '../contexts/NetworkContext';

// Dummy wallet for read-only mode
const dummyWallet = {
  publicKey: PublicKey.default,
  signTransaction: () => Promise.reject(),
  signAllTransactions: () => Promise.reject(),
};

export function useStableperpProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const { network } = useNetwork();

  const program = useMemo(() => {
    // If no wallet is connected, use dummyWallet for read-only mode
    const activeWallet = wallet || dummyWallet;
    
    const provider = new AnchorProvider(connection, activeWallet as any, {
      preflightCommitment: 'processed',
    });
    
    // Deep clone the IDL to safely modify it
    const idl = JSON.parse(JSON.stringify(stableperpIdl));
    if (network === 'mainnet-beta') {
      idl.address = import.meta.env.VITE_MAINNET_PROGRAM_ID;
    }
    
    return new Program(idl as unknown as Idl, provider);
  }, [connection, wallet, network]);

  return program;
}
