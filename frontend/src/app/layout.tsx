import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'TaskFlow — Command Your Work',
  description: 'A precision task management system for high-performance teams.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-void text-body">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#151821',
              color: '#e8eaf0',
              border: '1px solid #1e2230',
              borderRadius: '10px',
              fontSize: '13px',
              fontFamily: 'Outfit, sans-serif',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            },
            success: {
              iconTheme: { primary: '#34d399', secondary: '#151821' },
            },
            error: {
              iconTheme: { primary: '#fb7185', secondary: '#151821' },
            },
            duration: 3000,
          }}
        />
      </body>
    </html>
  );
}
