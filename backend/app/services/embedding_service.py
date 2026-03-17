import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()

HF_API_KEY = os.getenv("HF_API_KEY")


HF_URL = "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction"


def get_embedding(text: str, retries: int = 4, delay: int = 1):

    headers = {
        "Authorization": f"Bearer {HF_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "inputs": text
    }

    for attempt in range(retries):

        try:

            res = requests.post(
                HF_URL,
                headers=headers,
                json=payload
            )

            if res.status_code == 429:

                wait_time = delay * (2 ** attempt)

                print(
                    f"Rate limited. Retrying in {wait_time}s (attempt {attempt + 1})"
                )

                time.sleep(wait_time)

                continue

            if not res.ok:
                raise Exception(
                    f"HF API error: {res.status_code} {res.text}"
                )

            return res.json()

        except Exception as err:

            if attempt == retries - 1:
                print("Embedding fetch failed after retries:", err)
                return None