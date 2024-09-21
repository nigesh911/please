import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { db, collection, query, where, getDocs } from '../../../firebase/config';
import { DocumentData } from 'firebase/firestore';

interface CustomUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface CustomSession {
  user: CustomUser;
}

export async function GET() {
  const session = await getServerSession() as CustomSession | null;
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  console.log('Fetching watched movies for user:', userId);

  try {
    const watchedMoviesRef = collection(db, 'watchedMovies');
    const q = query(watchedMoviesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const watchedMovies = snapshot.docs.map((doc: DocumentData) => ({...doc.data(), id: doc.id}));

    console.log('Fetched watched movies:', watchedMovies);
    return NextResponse.json({ watchedMovies });
  } catch (error) {
    console.error('Error fetching watched movies:', error);
    return NextResponse.json({ error: 'Failed to fetch watched movies' }, { status: 500 });
  }
}