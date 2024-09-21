'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import MovieCard from '../../components/MovieCard';
import { decodeWatchedList } from '../../utils/watchedListUtils';
import Link from 'next/link';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const API_BASE_URL = 'https://api.themoviedb.org/3';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
}

export default function SharedListContent() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchSharedMovies = async () => {
      const listParam = searchParams.get('list');
      if (!listParam) {
        setError('No shared list found.');
        setLoading(false);
        return;
      }

      try {
        const decodedList = decodeWatchedList(listParam);
        const moviePromises = decodedList.map(async (id: number) => {
          const response = await fetch(`${API_BASE_URL}/movie/${id}?api_key=${API_KEY}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch movie with ID ${id}`);
          }
          return response.json();
        });

        const fetchedMovies = await Promise.all(moviePromises);
        setMovies(fetchedMovies);
      } catch (error) {
        console.error('Error fetching shared movies:', error);
        setError('Failed to load shared movies. The link might be invalid or expired.');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedMovies();
  }, [searchParams]);

  if (loading) {
    return <p className="text-center mt-4">Loading shared movies...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 mt-4">{error}</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
        {movies.map(movie => (
          <MovieCard
            key={movie.id}
            id={movie.id}
            title={movie.title}
            posterPath={movie.poster_path}
            onAddToWatchedList={() => {}}
            showAddButton={false}
          />
        ))}
      </div>
      <div className="mt-8 text-center">
        <p>Want to create your own movie list?</p>
        <Link href="/login" className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded hover:bg-opacity-80">
          Sign Up or Log In
        </Link>
      </div>
    </div>
  );
}