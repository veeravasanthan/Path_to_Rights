/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import BrandLogo from './BrandLogo';

interface SplashViewProps {
  onComplete: () => void;
  isDarkMode: boolean;
}

export default function SplashView({ onComplete, isDarkMode }: SplashViewProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2400);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${
      isDarkMode ? 'bg-stone-950 text-stone-100' : 'bg-[#fcfbf7] text-stone-900'
    } transition-colors duration-500`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center text-center"
      >
        {/* Animated Brand Emblem */}
        <div className="relative mb-6">
          <motion.div
            initial={{ rotate: -8 }}
            animate={{ rotate: 8 }}
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 2.4, ease: "easeInOut" }}
            className="flex items-center justify-center"
          >
            <BrandLogo size="xl" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="absolute top-1.5 right-1.5 size-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 fill-white" />
          </motion.div>
        </div>

        {/* Brand Name Text in elegant lettering */}
        <h1 className="font-sans font-bold text-3xl sm:text-4xl tracking-tight leading-none">
          Path to Rights
        </h1>
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-500 mt-2 font-mono">
          உரிமை வழி • Path to Rights
        </p>

        {/* Beautiful Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className={`text-sm sm:text-base font-medium mt-6 max-w-sm italic ${
            isDarkMode ? 'text-stone-300' : 'text-stone-600'
          }`}
        >
          &ldquo;Know Your Rights. Improve Your Future.&rdquo;
        </motion.p>

        {/* Ambient Loading Indicator */}
        <div className="mt-12 flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.3s]" />
          <span className="size-2 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.15s]" />
          <span className="size-2 rounded-full bg-amber-500 animate-bounce" />
        </div>
      </motion.div>
    </div>
  );
}
