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
  Search, 
  Volume2, 
  VolumeX, 
  Award, 
  HelpCircle, 
  Loader2, 
  Sparkles,
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface WelfareSchemesViewProps {
  onBack: () => void;
  selectedLanguage: Language;
  isDarkMode: boolean;
}

export default function WelfareSchemesView({
  onBack,
  selectedLanguage,
  isDarkMode
}: WelfareSchemesViewProps) {
  const t = UI_TRANSLATIONS[selectedLanguage.code] || UI_TRANSLATIONS['en'];
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Suggested pre-configured queries in the relative languages to make it extremely easy
  const translationPresets: Record<string, string[]> = {
    en: [
      "PM-KISAN direct cash relief details",
      "PM Awas Yojana rural housing support",
      "MGNREGA 100 days job guarantee steps",
      "Sukanya Samriddhi account rules for girls",
      "Pension schemes for elderly & widows"
    ],
    hi: [
      "पीएम-किसान सम्मान निधि की जानकारी",
      "प्रधानमंत्री आवास योजना ग्रामीण हेतु नियम",
      "मनरेगा १० दिनों की कार्य गारंटी योजना",
      "सुकन्या समृद्धि योजना बेटियों के लिए खाते की जानकारी",
      "बुजुर्गों और विधवाओं के लिए पेंशन योजना"
    ],
    ta: [
      "பி.எம்-கிசான் விவசாயி உதவித் தொகை விவரங்கள்",
      "பிரதான் மந்திரி ஆவாஸ் யோஜனா கிராமப்புற வீட்டு வசதி",
      "மகாத்மா காந்தி வேலைவாய்ப்பு 100 நாள் திட்டம்",
      "செல்வமகள் சேமிப்பு திட்டம் விவரங்கள்",
      "முதியோர் மற்றும் விதவை உதவித் தொகை ஓய்வூதியம்"
    ],
    te: [
      "పిఎమ్-కిసాన్ రైతు లబ్ధిదారుల వివరాలు",
      "పీఎం ఆవాస్ యోజన గ్రామీణ ఇళ్ల మంజూరు వివరాలు",
      "ఉపాధి హామీ పథకం 100 రోజుల పని వివరాలు",
      "సుకన్య సమృద్ధి యోజన ఆడపిల్లల పథకం",
      "వృద్ధాప్య మరియు వితంతు పెన్షన్ల వివరాలు"
    ],
    kn: [
      "ಪಿಎಂ-ಕಿಸಾನ್ ರೈತರ ಹಣಕಾಸು ನೆರವು ಮಾಹಿತಿ",
      "ಪ್ರಧಾನ ಮಂತ್ರಿ ಆವಾಸ್ ಯೋಜನಾ ಗ್ರಾಮೀಣ ವಸತಿ",
      "ಉದ್ಯೋಗ ಖಾತರಿ ಸಾಲ 100 ದಿನಗಳ ಕೆಲಸದ ವಿವರಗಳು",
      "ಸುಕನ್ಯಾ ಸಮೃದ್ಧಿ ಹೆಣ್ಣುಮಕ್ಕಳ ಉಳಿತಾಯ ಖಾತೆ",
      "ವೃದ್ಧರು ಮತ್ತು ವಿಧವೆಯರ ಮಾಸಾಶನ ಯೋಜನೆ"
    ],
    ml: [
      "പിഎം-കിസാൻ കർഷക സഹായ പദ്ധതി വിവരങ്ങൾ",
      "ലൈഫ് മിഷൻ / പ്രധാനമന്ത്രി ആവാസ് യോജന ഭവന പദ്ധതി",
      "തൊഴിലുറപ്പ് പദ്ധതിയുടെ വിശദാംശങ്ങൾ",
      "സുകന്യ സമൃദ്ധി പെൺകുട്ടികളുടെ സമ്പാദ്യ പദ്ധതി",
      "വാർദ്ധക്യകാല പെൻഷൻ ലഭിക്കുവാനുള്ള വിവരങ്ങൾ"
    ]
  };

  const currentPresets = translationPresets[selectedLanguage.code] || translationPresets['en'];

  const handleQuerySubmit = async (textToQuery: string) => {
    if (!textToQuery.trim() || isLoading) return;
    setIsLoading(true);
    setErrorMsg(null);
    setResult(null);
    
    // Stop speaking if playing
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    try {
      const response = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'schemes',
          query: textToQuery,
          languageName: selectedLanguage.name
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to explain scheme');
      }

      setResult(data.text);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error explaining scheme. Ensure your environment keys are verified.');
    } finally {
      setIsLoading(false);
    }
  };

  // Browser-native TTS speaker
  const toggleTTS = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!result) return;

    // Clean markdown hashes and asterisks from speech stream
    const cleanedText = result
      .replace(/[#*`_~]/g, '')
      .replace(/[-+]/g, ' • ');

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    
    // Attempt language mapping
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
      
      {/* Top Bar Navigation */}
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
          <Award className="w-5 h-5 text-emerald-500" />
          <span className="font-bold text-sm tracking-tight">{t.welfareAssistant || UI_TRANSLATIONS['en'].welfareAssistant}</span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 mt-8">
        
        {/* Banner */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {t.welfareTitle || UI_TRANSLATIONS['en'].welfareTitle}
          </h2>
          <p className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-stone-550'}`}>
            {t.welfareDesc || UI_TRANSLATIONS['en'].welfareDesc}
          </p>
        </div>

        {/* Dynamic Search Box */}
        <div className={`p-5 rounded-2xl border mb-6 ${
          isDarkMode ? 'bg-stone-900/40 border-stone-850' : 'bg-white border-stone-200/80'
        }`}>
          <label className="block text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">
            {t.searchSchemesLabel || UI_TRANSLATIONS['en'].searchSchemesLabel}
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchSchemesPlaceholder || UI_TRANSLATIONS['en'].searchSchemesPlaceholder}
                className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm outline-hidden font-sans text-stone-800 dark:text-stone-200 focus:border-amber-400 transition-all"
              />
            </div>
            <button
              onClick={() => handleQuerySubmit(query)}
              disabled={isLoading || !query.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-3 rounded-xl shadow-xs transition-all cursor-pointer text-xs flex items-center gap-1.5 shrink-0"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {t.findBtn || UI_TRANSLATIONS['en'].findBtn}
            </button>
          </div>

          {/* Quick Preset queries */}
          <div className="mt-4">
            <span className="text-[10px] uppercase font-bold text-stone-400 block mb-2 font-sand">
              {t.schemesPresetsTitle || UI_TRANSLATIONS['en'].schemesPresetsTitle}
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

        {/* Dynamic Showcase Panel */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-100/10 border border-red-200 rounded-2xl text-red-900 dark:text-red-300 text-xs mb-6"
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
              className={`p-10 rounded-2xl border text-center flex flex-col items-center justify-center min-h-[250px] ${
                isDarkMode ? 'bg-stone-900/30 border-stone-850' : 'bg-white border-stone-200'
              }`}
            >
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin mb-3" />
              <h4 className="font-bold text-sm tracking-tight">{t.loadingSchemesTitle || UI_TRANSLATIONS['en'].loadingSchemesTitle}</h4>
              <p className="text-xs text-stone-500 mt-1 max-w-sm">
                {t.loadingSchemesDesc || UI_TRANSLATIONS['en'].loadingSchemesDesc}
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
              {/* Audio Read-out Controls floating right */}
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
                  title="Read Aloud Summary"
                >
                  {isSpeaking ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-wider text-amber-600">
                  {t.simplifiedWelfareGuide || UI_TRANSLATIONS['en'].simplifiedWelfareGuide}
                </h3>
              </div>

              {/* Styled AI Scheme Explanation Output */}
              <div className="prose prose-stone dark:prose-invert max-w-none text-stone-800 dark:text-stone-250 text-xs sm:text-sm font-sans space-y-4 leading-relaxed">
                <MarkdownRenderer content={result} />
              </div>

              <div className={`mt-8 pt-5 border-t text-[10px] sm:text-xs font-sans ${isDarkMode ? 'border-stone-800 text-stone-400' : 'border-stone-150 text-stone-500'}`}>
                {t.schemesDisclaimer || UI_TRANSLATIONS['en'].schemesDisclaimer}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
