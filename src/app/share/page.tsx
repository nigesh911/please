import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '../../components/Navbar';

const SharedListContent = dynamic(() => import('./SharedListContent'), { 
  ssr: false,
  loading: () => <p>Loading shared list...</p>
});

export default function SharedList() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow p-4 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Shared Watched List</h1>
        <Suspense fallback={<p>Loading shared list...</p>}>
          <SharedListContent />
        </Suspense>
      </main>
    </div>
  );
}

// This tells Next.js not to statically generate this page
export function generateStaticParams() {
  return [];
}