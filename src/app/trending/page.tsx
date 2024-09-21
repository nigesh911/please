'use client';

import { useState, useEffect, useCallback } from 'react';
import { auth } from '../../firebase';
import { User } from 'firebase/auth';
import { motion } from 'framer-motion';
import Navbar from "../../components/Navbar";
import MovieCard from "../../components/MovieCard";

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const API_BASE_URL = 'https://api.themoviedb.org/3';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
}

export default function Trending() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const fetchTrendingMovies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
      if (!response.ok) {
        throw new Error('Failed to fetch trending movies');
      }
      const data = await response.json();
      if (Array.isArray(data.results)) {
        setMovies(data.results);
      } else {
        throw new Error('Invalid data format received from API');
      }
    } catch (error) {
      console.error('Error fetching trending movies:', error);
      setError('Failed to load trending movies. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrendingMovies();
  }, [fetchTrendingMovies]);

  const addToWatchedList = useCallback((movieId: number) => {
    if (user && typeof window !== 'undefined') {
      const userId = user.uid;
      const watchedList = JSON.parse(localStorage.getItem(`watchedList_${userId}`) || '[]');
      if (!watchedList.includes(movieId)) {
        watchedList.push(movieId);
        localStorage.setItem(`watchedList_${userId}`, JSON.stringify(watchedList));
        // Trigger a re-render to update the UI
        setMovies(prevMovies => [...prevMovies]);
      }
    }
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen font-[family-name:var(--font-geist-sans)]">
      <Navbar />
      <motion.main
        className="flex-grow p-4 sm:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Trending Movies</h1>
        {loading ? (
          <motion.p
            className="text-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            Loading trending movies...
          </motion.p>
        ) : error ? (
          <motion.p
            className="text-center text-red-500 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.p>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map(movie => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                posterPath={movie.poster_path}
                onAddToWatchedList={addToWatchedList}
              />
            ))}
          </div>
        ) : (
          <motion.p
            className="text-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            No trending movies found.
          </motion.p>
        )}
      </motion.main>
    </div>
  );
}