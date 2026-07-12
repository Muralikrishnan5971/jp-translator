from pathlib import Path

from paddleocr import PaddleOCR


class JapaneseOCREngine:
    """
    OCR Engine for extracting Japanese text from scanned page images.
    """

    def __init__(self):
        """
        Initialize PaddleOCR.

        This is executed only once when the object is created.
        Loading the OCR model only once makes processing hundreds
        of pages much faster.
        """

        self.ocr = PaddleOCR(
            use_angle_cls=True,
            lang="japan"
        )

    def extract_text(self, image_path: Path) -> str:
        """
        Extract Japanese text from a single image.

        Parameters
        ----------
        image_path : Path
            Path to the image file.

        Returns
        -------
        str
            OCR extracted Japanese text.
        """

        # Verify image exists
        if not image_path.exists():
            raise FileNotFoundError(f"Image not found: {image_path}")

        # Run OCR
        result = self.ocr.ocr(str(image_path), cls=True)

        # Collect all detected text
        extracted_text = []

        if result and result[0]:

            for line in result[0]:

                text = line[1][0]

                extracted_text.append(text)

        return "\n".join(extracted_text)