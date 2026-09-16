import { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';

export function LightweightChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#A3A3A3',
        fontFamily: "'Space Mono', monospace",
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#5EEAD4',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#5EEAD4',
      wickDownColor: '#EF4444',
    });

    const data = [
      { time: '2023-10-01', open: 180.34, high: 181.56, low: 179.23, close: 181.12 },
      { time: '2023-10-02', open: 181.12, high: 183.45, low: 180.50, close: 183.00 },
      { time: '2023-10-03', open: 183.00, high: 184.10, low: 182.15, close: 182.50 },
      { time: '2023-10-04', open: 182.50, high: 185.00, low: 181.90, close: 184.80 },
      { time: '2023-10-05', open: 184.80, high: 186.20, low: 184.00, close: 185.92 },
    ];

    candlestickSeries.setData(data);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth, height: chartContainerRef.current.clientHeight });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  return (
    <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
  );
}
