import requests

class EmbeddingService:
    def __init__(self, model_name="llama3.1", base_url="http://localhost:11434"):
        self.model_name = model_name
        # Note: /api/embeddings is correct, but let's handle the response keys robustly
        self.endpoint = f"{base_url}/api/embeddings"

    def generate(self, text):

        if not text or not isinstance(text, str):
            raise ValueError("Input text must be a non-empty string.")

        payload = {
            "model": self.model_name,
            "prompt": text
        }

        try:
            response = requests.post(self.endpoint, json=payload)
            response.raise_for_status()
            
            data = response.json()
            # FIX: Modern Ollama returns 'embedding'. Older or alternative endpoints use 'embeddings'.
            # We check both to prevent returning None.
            return data.get("embedding") or data.get("embeddings")
            
        except requests.exceptions.RequestException as e:
            print(f"Error generating embedding via Ollama: {e}")
            return None

embedding_service = EmbeddingService()