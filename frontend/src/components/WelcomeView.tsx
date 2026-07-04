/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Award, Landmark, FileText, Globe, ArrowRight } from 'lucide-react';
import BrandLogo from './BrandLogo';

interface WelcomeViewProps {
  onNext: () => void;
  isDarkMode: boolean;
}

export default function WelcomeView({ onNext, isDarkMode }: WelcomeViewProps) {
  const features = [
    {
      icon: <BookOpen className="w-5 h-5 text-amber-500" />,
      title: "Constitution Explained simplemente",
      desc: "Fundamental rights and everyday citizen laws simplified into clear, plain language with zero legal confusing jargon."
    },
    {
      icon: <Award className="w-5 h-5 text-emerald-500" />,
      title: "Government Schemes awareness",
      desc: "Find and understand welfare schemes, subsidy support, farming grants, and girl-child educational incentives."
    },
    {
      icon: <Landmark className="w-5 h-5 text-sky-500" />,
      title: "Financial Literacy guidance",
      desc: "Learn compound interest math, protect your family from local loan shark debt traps, and save securely in banks."
    },
    {
      icon: <FileText className="w-5 h-5 text-purple-500" />,
      title: "AI-Powered Document Summaries",
      desc: "Take a picture or drop a PDF of court summons, notices, or receipts to understand exactly what to do next."
    },
    {
      icon: <Globe className="w-5 h-5 text-orange-500" />,
      title: "Multilingual Local Support",
      desc: "Toggle easily between English, தமிழ், हिन्दी, മലയാളം, తెలుగు, and ಕನ್ನಡ for clear localized reading."
    }
  ];

  return (
    <div className={`min-h-screen flex flex-col justify-between ${
      isDarkMode ? 'bg-stone-950 text-stone-100' : 'bg-[#fcfbf7] text-stone-900'
    } transition-colors duration-500 font-sans`}>
      
      {/* Upper Content - Scrollable if screen is small */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-6 py-8 md:py-12 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 flex flex-col items-center"
        >
          <BrandLogo size="lg" className="mb-4 animate-pulse [animation-duration:3s]" />
          <span className="text-[11px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-3 py-1 rounded-full uppercase tracking-wider">
            Your Digital Welfare Companion
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight font-sans">
            Know Your Rights. Improve Your Future.
          </h2>
          <p className={`text-xs sm:text-sm mt-2 max-w-xl mx-auto font-sans ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
            Path to Rights translates complex government and legal notices, enabling everyday Indian citizens to navigate systems confidently.
          </p>
        </motion.div>

        {/* List of high-fidelity descriptions */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, staggerChildren: 0.1 }}
          className="grid gap-3 sm:gap-4 md:grid-cols-1"
        >
          {features.map((feat, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -1 }}
              className={`p-4 rounded-xl flex items-start gap-3.5 border transition-all ${
                isDarkMode 
                  ? 'bg-stone-900/45 border-stone-800 hover:border-stone-700 hover:bg-stone-900/70' 
                  : 'bg-white border-stone-200/60 hover:border-stone-300 hover:shadow-xs'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${isDarkMode ? 'bg-stone-850' : 'bg-stone-50'}`}>
                {feat.icon}
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 tracking-tight">
                  {feat.title}
                </h4>
                <p className={`text-[11px] sm:text-xs mt-1 leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-stone-550'}`}>
                  {feat.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
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
            Get Started
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
