'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Movie {
  id: string;
  title: string;
  poster_path: string;
}

interface Props {
  initialMovies: Movie[];
  userId: string;
}

const WatchedMoviesClient: React.FC<Props> = ({ initialMovies, userId }) => {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);

  useEffect(() => {
    setMovies(initialMovies);
  }, [initialMovies]);

  if (movies.length === 0) {
    return <p>No watched movies found. Start adding movies to your watched list!</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {movies.map((movie) => (
        <motion.div
          key={movie.id}
          className="bg-white rounded-lg shadow-md overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
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
        </motion.div>
      ))}
    </div>
  );
};

export default WatchedMoviesClient;