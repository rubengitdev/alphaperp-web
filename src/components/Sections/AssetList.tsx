import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { HermesClient } from '@pythnetwork/hermes-client';
import { useNetwork } from '../../contexts/NetworkContext';

export interface Asset {
  id: string;
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
}

interface AssetListProps {
  onSelectAsset?: (asset: Asset) => void;
  selectedAssetId?: string;
  onPricesUpdate?: (prices: Record<string, Asset>) => void;
}

const TRACKED_SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'SOLUSDT',
  'JUPUSDT', 'JTOUSDT', 'PYTHUSDT',
  'WIFUSDT', 'BONKUSDT', 'RAYUSDT',
  'RENDERUSDT',
];

const PYTH_SYMBOLS = [
  { symbol: 'TSLA', feedId: '16dad506d7db8da01c87581c87ca897a012a153557d4d578c3b9c9e1bc0632f1' },
  { symbol: 'AAPL', feedId: '49f6b65cb1de6b10eaf75e7c03ca029c306d0357e91b5311b175084a5ad55688' },
  { symbol: 'NVDA', feedId: 'b1073854ed24cbc755dc527418f52b7d271f6cc967bbf8d8129112b18860a593' },
  { symbol: 'MSFT', feedId: 'd0ca23c1cc005e004ccf1db5bf76aeb6a49218f43dac3d4b275e92de12ded4d1' },
  { symbol: 'AMZN', feedId: 'b5d0e0fa58a1f8b81498ae670ce93c872d14434b72c364885d4fa1b257cbb07a' },
  { symbol: 'GOOGL', feedId: '5a48c03e9b9cb337801073ed9d166817473697efff0d138874e0f6a33d6d5aa6' },
  { symbol: 'META', feedId: '78a3e3b8e676a8f73c439f5d749737034b139bbbe899ba5775216fba596607fe' },
  { symbol: 'NFLX', feedId: '8376cfd7ca8bcdf372ced05307b24dced1f15b1afafdeff715664598f15a3dd2' },
  { symbol: 'AMD',  feedId: '3622e381dbca2efd1859253763b1adc63f7f9abb8e76da1aa8e638a57ccde93e' },
  { symbol: 'COIN', feedId: 'fee33f2a978bf32dd6b662b65ba8083c6773b494f8401194ec1870c640860245' },
  { symbol: 'SPY',  feedId: '19e09bb805456ada3979a7d1cbb4b6d63babc3a0f8e8a9509f68afa5c4c11cd5' },
  { symbol: 'QQQ',  feedId: '9695e2b96ea7b3859da9ed25b7a46a920a776e2fdae19a7bcfdf2b219230452d' },
  { symbol: 'GME',  feedId: '6f9cd89ef1b7fd39f667101a91ad578b6c6ace4579d5f7f285a4b06aa4504be6' },
];

const buildInitialMap = (): Record<string, Asset> => {
  const map: Record<string, Asset> = {};
  TRACKED_SYMBOLS.forEach((sym) => {
    const base = sym.replace('USDT', '');
    map[base] = { id: base, symbol: base, price: 0, change24h: 0, volume24h: 0 };
  });
  PYTH_SYMBOLS.forEach((sym) => {
    map[sym.symbol] = { id: sym.symbol, symbol: sym.symbol, price: 0, change24h: 0, volume24h: 0 };
  });
  return map;
};

