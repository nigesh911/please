'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { auth, db } from '../firebase/config';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string;
  onAddToWatchedList: (movieId: number) => void;
  showAddButton?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ id, title, posterPath, onAddToWatchedList, showAddButton = true }) => {
  const [isWatched, setIsWatched] = useState(false);

  useEffect(() => {
    const checkIfWatched = async () => {
      const user = auth.currentUser;
      if (user) {
        const watchedMoviesRef = collection(db, 'watchedMovies');
        const q = query(watchedMoviesRef, where('userId', '==', user.uid), where('movieId', '==', id));
        const snapshot = await getDocs(q);
        setIsWatched(!snapshot.empty);
      }
    };

    checkIfWatched();
  }, [id]);

  const handleAddToWatchedList = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      const watchedMoviesRef = collection(db, 'watchedMovies');
      const q = query(watchedMoviesRef, where('userId', '==', user.uid), where('movieId', '==', id));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        await addDoc(watchedMoviesRef, {
          userId: user.uid,
          movieId: id,
          title: title,
          poster_path: posterPath,
          timestamp: new Date()
        });
        onAddToWatchedList(id);
        setIsWatched(true);
      } else {
        console.log('Movie already in watched list');
      }
    } catch (error) {
      console.error('Error adding movie to watched list:', error);
    }
  };

  return (
    <motion.div
      className="card relative"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Image
        src={`https://image.tmdb.org/t/p/w500${posterPath}`}
        alt={title}
        width={500}
        height={750}
        className="w-full h-auto rounded-lg"
      />
      {showAddButton && !isWatched && (
        <motion.button
          onClick={handleAddToWatchedList}
          className="absolute top-2 right-2 bg-primary text-white rounded-full p-2"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </motion.button>
      )}
      {isWatched && (
        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </motion.div>
  );
};

export default MovieCard;