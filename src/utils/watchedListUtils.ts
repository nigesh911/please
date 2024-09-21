export const encodeWatchedList = (watchedMovies: any[]) => {
  const movieIds = watchedMovies.map(movie => movie.movieId);
  return Buffer.from(JSON.stringify(movieIds)).toString('base64');
};

export const decodeWatchedList = (encodedList: string) => {
  try {
    return JSON.parse(Buffer.from(encodedList, 'base64').toString('utf-8'));
  } catch (error) {
    console.error('Error decoding watched list:', error);
    return [];
  }
};