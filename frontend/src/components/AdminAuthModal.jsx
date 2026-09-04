import React, { useState } from 'react';
import { Lock, X, KeyRound } from 'lucide-react';

export default function AdminAuthModal({ isOpen, onClose, onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === '1234') {
      setError('');
      setPassword('');
      onSuccess();
    } else {
      setError('የተሳሳተ የይለፍ ቃል ነው! እባክዎን እንደገና ይሞክሩ።');
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-white shadow-2xl">
        
        <button
          onClick={() => {
            setError('');
            setPassword('');
            onClose();
          }}
          className="absolute top-4 right-4 p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-full transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 bg-orange-600/20 border border-orange-500/30 rounded-2xl text-orange-500 mb-3">
            <Lock size={28} />
          </div>
          <h3 className="text-xl font-black text-white">አድሚን መግቢያ</h3>
          <p className="text-xs text-zinc-400 mt-1">ወደ ዳሽቦርድ ለመግባት የይለፍ ቃል ያስገቡ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                placeholder="የይለፍ ቃል ያስገቡ..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-orange-600/30 cursor-pointer"
          >
            ግባ
          </button>
        </form>

      </div>
    </div>
  );
}