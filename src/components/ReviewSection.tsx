'use client';

import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { motion } from 'framer-motion';

interface Review {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
  upvotes: number;
}

interface ReviewSectionProps {
  movieId: string | null;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ movieId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState('');

  useEffect(() => {
    // Load reviews from localStorage
    const storedReviews = localStorage.getItem('reviews');
    if (storedReviews) {
      setReviews(JSON.parse(storedReviews));
    }
  }, []);

  const handleSubmitReview = () => {
    if (newReview.trim() && auth.currentUser) {
      const review: Review = {
        id: Date.now().toString(),
        userId: auth.currentUser.uid,
        username: auth.currentUser.displayName || 'Anonymous',
        content: newReview,
        timestamp: Date.now(),
        upvotes: 0,
      };

      const updatedReviews = [...reviews, review];
      setReviews(updatedReviews);
      localStorage.setItem('reviews', JSON.stringify(updatedReviews));
      setNewReview('');
    }
  };

  const handleUpvote = (reviewId: string) => {
    const updatedReviews = reviews.map(review => 
      review.id === reviewId ? { ...review, upvotes: review.upvotes + 1 } : review
    );
    setReviews(updatedReviews);
    localStorage.setItem('reviews', JSON.stringify(updatedReviews));
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Reviews</h2>
      <div className="mb-4">
        <textarea
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Write your review..."
        />
        <button
          onClick={handleSubmitReview}
          className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Submit Review
        </button>
      </div>
      <div>
        {reviews.map((review) => (
          <motion.div
            key={review.id}
            className="bg-white p-4 rounded shadow mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="font-bold">{review.username}</p>
            <p>{review.content}</p>
            <div className="mt-2 flex items-center">
              <button
                onClick={() => handleUpvote(review.id)}
                className="text-blue-500 hover:text-blue-700"
              >
                Upvote
              </button>
              <span className="ml-2">{review.upvotes} upvotes</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection;