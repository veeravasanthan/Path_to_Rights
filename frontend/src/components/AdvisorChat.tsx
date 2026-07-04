/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Message, Language } from '../types';
import { Send, Sparkles, User, UserCheck, HelpCircle, Loader2 } from 'lucide-react';
import { UI_TRANSLATIONS } from '../translations';
import MarkdownRenderer from './MarkdownRenderer';

interface AdvisorChatProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  selectedLanguage: Language;
}

export default function AdvisorChat({
  messages,
  onSendMessage,
  isLoading,
  selectedLanguage
}: AdvisorChatProps) {
  const t = UI_TRANSLATIONS[selectedLanguage.code] || UI_TRANSLATIONS['en'];
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  // Pre-configured questions personalized to rural Indian needs
  const quickQuestions: Record<string, string[]> = {
    en: [
      'Where can I get a free lawyer?',
      'How do I file a written objection?',
      'What if I cannot go to Court on this date?',
      'Can police arrest me directly?'
    ],
    hi: [
      'मुझे मुफ्त सरकारी वकील कहाँ से मिल सकता है?',
      'मैं अपना लिखित जवाब कैसे दाखिल करूँ?',
      'अगर मैं उस तारीख को न जा पाऊँ तो क्या होगा?',
      'क्या पुलिस मुझे सीधे गिरफ्तार कर सकती है?'
    ],
    ta: [
      'இலவச அரசு வழக்கறிஞர் எங்கு கிடைப்பார்?',
      'நான் எவ்வாறு எழுத்துப்பூர்வமாக பதிலளிக்க வேண்டும்?',
      'குறிப்பிட்ட தேதியில் செல்லாவிட்டால் என்ன நடக்கும்?',
      'போலீஸ் நேரடியாக என்னை கைது செய்ய முடியுமா?'
    ],
    te: [
      'నాకు ఉచిత ప్రభుత్వ లాయర్ ఎక్కడ దొరుకుతారు?',
      'నేను వ్రాతపూర్వక సమాధానాన్ని ఎలా ఇవ్వాలి?',
      'నేను ఆ రోజు వెళ్లలేకపోతే ఏమవుతుంది?',
      'పోలీసులు నన్ను నేరుగా అరెస్ట్ చేయవచ్చా?'
    ],
    kn: [
      'ನನಗೆ ಉಚಿತ ಸರ್ಕಾರಿ ವಕೀಲರು ಎಲ್ಲಿ ಸಿಗುತ್ತಾರೆ?',
      'ನಾನು ಲಿಖಿತ ಅರ್ಜಿಯನ್ನು ಹೇಗೆ ಸಲ್ಲಿಸಬೇಕು?',
      'ನಿಗದಿತ ದಿನದಂದು ಹೋಗಲು ಸಾಧ್ಯವಾಗದಿದ್ದರೆ ಏನಾಗುತ್ತದೆ?',
      'ಪೊಲೀಸರು ನನ್ನನ್ನು ನೇರವಾಗಿ ಬಂಧಿಸಬಹುದೇ?'
    ],
    ml: [
      'എനിക്ക് സൗജന്യ നിയമ സഹായം എവിടെ നിന്ന് ലഭിക്കും?',
      'ഞാൻ എങ്ങനെ രേഖാമൂലം പ്രതികരിക്കണം?',
      'എനിക്ക് ആ തീയതിയിൽ പോകാൻ കഴിഞ്ഞില്ലെങ്കിൽ എന്ത് സംഭവിക്കും?',
      'പോലീസിന് എന്നെ നേരിട്ട് അറസ്റ്റ് ചെയ്യാൻ കഴിയുമോ?'
    ],
    mr: [
      'मला मोफत सरकारी वकील कोठे मिळेल?',
      'मी कोर्टात माझे लेखी उत्तर कसे दाखल करू?',
      'मी दिलेल्या तारखेला हजर राहू शकलो नाही तर काय होईल?',
      'पोलीस मला थेट अटक करू शकतात का?'
    ],
    bn: [
      'আমি কিভাবে বিনামূল্যে সরকারি উকিল পাব?',
      'লিখিত আপত্তি বা জবাব দিতে কি করতে হবে?',
      'যদি আমি নির্দিষ্ট তারিখে না যেতে পারি কি হবে?',
      'পুলিশ কি সরাসরি গ্রেফতার করতে পারবে?'
    ]
  };

  const currentQueries = quickQuestions[selectedLanguage.code] || quickQuestions['en'];

  return (
    <div className="bg-white border border-stone-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col h-[600px] mt-6 animate-fade-in">
      {/* Container Header */}
      <div className="bg-stone-50 border-b border-stone-150 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-amber-50 rounded-lg text-amber-700">
            <UserCheck className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-sm text-stone-800 tracking-tight">
              {t.chatTitle}
            </h3>
            <p className="text-[10px] text-stone-400 font-sans mt-0.5">
              {t.chatSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Messages viewport */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 bg-stone-50/20">
        {messages.map((msg) => {
          const isAssistant = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${
                isAssistant ? 'self-start' : 'self-end flex-row-reverse'
              }`}
            >
              <div
                className={`size-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  isAssistant
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-stone-900 text-white font-semibold'
                }`}
              >
                {isAssistant ? (
                  <Sparkles className="w-4 h-4 text-amber-700" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  isAssistant
                    ? 'bg-white border border-stone-150 text-stone-800 rounded-tl-sm shadow-xs'
                    : 'bg-amber-600 text-white rounded-tr-sm shadow-xs'
                }`}
              >
                <div className="font-sans">
                  <MarkdownRenderer content={msg.content} />
                </div>
                <div
                  className={`text-[9px] mt-1.5 block text-right font-sans ${
                    isAssistant ? 'text-stone-400' : 'text-amber-100'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 self-start max-w-[85%] items-center">
            <div className="size-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
            </div>
            <div className="bg-white border border-stone-150 rounded-2xl rounded-tl-sm px-4 py-3 text-xs text-stone-500 font-sans shadow-xs">
              {t.analyzingBtn}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggest questions */}
      {messages.length > 0 && (
        <div className="px-5 py-3 border-t border-stone-100 bg-white">
          <span className="font-sans font-medium text-[10px] text-stone-400 uppercase tracking-wider block mb-2">
            {t.quickQuestionsTitle}
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pb-1">
            {currentQueries.map((query, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSendMessage(query)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full border border-stone-150 hover:border-amber-400 text-[11px] text-stone-600 hover:text-amber-900 bg-stone-50/50 hover:bg-amber-50/20 text-left font-sans cursor-pointer transition-all truncate"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Inputs bar */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-stone-150 bg-white flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading || messages.length === 0}
          placeholder={
            messages.length === 0
              ? t.chatDisabledPlaceholder
              : t.chatInputPlaceholder
          }
          className="flex-1 rounded-xl border border-stone-200/80 px-4 py-2.5 text-sm outline-hidden font-sans text-stone-800 placeholder-stone-400 focus:border-amber-400 focus:ring-3 focus:ring-amber-500/5 transition-all"
        />
        <button
          type="submit"
          disabled={isLoading || !inputText.trim() || messages.length === 0}
          className={`size-10.5 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
            isLoading || !inputText.trim() || messages.length === 0
              ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
              : 'bg-amber-600 text-white hover:bg-amber-700 hover:shadow-xs'
          }`}
        >
          <Send className="w-4 h-4 stroke-[2.5]" />
        </button>
      </form>
    </div>
  );
}
