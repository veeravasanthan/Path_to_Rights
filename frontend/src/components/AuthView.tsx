/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  auth, 
  db, 
  OperationType, 
  handleFirestoreError 
} from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Mail, 
  Lock, 
  User, 
  Loader2, 
  Sparkles, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface AuthViewProps {
  onSuccess: () => void;
  isDarkMode: boolean;
}

export default function AuthView({ onSuccess, isDarkMode }: AuthViewProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Email/Password login logic
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    if (isSignUp && !fullName.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        // Register User
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;

        // Update displayName in Auth system
        await updateProfile(user, {
          displayName: fullName.trim()
        });

        // Store User Profile inside Firestore DB (enforcing blueprint security)
        const userDocPath = `users/${user.uid}`;
        try {
          await setDoc(doc(db, 'users', user.uid), {
            userId: user.uid,
            email: user.email,
            displayName: fullName.trim(),
            createdAt: new Date().toISOString()
          });
        } catch (fErr) {
          handleFirestoreError(fErr, OperationType.WRITE, userDocPath);
        }

        setSuccessMsg("Account registered successfully!");
        setTimeout(() => onSuccess(), 1200);
      } else {
        // Sign In
        await signInWithEmailAndPassword(auth, email.trim(), password);
        setSuccessMsg("Logged in successfully!");
        setTimeout(() => onSuccess(), 800);
      }
    } catch (err: any) {
      console.error(err);
      let cleanMsg = err.message || 'Authentication failed';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        cleanMsg = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        cleanMsg = 'This email is already in use.';
      } else if (err.code === 'auth/weak-password') {
        cleanMsg = 'Password should be at least 6 characters.';
      } else if (err.message?.includes('CONFIGURATION_NOT_FOUND')) {
        cleanMsg = 'This authentication method is not enabled. Please enable "Email/Password" provider in the Firebase Authentication console.';
      }
      setErrorMsg(cleanMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Google Login popup logic
  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Ensure profile doc exists in Firestore DB
      const userDocPath = `users/${user.uid}`;
      try {
        await setDoc(doc(db, 'users', user.uid), {
          userId: user.uid,
          email: user.email,
          displayName: user.displayName || 'Indian Citizen',
          createdAt: new Date().toISOString()
        }, { merge: true });
      } catch (fErr) {
        handleFirestoreError(fErr, OperationType.WRITE, userDocPath);
      }

      setSuccessMsg("Signed in with Google successfully!");
      setTimeout(() => onSuccess(), 1000);
    } catch (err: any) {
      console.error(err);
      let cleanMsg = err.message || 'Google Sign-In failed';
      if (err.code === 'auth/popup-closed-by-user') {
        cleanMsg = 'Sign-in window closed before completion.';
      } else if (err.message?.includes('CONFIGURATION_NOT_FOUND')) {
        cleanMsg = 'Google Sign-In provider is not enabled. Please activate "Google" provider in the Firebase Authentication console.';
      }
      setErrorMsg(cleanMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${
      isDarkMode ? 'bg-stone-950 text-stone-100' : 'bg-[#fcfbf7] text-stone-900'
    } transition-colors duration-500 font-sans`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full max-w-md p-6 sm:p-8 rounded-2xl border ${
          isDarkMode ? 'bg-stone-900/60 border-stone-800' : 'bg-white border-stone-200 shadow-md'
        }`}
      >
        <div className="text-center mb-6">
          <div className="inline-flex size-11 bg-amber-500/10 border border-amber-500/20 rounded-xl items-center justify-center mb-3 text-amber-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {isSignUp ? "Create Citizen Account" : "Welcome to Path to Rights"}
          </h2>
          <p className={`text-xs mt-1.5 ${isDarkMode ? 'text-stone-400' : 'text-stone-550'}`}>
            {isSignUp 
              ? "Join us to save summaries and read legal guides localized."
              : "Access your saved summaries and welfare analytics securely."
            }
          </p>
        </div>

        {/* Status Alerts */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 mb-4 rounded-xl border border-red-200 bg-red-100/10 text-red-900 dark:text-red-300 text-xs flex gap-2.5 items-start"
            >
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{errorMsg}</p>
            </motion.div>
          )}

          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 mb-4 rounded-xl border border-emerald-200 bg-emerald-100/10 text-emerald-800 dark:text-emerald-450 text-xs flex gap-2.5 items-start animate-pulse"
            >
              <p className="leading-relaxed font-bold">✓ {successMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Credentials Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Ram Kumar"
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-hidden font-sans text-stone-800 dark:text-stone-200 focus:border-amber-400 focus:ring-3 focus:ring-amber-500/5 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-hidden font-sans text-stone-800 dark:text-stone-200 focus:border-amber-400 focus:ring-3 focus:ring-amber-500/5 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm outline-hidden font-sans text-stone-800 dark:text-stone-200 focus:border-amber-400 focus:ring-3 focus:ring-amber-500/5 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer font-sans text-xs flex items-center justify-center gap-1.5"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSignUp ? (
              "Sign Up"
            ) : (
              "Log In"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex py-1 items-center">
          <div className="flex-grow border-t border-stone-200 dark:border-stone-800"></div>
          <span className="flex-shrink mx-4 text-[10px] uppercase font-bold text-stone-400">Or Continue With</span>
          <div className="flex-grow border-t border-stone-200 dark:border-stone-800"></div>
        </div>

        {/* OAuth Buttons */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-xl border flex items-center justify-center gap-2.5 font-sans cursor-pointer transition-colors text-xs font-semibold ${
            isDarkMode 
              ? 'border-stone-800 bg-stone-950 hover:bg-stone-900 text-stone-200'
              : 'border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700'
          }`}
        >
          {/* Flat Google logo design */}
          <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          Google Sign-In
        </button>

        {/* Switch Sign Up / Log In state */}
        <div className="text-center mt-6 text-xs text-stone-500 flex flex-col gap-2">
          <div>
            {isSignUp ? "Already have an account? " : "New to Path to Rights? "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-amber-650 dark:text-amber-400 font-bold hover:underline cursor-pointer"
            >
              {isSignUp ? "Log In Here" : "Register Profile Here"}
            </button>
          </div>
          <div>
            <span className="text-stone-400">or </span>
            <button
              type="button"
              onClick={onSuccess}
              className="text-stone-500 hover:text-stone-700 dark:hover:text-stone-305 font-semibold hover:underline cursor-pointer"
            >
              Continue as Guest
            </button>
          </div>
        </div>

        {/* Guidance for developer/user settings */}
        <div className={`mt-6 pt-4 border-t border-dashed text-[10px] font-sans leading-normal ${
          isDarkMode ? 'border-stone-800 text-stone-500' : 'border-stone-200 text-stone-400'
        }`}>
          💡 Helper: Before using email/password or Google authentication, ensure you have enabled both of these sign-in providers in the <strong>Firebase Authentication console</strong> for this project.
        </div>
      </motion.div>
    </div>
  );
}
