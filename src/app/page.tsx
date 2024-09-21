'use client';

import { useState, useEffect, useCallback } from 'react';
import { auth, db } from '../firebase/config';
import { User } from 'firebase/auth';
import { collection, addDoc, query, getDocs, where } from 'firebase/firestore';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const API_BASE_URL = 'https://api.themoviedb.org/3';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
}

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const fetchMovies = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`);
      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }
      const data = await response.json();
      if (Array.isArray(data.results)) {
        setMovies(prevMovies => [...prevMovies, ...data.results]);
        setPage(prevPage => prevPage + 1);
      } else {
        throw new Error('Invalid data format received from API');
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      setError('Failed to load movies. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [page, loading]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]); // Add fetchMovies to the dependency array

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || loading) {
        return;
      }
      fetchMovies();
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchMovies, loading]);

  const addToWatchedList = useCallback(async (movieId: number) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      const watchedMoviesRef = collection(db, 'watchedMovies');
      const q = query(watchedMoviesRef, where('userId', '==', user.uid), where('movieId', '==', movieId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`);
        const movieData = await response.json();

        await addDoc(watchedMoviesRef, {
          userId: user.uid,
          movieId: movieId,
          title: movieData.title,
          poster_path: movieData.poster_path,
          timestamp: new Date()
        });

        // Trigger a re-render to update the UI
        setMovies(prevMovies => [...prevMovies]);
      } else {
        console.log('Movie already in watched list');
      }
    } catch (error) {
      console.error('Error adding movie to watched list:', error);
    }
  }, [user, API_KEY]);

  return (
    <div className="flex flex-col min-h-screen font-[family-name:var(--font-geist-sans)]">
      <Navbar />
      <motion.main
        className="flex-grow p-4 sm:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <>
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
            {loading && (
              <motion.p
                className="text-center mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                Loading more movies...
              </motion.p>
            )}
          </>
        )}
      </motion.main>
    </div>
  );
}
