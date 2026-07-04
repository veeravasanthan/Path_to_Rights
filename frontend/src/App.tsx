/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LANGUAGES, Language, AnalysisResponse, Message } from './types';
import { UI_TRANSLATIONS } from './translations';

// Import newly designed citizen dashboards
import SplashView from './components/SplashView';
import WelcomeView from './components/WelcomeView';
import LanguageSelectionView from './components/LanguageSelectionView';
import HomeDashboard from './components/HomeDashboard';
import WelfareSchemesView from './components/WelfareSchemesView';
import IndianRightsView from './components/IndianRightsView';
import FinancialCompanionView from './components/FinancialCompanionView';
import PastSummariesView from './components/PastSummariesView';

import BrandLogo from './components/BrandLogo';

// Standard analysis sub-components
import DocumentInput from './components/DocumentInput';
import AnalysisResults from './components/AnalysisResults';
import AdvisorChat from './components/AdvisorChat';

// Firebase Integrations
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth, db, OperationType, handleFirestoreError } from './lib/firebase';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import AuthView from './components/AuthView';

import { motion, AnimatePresence } from 'motion/react';
import { 
  Scale, 
  Sparkles, 
  BookOpen, 
  UserCheck, 
  CheckCircle, 
  HelpCircle, 
  FileText,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Save,
  Check
} from 'lucide-react';

interface SavedItem {
  id: string;
  timestamp: string;
  language: Language;
  documentType: string;
  analysis: AnalysisResponse;
}

