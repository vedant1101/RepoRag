# RepoRAG 🔍
### _Ask your codebase anything. Get answers in seconds._

> A full-stack RAG (Retrieval-Augmented Generation) pipeline that lets you semantically search and query any GitHub repository using natural language. Powered by vector embeddings, Qdrant, and Llama 3.3 70B via Groq.

<br/>
```
$ ask "How does authentication work in this repo?"

  Searching chunks across hundreds of files...

  ✓ The auth middleware validates JWT tokens using jsonwebtoken,
    extracts the user ID from the payload, and attaches it to
    req.user for downstream handlers.

  Sources: middleware/auth.js · utils/jwt.js · +3 more
```

<br/>

## 🌐 Live Demo

| Service | URL |
|---|---|
| **Frontend** | `https://repo-rag-frotend.vercel.app` |
| **Backend API** | `https://reporagpython-production.up.railway.app` |

<br/>

## ✨ Features

- 🔗 **Clone any public GitHub repo** via URL
- 🧠 **Semantic search** — finds relevant code even if you don't know the exact function name
- 💬 **Natural language Q&A** — ask questions, get accurate answers grounded in the actual source code
- 📁 **Source attribution** — every answer shows exactly which files were used
- ⚡ **Fast** — Groq's inference API delivers Llama 3 responses in under a second
- 🌙 **VS Code-inspired dark UI** built with Next.js + Tailwind CSS

<br/>

## 🏗️ Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        INGESTION PIPELINE                   │
│                                                             │
│  GitHub URL → Clone → Scan Files → Chunk Code               │
│                              ↓                              │
│                    Generate Embeddings                      │
│                    (HuggingFace API)                        │
│                              ↓                              │
│                          Qdrant                             │
│                      (vectors + code)                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        QUERY PIPELINE                       │
│                                                             │
│  User Question → Embed Question (HuggingFace)               │
│                          ↓                                  │
│              Qdrant Similarity Search                       │
│                    (top 5 chunks)                           │
│                          ↓                                  │
│         Send Context + Question → Groq / Llama 3            │
│                          ↓                                  │
│              Return Answer + Source Files                   │
└─────────────────────────────────────────────────────────────┘
```

<br/>

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Python** | Runtime |
| **FastAPI** | REST API framework |
| **GitPython** | Git cloning |
| **tree-sitter** | AST-based code chunking |
| **HuggingFace Inference API** | Generate embeddings (`all-MiniLM-L6-v2`) |
| **Qdrant** | Vector database for similarity search |
| **Groq SDK** | LLM inference (Llama 3.3 70B) |
| **pydantic-settings** | Environment variable management |

### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Utility-first styling |

### Infrastructure
| Service | Purpose |
|---|---|
| **Railway** | Backend hosting |
| **Vercel** | Frontend hosting |
| **Qdrant Cloud** | Managed vector database |
| **HuggingFace** | Embedding model API |
| **Groq** | LLM inference API |

<br/>

## 📁 Project Structure
```
RepoRAG/
│
├── 📦 backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── Procfile
│   │
│   └── app/
│       ├── main.py
│       ├── api/v1/
│       │   ├── repo.py
│       │   └── query.py
│       ├── core/
│       │   └── config.py
│       ├── models/
│       │   ├── repo.py
│       │   └── query.py
│       ├── services/
│       │   ├── chunker.py
│       │   ├── embedding_service.py
│       │   ├── llm_service.py
│       │   └── vector_store.py
│       └── ingestion/
│           ├── repo_cloner.py
│           └── scanner.py
│
└── 🎨 frontend/
    └── app/
        ├── page.tsx
        ├── repo/
        │   └── page.tsx
        └── chat/
            └── page.tsx
```

<br/>

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- Accounts on: [HuggingFace](https://huggingface.co) · [Qdrant](https://cloud.qdrant.io) · [Groq](https://console.groq.com)

### 1. Clone the repo
```bash
git clone https://github.com/vedant1101/RepoRAG.git
cd RepoRAG
```

### 2. Backend setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:
```env
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_api_key
GROQ_API_KEY=your_groq_key
HF_API_KEY=your_huggingface_token
```
```bash
uvicorn app.main:app --reload
```

### 3. Frontend setup
```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```
```bash
npm run dev
```

Visit `http://localhost:3000` 🎉

<br/>

## 📡 API Reference

### `POST /api/v1/clone-repo`
Clone and index a GitHub repository.

**Request:**
```json
{
  "repoUrl": "https://github.com/expressjs/express"
}
```

**Response:**
```json
{
  "message": "Repository processed successfully",
  "totalFiles": 245,
  "processedFiles": 20
}
```

### `POST /api/v1/query-repo`
Query an indexed repository with a natural language question.

**Request:**
```json
{
  "question": "How does routing work?",
  "repoUrl": "https://github.com/expressjs/express"
}
```

**Response:**
```json
{
  "question": "How does routing work?",
  "answer": "Express uses a layer-based routing system...",
  "sourcesUsed": [
    {
      "id": "path/to/file.js",
      "filePath": "/tmp/repos/express/lib/router/index.js",
      "codePreview": "..."
    }
  ]
}
```

<br/>

## 🧠 How It Works

### 1. Code Chunking
Files are parsed using `tree-sitter` into an AST. Individual functions, classes, and methods are extracted as separate chunks ensuring each chunk is semantically meaningful.

### 2. Embedding Generation
Each chunk is sent to HuggingFace's `all-MiniLM-L6-v2` model, returning a dense vector representing the semantic meaning of the code.

### 3. Vector Storage
Embeddings and code are stored together in Qdrant, keeping the architecture simple with a single vector database.

### 4. Query & Retrieval
The user's question is embedded using the same model. Qdrant finds the top 5 most semantically similar chunks via cosine similarity.

### 5. Answer Generation
Retrieved code chunks are sent as context to Groq's Llama 3.3 70B model along with the question, generating a precise grounded answer.

<br/>

## 🚢 Deployment

### Backend — Railway
1. Push to GitHub
2. Create new Railway project → Add service → GitHub repo
3. Set Root Directory to `backend`
4. Add environment variables in Railway dashboard
5. Railway auto-deploys on every push

### Frontend — Vercel
1. Import repo on [vercel.com](https://vercel.com)
2. Set Root Directory to `frontend`
3. Set `NEXT_PUBLIC_API_URL` to your Railway backend URL
4. Vercel auto-deploys on every push

<br/>

## 🔮 Future Improvements

- [ ] User authentication with JWT
- [ ] Support for more languages (Go, Rust, Java)
- [ ] Streaming LLM responses
- [ ] Re-indexing detection — skip unchanged files
- [ ] Repo management dashboard
- [ ] Multi-repo querying
- [ ] Export conversation history

<br/>

## 👨‍💻 Author

**Vedant Sahai**

Built from scratch as a portfolio project to demonstrate full-stack RAG pipeline development.

- GitHub: [@vedant1101](https://github.com/vedant1101)

<br/>

## 📄 License

MIT © Vedant Sahai
