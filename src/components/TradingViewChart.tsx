interface TradingViewChartProps {
  symbol?: string;
}

export function TradingViewChart({ symbol = 'BTC' }: TradingViewChartProps) {
  // Map US stocks to their primary exchanges for TradingView
  const stockExchanges: Record<string, string> = {
    TSLA: 'NASDAQ', AAPL: 'NASDAQ', NVDA: 'NASDAQ', MSFT: 'NASDAQ', 
    AMZN: 'NASDAQ', GOOGL: 'NASDAQ', META: 'NASDAQ', NFLX: 'NASDAQ', 
    AMD: 'NASDAQ', COIN: 'NASDAQ', QQQ: 'NASDAQ',
    SPY: 'AMEX',
    GME: 'NYSE'
  };

  const isStock = !!stockExchanges[symbol];
  const tvSymbol = isStock 
    ? `${stockExchanges[symbol]}%3A${symbol}` 
    : `BINANCE%3A${symbol}USDT`;

  const src = `https://s.tradingview.com/widgetembed/?symbol=${tvSymbol}&interval=60&hidesidetoolbar=0&symboledit=0&saveimage=0&toolbarbg=141414&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&showpopupbutton=0&studies_overrides=%7B%7D&overrides=%7B%22paneProperties.background%22%3A%22%23000000%22%2C%22paneProperties.backgroundType%22%3A%22solid%22%7D&enabled_features=%5B%5D&disabled_features=%5B%22header_symbol_search%22%5D&locale=en&utm_source=localhost&utm_medium=widget_new&utm_campaign=chart`;

  return (
    <iframe
      key={tvSymbol}
      src={src}
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: '8px',
        display: 'block',
      }}
      allow="clipboard-write"
      title={`${symbol} Chart`}
    />
  );
}
