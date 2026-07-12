from pathlib import Path
from src.ocr_engine import JapaneseOCREngine
from src.pdf_converter import PDFConverter

ocr = JapaneseOCREngine()

text = ocr.extract_text(Path("pages/page001.png"))

print(text)

# pdf = Path("Japan Book Pages Split") / "japan book pdf 1_260709_191710-1.pdf"

# output = Path("pages")

# converter = PDFConverter()

# converter.convert_pdf_to_images(pdf, output)

output_folder = Path("ocr_output")
output_folder.mkdir(exist_ok=True)

# -----------------------------
# Output Text File
# -----------------------------
output_file = output_folder / "eng-page001.txt"

# -----------------------------
# Save OCR Result
# -----------------------------
with open(output_file, "w", encoding="utf-8") as file:
    file.write(text)

print(f"OCR completed successfully.")
print(f"Japanese text saved to: {output_file}")