import { Inter, Geist_Mono } from 'next/font/google';

export const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});
