from reportlab.pdfgen import canvas

def generate_pdf(severity, action):
    path = "storage/outputs/report.pdf"

    c = canvas.Canvas(path)
    c.setFont("Helvetica", 14)

    c.drawString(100, 750, "Crop Health Report")
    c.drawString(100, 700, f"Severity: {severity}%")
    c.drawString(100, 650, f"Recommendation: {action}")

    c.save()

    return path