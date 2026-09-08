import { useEffect, useState } from 'react';
import { fetchLabBoard, LAB_API_BASE, type LabBoard } from '../lib/labApi';
import { LiveResults } from './LiveResults';

export function PublicLiveBoard() {
  const [board, setBoard] = useState<LabBoard | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = () => fetchLabBoard().then((next) => {
      if (active) {
        setBoard(next);
        setError('');
      }
    }).catch((err) => {
      if (active) setError(err.message);
    });
    load();
    const timer = setInterval(load, 5000);
    let stream: EventSource | null = null;
    try {
      stream = new EventSource(`${LAB_API_BASE}/api/lab/stream`);
      stream.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (active && payload && payload.board) setBoard(payload.board);
        } catch (_err) { /* ignore */ }
      };
    } catch (_err) { /* polling remains */ }
    return () => {
      active = false;
      clearInterval(timer);
      if (stream) stream.close();
    };
  }, []);

  return (
    <div>
      <LiveResults board={board} />
      {error ? <p className="fine-print">{error}</p> : null}
    </div>
  );
}
