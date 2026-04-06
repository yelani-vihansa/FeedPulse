import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FeedPulse - AI-Powered Feedback Platform',
  description: 'Submit feedback and help us improve our product',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-white shadow-md border-b border-gray-200">
          <div className="container mx-auto px-6 py-3">
            <div className="flex justify-between items-center">
              <a href="/" className="text-xl font-bold text-blue-600 hover:text-blue-700">
                FeedPulse
              </a>
              <div className="space-x-4">
                <a href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Submit Feedback
                </a>
                <a href="/login" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Admin Login
                </a>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
