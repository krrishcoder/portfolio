import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, Instrument_Sans } from 'next/font/google';
import './globals.css';

/* IBM Plex Mono is promoted to the display face here rather than being demoted
   to tiny data labels: the subject matter is infrastructure, so the monospace
   is the voice of the page, and Instrument Sans carries the reading prose. */
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
});

const instrument = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Krishna Kumar — AI systems engineer',
  description:
    'AI engineer building grounded retrieval pipelines, tool-calling agents, realtime voice systems and the AWS infrastructure underneath them.',
  authors: [{ name: 'Krishna Kumar' }],
  keywords: [
    'AI engineer',
    'RAG',
    'LangGraph',
    'Qdrant',
    'FastAPI',
    'Model Context Protocol',
    'AWS',
  ],
};

export const viewport: Viewport = {
  themeColor: '#06080d',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${plexMono.variable} ${instrument.variable}`}>
      <body className="bg-void text-ink font-sans antialiased">{children}</body>
    </html>
  );
}
