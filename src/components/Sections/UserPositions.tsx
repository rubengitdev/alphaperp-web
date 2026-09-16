import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { HermesClient } from '@pythnetwork/hermes-client';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useStableperpProgram } from '../../hooks/useStableperpProgram';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { useNetwork } from '../../contexts/NetworkContext';

// Resolve underlying mint prefix to Binance symbol for live price
const MINT_PREFIX_TO_SYMBOL: Record<string, string> = {
  J9B: 'BTC',
  '7vx': 'ETH',
  Sol: 'SOL',
};

function resolveSymbol(underlyingMint: string): string {
  for (const prefix of Object.keys(MINT_PREFIX_TO_SYMBOL)) {
    if (underlyingMint.startsWith(prefix)) return MINT_PREFIX_TO_SYMBOL[prefix];
  }
  return 'SOL'; // Default fallback
}

interface Position {
  id: string;
  type: 'LONG' | 'SHORT';
  market: string;
  symbol: string; // Underlying e.g. "BTC"
  strike: number;
  size: number;
  premium: number;
  pnl: number | null;
  pythFeedId?: string | null;
  marketId?: string;
  underlyingMint?: string;
  optionMint?: string;
}

export const UserPositions: FC = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const program = useStableperpProgram();

  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const { network, apiUrl } = useNetwork();
  const wsRef = useRef<WebSocket | null>(null);
  const hermesRef = useRef(new HermesClient("https://hermes.pyth.network"));

  // Subscribe to live prices for position symbols
  useEffect(() => {
    const symbols = ['btcusdt', 'ethusdt', 'solusdt', 'jupusdt'];
    const streams = symbols.map((s) => `${s}@miniTicker`).join('/');
    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    const connect = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        const d = msg.data;
        if (!d) return;
        const sym = (d.s as string).replace('USDT', '');
        setPrices((prev) => ({ ...prev, [sym]: parseFloat(d.c) }));
      };

      ws.onerror = () => ws.close();
      ws.onclose = () => setTimeout(connect, 3000);
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    async function fetchPositions() {
      if (!publicKey || !program) return;

      try {
        setLoading(true);

        // Fetch markets from backend API
        let fetchedApiMarkets = [];
        try {
           const res = await fetch(`${apiUrl}/markets?network=${network}`);
           const json = await res.json();
           if (json.success) {
             fetchedApiMarkets = json.data;
           }
        } catch (e) {
           console.error("Failed to fetch API markets", e);
        }

        // 1. Fetch Written (SHORT) Positions
        const writerPositions = await (program as any).account.writerPosition.all([
          {
            memcmp: {
              offset: 40,
              bytes: publicKey.toBase58(),
            },
          },
        ]);

        const markets = await (program as any).account.market.all();
        const marketMap = new Map();
        markets.forEach((m: any) => marketMap.set(m.publicKey.toString(), m.account));

        const formattedWritten = writerPositions
          .filter((wp: any) => {
             // Only show positions that still have unsold or filled options
             return wp.account.mintedAmount.toNumber() > 0 || wp.account.filledAmount.toNumber() > 0;
          })
          .map((wp: any) => {
          const mktId = wp.account.market.toString();
          const marketData = marketMap.get(mktId);
          let market = 'Unknown';
          let symbol = 'SOL';
          let strike = 0;
          let pythFeedId = null;

          if (marketData) {
            // First check if it matches an API market for symbol and strike
            const apiMkt = fetchedApiMarkets.find((m: any) => m.address === mktId);
            if (apiMkt) {
              symbol = apiMkt.symbol.split('/')[0];
              market = apiMkt.symbol;
              strike = apiMkt.strike;
              pythFeedId = apiMkt.pythFeedId;
            } else {
              const underlyingMint = marketData.underlyingMint.toString();
              strike = marketData.strike.toNumber();
              symbol = resolveSymbol(underlyingMint);
              market = `${symbol}/USDC`;
            }
          }

          return {
            id: wp.publicKey.toString(),
            type: 'SHORT',
            market,
            symbol,
            strike,
            size: wp.account.mintedAmount.toNumber() / (10 ** 6),
            premium: wp.account.premiumAsk.toNumber() / (10 ** 6),
            pnl: null, // Calculated reactively from live prices
            pythFeedId,
            marketId: mktId,
            underlyingMint: marketData?.underlyingMint?.toString(),
            optionMint: marketData?.optionMint?.toString()
          };
        });

        // 2. Fetch Long (Bought) Positions via SPL Token
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: TOKEN_PROGRAM_ID,
        });

        const formattedLong: Position[] = [];

        for (const ta of tokenAccounts.value) {
          const accountData = ta.account.data.parsed.info;
          const mint = accountData.mint;
          const rawAmount = parseInt(accountData.tokenAmount.amount);
          const amount = rawAmount / (10 ** 6);

          if (amount > 0) {
            const matchingMarket = markets.find(
              (m: any) => m.account.optionMint.toString() === mint,
            );

            if (matchingMarket) {
              let symbol = 'SOL';
              let market = 'Unknown';
              let pythFeedId = null;
              let strike = 0;
              
              const apiMkt = fetchedApiMarkets.find((m: any) => m.address === matchingMarket.publicKey.toString());
              if (apiMkt) {
                symbol = apiMkt.symbol.split('/')[0];
                market = apiMkt.symbol;
                strike = apiMkt.strike;
                pythFeedId = apiMkt.pythFeedId;
              } else {
                const underlyingMint = matchingMarket.account.underlyingMint.toString();
                symbol = resolveSymbol(underlyingMint);
                market = `${symbol}/USDC`;
                strike = matchingMarket.account.strike.toNumber() / (10 ** 6);
              }

                const writer = writerPositions.find((wp: any) => wp.account.market.toString() === matchingMarket.publicKey.toString());
                const premium = writer ? writer.account.premiumAsk.toNumber() / (10 ** 6) : 0;
                
                formattedLong.push({
                  id: ta.pubkey.toString(),
                  type: 'LONG',
                  market,
                  symbol,
                  strike,
                  size: amount,
                  premium,
                  pnl: null,
                  pythFeedId
                });
            }
          }
        }

        setPositions([...formattedLong, ...formattedWritten]);
      } catch (err) {
        console.error('Error fetching positions:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPositions();
    const interval = setInterval(fetchPositions, 15000);
    return () => clearInterval(interval);
  }, [publicKey, program, connection, network, apiUrl]);

  // Poll Pyth Prices for positions with pythFeedIds
  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function updatePythPrices() {
      const feedIds = Array.from(new Set(
        positions
          .map((p: any) => p.pythFeedId)
          .filter(Boolean)
          .map(id => {
            let sId = id as string;
            if (sId.startsWith('0x')) sId = sId.slice(2);
            return sId;
          })
      ));

      if (feedIds.length === 0) return;

      try {
        const parsedData = await hermesRef.current.getLatestPriceUpdates(feedIds as string[]);
        const newPrices: Record<string, number> = {};
        
        if (parsedData && parsedData.parsed) {
          parsedData.parsed.forEach((feed: any) => {
             const price = feed.price.price * (10 ** feed.price.expo);
             // find the matching position symbol
             const position = positions.find((p: any) => {
                const pId = p.pythFeedId || '';
                return pId.includes(feed.id);
             });
             if (position) {
               newPrices[position.symbol] = price;
             }
          });
        }
        
        if (Object.keys(newPrices).length > 0) {
          setPrices(prev => ({ ...prev, ...newPrices }));
        }
      } catch (err) {
        console.error('Failed to fetch Pyth prices', err);
      }
    }

    if (positions.length > 0) {
      updatePythPrices();
      interval = setInterval(updatePythPrices, 5000); // Poll every 5s
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [positions]);

  // Calculate PnL reactively from live WebSocket prices
  const positionsWithPnl = positions.map((pos) => {
    const currentPrice = prices[pos.symbol] ?? null;
    if (currentPrice === null) return { ...pos, pnl: null };

    // LONG: value = max(current - strike, 0) - premium
    // SHORT: value = premium - max(current - strike, 0)
    let pnl: number;
    if (pos.type === 'LONG') {
      pnl = (Math.max(currentPrice - pos.strike, 0) - pos.premium) * pos.size;
    } else {
      pnl = (pos.premium - Math.max(currentPrice - pos.strike, 0)) * pos.size;
    }

    return { ...pos, pnl };
  });

  const formatPnl = (pnl: number | null): string => {
    if (pnl === null) return '—';
    return `${pnl >= 0 ? '+' : ''}$${pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (!publicKey) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#525252', fontSize: '0.875rem' }}>
        Please connect your wallet to view open positions.
      </div>
    );
  }

  const handleReclaim = async (marketId: string, underlyingMint: string, optionMint: string) => {
    if (!publicKey || !program) return;
    try {
      const [writerPosition] = PublicKey.findProgramAddressSync(
        [Buffer.from('writer'), new PublicKey(marketId).toBuffer(), publicKey.toBuffer()],
        program.programId
      );
      const collateralVault = await getAssociatedTokenAddress(new PublicKey(underlyingMint), new PublicKey(marketId), true);
      const writerUnderlyingAta = await getAssociatedTokenAddress(new PublicKey(underlyingMint), publicKey);
      const escrowOptionVault = await getAssociatedTokenAddress(new PublicKey(optionMint), writerPosition, true);

      await program.methods.reclaimCollateral().accounts({
        market: new PublicKey(marketId),
        writerPosition,
        collateralVault,
        writerUnderlyingAta,
        escrowOptionVault,
        optionMint: new PublicKey(optionMint),
        writer: publicKey,
        underlyingMint: new PublicKey(underlyingMint),
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      }).rpc();
      
      alert('Successfully reclaimed collateral / closed position.');
      window.location.reload(); // refresh
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes('No unsold options')) {
         alert('No unsold options to close.');
      } else {
         alert('Failed to close position.');
      }
    }
  };

  if (loading && positions.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#525252', fontSize: '0.875rem' }}>
        Loading positions...
      </div>
    );
  }

  if (positionsWithPnl.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#525252', fontSize: '0.875rem' }}>
        No open positions. Click a strike in the chain to build a trade.
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', fontFamily: "'Space Mono', monospace" }}>
        <thead>
          <tr style={{ color: '#A3A3A3', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <th style={{ padding: '0.5rem 1rem', fontWeight: 'normal' }}>Type</th>
            <th style={{ padding: '0.5rem 1rem', fontWeight: 'normal' }}>Market</th>
            <th style={{ padding: '0.5rem 1rem', fontWeight: 'normal' }}>Strike</th>
            <th style={{ padding: '0.5rem 1rem', fontWeight: 'normal' }}>Size</th>
            <th style={{ padding: '0.5rem 1rem', fontWeight: 'normal' }}>Mark Price</th>
            <th style={{ padding: '0.5rem 1rem', fontWeight: 'normal', textAlign: 'right' }}>Est. PnL</th>
            <th style={{ padding: '0.5rem 1rem', fontWeight: 'normal', textAlign: 'center' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {positionsWithPnl.map((pos, idx) => {
            const pnlColor = pos.pnl === null ? '#A3A3A3' : pos.pnl >= 0 ? '#5EEAD4' : '#F87171';
            const markPrice = prices[pos.symbol];
            return (
              <tr
                key={idx}
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.02)',
                  color: '#E5E5E5',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <td style={{ padding: '0.75rem 1rem', color: pos.type === 'LONG' ? '#5EEAD4' : '#F87171', fontWeight: 'bold' }}>
                  {pos.type}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>{pos.market}</td>
                <td style={{ padding: '0.75rem 1rem' }}>${pos.strike.toLocaleString()}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{pos.size}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#A3A3A3' }}>
                  {markPrice ? `$${markPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                </td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: pnlColor, fontWeight: 'bold' }}>
                  {formatPnl(pos.pnl)}
                </td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                  {pos.type === 'SHORT' ? (
                    <button
                      onClick={() => handleReclaim(pos.marketId || '', pos.underlyingMint || '', pos.optionMint || '')}
                      style={{
                        background: 'rgba(248,113,113,0.1)',
                        color: '#F87171',
                        border: '1px solid rgba(248,113,113,0.2)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontFamily: 'inherit'
                      }}
                    >
                      Close
                    </button>
                  ) : (
                    <span style={{ color: '#525252' }}>-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

