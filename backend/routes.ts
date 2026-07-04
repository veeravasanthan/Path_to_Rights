/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from 'express';
import { 
  analyzeDocument, 
  getRegionalKnowledge, 
  clarifyLegalChat 
} from '../ai_service/aiService';

let pdfParserClass: any = null;
async function getPdfParserClass() {
  if (!pdfParserClass) {
    const pdfModule = await import('pdf-parse');
    pdfParserClass = pdfModule.PDFParse;
  }
  return pdfParserClass;
}

const router = Router();

// 1. Health check API
router.get('/health', (req: Request, res: Response) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({ status: 'ok', hasKey });
});

// 2. Main document analysis API
router.post('/analyze', async (req: Request, res: Response) => {
  const { documentText, documentImage, documentPdf, languageCode, languageName } = req.body;

  if (!documentText && !documentImage && !documentPdf) {
    res.status(400).json({ error: 'Please provide either document text, an image upload, or a PDF file' });
    return;
  }

  let extractedPdfText = '';
  if (documentPdf) {
    try {
      const base64Data = documentPdf.replace(/^data:application\/pdf;base64,/, '');
      const dataBuffer = Buffer.from(base64Data, 'base64');
      const ParserClass = await getPdfParserClass();
      const parserInstance = new ParserClass({ data: dataBuffer });
      const pdfData = await parserInstance.getText();
      extractedPdfText = pdfData.text || '';
    } catch (pdfError: any) {
      console.error('Failed to parse PDF using pdf-parse:', pdfError);
      res.status(400).json({ success: false, error: `Failed to read the PDF document: ${pdfError.message || pdfError}` });
      return;
    }
  }

  try {
    const analysisResponse = await analyzeDocument({
      documentText,
      documentImageBase64: documentImage,
      extractedPdfText,
      languageName,
    });

    res.json({
      success: true,
      ...analysisResponse,
      extractedPdfText: extractedPdfText || undefined,
    });
  } catch (error: any) {
    console.error('Error in analyze API routing:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Verification or processing failed. Please ensure your API Key is entered in Settings.'
    });
  }
});

// 3. Regional Knowledge API (Rights, Schemes, and Financial Guidance)
router.post('/knowledge', async (req: Request, res: Response) => {
  const { category, query, languageName } = req.body;

  if (!query) {
    res.status(400).json({ error: 'Query is required' });
    return;
  }

  try {
    const answer = await getRegionalKnowledge({
      category: category || 'finance',
      query,
      languageName,
    });

    res.json({
      success: true,
      text: answer
    });
  } catch (error: any) {
    console.error('Error in knowledge API routing:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch guidance. Please try again.'
    });
  }
});

// 4. Follow-up Chat API for personalized legal clarifications
router.post('/chat', async (req: Request, res: Response) => {
  const { messages, originalDocumentText, originalAnalysis, languageName } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: 'Messages list is required' });
    return;
  }

  try {
    const answer = await clarifyLegalChat({
      messages,
      originalDocumentText,
      originalAnalysis,
      languageName,
    });

    res.json({
      success: true,
      content: answer
    });
  } catch (error: any) {
    console.error('Error in chat route handling:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Clarification failed. Please try again.'
    });
  }
});

export default router;