export default function App() {
  // Screens state: 'splash' | 'welcome' | 'auth' | 'language' | 'dashboard' | 'analyze' | 'rights' | 'schemes' | 'finance' | 'saved'
  const [screen, setScreen] = useState<string>('splash');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(LANGUAGES[0]); // Default to English
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [saveSuccessNotify, setSaveSuccessNotify] = useState<boolean>(false);

  // Firebase Auth states
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // Document analysis states
  const [documentText, setDocumentText] = useState<string>('');
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const [documentPdf, setDocumentPdf] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isChatLoading, setIsLoadingChat] = useState<boolean>(false);

  const t = UI_TRANSLATIONS[selectedLanguage.code] || UI_TRANSLATIONS['en'];

  // 1. Initial State Loading from Cache & Firebase Monitoring
  useEffect(() => {
    // Theme Preference
    const cachedTheme = localStorage.getItem('pathtorights_theme');
    if (cachedTheme === 'dark') {
      setIsDarkMode(true);
    }

    // Selected Language
    const cachedLang = localStorage.getItem('pathtorights_lang');
    if (cachedLang) {
      const match = LANGUAGES.find(l => l.code === cachedLang);
      if (match) setSelectedLanguage(match);
    }

    // Monitor Firebase Authentication
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthChecking(false);

      if (user) {
        // Authenticated user: Load saved documents directly from Firestore (Hardened relay)
        const pathForList = `users/${user.uid}/summaries`;
        try {
          const summariesRef = collection(db, 'users', user.uid, 'summaries');
          const querySnapshot = await getDocs(summariesRef);
          const customItems: SavedItem[] = [];
          querySnapshot.forEach((docSnap) => {
            customItems.push(docSnap.data() as SavedItem);
          });
          // Sort items dynamically by display or timestamp
          setSavedItems(customItems);
        } catch (err: any) {
          console.error("Firestore retrieval error: ", err);
          // Safe fallback to local storage
          const cachedSaved = localStorage.getItem('pathtorights_saved');
          if (cachedSaved) {
            setSavedItems(JSON.parse(cachedSaved));
          }
        }
      } else {
        // Guest user: Fallback to local storage caching
        const cachedSaved = localStorage.getItem('pathtorights_saved');
        if (cachedSaved) {
          try {
            setSavedItems(JSON.parse(cachedSaved));
          } catch (err) {
            console.error('Failed to parse cached summaries', err);
          }
        } else {
          setSavedItems([]);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Dynamic body styling for dark/light transitions
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
      document.body.style.backgroundColor = '#0c0a09'; // zinc-950 / stone-950 equivalent for deep space feel
    } else {
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = '#fcfbf7'; // cozy warm off-white
    }
  }, [isDarkMode]);

  // Translate and bootstrap Chat messages after document is parsed
  useEffect(() => {
    if (analysis) {
      const startingPhrases: Record<string, string> = {
        en: "I have translated and simplified this document for you. Do you have any questions about this document?",
        hi: "मैंने आपके लिए इस दस्तावेज़ का अनुवाद और सरलीकरण कर दिया है। क्या आपके पास इस दस्तावेज़ के बारे में कोई प्रश्न हैं?",
        ta: "இந்த ஆவணத்தை நான் உங்களுக்காக மொழிபெயர்த்து எளிமையாக்கியுள்ளேன். இந்த ஆவணம் குறித்து உங்களிடம் ஏதேனும் கேள்விகள் உள்ளதா?",
        te: "నేను మీ కోసం ఈ పత్రాన్ని అనువదించాను మరియు సరళీకరించాను. ఈ పత్రం గురించి మీకు ఏవైనా ప్రశ్నలు ఉన్నాయा?",
        kn: "ನಾನು ನಿಮಗಾಗಿ ಈ ದಾಖಲೆಯನ್ನು ಅನುವಾದಿಸಿದ್ದೇನೆ ಮತ್ತು ಸರಳೀಕರಿಸಿದ್ದೇನೆ. ಈ ದಾಖಲೆಯ ಬಗ್ಗೆ ನಿಮಗೆ ಏನಾದರೂ ಪ್ರಶ್ನೆಗಳಿವೆಯೇ?",
        ml: "ഞാൻ നിങ്ങൾക്കായി ഈ രേഖ വിവർത്തനം ചെയ്യുകയും ലളിതമാക്കുകയും ചെയ്തിട്ടുണ്ട്. ഈ രേഖയെക്കുറിച്ച് നിങ്ങൾക്ക് എന്തെങ്കിലും ചോദ്യങ്ങളുണ്ടോ?",
        mr: "मी तुमच्यासाठी हा दस्तऐवज अनुवादित आणि सोपा केला आहे. या दस्तऐवजाबद्दल तुम्हाला काही प्रश्न आहेत का?",
        bn: "আমি আপনার জন্য এই নথিটি অনুবাদ এবং सरल করেছি। এই নথি সম্পর্কে আপনার কোন প্রশ্ন আছে?",
        gu: "મેं આ દસ્તવેજ અનુવાદિત અને સરળ બનાવ્યો છે. શું તમને આ દસ્તવેજ વિશે કોઈ પ્રશ્નો છે?",
        pa: "ਮੈਂ ਤੁਹਾਡੇ ਲਈ ਇਸ ਦਸਤਾਵੇਜ਼ ਦਾ ਅਨੁਵਾದ ਅਤੇ ਸਰਲੀਕਰਨ ਕੀਤਾ ਹੈ। ਕੀ ਤੁਹਾਡੇ ਕੋਲ ਇਸ ਦਸਤਾਵੇਜ਼ ਬਾਰੇ ਕੋਈ ਸਵਾਲ ਹਨ?",
        or: "ମୁଁ ଆପଣଙ୍କ ପାଇଁ ଏହି ଦଲିଲକୁ ଅନுବାଦ କରି ସରଳ କରିଛି। ଏହି ଦଲିଲ ବିଷୟରେ ଆପಣଙ୍କର କୌଣସି ପ୍ରଶ୍ନ ଅଛି କି?",
        ur: "میں نے آپ کے لیے اس دستاویز کا ترجمہ اور سادہ خلاصہ کیا ہے۔ کیا آپ کے पास इस दस्तावेज के बारे में कोई सवाल है؟"
      };

      const starterText = startingPhrases[selectedLanguage.code] || startingPhrases['en'];

      setChatMessages([
        {
          id: 'initial',
          role: 'assistant',
          content: starterText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [analysis, selectedLanguage]);

  // Trigger Splash completion redirect
  const handleSplashComplete = () => {
    if (auth.currentUser) {
      const cachedLang = localStorage.getItem('pathtorights_lang');
      if (cachedLang) {
        setScreen('dashboard');
      } else {
        setScreen('language');
      }
    } else {
      setScreen('welcome');
    }
  };

  // Sign out current authenticated session
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setScreen('welcome');
    } catch (err) {
      console.error("Sign out error", err);
    }
  };

  // Select language & save
  const handleLanguageSelect = (lang: Language) => {
    setSelectedLanguage(lang);
    localStorage.setItem('pathtorights_lang', lang.code);
  };

  // Toggle Dark theme state
  const handleThemeChange = (val: boolean) => {
    setIsDarkMode(val);
    localStorage.setItem('pathtorights_theme', val ? 'dark' : 'light');
  };

  // Core Document Analyze Handler
  const handleAnalyze = async () => {
    if (!documentText && !documentImage && !documentPdf) return;
    
    setIsLoading(true);
    setErrorMsg(null);
    setAnalysis(null);
    setChatMessages([]);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentText,
          documentImage,
          documentPdf,
          languageCode: selectedLanguage.code,
          languageName: selectedLanguage.name
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || t.errorUnderstandingDoc);
      }

      setAnalysis(data);

      // Save the analyzed document to user history
      const dateString = new Date().toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      if (currentUser) {
        const docId = `summary_${Date.now()}`;
        const newSavedItem: SavedItem = {
          id: docId,
          timestamp: dateString,
          language: selectedLanguage,
          documentType: data.documentType || 'Legal Document Note',
          analysis: data
        };

        const docPath = `users/${currentUser.uid}/summaries/${docId}`;
        try {
          await setDoc(doc(db, 'users', currentUser.uid, 'summaries', docId), {
            id: docId,
            userId: currentUser.uid,
            timestamp: dateString,
            documentType: data.documentType || 'Legal Document Note',
            language: selectedLanguage,
            analysis: data,
            createdAt: new Date().toISOString()
          });
        } catch (fErr) {
          handleFirestoreError(fErr, OperationType.WRITE, docPath);
        }

        const updatedSaved = [newSavedItem, ...savedItems];
        setSavedItems(updatedSaved);
      } else {
        // Fallback or guest user caching
        const newSavedItem: SavedItem = {
          id: Math.random().toString(),
          timestamp: dateString,
          language: selectedLanguage,
          documentType: data.documentType || 'Legal Document Note',
          analysis: data
        };

        const updatedSaved = [newSavedItem, ...savedItems];
        setSavedItems(updatedSaved);
        localStorage.setItem('pathtorights_saved', JSON.stringify(updatedSaved));
      }

      setSaveSuccessNotify(true);
      setTimeout(() => setSaveSuccessNotify(false), 2500);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Connecting to server failed. Ensure network/API keys are active under the Settings tab.');
    } finally {
      setIsLoading(false);
    }
  };

  // Send Conversational Advisor Follow-up messages
  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || isChatLoading) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: Math.random().toString(),
      role: 'user',
      content: userText,
      timestamp: timeString
    };

    const updatedHistory = [...chatMessages, userMsg];
    setChatMessages(updatedHistory);
    setIsLoadingChat(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedHistory,
          originalDocumentText: documentText || (analysis ? analysis.extractedPdfText : undefined),
          originalAnalysis: analysis,
          languageName: selectedLanguage.name
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || t.errorChatFailed);
      }

      const botMsg: Message = {
        id: Math.random().toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsgText = (t.chatErrorBot || 'Sorry, there was a problem connecting with your regional legal advisor. Please try again.').replace("{error}", err.message);
      const errorBotMsg: Message = {
        id: Math.random().toString(),
        role: 'assistant',
        content: errorMsgText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages((prev) => [...prev, errorBotMsg]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Click on previously saved summaries
  const handleSelectSavedSummary = (savedItem: SavedItem) => {
    setSelectedLanguage(savedItem.language);
    setAnalysis(savedItem.analysis);
    setDocumentText(savedItem.analysis.extractedPdfText || '');
    setDocumentImage(null);
    setDocumentPdf(null);
    setScreen('analyze');
  };

  // Delete previously saved summaries
  const handleDeleteSavedSummary = async (id: string) => {
    const updated = savedItems.filter(item => item.id !== id);
    setSavedItems(updated);

    if (currentUser) {
      const docPath = `users/${currentUser.uid}/summaries/${id}`;
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'summaries', id));
      } catch (err: any) {
        handleFirestoreError(err, OperationType.DELETE, docPath);
      }
    } else {
      localStorage.setItem('pathtorights_saved', JSON.stringify(updated));
    }
  };

  return (
    <AnimatePresence mode="wait">
      {screen === 'splash' && (
        <motion.div key="splash" className="w-full">
          <SplashView 
            onComplete={handleSplashComplete} 
            isDarkMode={isDarkMode} 
          />
        </motion.div>
      )}

      {screen === 'welcome' && (
        <motion.div key="welcome" className="w-full">
          <WelcomeView 
            onNext={() => setScreen('auth')} 
            isDarkMode={isDarkMode} 
          />
        </motion.div>
      )}

      {screen === 'auth' && (
        <motion.div key="auth" className="w-full">
          <AuthView 
            onSuccess={() => setScreen('language')}
            isDarkMode={isDarkMode}
          />
        </motion.div>
      )}

      {screen === 'language' && (
        <motion.div key="language" className="w-full">
          <LanguageSelectionView
            languages={LANGUAGES}
            selectedLanguage={selectedLanguage}
            onSelectLanguage={handleLanguageSelect}
            onNext={() => setScreen('dashboard')}
            isDarkMode={isDarkMode}
          />
        </motion.div>
      )}

      {screen === 'dashboard' && (
        <motion.div key="dashboard" className="w-full">
          <HomeDashboard
            onNavigate={(targetScreen) => setScreen(targetScreen)}
            selectedLanguage={selectedLanguage}
            onLanguageChangeClick={() => setScreen('language')}
            isDarkMode={isDarkMode}
            setDarkMode={handleThemeChange}
            savedCount={savedItems.length}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        </motion.div>
      )}

      {screen === 'schemes' && (
        <motion.div key="schemes" className="w-full">
          <WelfareSchemesView
            onBack={() => setScreen('dashboard')}
            selectedLanguage={selectedLanguage}
            isDarkMode={isDarkMode}
          />
        </motion.div>
      )}

      {screen === 'rights' && (
        <motion.div key="rights" className="w-full">
          <IndianRightsView
            onBack={() => setScreen('dashboard')}
            selectedLanguage={selectedLanguage}
            isDarkMode={isDarkMode}
          />
        </motion.div>
      )}

      {screen === 'finance' && (
        <motion.div key="finance" className="w-full">
          <FinancialCompanionView
            onBack={() => setScreen('dashboard')}
            selectedLanguage={selectedLanguage}
            isDarkMode={isDarkMode}
          />
        </motion.div>
      )}

      {screen === 'saved' && (
        <motion.div key="saved" className="w-full">
          <PastSummariesView
            onBack={() => setScreen('dashboard')}
            onSelectSaved={handleSelectSavedSummary}
            onDeleteSaved={handleDeleteSavedSummary}
            savedItems={savedItems}
            isDarkMode={isDarkMode}
            selectedLanguage={selectedLanguage}
          />
        </motion.div>
      )}

      {screen === 'analyze' && (
        <motion.div key="analyze" className="w-full">
          <div className={`min-h-screen ${
            isDarkMode ? 'bg-stone-950 text-stone-100' : 'bg-[#fcfbf7] text-stone-900'
          } transition-colors duration-500 pb-16 font-sans`}>
          
          {/* Header Bar */}
          <header className={`sticky top-0 z-45 border-b backdrop-blur-md px-6 py-4 flex items-center justify-between ${
            isDarkMode ? 'bg-stone-950/80 border-stone-900' : 'bg-white/80 border-stone-200/50'
          }`}>
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setScreen('dashboard');
              }}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all border cursor-pointer ${
                isDarkMode ? 'border-stone-800 hover:bg-stone-900 text-stone-300' : 'border-stone-200 hover:bg-stone-50 text-stone-700'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              {t.navDashboard}
            </button>

            <span className="font-extrabold text-sm sm:text-base flex items-center gap-2">
              <BrandLogo size="sm" />
              {t.documentAssistant || UI_TRANSLATIONS['en'].documentAssistant}
            </span>
          </header>

          <main className="max-w-7xl w-full mx-auto px-4 sm:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Success Saved Notification banner */}
            {saveSuccessNotify && (
              <div className="col-span-12 bg-emerald-500 text-white font-bold p-3 px-5 rounded-xl shadow-md text-xs sm:text-sm flex items-center gap-2 animate-bounce">
                <Check className="w-5 h-5 shrink-0" />
                <span>{t.saveSuccessBanner || UI_TRANSLATIONS['en'].saveSuccessBanner}</span>
              </div>
            )}

            {/* Left Column: Input Selection */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className={`p-5 rounded-2xl border ${
                isDarkMode ? 'bg-stone-900/40 border-stone-850' : 'bg-amber-50/20 border-amber-100'
              }`}>
                <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-amber-600">
                  {t.citizenVoiceTitle || UI_TRANSLATIONS['en'].citizenVoiceTitle}
                </h4>
                <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-stone-400' : 'text-stone-550'}`}>
                  {(t.citizenVoiceDesc || UI_TRANSLATIONS['en'].citizenVoiceDesc).replace('{lang}', `${selectedLanguage.name} (${selectedLanguage.localName})`)}
                </p>
              </div>

              <DocumentInput
                documentText={documentText}
                setDocumentText={setDocumentText}
                documentImage={documentImage}
                setDocumentImage={setDocumentImage}
                documentPdf={documentPdf}
                setDocumentPdf={setDocumentPdf}
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
                selectedLanguage={selectedLanguage}
              />
            </div>

            {/* Right Column: Outcomes showcase / dynamic chat */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 dark:bg-red-950/15 border border-red-200 dark:border-red-900/30 rounded-2xl p-5 flex gap-3 text-red-900 dark:text-red-300 mb-6"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold">{t.errorProcessingDoc || UI_TRANSLATIONS['en'].errorProcessingDoc}</h4>
                      <p className="text-xs mt-1 font-sans leading-relaxed">{errorMsg}</p>
                    </div>
                  </motion.div>
                )}

                {isLoading ? (
                  <motion.div
                    key="compiling-skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`border rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-xs min-h-[500px] ${
                      isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
                    }`}
                  >
                    <div className="relative">
                      <div className="size-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
                      <Scale className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-amber-600 animate-pulse" />
                    </div>
                    <h3 className="font-sans font-bold text-lg text-stone-800 dark:text-stone-200 mt-6 tracking-tight">
                      {t.loadingTitle}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1.5 max-w-[400px] font-sans leading-relaxed">
                      {t.loadingSubtitle.replace("{lang}", selectedLanguage.name)}
                    </p>
                    
                    <div className="flex flex-col gap-2 mt-8 w-full max-w-xs text-left">
                      <div className="flex items-center gap-2 text-xs text-stone-500 font-sans bg-stone-50 dark:bg-stone-950/40 p-2.5 rounded-lg border border-stone-100 dark:border-stone-850">
                        <span className="size-1.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                        <span>{t.loadingProgress1.replace("{lang}", selectedLanguage.name)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-stone-500 font-sans bg-stone-50 dark:bg-stone-950/40 p-2.5 rounded-lg border border-stone-100 dark:border-stone-850">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                        <span>{t.loadingProgress2}</span>
                      </div>
                    </div>
                  </motion.div>
                ) : analysis ? (
                  <motion.div
                    key="findings"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                  >
                    <AnalysisResults 
                      analysis={analysis} 
                      selectedLanguage={selectedLanguage}
                    />
                    
                    {/* Multiturn Advisor Chat */}
                    <AdvisorChat
                      messages={chatMessages}
                      onSendMessage={handleSendMessage}
                      isLoading={isChatLoading}
                      selectedLanguage={selectedLanguage}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="pre-load-instruction"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`border rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[500px] ${
                      isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200/80'
                    }`}
                  >
                    <div className="size-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center shadow-xs">
                      <Scale className="w-8 h-8 stroke-[1.8]" />
                    </div>
                    
                    <h3 className="font-sans font-bold text-xl text-stone-900 dark:text-stone-100 mt-6 tracking-tight">
                      {t.readyToAnalyze || UI_TRANSLATIONS['en'].readyToAnalyze}
                    </h3>
                    
                    <p className="text-stone-400 text-sm max-w-[480px] leading-relaxed mt-2.5 font-sans">
                      {t.readyToAnalyzeDesc || UI_TRANSLATIONS['en'].readyToAnalyzeDesc}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-10">
                      <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-stone-950/30 border-stone-850' : 'bg-stone-50/50 border-stone-100'}`}>
                        <span className="text-xl block mb-1">⚖️</span>
                        <h5 className="font-sans font-bold text-[10px] sm:text-xs text-stone-800 dark:text-stone-200 uppercase tracking-tight">
                          {t.simpleExplanationTitle || UI_TRANSLATIONS['en'].simpleExplanationTitle}
                        </h5>
                        <p className="text-[10px] text-stone-400 mt-1 font-sans">
                          {t.simpleExplanationDesc || UI_TRANSLATIONS['en'].simpleExplanationDesc}
                        </p>
                      </div>
                      <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-stone-950/30 border-stone-850' : 'bg-stone-50/50 border-stone-100'}`}>
                        <span className="text-xl block mb-1">⚠️</span>
                        <h5 className="font-sans font-bold text-[10px] sm:text-xs text-stone-800 dark:text-stone-200 uppercase tracking-tight">
                          {t.importantWarningsTitle || UI_TRANSLATIONS['en'].importantWarningsTitle}
                        </h5>
                        <p className="text-[10px] text-stone-400 mt-1 font-sans">
                          {t.importantWarningsDesc || UI_TRANSLATIONS['en'].importantWarningsDesc}
                        </p>
                      </div>
                      <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-stone-950/30 border-stone-850' : 'bg-stone-50/50 border-stone-100'}`}>
                        <span className="text-xl block mb-1">💬</span>
                        <h5 className="font-sans font-bold text-[10px] sm:text-xs text-stone-800 dark:text-stone-200 uppercase tracking-tight">
                          {t.instantFollowupTitle || UI_TRANSLATIONS['en'].instantFollowupTitle}
                        </h5>
                        <p className="text-[10px] text-stone-400 mt-1 font-sans">
                          {t.instantFollowupDesc || UI_TRANSLATIONS['en'].instantFollowupDesc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </main>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);
}
