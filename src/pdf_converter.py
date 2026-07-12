from pathlib import Path
from pdf2image import convert_from_path


class PDFConverter:
    """
    Converts every page of a PDF into PNG images.
    """

    def __init__(self, dpi: int = 300):
        """
        Initialize the converter.

        Parameters
        ----------
        dpi : int
            Image resolution.
            300 DPI is ideal for OCR.
        """
        self.dpi = dpi

    def convert_pdf_to_images(
        self,
        pdf_path: Path,
        output_folder: Path
    ) -> None:
        """
        Convert PDF pages into PNG images.

        Parameters
        ----------
        pdf_path : Path
            PDF file.

        output_folder : Path
            Folder where images will be saved.
        """

        if not pdf_path.exists():
            raise FileNotFoundError(f"PDF not found: {pdf_path}")

        output_folder.mkdir(parents=True, exist_ok=True)

        print(f"Reading PDF: {pdf_path.name}")

        pages = convert_from_path(
            pdf_path,
            dpi=self.dpi
        )

        print(f"Found {len(pages)} pages")

        for index, page in enumerate(pages, start=1):

            filename = f"page{index:03d}.png"

            image_path = output_folder / filename

            page.save(image_path, "PNG")

            print(f"Saved {filename}")

        print("PDF conversion completed.")