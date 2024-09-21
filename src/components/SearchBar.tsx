'use client';

import React, { useState } from 'react';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onAddMovie?: (movieId: number) => Promise<void>;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onAddMovie }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    } else if (onAddMovie) {
      // Assuming the query is a movie ID for simplicity
      // In a real app, you might want to search for the movie first
      const movieId = parseInt(query, 10);
      if (!isNaN(movieId)) {
        await onAddMovie(movieId);
        setQuery(''); // Clear the input after adding
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={onAddMovie ? "Enter movie ID..." : "Search movies..."}
        className="px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {onAddMovie ? "Add Movie" : "Search"}
      </button>
    </form>
  );
};

export default SearchBar;