import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

# Define Canvas for Header/Footer and Page Numbers
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#1E3A8A")) # primary color
        
        # Header (Top of every page)
        self.drawString(54, 750, "TUTORMATE PRO — GOOGLE ADS API DESIGN DOCUMENT")
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#4B5563")) # slate gray
        self.drawRightString(558, 750, "INTERNAL SEO & SEM PLANNING SYSTEM")
        
        # Header line
        self.setStrokeColor(colors.HexColor("#D1D5DB"))
        self.setLineWidth(0.5)
        self.line(54, 742, 558, 742)
        
        # Footer line
        self.line(54, 52, 558, 52)
        self.drawString(54, 40, "CONFIDENTIAL — FOR GOOGLE ADS API ACCESS REVIEW ONLY")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 40, page_text)
        
        self.restoreState()

def generate_pdf():
    # Setup document template
    pdf_filename = "google_ads_api_design_document_tutormate_pro.pdf"
    
    # 54pt margin = 0.75in. Printable width is 504pt. Top/Bottom margins are 72pt (1in)
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=72,
        bottomMargin=72
    )
    
    styles = getSampleStyleSheet()
    
    # Create unique custom styles to avoid conflicts
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#1E3A8A'),
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#4B5563'),
        spaceAfter=12
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1E3A8A'),
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1F2937'),
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1F2937'),
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#1F2937')
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.white
    )

    story = []
    
    # ----------------------------------------------------
    # PAGE 1: TITLE, INTRO & METADATA
    # ----------------------------------------------------
    
    story.append(Paragraph("Google Ads API Access Design Document", title_style))
    story.append(Paragraph("Developer Token Basic Access Application for TutorMate Pro", subtitle_style))
    
    # Divider line
    divider = Table([['']], colWidths=[504], rowHeights=[2])
    divider.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#1E3A8A')),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(divider)
    story.append(Spacer(1, 10))
    
    story.append(Paragraph("1. Purpose & Application Context", h1_style))
    story.append(Paragraph(
        "TutorMate Pro (<font color='#1E3A8A'><u>https://www.tutormatepro.com/</u></font>) is an educational portal that offers study guides, exercises, planning sheets, and preparatory academic tools for students in Spain, particularly those preparing for university entrance examinations (EBAU/Selectividad). "
        "In order to target student queries effectively and plan relevant, high-quality blog content and guides, TutorMate Pro requires search volume data and keyword ideas specific to the Spanish academic landscape.",
        body_style
    ))
    story.append(Paragraph(
        "The <b>TutorMate Pro Keyword Research Tool</b> is an internal, private command-line application designed to automate the discovery of related search terms and historical keyword metrics. "
        "By querying Google Ads API data, the tool enables precise search engine optimization (SEO) and marketing content planning. This document outlines the technical architecture, access control, and policy compliance of the integration.",
        body_style
    ))
    
    story.append(Paragraph("2. User Access & Platform Scope", h1_style))
    story.append(Paragraph(
        "To satisfy Google Ads API developer guidelines, the system enforces a strict private-use design scope:",
        body_style
    ))
    story.append(Paragraph("• <b>Exclusive Internal Use:</b> The application is operated exclusively by the account owner / administrator of TutorMate Pro. No public users, external clients, or third parties have access.", bullet_style))
    story.append(Paragraph("• <b>Zero Public Facing Interfaces:</b> The tool exists as a secure local terminal script. There is no web dashboard, login portal, or public-facing integration that exposes the developer token or Google Ads API credentials.", bullet_style))
    story.append(Paragraph("• <b>Single Account Context:</b> The script connects exclusively to the administrative Google Ads account owned by TutorMate Pro. It does not manage external client MCC structures or third-party ad accounts.", bullet_style))
    
    story.append(Spacer(1, 8))
    
    # Metadata Table
    metadata_data = [
        [Paragraph("<b>System Parameter</b>", table_header_style), Paragraph("<b>Official Specification</b>", table_header_style)],
        [Paragraph("<b>Application Name</b>", table_cell_style), Paragraph("TutorMate Pro Keyword Research Tool", table_cell_style)],
        [Paragraph("<b>Primary Domain (Website)</b>", table_cell_style), Paragraph('<font color="#1E3A8A"><u>https://www.tutormatepro.com/</u></font>', table_cell_style)],
        [Paragraph("<b>Target Audience / Users</b>", table_cell_style), Paragraph("Strictly the account owner / internal admin (1 user total). Zero third-party access.", table_cell_style)],
        [Paragraph("<b>Google Ads API Service Used</b>", table_cell_style), Paragraph('<font face="Courier">KeywordPlanIdeaService.generate_keyword_ideas</font> only (Read-Only).', table_cell_style)],
        [Paragraph("<b>Targeting Criteria</b>", table_cell_style), Paragraph("Spain (geoTargetConstants/2724), Spanish language (languageConstants/1003), Google Search Network.", table_cell_style)],
        [Paragraph("<b>Authentication Flow</b>", table_cell_style), Paragraph("OAuth 2.0 Installed App Flow with offline refresh token flow.", table_cell_style)],
        [Paragraph("<b>Data Storage</b>", table_cell_style), Paragraph("Output files are saved locally as CSV and Excel (.xlsx) formats. No remote DB storage.", table_cell_style)],
    ]
    
    metadata_table = Table(metadata_data, colWidths=[150, 354])
    metadata_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E3A8A')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#D1D5DB')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor('#F9FAFB'), colors.white]),
    ]))
    
    story.append(metadata_table)
    
    # Force PageBreak to ensure exactly two balanced, clean pages
    story.append(PageBreak())
    
    # ----------------------------------------------------
    # PAGE 2: TECHNICAL DETAILS & COMPLIANCE
    # ----------------------------------------------------
    
    story.append(Paragraph("3. Technical Implementation & Google Ads API Services", h1_style))
    story.append(Paragraph(
        "The system communicates directly with the Google Ads API endpoints using the official Google Ads Python Client Library. "
        "To comply with read-only guidelines, the script relies strictly on a single API service to fetch keyword recommendations. "
        "No campaign writing or bidding services are imported or utilized.",
        body_style
    ))
    story.append(Paragraph(
        "<b>Service Utilized:</b> <font face='Courier' color='#1E3A8A'>KeywordPlanIdeaService.generate_keyword_ideas</font>",
        body_style
    ))
    story.append(Paragraph(
        "The script populates a <font face='Courier'>GenerateKeywordIdeasRequest</font> to retrieve keyword ideas and historical search volumes. "
        "Specifically, the tool queries and displays the following attributes for each keyword idea:",
        body_style
    ))
    story.append(Paragraph("• <b>Text:</b> The suggested search query matching user search behavior in Spain.", bullet_style))
    story.append(Paragraph("• <b>Average Monthly Searches:</b> The average monthly query volume over the past 12 months.", bullet_style))
    story.append(Paragraph("• <b>Competition Level & Index:</b> The competitive index score (0-100) representing ad placement density.", bullet_style))
    story.append(Paragraph("• <b>Top of Page Bids (Low/High Range):</b> Historical bids in Euros representing commercial intent and CPC ranges.", bullet_style))
    story.append(Paragraph("• <b>Monthly Search Volume Trends:</b> A monthly search volume breakdown for the past year to analyze academic seasonality (e.g. peak activity in May/June for EBAU/Selectividad exams).", bullet_style))
    
    story.append(Paragraph("4. Operational Scope Matrix (Developer Policy Alignment)", h1_style))
    story.append(Paragraph(
        "The following matrix explicitly outlines what the TutorMate Pro Keyword Research Tool is programmed to do versus functions it is restricted from doing. This boundary ensures total compliance with read-only access levels:",
        body_style
    ))
    
    scope_data = [
        [Paragraph("<b>Active Tool Functionality (In-Scope)</b>", table_header_style), Paragraph("<b>Prohibited API Capabilities (Out-of-Scope)</b>", table_header_style)],
        [
            Paragraph("• Reads seed keywords from a local plain text file (<code>keywords_seed.txt</code>).<br/>"
                      "• Requests keyword ideas filtered for Spain (geo 2724) and Spanish (lang 1003) on the Google Search Network.<br/>"
                      "• Pulls historical search metrics and CPC bounds.<br/>"
                      "• Extracts optional ideas using <code>tutormatepro.com</code> URL as a page context seed.<br/>"
                      "• Writes output datasets directly to local CSV/XLSX spreadsheets in a secure local subdirectory.", table_cell_style),
            Paragraph("• <b>NO campaign management:</b> Does not create, modify, or pause Google Ads campaigns.<br/>"
                      "• <b>NO ad management:</b> Does not write or publish search or display ads.<br/>"
                      "• <b>NO bid/budget modification:</b> Does not adjust keyword bids, targeting bids, or campaign budgets.<br/>"
                      "• <b>NO customer data access:</b> Does not view or extract customer PII or account performance history.<br/>"
                      "• <b>NO external account support:</b> Cannot handle client accounts.<br/>"
                      "• <b>NO remarketing/conversions:</b> Zero integration with app conversion tracking or remarketing lists.", table_cell_style)
        ]
    ]
    
    scope_table = Table(scope_data, colWidths=[252, 252])
    scope_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E3A8A')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#D1D5DB')),
        ('BACKGROUND', (0,1), (0,1), colors.HexColor('#F0FDF4')), # Soft light green background
        ('BACKGROUND', (1,1), (1,1), colors.HexColor('#FEF2F2')), # Soft light red background
    ]))
    
    story.append(scope_table)
    story.append(Spacer(1, 5))
    
    story.append(Paragraph("5. Authentication, Security & Data Storage", h1_style))
    story.append(Paragraph(
        "Data security and credential protection are implemented through strict local storage standards:",
        body_style
    ))
    story.append(Paragraph("• <b>Credential Security:</b> The application utilizes OAuth 2.0 Installed App Flow. No usernames or passwords are collected, processed, or stored. Authentication tokens (Client ID, Client Secret, Refresh Token) and the Google Ads Developer Token are maintained locally inside a secure <code>.env</code> file.", bullet_style))
    story.append(Paragraph("• <b>Git Protection:</b> The <code>.env</code> configuration file is explicitly added to the project's <code>.gitignore</code> and is excluded from all Git commits. No sensitive configuration keys are ever exposed or committed to public or private repositories (e.g., GitHub).", bullet_style))
    story.append(Paragraph("• <b>Private Output:</b> Resulting files (CSV/Excel) are generated on the operator's machine and are stored locally for immediate internal study. There is no transmission of search volume or keyword list data to any third-party or cloud databases.", bullet_style))
    
    story.append(Paragraph("6. Compliance & Policy Declaration", h1_style))
    story.append(Paragraph(
        "By submitting this design document, the developer of TutorMate Pro certifies that the requested Basic Access developer token will be used exclusively for the internal, read-only planning purposes described herein. "
        "The tool complies with the Google Ads API Terms & Conditions, does not violate any Minimum Functionality Requirements (MFR) since it does not offer public or commercial services, and will never perform campaign writes, budget alterations, or user tracking.",
        body_style
    ))
    
    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF: {pdf_filename}")

if __name__ == "__main__":
    generate_pdf()
