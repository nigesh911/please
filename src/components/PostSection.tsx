'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Post {
  id: string;
  movieId: number;
  text: string;
  timestamp: number;
}

interface PostSectionProps {
  movieId: number;
}

const PostSection: React.FC<PostSectionProps> = ({ movieId }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPosts = JSON.parse(localStorage.getItem(`posts_${movieId}`) || '[]');
      setPosts(storedPosts);
    }
  }, [movieId]);

  const handleSubmitPost = () => {
    if (newPost.trim() && typeof window !== 'undefined') {
      const post: Post = {
        id: Date.now().toString(), // Use timestamp as a unique ID
        movieId,
        text: newPost,
        timestamp: Date.now(),
      };
      const updatedPosts = [post, ...posts]; // Add new post at the beginning
      setPosts(updatedPosts);
      localStorage.setItem(`posts_${movieId}`, JSON.stringify(updatedPosts));
      setNewPost('');
    }
  };

  return (
    <div className="mt-4">
      <div className="mb-4">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          className="input mb-2"
          placeholder="Write your post..."
          rows={3}
        />
        <motion.button
          onClick={handleSubmitPost}
          className="btn btn-primary w-full"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Submit Post
        </motion.button>
      </div>
      {posts.length > 0 ? (
        <ul className="space-y-2 max-h-60 overflow-y-auto">
          {posts.map((post) => (
            <li key={post.id} className="bg-background p-2 rounded">
              <p>{post.text}</p>
              <small className="text-secondary">
                {new Date(post.timestamp).toLocaleString()}
              </small>
            </li>
          ))}
        </ul>
      ) : (
        <p>No posts yet.</p>
      )}
    </div>
  );
};

export default PostSection;