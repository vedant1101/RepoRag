'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

export default function Home() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!gridRef.current) return;
      const { clientX, clientY } = e;
      gridRef.current.style.setProperty('--mx', `${clientX}px`);
      gridRef.current.style.setProperty('--my', `${clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <main className="min-h-screen bg-[#0d1117] text-white overflow-hidden font-mono">
      {/* Animated grid background */}
      <div
        ref={gridRef}
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(30,215,96,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(30,215,96,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle 600px at var(--mx, 50%) var(--my, 50%), black, transparent)',
        }}
      />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#1ed760] animate-pulse" />
          <span className="text-sm text-white/60 tracking-widest uppercase">RepoRAG</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-white/40 tracking-wider">
          <a href="#how" className="hover:text-white/80 transition-colors">How it works</a>
          <a href="#stack" className="hover:text-white/80 transition-colors">Stack</a>
          <Link href="/repo" className="px-4 py-2 border border-[#1ed760]/40 text-[#1ed760] hover:bg-[#1ed760]/10 transition-all rounded text-xs tracking-widest">
            GET STARTED →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-8 text-center">
        {/* Terminal badge */}
        <div className="mb-8 flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs text-white/50 tracking-wider">
          <span className="text-[#1ed760]">▶</span>
          <span>Semantic search over any GitHub repo</span>
        </div>

        {/* Headline */}
        <h1 className="text-6xl md:text-8xl font-bold leading-none tracking-tighter mb-6">
          <span className="block text-white">Ask your</span>
          <span className="block text-transparent bg-clip-text" style={{
            backgroundImage: 'linear-gradient(135deg, #1ed760 0%, #17a845 50%, #0d7a30 100%)'
          }}>
            codebase
          </span>
          <span className="block text-white/30">anything.</span>
        </h1>

        <p className="max-w-md text-white/40 text-sm leading-relaxed mb-10 tracking-wide">
          Paste a GitHub URL. Get instant semantic answers powered by vector search and Llama 3. No more grepping through thousands of files.
        </p>

        <div className="flex items-center gap-4">
          <Link
            href="/repo"
            className="group px-8 py-3 bg-[#1ed760] text-black font-bold text-sm tracking-widest rounded hover:bg-[#17a845] transition-all hover:scale-105 active:scale-95"
          >
            CLONE A REPO
          </Link>
          <Link
            href="/chat"
            className="px-8 py-3 border border-white/10 text-white/50 text-sm tracking-widest rounded hover:border-white/30 hover:text-white/80 transition-all"
          >
            TRY A QUERY
          </Link>
        </div>

        {/* Floating terminal preview */}
        <div className="mt-16 w-full max-w-2xl bg-[#161b22] border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
            <span className="ml-2 text-xs text-white/20 tracking-wider">query terminal</span>
          </div>
          <div className="p-6 text-left space-y-3 text-sm">
            <div className="flex gap-3">
              <span className="text-[#1ed760]">❯</span>
              <span className="text-white/60">How does the authentication middleware work?</span>
            </div>
            <div className="pl-5 space-y-1">
              <p className="text-white/30 text-xs">// searching 2,847 chunks across 143 files...</p>
              <p className="text-white/70">The auth middleware validates JWT tokens using <span className="text-[#1ed760]">jsonwebtoken</span>, extracts the user ID from the payload, and attaches it to <span className="text-[#1ed760]">req.user</span> for downstream handlers.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <span className="text-white/20">sources:</span>
              <span className="text-[#1ed760]/60 text-xs">middleware/auth.js</span>
              <span className="text-[#1ed760]/60 text-xs">utils/jwt.js</span>
              <span className="text-[#1ed760]/60 text-xs">+3 more</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 px-8 py-24 max-w-5xl mx-auto">
        <p className="text-xs text-[#1ed760] tracking-widest uppercase mb-3">// how it works</p>
        <h2 className="text-3xl font-bold text-white/90 mb-16 tracking-tight">Four steps to answers.</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-white/5 rounded-xl overflow-hidden">
          {[
            { step: '01', title: 'Clone', desc: 'Paste any public GitHub URL. We clone and scan all source files.' },
            { step: '02', title: 'Chunk', desc: 'Code is split into semantic chunks and embedded via HuggingFace.' },
            { step: '03', title: 'Index', desc: 'Embeddings stored in Pinecone. File content stored in MySQL.' },
            { step: '04', title: 'Answer', desc: 'Your query finds top matches. Llama 3 generates a precise answer.' },
          ].map((item) => (
            <div key={item.step} className="bg-[#0d1117] p-6 hover:bg-[#161b22] transition-colors group">
              <div className="text-4xl font-bold text-white/5 group-hover:text-[#1ed760]/10 transition-colors mb-4 font-mono">{item.step}</div>
              <h3 className="text-white font-semibold mb-2 tracking-wide">{item.title}</h3>
              <p className="text-white/30 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stack */}
      <section id="stack" className="relative z-10 px-8 py-16 max-w-5xl mx-auto border-t border-white/5">
        <p className="text-xs text-[#1ed760] tracking-widest uppercase mb-8">// tech stack</p>
        <div className="flex flex-wrap gap-3">
          {['Node.js', 'Express', 'Next.js', 'TypeScript', 'MySQL', 'Pinecone', 'HuggingFace', 'Groq / Llama 3', 'Tailwind CSS'].map((tech) => (
            <span key={tech} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white/50 tracking-wider hover:border-[#1ed760]/30 hover:text-white/80 transition-all">
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-6 border-t border-white/5 flex items-center justify-between text-xs text-white/20 tracking-wider">
        <span>RepoRAG — Built by Vedant Sahai</span>
        <span>Node · Pinecone · Llama 3</span>
      </footer>
    </main>
  );
}