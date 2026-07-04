/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LANGUAGES, Language } from '../types';
import { Globe, Check } from 'lucide-react';
import { UI_TRANSLATIONS } from '../translations';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
}

export default function LanguageSelector({
  selectedLanguage,
  onSelectLanguage
}: LanguageSelectorProps) {
  const t = UI_TRANSLATIONS[selectedLanguage.code] || UI_TRANSLATIONS['en'];

  return (
    <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs transition-all">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-amber-50 rounded-lg text-amber-700">
          <Globe className="w-4 h-4" />
        </div>
        <h3 className="font-sans font-semibold text-sm text-stone-800 tracking-tight">
          {t.selectLanguage}
        </h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {LANGUAGES.map((lang) => {
          const isSelected = selectedLanguage.code === lang.code;
          return (
            <button
              key={lang.code}
              id={`lang-btn-${lang.code}`}
              onClick={() => onSelectLanguage(lang)}
              className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-250 cursor-pointer ${
                isSelected
                  ? 'border-amber-500 bg-amber-50/75 shadow-xs'
                  : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-200'
              }`}
            >
              <span className={`text-sm font-semibold block transition-colors ${
                isSelected ? 'text-amber-950 font-bold' : 'text-stone-800'
              }`}>
                {lang.localName}
              </span>
              <span className="text-[10px] text-stone-400 mt-0.5 font-sans">
                {lang.name}
              </span>
              {isSelected && (
                <div className="absolute top-2 right-2 text-amber-600 bg-white rounded-full p-0.5 shadow-xs size-4 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
