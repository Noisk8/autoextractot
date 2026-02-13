import PyPDF2
import io

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extrae texto de un archivo PDF
    """
    pdf_file = io.BytesIO(pdf_bytes)
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text()
    
    return text
