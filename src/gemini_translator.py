from pathlib import Path
import os

from dotenv import load_dotenv
from google import genai


class GeminiTranslator:
    """
    Translates Japanese OCR text into English using Google Gemini.
    """

    def __init__(self):

        load_dotenv()

        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in .env")

        self.client = genai.Client(api_key=api_key)

        self.model = "gemini-3.5-flash"

        # Read the prompt once when the class is created
        prompt_path = Path("translation_prompt.txt")

        if not prompt_path.exists():
            raise FileNotFoundError(f"Prompt file not found: {prompt_path}")

        with open(prompt_path, "r", encoding="utf-8") as file:
            self.prompt_template = file.read()

    def translate(self, japanese_text: str) -> str:
        """
        Translate Japanese OCR text into English.
        """

        prompt = self.prompt_template.replace(
            "{{JAPANESE_TEXT}}",
            japanese_text.strip()
        )

        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt
        )

        return response.text.strip()