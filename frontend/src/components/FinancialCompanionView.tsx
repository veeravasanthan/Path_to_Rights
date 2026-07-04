/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import { UI_TRANSLATIONS } from '../translations';
import MarkdownRenderer from './MarkdownRenderer';
import { 
  ArrowLeft, 
  Coins, 
  Volume2, 
  VolumeX, 
  Loader2, 
  Sparkles, 
  Calculator, 
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  TrendingDown
} from 'lucide-react';

interface FinancialCompanionViewProps {
  onBack: () => void;
  selectedLanguage: Language;
  isDarkMode: boolean;
}

export default function FinancialCompanionView({
  onBack,
  selectedLanguage,
  isDarkMode
}: FinancialCompanionViewProps) {
  const t = UI_TRANSLATIONS[selectedLanguage.code] || UI_TRANSLATIONS['en'];
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Debt Trap Calculator Parameters
  const [loanAmount, setLoanAmount] = useState<number>(10000); // Principal
  const [rateType, setRateType] = useState<'bank' | 'landlord'>('landlord'); // Bank vs Predatory Money Lender
  const [interestPercent, setInterestPercent] = useState<number>(36); // e.g. 3% per month = 36% Year or Bank 10%
  const [durationMonths, setDurationMonths] = useState<number>(12); // Length

  // Quick Educational Presets
  const educationPresets: Record<string, string[]> = {
    en: [
      "Why compounding interest makes informal loans dangerous",
      "How to apply for standard bank loans safely",
      "Risks of signed blank check books or empty stamp papers",
      "Central crop insurance PMFBY scheme details",
      "How Microfinance (SHG) loans work"
    ],
    hi: [
      "चक्रवृद्धि ब्याज क्यों अनौपचारिक ऋणों को खतरनाक बनाता है",
      "सुरक्षित रूप से बैंक ऋण के लिए आवेदन कैसे करें",
      "हस्ताक्षरित कोरे चेक बुक या खाली स्टांप पेपर के खतरे",
      "पीएम फसल बीमा योजना (PMFBY) की जानकारी",
      "महिला स्वयं सहायता समूह (SHG) लोन कैसे काम करता है"
    ],
    ta: [
      "கந்துவட்டி மற்றும் கூட்டு வட்டி ஏன் ஆபத்தானது?",
      "வங்கிகளில் பாதுகாப்பாக கடன் வாங்குவது எப்படி?",
      "கையெழுத்திட்ட வெற்று காசோலைகள் அல்லது பத்திரங்களின் பேராபத்து",
      "பயிர் காப்பீட்டுத் திட்டம் (PMFBY) விவரங்கள்",
      "மகளிர் சுயஉதவிக் குழு (SHG) கடன்கள் எவ்வாறு செயல்படுகின்றன?"
    ],
    te: [
      "చక్రవడ్డీ ఎందుకు అనధికారిక అప్పులను ప్రమాదకరంగా మారుస్తుంది?",
      "బ్యాంకుల నుండి అప్పులను సురక్షితంగా ఎలా పొందాలి?",
      "ఖాళీ కాగితాలు లేదా చెక్కులపై సంతకం చేయడంలో ఉన్న ప్రమాదాలు",
      "ప్రధానమంత్రి ఫసల్ బీమా యోజన వివరాలు",
      "మహిళా స్వయం సహాయక సంఘాల (SHG) రుణాలు ఎలా పని చేస్తాయి?"
    ],
    kn: [
      "ಕ চক্রಬಡ್ಡಿ ಏಕೆ ಖಾಸಗಿ ಸಾಲಗಳನ್ನು ಅತ್ಯಂತ ಅಪಾಯಕಾರಿಯಾಗಿಸುತ್ತದೆ?",
      "ಬ್ಯಾಂಕ್‌ಗಳಿಂದ ಸುರಕ್ಷಿತವಾಗಿ ಸಾಲ ಪಡೆಯುವುದು ಹೇಗೆ?",
      "ಖಾಲಿ ಚೆಕ್ ಅಥವಾ ಕೋರೆ ಸ್ಟಾಂಪ್ ಪೇಪರ್‌ಗಳ ಮೇಲಿನ ಸಹಿಯ ಅನಾಹುತಗಳು",
      "ಪ್ರಧಾನ ಮಂತ್ರಿ ಫಸಲ್ ಬಿಮಾ ಯೋಜನಾ ಮಾಹಿತಿ",
      "ಸ್ವಸಹಾಯ ಸಂಘಗಳ (SHG) ಸಾಲ ವ್ಯವಸ್ಥೆ ಹೇಗೆ ನಡೆಯುತ್ತದೆ?"
    ],
    ml: [
      "എന്തുകൊണ്ടാണ് കൂട്ടുപലിശ സാധാരണ ലോണുകളെ അപകടകരമാക്കുന്നത്?",
      "ബാങ്കുകളിൽ നിന്ന് സുരക്ഷിതമായി വായ്പ എടുക്കുന്നത് എങ്ങനെ?",
      "ഒപ്പിട്ട ബ്ലാങ്ക് ചെക്കുകളോ മുദ്രപ്പത്രങ്ങളോ നൽകുന്നതിൻ്റെ ഭീഷണി",
      "പി-എം വിള ഇൻഷുറൻസ് പദ്ധതി വിശദാംശങ്ങൾ",
      "സ്ത്രീകളുടെ സ്വയം സഹായ സംഘം (SHG) വായ്പകൾ പ്രവർത്തിക്കുന്നത് എങ്ങനെ?"
    ]
  };

  const currentPresets = educationPresets[selectedLanguage.code] || educationPresets['en'];

  // Handle calculator dynamics
  const monthlyRate = (interestPercent / 12) / 105; // Predatory/Regular math formula approximation
  // Let's do Standard Compound Interest calculated Month-By-Month
  // Formula: A = P(1 + r/n)^nt --> monthly compounding is extremely typical of informal money lenders!
  const calculatedTotal = loanAmount * Math.pow(1 + (interestPercent / 100 / 12), durationMonths);
  const totalInterest = calculatedTotal - loanAmount;

  const handleQuerySubmit = async (textToQuery: string) => {
    if (!textToQuery.trim() || isLoading) return;
    setIsLoading(true);
    setErrorMsg(null);
    setResult(null);

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    try {
      const response = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'finance',
          query: textToQuery,
          languageName: selectedLanguage.name
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to explain financial concept');
      }

      setResult(data.text);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error clarifying financial issues. Ensure server and network lines are active.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTTS = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!result) return;

    const cleanedText = result
      .replace(/[#*`_~]/g, '')
      .replace(/[-+]/g, ' • ');

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    
    const voiceMaps: Record<string, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      kn: 'kn-IN',
      ml: 'ml-IN'
    };

    utterance.lang = voiceMaps[selectedLanguage.code] || 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`min-h-screen ${
      isDarkMode ? 'bg-stone-950 text-stone-100' : 'bg-[#fcfbf7] text-stone-900'
    } transition-colors duration-500 pb-16 font-sans`}>
      
      {/* Navigation Top Bar */}
      <div className={`p-4 border-b flex items-center justify-between sticky top-0 z-45 backdrop-blur-md ${
        isDarkMode ? 'bg-stone-950/80 border-stone-850' : 'bg-white/80 border-stone-200/50'
      }`}>
        <button
          type="button"
          onClick={() => {
            if (isSpeaking) window.speechSynthesis.cancel();
            onBack();
          }}
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all border cursor-pointer ${
            isDarkMode ? 'border-stone-800 hover:bg-stone-900 text-stone-300' : 'border-stone-200 hover:bg-stone-50 text-stone-700'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          {t.navDashboard}
        </button>

        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-purple-500" />
          <span className="font-bold text-sm tracking-tight">{t.financeAssistant || UI_TRANSLATIONS['en'].financeAssistant}</span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 mt-8 grid grid-cols-1 gap-8">
        
        {/* Title */}
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {t.financeTitle || UI_TRANSLATIONS['en'].financeTitle}
          </h2>
          <p className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-stone-550'}`}>
            {t.financeDesc || UI_TRANSLATIONS['en'].financeDesc}
          </p>
        </div>

        {/* 1. INTERACTIVE CALCULATOR (Compound Interest Debt Trap Analyzer) */}
        <div className={`p-6 rounded-2xl border ${
          isDarkMode ? 'bg-stone-900/60 border-stone-850' : 'bg-white border-stone-200/80 shadow-xs'
        }`}>
          <div className="flex items-center gap-2.5 mb-5 border-b border-stone-250 dark:border-stone-800 pb-3">
            <Calculator className="w-5.5 h-5.5 text-amber-600" />
            <h3 className="font-bold text-sm sm:text-base tracking-tight text-stone-900 dark:text-stone-100 uppercase font-mono">
              {t.debtCalculatorTitle || UI_TRANSLATIONS['en'].debtCalculatorTitle}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                  {t.borrowingLabel || UI_TRANSLATIONS['en'].borrowingLabel}
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="range"
                    min="2000"
                    max="100000"
                    step="1000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="flex-1 accent-amber-600 cursor-pointer"
                  />
                  <span className="text-sm font-extrabold font-mono border-stone-300 border dark:border-stone-800 px-3 py-1 bg-stone-50 dark:bg-stone-950 rounded-lg shrink-0">
                    ₹{loanAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                  {t.lenderLabel || UI_TRANSLATIONS['en'].lenderLabel}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRateType('bank');
                      setInterestPercent(11); // Typical Bank loan interest
                    }}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      rateType === 'bank'
                        ? 'border-emerald-500 bg-emerald-550/10 text-emerald-700 dark:text-emerald-400'
                        : 'border-stone-200 dark:border-stone-850 hover:bg-stone-50 dark:hover:bg-stone-900'
                    }`}
                  >
                    {t.bankLenderOption || UI_TRANSLATIONS['en'].bankLenderOption}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRateType('landlord');
                      setInterestPercent(36); // Typical money lender (e.g. 3% pm = 36% pa or higher!)
                    }}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      rateType === 'landlord'
                        ? 'border-red-500 bg-red-550/10 text-red-700 dark:text-red-400'
                        : 'border-stone-200 dark:border-stone-850 hover:bg-stone-50 dark:hover:bg-stone-900'
                    }`}
                  >
                    {t.informalLenderOption || UI_TRANSLATIONS['en'].informalLenderOption}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                  {t.yearlyInterestLabel || UI_TRANSLATIONS['en'].yearlyInterestLabel}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    max="150"
                    value={interestPercent}
                    onChange={(e) => setInterestPercent(Number(e.target.value))}
                    className="w-24 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-lg px-2 py-1.5 text-xs text-stone-800 dark:text-stone-200 font-mono"
                  />
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 leading-normal">
                    {rateType === 'landlord' 
                      ? (t.interestWarningMoneyLender || UI_TRANSLATIONS['en'].interestWarningMoneyLender) 
                      : (t.interestWarningBank || UI_TRANSLATIONS['en'].interestWarningBank)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                  {t.repaymentPeriodLabel || UI_TRANSLATIONS['en'].repaymentPeriodLabel}
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="range"
                    min="3"
                    max="36"
                    step="1"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(Number(e.target.value))}
                    className="flex-1 accent-amber-600 cursor-pointer"
                  />
                  <span className="text-sm font-extrabold font-mono border-stone-300 border dark:border-stone-800 px-3 py-1 bg-stone-50 dark:bg-stone-950 rounded-lg shrink-0">
                    {durationMonths} Mon
                  </span>
                </div>
              </div>
            </div>

            {/* Simulated Calculated results */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${
              rateType === 'landlord' 
                ? 'bg-red-50/20 border-red-200 text-red-950 dark:text-red-200' 
                : 'bg-emerald-50/20 border-emerald-200 text-emerald-950 dark:text-emerald-200'
            }`}>
              
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest block text-stone-500 dark:text-stone-400">
                  {t.repaymentProjectionTitle || UI_TRANSLATIONS['en'].repaymentProjectionTitle}
                </span>

                <div className="mt-4 space-y-3 font-mono">
                  <div className="flex justify-between items-center text-xs">
                    <span>{t.borrowedAmountLabel || UI_TRANSLATIONS['en'].borrowedAmountLabel}</span>
                    <span className="font-bold">₹{loanAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span>{(t.accruedInterestLabel || UI_TRANSLATIONS['en'].accruedInterestLabel).replace('{rate}', String(interestPercent))}</span>
                    <span className="font-bold text-amber-600">₹{Math.round(totalInterest).toLocaleString('en-IN')}</span>
                  </div>
                  <hr className="border-stone-250 dark:border-stone-800" />
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold">{t.totalRepayableLabel || UI_TRANSLATIONS['en'].totalRepayableLabel}</span>
                    <span className="font-extrabold text-base text-red-650 dark:text-red-400">
                      ₹{Math.round(calculatedTotal).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Debt Warning Block */}
              <div className="mt-5 pt-4.5 border-t border-stone-200 dark:border-stone-800">
                {rateType === 'landlord' ? (
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-red-650 shrink-0 mt-0.5 animate-bounce" />
                    <div>
                      <h4 className="text-xs font-bold text-red-700 dark:text-red-400">{t.predatoryAlertTitle || UI_TRANSLATIONS['en'].predatoryAlertTitle}</h4>
                      <p className="text-[10px] mt-0.5 leading-relaxed text-stone-500 dark:text-stone-400">
                        {(t.predatoryAlertDesc || UI_TRANSLATIONS['en'].predatoryAlertDesc).replace('{rate}', String(interestPercent)).replace('{interest}', `₹${Math.round(totalInterest).toLocaleString('en-IN')}`)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{t.bankStandardTitle || UI_TRANSLATIONS['en'].bankStandardTitle}</h4>
                      <p className="text-[10px] mt-0.5 leading-relaxed text-stone-500 dark:text-stone-400">
                        {(t.bankStandardDesc || UI_TRANSLATIONS['en'].bankStandardDesc).replace('{rate}', String(interestPercent))}
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* 2. ASK AI FOR DETAILED GUIDELINES */}
        <div className={`p-5 rounded-2xl border ${
          isDarkMode ? 'bg-stone-900/40 border-stone-850' : 'bg-white border-stone-200/80'
        }`}>
          <label className="block text-xs font-bold uppercase tracking-wider text-purple-600 mb-2">
            {t.askFinanceLabel || UI_TRANSLATIONS['en'].askFinanceLabel}
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.askFinancePlaceholder || UI_TRANSLATIONS['en'].askFinancePlaceholder}
                className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl pr-4 pl-10 py-3 text-xs sm:text-sm outline-hidden font-sans text-stone-800 dark:text-stone-200 focus:border-amber-400 transition-all"
              />
            </div>
            <button
              onClick={() => handleQuerySubmit(query)}
              disabled={isLoading || !query.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-3 rounded-xl shadow-xs transition-all cursor-pointer text-xs flex items-center gap-1.5 shrink-0"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {t.consultBtn || UI_TRANSLATIONS['en'].consultBtn}
            </button>
          </div>

          {/* Quick presets */}
          <div className="mt-4">
            <span className="text-[10px] uppercase font-bold text-stone-400 block mb-2 font-sand">
              {t.financePresetsTitle || UI_TRANSLATIONS['en'].financePresetsTitle}
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
              {currentPresets.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setQuery(preset);
                    handleQuerySubmit(preset);
                  }}
                  disabled={isLoading}
                  className={`px-3 py-1.5 rounded-full border text-[11px] text-left transition-all font-sans cursor-pointer ${
                    isDarkMode
                      ? 'border-stone-800 bg-stone-950 hover:border-amber-500 hover:text-amber-400'
                      : 'border-stone-150 bg-stone-50 hover:border-amber-500 hover:bg-amber-50/20'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output Panel for AI search results */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-100/10 border border-red-200 rounded-2xl text-red-900 dark:text-red-300 text-xs"
            >
              {errorMsg}
            </motion.div>
          )}

          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`p-10 rounded-2xl border text-center flex flex-col items-center justify-center min-h-[200px] ${
                isDarkMode ? 'bg-stone-900/30 border-stone-850' : 'bg-white border-stone-200'
              }`}
            >
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin mb-3" />
              <h4 className="font-bold text-sm tracking-tight">{t.loadingFinanceTitle || UI_TRANSLATIONS['en'].loadingFinanceTitle}</h4>
              <p className="text-xs text-stone-500 mt-1 max-w-sm">
                {t.loadingFinanceDesc || UI_TRANSLATIONS['en'].loadingFinanceDesc}
              </p>
            </motion.div>
          )}

          {!isLoading && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border shadow-xs p-6 sm:p-8 relative ${
                isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-150'
              }`}
            >
              {/* Voice Read aloud floating key */}
              <div className="absolute top-5 right-5 flex gap-2">
                <button
                  type="button"
                  onClick={toggleTTS}
                  className={`p-2 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${
                    isSpeaking 
                      ? 'bg-amber-100 dark:bg-amber-900 border-amber-300 dark:border-amber-800 text-amber-700 animate-pulse'
                      : isDarkMode
                      ? 'bg-stone-850 border-stone-800 text-stone-300 hover:text-white'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                  title="Speak Results aloud"
                >
                  {isSpeaking ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-5 h-5 text-purple-500" />
                <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-wider text-purple-650 dark:text-purple-400">
                  {t.simplifiedFinanceGuide || UI_TRANSLATIONS['en'].simplifiedFinanceGuide}
                </h3>
              </div>

              {/* Financial guidance blocks */}
              <div className="prose prose-stone dark:prose-invert max-w-none text-stone-800 dark:text-stone-250 text-xs sm:text-sm font-sans space-y-4 leading-relaxed">
                <MarkdownRenderer content={result} />
              </div>

              <div className={`mt-8 pt-5 border-t text-[10px] sm:text-xs font-sans ${isDarkMode ? 'border-stone-800 text-stone-400' : 'border-stone-150 text-stone-500'}`}>
                {t.rbiAdvisoryNotice || UI_TRANSLATIONS['en'].rbiAdvisoryNotice}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
