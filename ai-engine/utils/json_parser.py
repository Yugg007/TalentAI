import json
import re


def extract_json(response: str):

    response = response.strip()

    # Direct JSON
    try:
        return json.loads(response)
    except json.JSONDecodeError:
        pass

    # Markdown JSON block
    match = re.search(
        r"```(?:json)?\s*(\{.*?\})\s*```",
        response,
        re.DOTALL
    )

    if match:
        return json.loads(match.group(1))

    # First { ... Last }
    start = response.find("{")
    end = response.rfind("}")

    if start != -1 and end != -1:
        return json.loads(response[start:end + 1])

    raise ValueError(
        "No valid JSON found in response"
    )