'use client';

import { useState, useEffect, useCallback } from 'react';
import { auth, db } from '../../firebase/config';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import Navbar from '../../components/Navbar';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import debounce from 'lodash/debounce';
import { encodeWatchedList } from '../../utils/watchedListUtils';

interface Movie {
  id: string;
  title: string;
  poster_path: string;
}

interface SearchResult {
  id: number;
  title: string;
  poster_path: string;
}

const SkeletonMovie = () => (
  <div className="bg-gray-200 rounded-lg shadow-md overflow-hidden animate-pulse">
    <div className="w-full h-64 bg-gray-300"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
    </div>
  </div>
);

export default function WatchedPage() {
  const [user, setUser] = useState<User | null>(null);
  const [watchedMovies, setWatchedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchWatchedMovies(currentUser.uid);
      } else {
        setWatchedMovies([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchWatchedMovies = async (userId: string) => {
    try {
      const watchedMoviesRef = collection(db, 'watchedMovies');
      const q = query(watchedMoviesRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const movies = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Movie));
      setWatchedMovies(movies);
      setError(null);
    } catch (error) {
      console.error('Error fetching watched movies:', error);
      setError('Failed to fetch watched movies. Please try again later.');
    }
  };

  const handleAddMovie = async (movie: SearchResult) => {
    if (user) {
      try {
        const watchedMoviesRef = collection(db, 'watchedMovies');
        await addDoc(watchedMoviesRef, {
          userId: user.uid,
          movieId: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          timestamp: new Date()
        });

        await fetchWatchedMovies(user.uid);
        setError(null);
        setSearchQuery('');
        setSearchResults([]);
      } catch (error) {
        console.error('Error adding movie to watched list:', error);
        setError('Failed to add movie to watched list. Please try again later.');
      }
    }
  };

  const handleRemoveMovie = async (movieId: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, 'watchedMovies', movieId));
        await fetchWatchedMovies(user.uid);
      } catch (error) {
        console.error('Error removing movie from watched list:', error);
      }
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/share?list=${encodeWatchedList(watchedMovies)}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Share link copied to clipboard!');
    });
  };

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length > 2) {
        try {
          const response = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(query)}`
          );
          const data = await response.json();
          setSearchResults(data.results.slice(0, 5));
        } catch (error) {
          console.error('Error searching movies:', error);
        }
      } else {
        setSearchResults([]);
      }
    }, 300),
    []
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const filteredMovies = watchedMovies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow p-4 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Watched Movies</h1>
          <p>Please sign in to view your watched movies.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <motion.main
        className="flex-grow p-4 sm:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Watched Movies</h1>
        
        <div className="mb-6 p-4 bg-gray-200 rounded-lg shadow relative">
          <h2 className="text-xl font-semibold mb-4">Add a Movie</h2>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search for a movie..."
            className="w-full px-4 py-2 bg-gray-300 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchResults.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-96 overflow-y-auto">
              {searchResults.map((result) => (
                <li
                  key={result.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => handleAddMovie(result)}
                >
                  <Image
                    src={`https://image.tmdb.org/t/p/w92${result.poster_path}`}
                    alt={result.title}
                    width={46}
                    height={69}
                    className="mr-4 rounded"
                  />
                  <span>{result.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <button 
          onClick={handleShare}
          className="mb-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          Share My Watched List
        </button>
        
        {error && <p className="text-red-500 mt-4 mb-4">{error}</p>}
        
        <AnimatePresence>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
              {[...Array(10)].map((_, index) => (
                <SkeletonMovie key={index} />
              ))}
            </div>
          ) : filteredMovies.length === 0 ? (
            <motion.p
              className="mt-4 text-lg text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              No watched movies found. Start adding movies to your watched list!
            </motion.p>
          ) : (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredMovies.map((movie) => (
                <motion.div
                  key={movie.id}
                  className="relative bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.05, zIndex: 1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    width={500}
                    height={750}
                    className="w-full h-auto"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{movie.title}</h3>
                  </div>
                  <motion.button
                    onClick={() => handleRemoveMovie(movie.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 shadow-md"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>
    </div>
  );
}