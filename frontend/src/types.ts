/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Language {
  code: string;
  name: string;
  localName: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', localName: 'English' },
  { code: 'hi', name: 'Hindi', localName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', localName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', localName: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', localName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', localName: 'മലയാളം' },
  { code: 'mr', name: 'Marathi', localName: 'मराठी' },
  { code: 'bn', name: 'Bengali', localName: 'বাংলা' },
  { code: 'gu', name: 'Gujarati', localName: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', localName: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'Odia', localName: 'ଓଡ଼ିଆ' },
  { code: 'ur', name: 'Urdu', localName: 'اردو' }
];

export interface AnalysisResponse {
  success: boolean;
  documentType: string;
  simpleExplanation: string;
  importantPoints: string[];
  redFlags: string[];
  whenAndWhere: {
    required: boolean;
    when: string;
    where: string;
  };
  rawMarkdown: string; // The full raw generated text matching the prompt requirements
  error?: string;
  extractedPdfText?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface SampleDocument {
  id: string;
  title: string;
  docType: string;
  language: string;
  content: string;
}

export const SAMPLE_DOCUMENTS: SampleDocument[] = [
  {
    id: 'fir-1',
    title: 'First Information Report (FIR) - Hindi',
    docType: 'FIR (Police Complaint)',
    language: 'Hindi',
    content: `प्रथम सूचना रिपोर्ट (धारा 154 दंड प्रक्रिया संहिता)
थाना: सिविल लाइन्स, जिला: प्रयागराज
दिनांक: 15/05/2026, समय: दोपहर 02:30 बजे
प्राथमिकी संख्या: 0422/2026
शिकायतकर्ता: राम लाल, पुत्र: सुंदर लाल, निवासी: ग्राम मऊ, प्रयागराज।
अभियुक्त (आरोपी): रमेश यादव और 2 अज्ञात व्यक्ति।
विवरण:
शिकायतकर्ता ने बयान दिया कि दिनांक 14/05/2026 की शाम लगभग 07:00 बजे जब वह अपने खेत से घर लौट रहा था, तब अभियुक्त रमेश यादव ने कुल्हाड़ी लेकर उसका रास्ता रोका और गाली-गलौज की। विरोध करने पर रमेश और उसके साथ आए दो अन्य अज्ञात व्यक्तियों ने लाठियों से हमला कर दिया। शिकायतकर्ता के सिर और बाएं हाथ पर गंभीर चोटें आई हैं। शोर मचाने पर गांव के रमेश चंद्र और लालजी सिंह मौके पर आए, जिन्हें देखकर हमलावर जान से मारने की धमकी देते हुए भाग गए।
धाराएं (Sections): धारा 323 (स्वेच्छा से चोट पहुंचाना), 504 (शांति भंग करने के इरादे से अपमान), और 506 (आपराधिक धमकी) भारतीय दंड संहिता (IPC)।
कार्रवाई: उप-निरीक्षक (Sub-Inspector) विजय कुमार को जांच सौंपी गई है। शिकायतकर्ता को सरकारी अस्पताल रेफर किया गया है।`
  },
  {
    id: 'court-summons',
    title: 'Court Summons (न्यायालय समन) - Tamil/English',
    docType: 'Court Notice (न्यायालय समन)',
    language: 'Tamil',
    content: `CIVIL COURT OR DISTRICT COURT JUDICIAL MAGISTRATE - ERODE, TAMIL NADU
SUMMONS TO DEFENDANT FOR APPEARANCE IN PERSON (ORDER V, RULE 1 & 5 CPC)
Suit No: OS 128 / 2026
To: 
Muthusamy, S/O Karuppan,
Door No. 12, Gandhi Nagar, Erode - 638009.

WHEREAS, Arumugam, S/O Palanisamy, Erode, has filed a suit against you for Recovery of Money (Rs. 85,000/- with interest) based on a Promissory Note dated 12/04/2024.

You are hereby summoned to appear in this Court in person or by a pleader (Advocate) duly instructed on the 25th day of June 2026 at 10:30 AM to answer the claim.

TAKE NOTICE that, in default (if you do not appear), the suit will be heard and determined in your absence (Ex-parte decision).
Given under my hand and the seal of the Court, this 20th day of May 2026.
By Order, Civil Judge, District Court, Erode.`
  },
  {
    id: 'land-patta-dispute',
    title: 'Tehsildar Land Notice (जमीन नोटिस) - Hindi',
    docType: 'Land Record Notice (पटवारी/तहसीलदार जमीन विवाद)',
    language: 'Hindi',
    content: `कार्यालय तहसीलदार, तहसील: विकासनगर, जिला: देहरादून, उत्तराखंड
राजस्व वाद संख्या: 345 / नामान्तरण (Mutation) / 2026
दिनांक: 18/05/2026

बनाम:
हरि सिंह, पुत्र: बलवंत सिंह, निवासी: ग्राम केदारवाला, विकासनगर।

विषय: भूमि खसरा नंबर 142/1, क्षेत्रफल 0.250 हेक्टेयर पर आपत्ति (Objection) दर्ज करने हेतु सूचना।

उत्तराधिकार/विक्रय के आधार पर उपरोक्त भूमि का नामान्तरण (Dakhil-Kharij) दर्ज करने हेतु श्रीमती सुमित्रा देवी, पत्नी स्व. राम सिंह द्वारा आवेदन प्रस्तुत किया गया है। यदि आपको इसमें कोई आपत्ति है, तो आप स्वयं अथवा अपने अधिकृत प्रतिनिधि के माध्यम से दिनांक 12 जून 2026 को प्रातः 11:00 बजे तहसीलदार न्यायालय में उपस्थित होकर साक्ष्य सहित अपनी आपत्ति दर्ज कराएं। 
नियत तिथि पर उपस्थित न होने की दशा में एकतरफा कार्रवाई करते हुए नामान्तरण की प्रक्रिया पूरी कर दी जाएगी और बाद में कोई भी आपत्ति स्वीकार नहीं की जाएगी।
तहसीलदार, विकासनगर`
  }
];
