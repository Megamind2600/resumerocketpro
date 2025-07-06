export interface DocumentContent {
  resumeText: string;
  coverLetter: string;
  includeWatermark: boolean;
}

export async function generatePDFDocuments(content: DocumentContent): Promise<{
  resumePDF: Buffer;
  coverLetterPDF: Buffer;
}> {
  // For production, you would use pdf-lib or puppeteer here
  // This is a simplified implementation for demo purposes
  
  const resumeHTML = generateResumeHTML(content.resumeText, content.includeWatermark);
  const coverLetterHTML = generateCoverLetterHTML(content.coverLetter, content.includeWatermark);
  
  // Simulate PDF generation
  const resumePDF = Buffer.from(resumeHTML, 'utf8');
  const coverLetterPDF = Buffer.from(coverLetterHTML, 'utf8');
  
  return {
    resumePDF,
    coverLetterPDF,
  };
}

function generateResumeHTML(content: string, includeWatermark: boolean): string {
  const watermarkStyle = includeWatermark ? `
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); 
                font-size: 48px; color: rgba(0,0,0,0.1); font-weight: bold; z-index: 1000; pointer-events: none;">
      DEMO – Pay to Download
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; position: relative; }
        .watermark { position: relative; }
        h1 { color: #2563EB; text-align: center; }
        h2 { color: #1E40AF; border-bottom: 2px solid #2563EB; padding-bottom: 5px; }
        .contact-info { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 25px; }
        .experience-item { margin-bottom: 15px; }
        .job-title { font-weight: bold; color: #1E40AF; }
        .company { font-style: italic; }
        .dates { color: #666; font-size: 0.9em; }
        ul { padding-left: 20px; }
        li { margin-bottom: 5px; }
      </style>
    </head>
    <body>
      <div class="watermark">
        ${watermarkStyle}
        <div style="white-space: pre-wrap;">${content}</div>
      </div>
    </body>
    </html>
  `;
}

function generateCoverLetterHTML(content: string, includeWatermark: boolean): string {
  const watermarkStyle = includeWatermark ? `
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); 
                font-size: 48px; color: rgba(0,0,0,0.1); font-weight: bold; z-index: 1000; pointer-events: none;">
      DEMO – Pay to Download
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.8; position: relative; }
        .watermark { position: relative; }
        .header { text-align: center; margin-bottom: 40px; }
        .content { max-width: 600px; margin: 0 auto; }
        p { margin-bottom: 20px; text-align: justify; }
        .signature { margin-top: 40px; }
      </style>
    </head>
    <body>
      <div class="watermark">
        ${watermarkStyle}
        <div class="content">
          <div style="white-space: pre-wrap;">${content}</div>
        </div>
      </div>
    </body>
    </html>
  `;
}
