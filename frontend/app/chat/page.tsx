'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Source {
  id: number;
  filePath: string;
  codePreview: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('repoUrl');
    if (stored) setRepoUrl(stored);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleQuery = async () => {
    if (!question.trim() || !repoUrl.trim()) return;

    const userMsg: Message = { role: 'user', content: question };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/query-repo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, repoUrl }),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      const assistantMsg: Message = {
        role: 'assistant',
        content: data.answer,
        sources: data.sourcesUsed,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0d1117] text-white font-mono flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#1ed760]" />
          <span className="text-sm text-white/60 tracking-widest uppercase">RepoRAG</span>
        </Link>

        {/* Repo URL bar */}
        <div className="flex items-center gap-2 bg-[#161b22] border border-white/10 rounded-lg px-3 py-2 w-80">
          <span className="text-[#1ed760] text-xs">repo:</span>
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/username/repo"
            className="flex-1 bg-transparent text-xs text-white/50 placeholder:text-white/20 outline-none"
          />
        </div>

        <Link href="/repo" className="text-xs text-white/30 hover:text-white/60 transition-colors tracking-wider">
          ← Clone new repo
        </Link>
      </nav>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full min-h-[50vh] space-y-6">
            <div className="text-center">
              <div className="text-5xl mb-4 opacity-20">{'</>'}</div>
              <p className="text-white/20 text-sm tracking-wider mb-2">Ask anything about your codebase</p>
              <p className="text-white/10 text-xs tracking-wider">Make sure you've cloned a repo first</p>
            </div>
            {/* Suggested questions */}
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {[
                'How does authentication work?',
                'What does the Logger class do?',
                'How are routes structured?',
                'Where is the database connected?',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setQuestion(q)}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white/40 hover:border-[#1ed760]/30 hover:text-white/70 transition-all tracking-wide"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl w-full ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
              {/* Role label */}
              <div className={`flex items-center gap-2 mb-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                <span className={`text-xs tracking-widest ${msg.role === 'user' ? 'text-white/30' : 'text-[#1ed760]/60'}`}>
                  {msg.role === 'user' ? 'YOU' : 'REPORAG'}
                </span>
              </div>

              {/* Message bubble */}
              <div className={`rounded-xl p-4 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-white/5 border border-white/10 text-white/70 max-w-md ml-auto'
                  : 'bg-[#161b22] border border-white/10 text-white/80'
              }`}>
                {msg.content.split('```').map((part, idx) =>
                  idx % 2 === 1 ? (
                    <pre key={idx} className="bg-black/40 rounded-lg p-3 my-3 text-xs text-[#1ed760]/80 overflow-x-auto border border-white/5">
                      <code>{part.replace(/^(javascript|js|ts|typescript)\n/, '')}</code>
                    </pre>
                  ) : (
                    <span key={idx}>{part}</span>
                  )
                )}
              </div>

              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-white/20 tracking-widest">SOURCES USED</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((src) => (
                      <div
                        key={src.id}
                        className="group relative px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/40 hover:border-[#1ed760]/30 hover:text-white/70 transition-all cursor-pointer"
                        title={src.codePreview}
                      >
                        <span className="text-[#1ed760]/40 mr-1">#</span>
                        {src.filePath.split('/').pop()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#161b22] border border-white/10 rounded-xl p-4 flex items-center gap-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#1ed760] animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
              <span className="text-xs text-white/30 tracking-wider">Searching codebase...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-red-400 text-xs tracking-wider">⚠ {error}</p>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="shrink-0 border-t border-white/5 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="flex-1 flex items-center gap-3 bg-[#161b22] border border-white/10 rounded-xl px-4 focus-within:border-[#1ed760]/30 transition-colors">
            <span className="text-[#1ed760]/60 text-sm">❯</span>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleQuery()}
              placeholder="Ask about the codebase..."
              disabled={loading}
              className="flex-1 bg-transparent py-3.5 text-sm text-white/70 placeholder:text-white/20 outline-none tracking-wide disabled:opacity-50"
            />
          </div>
          <button
            onClick={handleQuery}
            disabled={loading || !question.trim() || !repoUrl.trim()}
            className="px-5 py-3.5 bg-[#1ed760] text-black font-bold text-xs tracking-widest rounded-xl hover:bg-[#17a845] transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          >
            ASK →
          </button>
        </div>
        {!repoUrl && (
          <p className="text-center text-xs text-red-400/50 mt-2 tracking-wider">
            ⚠ No repo URL set —{' '}
            <Link href="/repo" className="underline hover:text-red-400">clone one first</Link>
          </p>
        )}
      </div>
    </main>
  );
}