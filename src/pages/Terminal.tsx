import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MarketList } from '../components/Sections/MarketList';
import { WriteOption } from '../components/Sections/WriteOption';
import { BuyOption } from '../components/Sections/BuyOption';
import { TradingViewChart } from '../components/TradingViewChart';
import { UserPositions } from '../components/Sections/UserPositions';
import { AssetList, type Asset } from '../components/Sections/AssetList';
import { KYCDisclaimer } from '../components/common/KYCDisclaimer';
import './Terminal.css';

export function Terminal() {
  const [searchParams] = useSearchParams();
  const initialMarketId = searchParams.get('market');
  const initialAction = searchParams.get('action'); // "buy_call", "write_call", etc.

  const [orderAction, setOrderAction] = useState<'buy' | 'sell'>(initialAction?.startsWith('write') ? 'sell' : 'buy');
  const [orderType, setOrderType] = useState<'call' | 'put'>(initialAction?.endsWith('put') ? 'put' : 'call');
  const [bottomTab, setBottomTab] = useState<'chain' | 'positions'>('chain');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<any | null>(null);
  const [livePrices, setLivePrices] = useState<Record<string, Asset>>({});

  const headerAsset = selectedAsset ? (livePrices[selectedAsset.id] || selectedAsset) : null;

  // Check US Market Hours
  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcMinute = now.getUTCMinutes();
  const nyTime = (utcHour - 4 + 24) % 24; 
  const isWeekend = now.getUTCDay() === 0 || now.getUTCDay() === 6;
  const isBeforeOpen = nyTime < 9 || (nyTime === 9 && utcMinute < 30);
  const isAfterClose = nyTime >= 16;
  const usMarketClosed = isWeekend || isBeforeOpen || isAfterClose;
  
  const isCrypto = ['BTC', 'ETH', 'SOL', 'JUP', 'JTO', 'PYTH', 'WIF', 'BONK', 'RAY', 'RENDER'].includes(selectedAsset?.symbol || '');
  const showStockBanner = usMarketClosed && selectedAsset && !isCrypto;

  return (
    <div className="terminal-layout">
      {/* LEFT SIDEBAR: MARKETS */}
      <div className="terminal-panel terminal-left">
        <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontSize: '0.75rem', color: '#A3A3A3', letterSpacing: '0.1em', fontWeight: 'bold' }}>MARKETS</div>
          <div style={{ fontSize: '0.65rem', color: '#6B7280', marginTop: '0.25rem' }}>* Data reflects rolling 24H performance</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          <AssetList onSelectAsset={setSelectedAsset} selectedAssetId={selectedAsset?.id} onPricesUpdate={setLivePrices} />
        </div>
      </div>

      {/* CENTER TOP: CHART & HEADER */}
      <div className="terminal-panel terminal-center-top">
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FFF' }}>{headerAsset ? headerAsset.symbol : 'Select Asset'}</span>
            <span style={{ fontSize: '0.875rem', color: '#A3A3A3', marginLeft: '0.5rem' }}>{headerAsset ? 'Perpetual Options' : ''}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#FFF' }}>{headerAsset && headerAsset.price > 0 ? `$${headerAsset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}</div>
            <div style={{ fontSize: '0.875rem', color: headerAsset && headerAsset.change24h >= 0 ? '#5EEAD4' : '#F87171' }}>
              {headerAsset && headerAsset.price > 0 ? `${headerAsset.change24h >= 0 ? '+' : ''}${headerAsset.change24h.toFixed(2)}% (24H)` : '-'}
            </div>
          </div>
        </div>
        {showStockBanner && (
          <div style={{ padding: '0.75rem 1.5rem', backgroundColor: 'rgba(248, 113, 113, 0.1)', color: '#F87171', fontSize: '0.875rem', textAlign: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
            ⚠️ US Stock Market is currently closed. Trading is suspended until regular hours (09:30 - 16:00 ET).
          </div>
        )}
        <div style={{ flex: 1, padding: '1rem', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <TradingViewChart symbol={selectedAsset?.symbol ?? 'BTC'} />
        </div>
      </div>

      {/* CENTER BOTTOM: OPTION CHAIN / POSITIONS */}
      <div className="terminal-panel terminal-center-bottom" style={{ padding: '1rem', position: 'relative' }}>
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)', 
          marginBottom: '0.5rem',
          position: 'sticky',
          top: '-1rem', // offset the 1rem padding of the container
          backgroundColor: 'rgba(20, 20, 20, 0.95)',
          zIndex: 10,
          paddingTop: '1rem'
        }}>
          <button 
            onClick={() => setBottomTab('chain')}
            style={{ padding: '0.75rem 1rem', backgroundColor: 'transparent', color: bottomTab === 'chain' ? '#5EEAD4' : '#A3A3A3', border: 'none', borderBottom: bottomTab === 'chain' ? '2px solid #5EEAD4' : '2px solid transparent', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.1em' }}
          >
            OPTION CHAIN
          </button>
          <button 
            onClick={() => setBottomTab('positions')}
            style={{ padding: '0.75rem 1rem', backgroundColor: 'transparent', color: bottomTab === 'positions' ? '#5EEAD4' : '#A3A3A3', border: 'none', borderBottom: bottomTab === 'positions' ? '2px solid #5EEAD4' : '2px solid transparent', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.1em' }}
          >
            OPEN POSITIONS
          </button>
        </div>
        {bottomTab === 'chain' ? (
          <MarketList 
            onSelectMarket={(mkt) => {
              setSelectedMarket(mkt);
            }} 
            selectedMarketId={selectedMarket?.id} 
            filterAssetSymbol={selectedAsset?.symbol} 
            initialMarketId={initialMarketId}
          />
        ) : (
          <UserPositions />
        )}
      </div>

      {/* RIGHT SIDEBAR: ORDER ENTRY */}
      <div className="terminal-panel terminal-right">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', padding: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <button 
            onClick={() => { setOrderAction('buy'); setOrderType('call'); }}
            style={{ padding: '0.75rem', backgroundColor: orderAction === 'buy' && orderType === 'call' ? 'rgba(94, 234, 212, 0.1)' : 'transparent', color: orderAction === 'buy' && orderType === 'call' ? '#5EEAD4' : '#A3A3A3', border: orderAction === 'buy' && orderType === 'call' ? '1px solid #5EEAD4' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 'bold', transition: 'all 0.2s' }}
          >
            Buy Call
          </button>
          <button 
            onClick={() => { setOrderAction('buy'); setOrderType('put'); }}
            style={{ padding: '0.75rem', backgroundColor: orderAction === 'buy' && orderType === 'put' ? 'rgba(94, 234, 212, 0.1)' : 'transparent', color: orderAction === 'buy' && orderType === 'put' ? '#5EEAD4' : '#A3A3A3', border: orderAction === 'buy' && orderType === 'put' ? '1px solid #5EEAD4' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 'bold', transition: 'all 0.2s' }}
          >
            Buy Put
          </button>
          <button 
            onClick={() => { setOrderAction('sell'); setOrderType('call'); }}
            style={{ padding: '0.75rem', backgroundColor: orderAction === 'sell' && orderType === 'call' ? 'rgba(94, 234, 212, 0.1)' : 'transparent', color: orderAction === 'sell' && orderType === 'call' ? '#5EEAD4' : '#A3A3A3', border: orderAction === 'sell' && orderType === 'call' ? '1px solid #5EEAD4' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 'bold', transition: 'all 0.2s' }}
          >
            Sell Call
          </button>
          <button 
            onClick={() => { setOrderAction('sell'); setOrderType('put'); }}
            style={{ padding: '0.75rem', backgroundColor: orderAction === 'sell' && orderType === 'put' ? 'rgba(94, 234, 212, 0.1)' : 'transparent', color: orderAction === 'sell' && orderType === 'put' ? '#5EEAD4' : '#A3A3A3', border: orderAction === 'sell' && orderType === 'put' ? '1px solid #5EEAD4' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 'bold', transition: 'all 0.2s' }}
          >
            Sell Put
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {orderAction === 'buy' ? (
            <BuyOption market={selectedMarket} optionType={orderType} />
          ) : (
            <WriteOption market={selectedMarket} optionType={orderType} />
          )}
          <KYCDisclaimer />
        </div>
      </div>
    </div>
  );
}