export const AssetList: FC<AssetListProps> = ({ onSelectAsset, selectedAssetId, onPricesUpdate }) => {
  const [activeTab, setActiveTab] = useState<'crypto' | 'stocks'>('stocks');
  const [assetMap, setAssetMap] = useState<Record<string, Asset>>(buildInitialMap);
  const { apiUrl } = useNetwork();
  const hasAutoSelected = useRef(false);
  const wsRef = useRef<WebSocket | null>(null);
  const hermesRef = useRef(new HermesClient("https://hermes.pyth.network"));

  useEffect(() => {
    // Subscribe to Binance individual symbol miniTicker streams
    const streams = TRACKED_SYMBOLS.map((s) => `${s.toLowerCase()}@miniTicker`).join('/');
    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    const connect = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        const d = msg.data;
        if (!d) return;

        const base = (d.s as string).replace('USDT', '');
        const close = parseFloat(d.c);
        const open = parseFloat(d.o);
        const change24h = open > 0 ? ((close - open) / open) * 100 : 0;
        
        setAssetMap((prev) => ({
          ...prev,
          [base]: {
            id: base,
            symbol: base,
            price: close,
            change24h,
            volume24h: parseFloat(d.q),
          },
        }));
      };

      ws.onerror = () => ws.close();
      ws.onclose = () => {
        // Reconnect after 3s if not intentionally closed
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect loop on unmount
        wsRef.current.close();
      }
    };
  }, []);

  // Poll Pyth for US Stocks and fetch 24h change
  useEffect(() => {
    let pythInterval: NodeJS.Timeout;
    let changeInterval: NodeJS.Timeout;

    async function fetchPyth() {
      try {
        const feedIds = PYTH_SYMBOLS.map(p => p.feedId);
        const parsedData = await hermesRef.current.getLatestPriceUpdates(feedIds);
        
        const parsed = parsedData?.parsed;
        if (parsed) {
          setAssetMap(prev => {
            const next = { ...prev };
            parsed.forEach((feed: any) => {
              const symInfo = PYTH_SYMBOLS.find(p => p.feedId === feed.id);
              if (symInfo) {
                const price = feed.price.price * (10 ** feed.price.expo);
                next[symInfo.symbol] = {
                  ...next[symInfo.symbol],
                  price,
                };
              }
            });
            return next;
          });
        }
      } catch (e) {
        console.error('Pyth fetch error in AssetList', e);
      }
    }

    async function fetchStockChanges() {
      try {
        const symbolsStr = PYTH_SYMBOLS.map(p => p.symbol).join(',');
        const res = await fetch(`${apiUrl}/stocks/change?symbols=${symbolsStr}`);
        const json = await res.json();
        
        if (json.success && json.data) {
          setAssetMap(prev => {
            const next = { ...prev };
            Object.keys(json.data).forEach(sym => {
              if (next[sym]) {
                next[sym] = {
                  ...next[sym],
                  change24h: json.data[sym].change24h,
                  // We can optionally use volume, but user wants to hide it.
                };
              }
            });
            return next;
          });
        }
      } catch (e) {
        console.error('Failed to fetch stock 24h changes', e);
      }
    }

    fetchPyth();
    fetchStockChanges();
    
    pythInterval = setInterval(fetchPyth, 5000);
    // Fetch changes less frequently (every 60s) since they update slowly
    changeInterval = setInterval(fetchStockChanges, 60000);

    return () => {
      clearInterval(pythInterval);
      clearInterval(changeInterval);
    };
  }, [apiUrl]);

  // Notify parent of price updates safely outside the reducer
  useEffect(() => {
    if (onPricesUpdate) {
      onPricesUpdate(assetMap);
    }
  }, [assetMap, onPricesUpdate]);

  // Auto-select first asset on load
  useEffect(() => {
    if (hasAutoSelected.current || !onSelectAsset || selectedAssetId) return;
    const first = Object.values(assetMap).find((a) => {
      if (a.price <= 0) return false;
      const isStock = PYTH_SYMBOLS.some(p => p.symbol === a.symbol);
      return activeTab === 'stocks' ? isStock : !isStock;
    });
    if (first) {
      hasAutoSelected.current = true;
      onSelectAsset(first);
    }
  }, [assetMap, onSelectAsset, selectedAssetId, activeTab]);

  const handleTabChange = (tab: 'crypto' | 'stocks') => {
    setActiveTab(tab);
    if (onSelectAsset) {
      const firstInTab = Object.values(assetMap).find(a => {
        const isStock = PYTH_SYMBOLS.some(p => p.symbol === a.symbol);
        return tab === 'stocks' ? isStock : !isStock;
      });
      if (firstInTab) {
        onSelectAsset(firstInTab);
      }
    }
  };

  const assets = Object.values(assetMap).filter(asset => {
    const isStock = PYTH_SYMBOLS.some(p => p.symbol === asset.symbol);
    return activeTab === 'stocks' ? isStock : !isStock;
  });

  const formatVolume = (v: number) => {
    if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    return `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)', 
        marginBottom: '0.5rem',
        position: 'sticky',
        top: 0,
        backgroundColor: 'rgba(20, 20, 20, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 10,
        paddingTop: '0.5rem',
        margin: '0 -0.5rem', // Offset padding if any, to connect to edges
        padding: '0.5rem 0.5rem 0 0.5rem'
      }}>
        <button 
          onClick={() => handleTabChange('crypto')}
          style={{ flex: 1, padding: '0.5rem', backgroundColor: 'transparent', color: activeTab === 'crypto' ? '#5EEAD4' : '#A3A3A3', border: 'none', borderBottom: activeTab === 'crypto' ? '2px solid #5EEAD4' : '2px solid transparent', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
        >
          CRYPTO
        </button>
        <button 
          onClick={() => handleTabChange('stocks')}
          style={{ flex: 1, padding: '0.5rem', backgroundColor: 'transparent', color: activeTab === 'stocks' ? '#5EEAD4' : '#A3A3A3', border: 'none', borderBottom: activeTab === 'stocks' ? '2px solid #5EEAD4' : '2px solid transparent', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
        >
          US STOCKS
        </button>
      </div>
      {assets.map((asset) => {
        const isSelected = selectedAssetId === asset.id;
        const isPositive = asset.change24h >= 0;
        return (
          <div
            key={asset.id}
            onClick={() => onSelectAsset && onSelectAsset(asset)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: isSelected ? 'rgba(94, 234, 212, 0.1)' : 'transparent',
              border: isSelected ? '1px solid rgba(94, 234, 212, 0.2)' : '1px solid transparent',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div>
              <div style={{ fontWeight: 'bold', color: '#FFF', fontSize: '0.875rem' }}>
                {asset.symbol}{PYTH_SYMBOLS.some(p => p.symbol === asset.symbol) ? '' : '/USDT'}
              </div>
              {!PYTH_SYMBOLS.some(p => p.symbol === asset.symbol) && (
                <div style={{ color: '#A3A3A3', fontSize: '0.7rem', marginTop: '0.2rem' }}>
                  {asset.volume24h > 0 ? formatVolume(asset.volume24h) : '—'}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold', color: '#FFF', fontSize: '0.875rem' }}>
                {asset.price > 0
                  ? `$${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: asset.price < 0.01 ? 6 : 2 })}`
                  : '—'}
              </div>
              <div style={{ color: isPositive ? '#5EEAD4' : '#F87171', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                {asset.change24h !== 0 ? `${isPositive ? '+' : ''}${asset.change24h.toFixed(2)}% (24H)` : '—'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

