import ollama

class AIService:
    @staticmethod
    def generate_chat_response(messages):
        formatted = [{'role': m['role'], 'content': m['content']} for m in messages]
        response = ollama.chat(model='llama3.1', messages=formatted)
        return response['message']['content']

    @staticmethod
    def analyze_ats(resume_text, job_desc):
        prompt = f"Analyze resume: {resume_text} against Job: {job_desc}. Return JSON."
        response = ollama.chat(model='llama3.1', messages=[{'role': 'user', 'content': prompt}])
        return response['message']['content']