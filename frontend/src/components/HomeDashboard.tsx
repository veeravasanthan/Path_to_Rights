/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Language } from '../types';
import { UI_TRANSLATIONS } from '../translations';
import BrandLogo from './BrandLogo';
import { 
  FileText, 
  BookOpen, 
  Award, 
  Coins, 
  FolderHeart, 
  ArrowRight,
  Sun,
  Moon,
  MessageSquare,
  HelpCircle,
  LogOut,
  User
} from 'lucide-react';

interface HomeDashboardProps {
  onNavigate: (screen: string) => void;
  selectedLanguage: Language;
  onLanguageChangeClick: () => void;
  isDarkMode: boolean;
  setDarkMode: (val: boolean) => void;
  savedCount: number;
  currentUser: any;
  onLogout: () => void;
}

export default function HomeDashboard({
  onNavigate,
  selectedLanguage,
  onLanguageChangeClick,
  isDarkMode,
  setDarkMode,
  savedCount,
  currentUser,
  onLogout
}: HomeDashboardProps) {
  const t = UI_TRANSLATIONS[selectedLanguage.code] || UI_TRANSLATIONS['en'];

  const menuItems = [
    {
      id: 'analyze',
      title: t.menuItem1Title,
      desc: t.menuItem1Desc,
      icon: <FileText className="w-6 h-6 text-amber-500" />,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      pillText: t.menuItem1Pill
    },
    {
      id: 'rights',
      title: t.menuItem2Title,
      desc: t.menuItem2Desc,
      icon: <BookOpen className="w-6 h-6 text-sky-500" />,
      color: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
      pillText: t.menuItem2Pill
    },
    {
      id: 'schemes',
      title: t.menuItem3Title,
      desc: t.menuItem3Desc,
      icon: <Award className="w-6 h-6 text-emerald-500" />,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      pillText: t.menuItem3Pill
    },
    {
      id: 'finance',
      title: t.menuItem4Title,
      desc: t.menuItem4Desc,
      icon: <Coins className="w-6 h-6 text-purple-500" />,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      pillText: t.menuItem4Pill
    },
    {
      id: 'saved',
      title: t.menuItem5Title,
      desc: t.menuItem5Desc,
      icon: <FolderHeart className="w-6 h-6 text-rose-500" />,
      color: "bg-rose-500/10 text-rose-650 dark:text-rose-400 border-rose-500/20",
      pillText: t.menuItem5Pill.replace('{count}', String(savedCount))
    }
  ];

  return (
    <div className={`min-h-screen ${
      isDarkMode ? 'bg-stone-950 text-stone-100' : 'bg-[#fcfbf7] text-stone-900'
    } transition-colors duration-500 pb-16 font-sans`}>
      
      {/* Header Bar */}
      <header className={`sticky top-0 z-45 border-b backdrop-blur-md px-6 py-4.5 flex items-center justify-between ${
        isDarkMode ? 'bg-stone-950/85 border-stone-900' : 'bg-white/85 border-stone-200/60'
      }`}>
        <div className="flex items-center gap-2.5">
          <BrandLogo size="md" />
          <div>
            <span className="font-sans font-bold text-sm tracking-tight block">Path to Rights</span>
            <span className="text-[10px] text-amber-500 uppercase tracking-widest font-mono font-bold block">Path to Rights</span>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-2.5">
          {/* User profile identifier */}
          {currentUser && (
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
              isDarkMode ? 'border-stone-800 bg-stone-900/60' : 'border-stone-200 bg-stone-50'
            }`}>
              <div className="size-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-700">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold block max-w-[100px] truncate leading-none">
                  {currentUser.displayName || 'Citizen'}
                </span>
                <span className="text-[8px] text-stone-400 block max-w-[100px] truncate">
                  {currentUser.email}
                </span>
              </div>
            </div>
          )}

          {/* Tone Toggle */}
          <button 
            type="button"
            onClick={() => setDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl transition-all border cursor-pointer ${
              isDarkMode ? 'bg-stone-900 border-stone-800 text-amber-400 hover:text-amber-300' : 'bg-stone-50 border-stone-200 text-stone-600 hover:text-stone-800'
            }`}
          >
            {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
          
          {/* Localized shortcut to language picker */}
          <button
            type="button"
            onClick={onLanguageChangeClick}
            className={`font-sans text-xs font-bold px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all ${
              isDarkMode 
                ? 'bg-amber-600 text-white border-amber-550 hover:bg-amber-700' 
                : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
            }`}
          >
            🗣️ {selectedLanguage.localName}
          </button>

          {/* Sign Out Button */}
          {currentUser && (
            <button
              type="button"
              onClick={onLogout}
              className={`p-2 rounded-xl transition-all border cursor-pointer ${
                isDarkMode ? 'bg-red-950/20 border-red-900/30 text-red-400 hover:bg-red-900/30' : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100/50'
              }`}
              title="Sign Out"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="max-w-4xl mx-auto px-6 mt-8 sm:mt-12">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight font-sans">
            Hi {currentUser?.displayName || 'Citizen'}, {selectedLanguage.code === 'ta' ? 'வணக்கம்' : selectedLanguage.code === 'hi' ? 'नमस्ते' : 'Namaste'} 🙏
          </h2>
          <p className={`text-xs sm:text-sm mt-1.5 font-sans leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-stone-550'}`}>
            {t.dashboardWelcome}
          </p>
        </motion.div>

        {/* Action cards layout */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid gap-4.5 md:grid-cols-2"
        >
          {menuItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -3, scale: 1.005 }}
              onClick={() => onNavigate(item.id)}
              className={`p-5 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all h-[190px] text-left relative overflow-hidden group ${
                isDarkMode 
                  ? 'bg-stone-900/60 border-stone-850 hover:border-amber-500 hover:bg-stone-900/90' 
                  : 'bg-white border-stone-200 hover:border-amber-500 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2.5 mb-3.5">
                  <div className={`p-2.5 rounded-xl border flex items-center justify-center ${item.color}`}>
                    {item.icon}
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md font-sans ${
                    isDarkMode ? 'bg-stone-800 text-stone-300' : 'bg-stone-100 text-stone-500'
                  }`}>
                    {item.pillText}
                  </span>
                </div>
                
                <h3 className="font-sans font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {item.title}
                </h3>
                
                <p className={`text-[11px] sm:text-xs mt-1.5 leading-normal font-sans line-clamp-2 ${
                  isDarkMode ? 'text-stone-400' : 'text-stone-550'
                }`}>
                  {item.desc}
                </p>
              </div>

              {/* Action indicator at bottom */}
              <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-amber-500 dark:text-amber-400 self-end mt-4">
                <span>{t.menuItemEnter}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Helpful Info Alerts */}
        <div className={`p-4.5 rounded-2xl border mt-8 flex items-start gap-3.5 ${
          isDarkMode ? 'bg-stone-900/40 border-stone-850' : 'bg-amber-50/20 border-amber-100'
        }`}>
          <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h5 className="font-sans font-bold text-xs text-amber-800 dark:text-amber-400 tracking-tight">{t.accessibilityTipTitle}</h5>
            <p className={`text-[10px] sm:text-xs mt-0.5 leading-relaxed font-sans ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>
              {t.accessibilityTipDesc}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
