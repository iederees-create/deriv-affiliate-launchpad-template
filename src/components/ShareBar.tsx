import { useEffect, useState } from 'react';
import { Check, Facebook, Link as LinkIcon, Linkedin, Share2, Twitter } from 'lucide-react';

type ShareBarProps = {
  url: string;
  title: string;
  text?: string;
  label?: string;
};

export function ShareBar({ url, title, text, label = 'Share this' }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const waText = encodeURIComponent(`${title}${text ? ` — ${text}` : ''} ${url}`);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const nativeShare = async () => {
    if (!canNativeShare) return;
    try {
      await navigator.share({ title, text: text || title, url });
    } catch {
      /* ignore abort */
    }
  };

  return (
    <div className="share-bar" role="group" aria-label={label}>
      <span className="share-bar-label">{label}</span>
      {canNativeShare ? (
        <button type="button" className="share-btn" onClick={nativeShare} aria-label="Share via this device">
          <Share2 size={15} />
        </button>
      ) : null}
      <a className="share-btn" href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noreferrer" aria-label="Share on X">
        <Twitter size={15} />
      </a>
      <a className="share-btn" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noreferrer" aria-label="Share on LinkedIn">
        <Linkedin size={15} />
      </a>
      <a className="share-btn" href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noreferrer" aria-label="Share on Facebook">
        <Facebook size={15} />
      </a>
      <a className="share-btn" href={`https://api.whatsapp.com/send?text=${waText}`} target="_blank" rel="noreferrer" aria-label="Share on WhatsApp">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.553 4.104 1.517 5.829L.057 23.571a.5.5 0 0 0 .637.612l5.9-1.545A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.9 9.9 0 0 1-5.031-1.371l-.36-.214-3.732.978.996-3.647-.235-.374A9.861 9.861 0 0 1 2.1 12C2.1 6.533 6.533 2.1 12 2.1c5.466 0 9.9 4.433 9.9 9.9 0 5.467-4.434 9.9-9.9 9.9z" />
        </svg>
      </a>
      <button type="button" className="share-btn" onClick={copy} aria-label={copied ? 'Link copied' : 'Copy link'}>
        {copied ? <Check size={15} /> : <LinkIcon size={15} />}
      </button>
      {copied ? <span className="share-copied">Copied</span> : null}
    </div>
  );
}
