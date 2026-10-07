import { useEffect, useRef } from 'react';

type Props = {
  src: string;
  config: Record<string, unknown>;
  height: number;
  label: string;
};

export function TradingViewEmbed({ src, config, height, label }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const json = JSON.stringify(config);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    host.innerHTML = '';
    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container__widget';
    widget.style.height = '100%';
    widget.style.width = '100%';
    const script = document.createElement('script');
    script.src = src;
    script.type = 'text/javascript';
    script.async = true;
    script.text = json;
    host.appendChild(widget);
    host.appendChild(script);
    return () => {
      host.innerHTML = '';
    };
  }, [src, json]);

  return (
    <div className="tv-embed" style={{ height }} aria-label={label}>
      <div className="tradingview-widget-container" ref={hostRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
