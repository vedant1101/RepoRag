'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RepoPage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ totalFiles: number; processedFiles: number } | null>(null);
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [lineIndex, setLineIndex] = useState(0);
  const [dotCount, setDotCount] = useState(0);
  const router = useRouter();

  // Terminal messages
  const lines = [
    (url: string) => `$ git clone ${url}`,
    () => 'Cloning into repository',
    () => 'Scanning files',
    () => 'Generating embeddings',
    () => 'Storing in vector database',
  ];

  useEffect(() => {
    if (!loading) {
      setDisplayedLines([]);
      setLineIndex(0);
      setDotCount(0);
      return;
    }

    let charIndex = 0;
    let currentLine = lines[lineIndex](repoUrl);
    let timeout: NodeJS.Timeout;

    const type = () => {
      if (charIndex <= currentLine.length) {
        const newLines = [...displayedLines];
        newLines[lineIndex] = currentLine.slice(0, charIndex);
        setDisplayedLines(newLines);
        charIndex++;
        timeout = setTimeout(type, 50);
      } else {
        // Start dot animation for steps except first command
        if (lineIndex > 0) {
          const dotInterval = setInterval(() => {
            setDotCount((prev) => (prev + 1) % 4);
          }, 500);
          timeout = setTimeout(() => {
            clearInterval(dotInterval);
            if (lineIndex < lines.length - 1) {
              setLineIndex((prev) => prev + 1);
            }
          }, 2500); // hold each step for 2.5s
        } else {
          timeout = setTimeout(() => {
            if (lineIndex < lines.length - 1) {
              setLineIndex((prev) => prev + 1);
            }
          }, 500);
        }
      }
    };

    type();
    return () => clearTimeout(timeout);
  }, [loading, lineIndex, repoUrl]);

  const handleClone = async () => {
    if (!repoUrl.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);
    setLineIndex(0);
    setDisplayedLines([]);
    setDotCount(0);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/clone-repo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl }),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data);

      localStorage.setItem('repoUrl', repoUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0d1117] text-white font-mono flex flex-col">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#1ed760]" />
          <span className="text-sm text-white/60 tracking-widest uppercase">RepoRAG</span>
        </Link>
        <Link href="/chat" className="text-xs text-white/30 hover:text-white/60 transition-colors tracking-wider">
          Go to Chat →
        </Link>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
        <div className="w-full max-w-xl">
          <p className="text-xs text-[#1ed760] tracking-widest uppercase mb-3">// step 01</p>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Clone a repository</h1>
          <p className="text-white/30 text-sm mb-10 leading-relaxed">
            Paste a public GitHub URL. We'll clone it, chunk the code, generate embeddings, and store everything ready for querying.
          </p>

          <div className="flex gap-3 mb-4">
            <div className="flex-1 flex items-center gap-3 bg-[#161b22] border border-white/10 rounded-lg px-4 focus-within:border-[#1ed760]/40 transition-colors">
              <span className="text-[#1ed760] text-sm">$</span>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleClone()}
                placeholder="https://github.com/username/repo"
                className="flex-1 bg-transparent py-3 text-sm text-white/80 placeholder:text-white/20 outline-none tracking-wide"
              />
            </div>
            <button
              onClick={handleClone}
              disabled={loading || !repoUrl.trim()}
              className="px-6 py-3 bg-[#1ed760] text-black font-bold text-xs tracking-widest rounded-lg hover:bg-[#17a845] transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            >
              {loading ? 'CLONING...' : 'CLONE →'}
            </button>
          </div>

          <div className="flex items-center gap-2 mb-10 flex-wrap">
            <span className="text-xs text-white/20 tracking-wider">try:</span>
            {['bradtraversy/node_crash_course', 'expressjs/express'].map((repo) => (
              <button
                key={repo}
                onClick={() => setRepoUrl(`https://github.com/${repo}`)}
                className="text-xs text-[#1ed760]/40 hover:text-[#1ed760]/80 transition-colors tracking-wide"
              >
                {repo}
              </button>
            ))}
          </div>

          {loading && (
            <div className="bg-[#161b22] border border-white/10 rounded-xl p-6 font-mono text-[#1ed760] text-sm space-y-2 relative overflow-hidden">
              {displayedLines.map((line, idx) => (
                <pre key={idx} className="whitespace-pre-wrap pl-2">
                  {line}
                  {idx > 0 && lineIndex === idx ? '.'.repeat(dotCount) : ''}
                </pre>
              ))}
              <span className="blinking-cursor">|</span>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400 text-xs tracking-wider">⚠ {error}</p>
            </div>
          )}

          {result && (
            <div className="bg-[#161b22] border border-[#1ed760]/20 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#1ed760]" />
                <span className="text-[#1ed760] text-xs tracking-widest uppercase">Repository indexed successfully</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-3xl font-bold text-white">{result.totalFiles.toLocaleString()}</p>
                  <p className="text-xs text-white/30 mt-1 tracking-wider">total files</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-3xl font-bold text-[#1ed760]">{result.processedFiles}</p>
                  <p className="text-xs text-white/30 mt-1 tracking-wider">files indexed</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/chat')}
                className="w-full py-3 bg-[#1ed760] text-black font-bold text-xs tracking-widest rounded-lg hover:bg-[#17a845] transition-all hover:scale-[1.02] active:scale-95"
              >
                START QUERYING →
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .blinking-cursor {
          animation: blink 1s step-start infinite;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </main>
  );
}