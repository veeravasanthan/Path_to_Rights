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
  BookOpen, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  Loader2, 
  Sparkles,
  Scale,
  ShieldAlert
} from 'lucide-react';

interface IndianRightsViewProps {
  onBack: () => void;
  selectedLanguage: Language;
  isDarkMode: boolean;
}

export default function IndianRightsView({
  onBack,
  selectedLanguage,
  isDarkMode
}: IndianRightsViewProps) {
  const t = UI_TRANSLATIONS[selectedLanguage.code] || UI_TRANSLATIONS['en'];
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Key legal queries relevant to ordinary rural & middle-income Indian citizens
  const rightPresets: Record<string, string[]> = {
    en: [
      "Article 21: Right to Life and Liberty simply",
      "What are my rights if police stop me?",
      "How can I get a free legal aid lawyer?",
      "Under what sections can police make arrests?",
      "Womens rights in inheritance & property"
    ],
    hi: [
      "अनुच्छेद 21: जीवन का अधिकार आसान भाषा में",
      "यदि पुलिस मुझे रोके तो मेरे क्या अधिकार हैं?",
      "मुझे मुफ्त सरकारी वकील (कानूनी सहायता) कैसे मिल सकता है?",
      "पुलिस किस आधार पर किसी को गिरफ्तार कर सकती है?",
      "विरासत और संपत्ति में महिलाओं के अधिकार"
    ],
    ta: [
      "சட்டப்பிரிவு 21: வாழும் உரிமை மற்றும் சுதந்திரம் என்றால் என்ன?",
      "போலீசார் என்னை நிறுத்தினால் எனது உரிமைகள் என்ன?",
      "இலவச அரசு வழக்கறிஞர் நான் எவ்வாறு பெறமுடியும்?",
      "எந்தக் குற்றச்சாட்டுகளின் கீழ் போலீசார் கைது செய்ய முடியும்?",
      "சொத்துரிமையில் பெண்களுக்கான சட்டரீதியான உரிமைகள்"
    ],
    te: [
      "ఆర్టికల్ 21: జీవించే హక్కు అంటే ఏమిటి?",
      "పోలీసులు నన్ను ఆపితే నాకున్న హక్కులు ఏమిటి?",
      "నేను ఉచిత న్యాయవాదిని ఎలా పొందగలను?",
      "పోలీసులు ఏ ప్రాతిపదికన అరెస్టు చేయవచ్చు?",
      "ఆస్తిలో మరియు వారసత్వంలో మహిళల హక్కులు"
    ],
    kn: [
      "ವಿಧಿ 21: ಜೀವಿಸುವ ಹಕ್ಕು ಮತ್ತು ವೈಯಕ್ತಿಕ ಸ್ವಾತಂತ್ರ್ಯ",
      "ಪೊಲೀಸರು ನನ್ನನ್ನು ತಡೆದರೆ ನನ್ನ ಹಕ್ಕುಗಳೇನು?",
      "ನಾನು ಉಚಿತ ಸರ್ಕಾರಿ ವಕೀಲರ ನೆರವು ಪಡೆಯುವುದು ಹೇಗೆ?",
      "ಪೊಲೀಸರು ಯಾವ ನಿಯಮಗಳಡಿ ಬಂಧಿಸಬಹುದು?",
      "ಆಸ್ತಿ ಮತ್ತು ಉತ್ತರಾಧಿಕಾರದಲ್ಲಿ ಮಹಿಳೆಯರಿಗಿರುವ ಹಕ್ಕುಗಳು"
    ],
    ml: [
      "നിയമവിഭാഗം 21: ജീവിക്കാനുള്ള അവകാശത്തെക്കുറിച്ച് ലളിതമായി",
      "പോലീസ് എന്നെ തടഞ്ഞു നിർത്തിയാൽ എനിക്ക് എന്തൊക്കെ അവകാശങ്ങളുണ്ട്?",
      "ഉചിതമായ സൗജന്യ നിയമ സഹായം എങ്ങനെ ലഭിക്കും?",
      "ഏതൊക്കെ കുറ്റങ്ങൾക്കാണ് പോലീസ് അറസ്റ്റ് ചെയ്യുക?",
      "വസ്തുവകകളിലും പാരമ്പര്യത്തിലും സ്ത്രീകൾക്കുള്ള അവകാശങ്ങൾ"
    ]
  };

  const currentPresets = rightPresets[selectedLanguage.code] || rightPresets['en'];

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
          category: 'rights',
          query: textToQuery,
          languageName: selectedLanguage.name
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to explain constitutional right');
      }

      setResult(data.text);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error explaining rights. Ensure your API Keys are active under secrets.');
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
          <Scale className="w-5 h-5 text-sky-500" />
          <span className="font-bold text-sm tracking-tight">{t.rightsAssistant || UI_TRANSLATIONS['en'].rightsAssistant}</span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 mt-8">
        
        {/* Banner */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {t.constitutionTitle || UI_TRANSLATIONS['en'].constitutionTitle}
          </h2>
          <p className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-stone-550'}`}>
            {t.constitutionDesc || UI_TRANSLATIONS['en'].constitutionDesc}
          </p>
        </div>

        {/* Dynamic Search Box */}
        <div className={`p-5 rounded-2xl border mb-6 ${
          isDarkMode ? 'bg-stone-900/40 border-stone-850' : 'bg-white border-stone-200/80'
        }`}>
          <label className="block text-xs font-bold uppercase tracking-wider text-sky-600 mb-2">
            {t.askRightsLabel || UI_TRANSLATIONS['en'].askRightsLabel}
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.askRightsPlaceholder || UI_TRANSLATIONS['en'].askRightsPlaceholder}
                className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl pr-4 pl-10 py-3 text-xs sm:text-sm outline-hidden font-sans text-stone-800 dark:text-stone-200 focus:border-amber-400 transition-all"
              />
            </div>
            <button
              onClick={() => handleQuerySubmit(query)}
              disabled={isLoading || !query.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-3 rounded-xl shadow-xs transition-all cursor-pointer text-xs flex items-center gap-1.5 shrink-0"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {t.askBtn || UI_TRANSLATIONS['en'].askBtn}
            </button>
          </div>

          {/* Quick presets */}
          <div className="mt-4">
            <span className="text-[10px] uppercase font-bold text-stone-400 block mb-2">
              {t.rightsPresetsTitle || UI_TRANSLATIONS['en'].rightsPresetsTitle}
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

        {/* Output Panel */}
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
              <h4 className="font-bold text-sm tracking-tight">{t.loadingRightsTitle || UI_TRANSLATIONS['en'].loadingRightsTitle}</h4>
              <p className="text-xs text-stone-500 mt-1 max-w-sm">
                {t.loadingRightsDesc || UI_TRANSLATIONS['en'].loadingRightsDesc}
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
              {/* Floating Voice play toggle */}
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
                <ShieldAlert className="w-5 h-5 text-sky-500" />
                <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-wider text-sky-600">
                  {t.simplifiedRightsGuide || UI_TRANSLATIONS['en'].simplifiedRightsGuide}
                </h3>
              </div>

              {/* Text Area outputs */}
              <div className="prose prose-stone dark:prose-invert max-w-none text-stone-800 dark:text-stone-250 text-xs sm:text-sm font-sans space-y-4 leading-relaxed">
                <MarkdownRenderer content={result} />
              </div>

              <div className={`mt-8 pt-5 border-t text-[10px] sm:text-xs font-sans ${isDarkMode ? 'border-stone-800 text-stone-400' : 'border-stone-150 text-stone-500'}`}>
                {t.legalAidNotice || UI_TRANSLATIONS['en'].legalAidNotice}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
