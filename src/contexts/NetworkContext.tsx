import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type NetworkType = 'devnet' | 'mainnet-beta';

interface NetworkContextState {
  network: NetworkType;
  setNetwork: (network: NetworkType) => void;
  rpcUrl: string;
  apiUrl: string;
}

const NetworkContext = createContext<NetworkContextState | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [network, setNetworkState] = useState<NetworkType>(() => {
    const saved = localStorage.getItem('stableperp-network');
    return (saved as NetworkType) || 'devnet';
  });

  useEffect(() => {
    localStorage.setItem('stableperp-network', network);
  }, [network]);

  const setNetwork = (newNetwork: NetworkType) => {
    setNetworkState(newNetwork);
  };

  const rpcUrl = network === 'mainnet-beta'
    ? import.meta.env.VITE_MAINNET_RPC_URL || 'https://api.mainnet-beta.solana.com'
    : import.meta.env.VITE_RPC_URL || 'https://api.devnet.solana.com';

  const baseApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

  return (
    <NetworkContext.Provider value={{ network, setNetwork, rpcUrl, apiUrl: baseApiUrl }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
