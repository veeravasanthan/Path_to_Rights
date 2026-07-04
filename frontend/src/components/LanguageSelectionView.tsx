/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Language } from '../types';
import { Globe, ArrowRight, Check } from 'lucide-react';

interface LanguageSelectionViewProps {
  languages: Language[];
  selectedLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  onNext: () => void;
  isDarkMode: boolean;
}

export default function LanguageSelectionView({
  languages,
  selectedLanguage,
  onSelectLanguage,
  onNext,
  isDarkMode
}: LanguageSelectionViewProps) {
  
  // Highlight the core specified ones (Tamil, Hindi, English, Malayalam, Telugu, Kannada)
  const coreCodes = ['en', 'ta', 'hi', 'ml', 'te', 'kn'];
  
  // Assign representative script glyphs
  const glyphs: Record<string, string> = {
    en: 'A',
    hi: 'अ',
    ta: 'அ',
    te: 'త',
    kn: 'ಕ',
    ml: 'ക',
    mr: 'म',
    bn: 'আ',
    gu: 'ગુ',
    pa: 'ਪ',
    or: 'ଓ',
    ur: 'ع'
  };

  // Reorder to put core codes first
  const reorderedLangs = [
    ...languages.filter(l => coreCodes.includes(l.code)),
    ...languages.filter(l => !coreCodes.includes(l.code))
  ];

  return (
    <div className={`min-h-screen flex flex-col justify-between ${
      isDarkMode ? 'bg-stone-950 text-stone-100' : 'bg-[#fcfbf7] text-stone-900'
    } transition-colors duration-500 font-sans`}>
      
      {/* Upper Area */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-6 py-8 md:py-12 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="size-12 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Globe className="w-6 h-6 stroke-[2]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans">
            Choose Your Language
          </h2>
          <p className={`text-xs sm:text-sm mt-1 mb-2 font-sans ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
            Select the voice and language in which you want rights and legal documents explained.
          </p>
        </motion.div>

        {/* Dynamic Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4.5">
          {reorderedLangs.map((lang) => {
            const isSelected = selectedLanguage.code === lang.code;
            const letter = glyphs[lang.code] || 'অ';
            const isCore = coreCodes.includes(lang.code);

            return (
              <motion.button
                key={lang.code}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectLanguage(lang)}
                className={`relative p-4 rounded-2xl flex flex-col items-center justify-center text-center border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-amber-500 bg-amber-550/10 shadow-xs ring-2 ring-amber-500/20'
                    : isDarkMode
                    ? 'bg-stone-900/60 border-stone-800/80 hover:bg-stone-900 hover:border-stone-700'
                    : 'bg-white border-stone-200 hover:bg-stone-50/50 hover:border-stone-300'
                }`}
              >
                {/* Script Glyph circle */}
                <div className={`size-12 rounded-full mb-3 font-sans font-bold text-lg flex items-center justify-center ${
                  isSelected
                    ? 'bg-amber-600 text-white'
                    : isDarkMode
                    ? 'bg-stone-800 text-stone-300'
                    : 'bg-stone-100 text-stone-700'
                }`}>
                  {letter}
                </div>

                <span className={`text-xs sm:text-sm font-bold block ${
                  isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-stone-800 dark:text-stone-200'
                }`}>
                  {lang.localName}
                </span>
                
                <span className={`text-[10px] sm:text-xs mt-0.5 ${isDarkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                  {lang.name}
                </span>

                {isCore && (
                  <span className="absolute top-2 left-2 text-[8px] bg-amber-150 text-amber-800 px-1.5 py-0.5 rounded-md font-sans font-semibold">
                    Primary
                  </span>
                )}

                {isSelected && (
                  <div className="absolute top-2 right-2 text-white bg-amber-600 rounded-full p-0.5 size-4 flex items-center justify-center shadow-xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Button Row */}
      <div className={`p-5 border-t w-full text-center ${
        isDarkMode ? 'border-stone-900 bg-stone-950/80 backdrop-blur-md' : 'border-stone-150 bg-white/85 backdrop-blur-md'
      }`}>
        <div className="max-w-md mx-auto">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onNext}
            className="w-full inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all font-sans cursor-pointer group text-sm"
          >
            Continue to Assistant
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </div>
      </div>

    </div>
  );
}
