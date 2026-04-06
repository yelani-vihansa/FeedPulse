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
      <body className={`${inter.className} min-h-screen`}>
        <nav className="border-b border-white/70 bg-white/70 shadow-sm backdrop-blur-xl">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <a href="/" className="text-xl font-bold text-[#2563EB] hover:text-[#3B82F6]">
                FeedPulse
              </a>
              <div className="space-x-4">
                <a href="/" className="text-gray-600 hover:text-[#2563EB] transition-colors">
                  Submit Feedback
                </a>
                <a href="/login" className="text-gray-600 hover:text-[#2563EB] transition-colors">
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
