'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User, updateProfile } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import DarkModeToggle from './DarkModeToggle';
import React from 'react';

const Navbar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [username, setUsername] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        setUsername(user.displayName || user.email?.split('@')[0] || 'Anonymous');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: email.split('@')[0] });
        setUsername(email.split('@')[0]);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setShowAuthForm(false);
    } catch (error: unknown) {
      console.error('Authentication error:', error);
      if (error instanceof Error) {
        const firebaseError = error as { code?: string; message?: string };
        if (firebaseError.code === 'auth/email-already-in-use') {
          setError('Email is already in use. Please sign in or use a different email.');
        } else if (firebaseError.code === 'auth/weak-password') {
          setError('Password should be at least 6 characters long.');
        } else if (firebaseError.code === 'auth/invalid-email') {
          setError('Invalid email address.');
        } else if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password') {
          setError('Invalid email or password.');
        } else {
          setError(`An error occurred: ${firebaseError.message || 'Please try again.'}`);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setShowProfileMenu(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleUsernameUpdate = async () => {
    if (user) {
      try {
        await updateProfile(user, { displayName: username });
        setIsEditingUsername(false);
      } catch (error) {
        console.error('Error updating username:', error);
        setError('Failed to update username. Please try again.');
      }
    }
  };

  return (
    <nav className="bg-card-bg text-text shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary">MovieApp</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/" className="text-text hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              <Link href="/trending" className="text-text hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                Trending
              </Link>
              <Link href="/watched" className="text-text hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                Watched
              </Link>
              <Link href="/chat" className="text-text hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                Chat
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <DarkModeToggle />
            {user ? (
              <div className="relative ml-4">
                <motion.button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 btn btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{username}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </motion.button>
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      className="absolute right-0 mt-2 w-48 bg-card-bg rounded-md shadow-lg py-1 z-10"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {isEditingUsername ? (
                        <div className="px-4 py-2">
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="input w-full mb-2"
                            placeholder="Enter new username"
                          />
                          <motion.button
                            onClick={handleUsernameUpdate}
                            className="btn btn-primary w-full"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Save
                          </motion.button>
                        </div>
                      ) : (
                        <motion.button
                          onClick={() => setIsEditingUsername(true)}
                          className="block w-full text-left px-4 py-2 text-sm text-text hover:bg-background"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Edit Username
                        </motion.button>
                      )}
                      <motion.button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-text hover:bg-background"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Sign Out
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                onClick={() => setShowAuthForm(true)}
                className="ml-4 btn btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign In / Sign Up
              </motion.button>
            )}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showAuthForm && !user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowAuthForm(false)}
          >
            <motion.div
              className="bg-card-bg p-8 rounded-lg shadow-xl max-w-md w-full"
              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="text-2xl font-bold mb-6 text-center text-text">
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </h2>
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input w-full bg-background text-text"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-text mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input w-full bg-background text-text"
                    placeholder="Enter your password"
                  />
                </div>
                {isSignUp && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-text mb-1">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input w-full bg-background text-text"
                      placeholder="Confirm your password"
                    />
                  </div>
                )}
                <motion.button
                  type="submit"
                  className="btn btn-primary w-full"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </motion.button>
              </form>
              <motion.button
                onClick={() => setIsSignUp(!isSignUp)}
                className="mt-4 text-sm text-primary hover:underline w-full text-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSignUp ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
              </motion.button>
              {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;