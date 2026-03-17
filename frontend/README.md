# RepoRAG — Frontend 

> Next.js frontend for [RepoRAG](https://github.com/vedant1101/project-rag) — a full-stack RAG pipeline for querying GitHub repositories using natural language.

## 🌐 Live

[repo-rag-frontend.vercel.app](https://repo-rag-frotend.vercel.app)

## 🛠️ Tech Stack

- **Next.js 14** — App Router
- **TypeScript**
- **Tailwind CSS**

## 📁 Pages

| Page | Route | Description |
|---|---|---|
| Landing | `/` | Hero, how it works, tech stack |
| Clone | `/repo` | Paste GitHub URL and index repo |
| Chat | `/chat` | Ask questions, get answers with sources |

## 🚀 Run Locally
```bash
npm install
npm run dev
```

Add `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:4545
```

## 🔗 Backend Repo

[github.com/vedant1101/project-rag](https://github.com/vedant1101/RepoRag_Backend)

## 📄 License

MIT © Vedant Sahai
