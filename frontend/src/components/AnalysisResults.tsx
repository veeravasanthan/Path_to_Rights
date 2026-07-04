/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AnalysisResponse, Language } from '../types';
import { UI_TRANSLATIONS } from '../translations';
import MarkdownRenderer from './MarkdownRenderer';
import { 
  FileCheck, 
  MapPin, 
  Calendar, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  Volume2,
  VolumeX,
  Copy,
  Download,
  Share2,
  Check
} from 'lucide-react';

interface AnalysisResultsProps {
  analysis: AnalysisResponse;
  selectedLanguage: Language;
}

export default function AnalysisResults({
  analysis,
  selectedLanguage
}: AnalysisResultsProps) {
  const t = UI_TRANSLATIONS[selectedLanguage.code] || UI_TRANSLATIONS['en'];
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Play browser-native text-to-speech for legal accessibility
  const toggleTTS = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const heading = `${analysis.documentType}.`;
    const explanation = `${t.whatDoesThisMean}. ${analysis.simpleExplanation}`;
    const timeline = analysis.whenAndWhere.required 
      ? `${t.whenAndWhere}. ${t.timelineWhen}: ${analysis.whenAndWhere.when}. ${t.timelineWhere}: ${analysis.whenAndWhere.where}.` 
      : `${t.noAppearance}`;
    const warnings = analysis.redFlags.length > 0 
      ? `${t.redFlagsLabel}: ${analysis.redFlags.join('. ')}` 
      : '';

    const speechStream = `${heading} ${explanation} ${timeline} ${warnings}`
      .replace(/[#*`_~]/g, '')
      .replace(/[-+]/g, ' ');

    const utterance = new SpeechSynthesisUtterance(speechStream);
    
    // Assign proper regional speech accents if available
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

  // Copy structured output to clipboard
  const handleCopy = () => {
    const textBuffer = `=== PATH TO RIGHTS LEGAL AID ===\n` +
      `Document Type: ${analysis.documentType}\n\n` +
      `Simple Explanation:\n${analysis.simpleExplanation}\n\n` +
      `Appearance Required: ${analysis.whenAndWhere.required ? `YES\nWhen: ${analysis.whenAndWhere.when}\nWhere: ${analysis.whenAndWhere.where}` : 'NO'}\n\n` +
      `Three Crucial Highlights:\n${analysis.importantPoints.map((pt, i) => `${i + 1}. ${pt}`).join('\n')}\n\n` +
      `CRITICAL RED FLAGS:\n${analysis.redFlags.map(rf => `⚠️ ${rf}`).join('\n')}\n\n` +
      `Disclaimer: Simplified for informational reading only.`;

    navigator.clipboard.writeText(textBuffer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Trigger client-side direct text download
  const handleDownload = () => {
    const textBuffer = `=== PATH TO RIGHTS LEGAL AID ===\n` +
      `Document Type: ${analysis.documentType}\n\n` +
      `Simple Explanation:\n${analysis.simpleExplanation}\n\n` +
      `Appearance Required: ${analysis.whenAndWhere.required ? `YES\nWhen: ${analysis.whenAndWhere.when}\nWhere: ${analysis.whenAndWhere.where}` : 'NO'}\n\n` +
      `Three Crucial Highlights:\n${analysis.importantPoints.map((pt, i) => `${i + 1}. ${pt}`).join('\n')}\n\n` +
      `CRITICAL RED FLAGS:\n${analysis.redFlags.map(rf => `⚠️ ${rf}`).join('\n')}\n\n` +
      `Disclaimer: Simplified for informational reading only.`;

    const blob = new Blob([textBuffer], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PathToRights_${analysis.documentType.replace(/\s+/g, '_')}_Summary.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Safe Web Share API or alternate action
  const handleShare = () => {
    const shareTitle = `Path to Rights: ${analysis.documentType}`;
    const shareText = `I simplified my legal document "${analysis.documentType}" using Path to Rights in my regional language! Here is the outcome:\n\n${analysis.simpleExplanation.substring(0, 150)}...`;

    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: shareText
      }).catch((err) => console.log('Share canceled', err));
    } else {
      // Direct WhatsApp share fallback or highlight copy ready alert
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + "\n\nSimplified by Path to Rights Legal Companion.")}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Header / Document Type Title & Action Controls */}
      <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/20 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs shrink-0">
            <FileCheck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-sans font-medium text-xs text-amber-800 dark:text-amber-400 uppercase tracking-wider block">
              {t.docTypeLabel}
            </span>
            <h2 className="font-sans font-extrabold text-lg sm:text-xl text-amber-950 dark:text-amber-100 tracking-tight leading-tight">
              {analysis.documentType}
            </h2>
          </div>
        </div>

        {/* INTERACTIVE CONTROLS BAR */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto border-t border-stone-200 dark:border-stone-850 sm:border-0 pt-3 sm:pt-0">
          {/* Read Aloud */}
          <button
            type="button"
            onClick={toggleTTS}
            className={`p-2 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${
              isSpeaking 
                ? 'bg-amber-100 dark:bg-amber-950 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 animate-pulse'
                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-850'
            }`}
            title="Read Aloud Summary"
          >
            {isSpeaking ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
          </button>

          {/* Copy */}
          <button
            type="button"
            onClick={handleCopy}
            className={`p-2 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${
              copied 
                ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-800 text-emerald-700'
                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-850'
            }`}
            title="Copy to Clipboard"
          >
            {copied ? <Check className="w-4.5 h-4.5" /> : <Copy className="w-4.5 h-4.5" />}
          </button>

          {/* Download */}
          <button
            type="button"
            onClick={handleDownload}
            className="p-2 rounded-xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-850 flex items-center justify-center cursor-pointer transition-all"
            title="Download TXT Summary"
          >
            <Download className="w-4.5 h-4.5" />
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-xl border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-850 flex items-center justify-center cursor-pointer transition-all"
            title="Share with Family"
          >
            <Share2 className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* 2. Direct simple explanation */}
      <div className="bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-850 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4.5 h-4.5 text-amber-700 shrink-0" />
          <h3 className="font-sans font-semibold text-stone-800 dark:text-stone-200 text-sm tracking-tight">
            {t.whatDoesThisMean}
          </h3>
        </div>
        <div className="text-stone-800 dark:text-stone-200 font-sans text-xs sm:text-sm leading-relaxed">
          <MarkdownRenderer content={analysis.simpleExplanation} />
        </div>
      </div>

      {/* 3. When and Where check */}
      <div className="bg-stone-900 dark:bg-stone-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 size-40 bg-white/5 rounded-full blur-xl pointer-events-none" />
        
        <h3 className="font-sans font-semibold text-amber-500 text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-amber-500" />
          {t.whenAndWhere}
        </h3>

        {!analysis.whenAndWhere.required ? (
          <div className="bg-white/10 rounded-xl p-4 border border-white/10">
            <p className="text-xs text-stone-300 font-sans">
              {t.noAppearance}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex gap-3 h-full items-start">
              <div className="p-2 bg-amber-500/25 text-amber-300 rounded-lg shrink-0 mt-0.5">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-sans uppercase tracking-wider block">{t.timelineWhen}</span>
                <span className="text-xs sm:text-sm font-semibold text-amber-100 block mt-1">{analysis.whenAndWhere.when}</span>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex gap-3 h-full items-start">
              <div className="p-2 bg-amber-500/25 text-amber-300 rounded-lg shrink-0 mt-0.5">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-sans uppercase tracking-wider block">{t.timelineWhere}</span>
                <span className="text-xs sm:text-sm font-semibold text-amber-100 block mt-1">{analysis.whenAndWhere.where}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. 3 Most Important Points */}
      <div className="bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-850 rounded-2xl p-6 shadow-xs">
        <h3 className="font-sans font-semibold text-stone-800 dark:text-stone-250 text-sm tracking-tight mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
          {t.exactly3Points}
        </h3>
        <div className="flex flex-col gap-3.5">
          {analysis.importantPoints.slice(0, 3).map((point, index) => (
            <div 
              key={index}
              className="flex gap-3.5 items-start bg-stone-50/50 dark:bg-stone-950/40 hover:bg-stone-50 dark:hover:bg-stone-900 rounded-xl p-3 border border-stone-100 dark:border-stone-850 transition-colors"
            >
              <span className="size-6 rounded-full shrink-0 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 font-bold text-xs flex items-center justify-center font-mono">
                {index + 1}
              </span>
              <p className="text-stone-800 dark:text-stone-300 text-xs sm:text-sm leading-relaxed pt-0.5 font-sans">
                {point}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Dangers and Red Flags */}
      <div className="bg-red-50/30 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/20 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-red-500/5 pointer-events-none">
          <AlertCircle className="w-24 h-24 stroke-[1.5]" />
        </div>
        <h3 className="font-sans font-semibold text-red-950 dark:text-red-400 text-sm tracking-tight mb-4 flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5 text-red-600 shrink-0" />
          {t.redFlagsLabel}
        </h3>
        <ul className="flex flex-col gap-3">
          {analysis.redFlags.map((flag, index) => (
            <li 
              key={index} 
              className="flex gap-2.5 items-start text-red-900 dark:text-red-300 text-xs sm:text-sm leading-normal font-sans bg-white/70 dark:bg-stone-950/60 border border-red-100/50 dark:border-red-900/30 p-2.5 rounded-xl"
            >
              <span className="text-red-500 font-bold shrink-0 mt-0.5">⚠️</span>
              <span>{flag}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
