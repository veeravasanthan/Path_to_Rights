/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Language, AnalysisResponse } from '../types';
import { ArrowLeft, Trash2, Calendar, FileCheck, FolderHeart, ExternalLink } from 'lucide-react';
import { UI_TRANSLATIONS } from '../translations';

interface SavedItem {
  id: string;
  timestamp: string;
  language: Language;
  documentType: string;
  analysis: AnalysisResponse;
}

interface PastSummariesViewProps {
  onBack: () => void;
  onSelectSaved: (item: SavedItem) => void;
  onDeleteSaved: (id: string) => void;
  savedItems: SavedItem[];
  isDarkMode: boolean;
  selectedLanguage: Language;
}

export default function PastSummariesView({
  onBack,
  onSelectSaved,
  onDeleteSaved,
  savedItems,
  isDarkMode,
  selectedLanguage
}: PastSummariesViewProps) {
  const t = UI_TRANSLATIONS[selectedLanguage.code] || UI_TRANSLATIONS['en'];
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
          onClick={onBack}
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all border cursor-pointer ${
            isDarkMode ? 'border-stone-800 hover:bg-stone-900 text-stone-300' : 'border-stone-200 hover:bg-stone-50 text-stone-700'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          {t.navDashboard}
        </button>

        <div className="flex items-center gap-2">
          <FolderHeart className="w-5 h-5 text-rose-500" />
          <span className="font-bold text-sm tracking-tight font-sans">
            {t.savedSummariesTitle || 'Saved Summaries'}
          </span>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 mt-8">
        
        {/* Header Title */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {t.savedSummariesTitle || 'Saved Document Summaries'}
          </h2>
          <p className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-stone-550'}`}>
            {t.savedSummariesDesc || 'Retrieve and review summaries of previously scanned court summons, leases, land disputes, or legal notices saved offline on your mobile browser.'}
          </p>
        </div>

        {/* Saved Summaries Empty State */}
        {savedItems.length === 0 ? (
          <div className={`p-10 rounded-2xl border text-center ${
            isDarkMode ? 'bg-stone-900/30 border-stone-850 text-stone-400' : 'bg-white border-stone-150 text-stone-500'
          }`}>
            <span className="text-3xl block mb-2 font-sans">📂</span>
            <h4 className="font-bold text-sm tracking-tight text-stone-700 dark:text-stone-300">
              {t.noSavedSummaries || 'No Saved Summaries Available'}
            </h4>
            <p className="text-xs mt-1 max-w-xs mx-auto leading-relaxed">
              {t.noSavedSummariesDesc || 'Scan or upload your first official document notice to automatically analyze, save, and keep track of compliance timelines.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedItems.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -1 }}
                className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                  isDarkMode 
                    ? 'bg-stone-900 border-stone-850 hover:border-amber-500' 
                    : 'bg-white border-stone-200 hover:border-amber-500 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl mt-0.5 shrink-0 border border-amber-500/10">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 tracking-tight">
                        {item.documentType || 'Legal Document Notice'}
                      </h4>
                      <p className={`text-[11px] sm:text-xs leading-normal mt-1 mb-2 font-sans line-clamp-2 ${
                        isDarkMode ? 'text-stone-400' : 'text-stone-550'
                      }`}>
                        {item.analysis?.simpleExplanation}
                      </p>
                      
                      {/* Meta Tags */}
                      <div className="flex flex-wrap gap-2.5 mt-2">
                        <span className={`text-[9px] flex items-center gap-1 font-sans px-2 py-0.5 rounded-md ${
                          isDarkMode ? 'bg-stone-950 text-stone-400' : 'bg-stone-50 text-stone-550'
                        }`}>
                          <Calendar className="w-3 h-3 text-stone-400" />
                          {item.timestamp}
                        </span>
                        <span className={`text-[9px] font-sans font-bold px-2 py-0.5 rounded-md uppercase ${
                          isDarkMode ? 'bg-amber-950/40 text-amber-400' : 'bg-amber-50 text-amber-850'
                        }`}>
                          {item.language?.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions right aligned */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onSelectSaved(item)}
                      className={`p-2 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
                        isDarkMode 
                          ? 'bg-stone-850 border-stone-800 text-stone-300 hover:text-white hover:bg-stone-800' 
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                      title="Load Details & Chat"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteSaved(item.id)}
                      className={`p-2 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
                        isDarkMode 
                          ? 'bg-red-950/20 border-red-900 text-red-400 hover:bg-red-900/30' 
                          : 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100/60'
                      }`}
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </motion.div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
