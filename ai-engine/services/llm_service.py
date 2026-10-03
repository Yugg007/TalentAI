import logging
import requests
import tenacity
import time

from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential
)

from common.model_constants import Models

logger = logging.getLogger(__name__)


class LLMService:

    def __init__(self):
        self.url = "http://localhost:11434/api/generate"
        self.timeout = 3000

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(
            multiplier=1,
            min=2,
            max=10
        )
    )
    def _generate(
            self,
            prompt,
            model,
            temperature,
            top_p=0.9
    ):

        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
                "top_p": top_p
            }
        }

        start_time = time.time()
        logger.info(
            f"Calling model: {model}"
        )

        response = requests.post(
            self.url,
            json=payload,
            timeout=self.timeout
        )

        print(
            f"Response status code: {response}"
        )

        response.raise_for_status()

        data = response.json()

        answer = data.get(
            "response",
            ""
        )

        duration = round(
            time.time() - start_time,
            2
        )

        logger.info(
            f"Response received from {model} for prompt size {len(prompt)} in {duration} seconds"
        )

        return answer

    # ---------- PUBLIC INTERFACES ----------

    def resume(
            self,
            prompt
    ):
        return self._generate(
            prompt=prompt,
            model=Models.RESUME_MODEL,
            temperature=0.0
        )

    def job_description(
            self,
            prompt
    ):
        return self._generate(
            prompt=prompt,
            model=Models.JD_MODEL,
            temperature=0.0
        )

    def interview(
            self,
            prompt
    ):
        return self._generate(
            prompt=prompt,
            model=Models.INTERVIEW_MODEL,
            temperature=0.4
        )

    # Generic fallback

    def generate(
            self,
            prompt,
            model=None,
            temperature=0.1
    ):
        return self._generate(
            prompt=prompt,
            model=model or Models.DEFAULT_MODEL,
            temperature=temperature
        )


llm_service = LLMService()