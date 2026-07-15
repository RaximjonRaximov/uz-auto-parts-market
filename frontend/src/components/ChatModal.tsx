import { useEffect, useRef, useState } from 'react';
import { X, Send } from 'lucide-react';
import { api } from '../lib/api';
import type { Message, Order } from '../types';

interface Props {
  order: Order;
  open: boolean;
  onClose: () => void;
}

export function ChatModal({ order, open, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get(`/messages/${order.id}`);
      setMessages(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!open) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [open, order.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    try {
      await api.post('/messages', { order_id: order.id, body });
      setBody('');
      await fetchMessages();
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--foreground)]/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg glass rounded-3xl shadow-2xl border border-[var(--border)] overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-[var(--foreground)]">Xabarlar</h3>
            <p className="text-xs text-[var(--foreground)]/60">Buyurtma #{order.id}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--muted)] transition-colors" aria-label="Yopish">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-[300px]">
          {messages.length === 0 && (
            <div className="text-center text-sm text-[var(--foreground)]/50 py-8">Hali xabar yo'q.</div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === order.buyer_id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  msg.sender_id === order.buyer_id
                    ? 'bg-[var(--primary)] text-white rounded-br-none'
                    : 'bg-[var(--muted)] text-[var(--foreground)] rounded-bl-none'
                }`}
              >
                <div className="font-bold text-xs opacity-80 mb-1">{msg.sender_name}</div>
                <div className="font-medium">{msg.body}</div>
                <div className="text-[10px] opacity-70 mt-1 text-right">
                  {new Date(msg.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-[var(--border)] flex items-center gap-2">
          <input
            type="text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Xabar yozing..."
            className="input-base flex-1"
          />
          <button type="submit" disabled={loading || !body.trim()} className="btn-primary p-3 shine" aria-label="Yuborish">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
