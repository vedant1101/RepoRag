import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def ask_llm(question, context):
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": """You are an expert code analyst. You are given code chunks from a real GitHub repository.
Answer questions about the codebase clearly, confidently, and directly based on the provided code.
- Never say 'it appears', 'it seems', 'likely', 'might', or 'assumptions'
- State facts directly based on what you see in the code
- Be specific about file names, function names, and implementation details
- If asked for an overview, give a clear and confident summary of what the repo does"""
            },
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion: {question}"
            }
        ],
        max_tokens=1024
    )
    return completion.choices[0].message.content