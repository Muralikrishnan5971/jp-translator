from pathlib import Path
from src.ocr_engine import JapaneseOCREngine
from src.pdf_converter import PDFConverter


converter = PDFConverter()
ocr = JapaneseOCREngine()
input_folder = Path("Japan Book Pages Split")

# for pdf_number in range(1, 69):

#     pdf_name = f"japan book pdf 1_260709_191710-{pdf_number}.pdf"

#     pdf_path = input_folder / pdf_name

#     if not pdf_path.exists():
#         print(f"Skipping {pdf_name} (File not found)")
#         continue

#     print(f"\nProcessing {pdf_name}")

#     # ------------------------------------------
#     # Create page output folder
#     # ------------------------------------------

#     pages_folder = Path("pages")
#     pages_folder.mkdir(exist_ok=True)

#     converter.convert_pdf_to_images(
#         pdf_path,
#         pages_folder,
#         pdf_prefix=f"page{pdf_number:03d}"
#     )

for png_number in range(1, 69):

    ocr = JapaneseOCREngine()
    text = ocr.extract_text(Path(f"pages/page{png_number:03d}.png"))
    print(text)
    output_folder = Path("ocr_output")
    output_folder.mkdir(exist_ok=True)
    output_file = output_folder / f"jp-page{png_number:03d}.txt"
    with open(output_file, "w", encoding="utf-8") as file:
        file.write(text)

    print(f"OCR completed successfully.")
    print(f"Japanese text saved to: {output_file}")