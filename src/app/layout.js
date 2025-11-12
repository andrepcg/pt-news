import { Inter } from "next/font/google";
import Script from 'next/script'

import "./globals.css";
import NewsletterSubscribe from "./components/NewsletterSubscribe";
import Search from "./components/Search";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata = {
  title: "Diurna.pt - Últimas Notícias 🇵🇹",
  description: "Acompanhe as últimas notícias de Portugal em tempo real. O Diurna.pt agrega as principais notícias dos maiores meios de comunicação portugueses num único local.",
  keywords: "notícias portugal, últimas notícias, notícias portuguesas, actualidade portugal, notícias em tempo real, imprensa portuguesa, jornais portugueses, media portugal",
  openGraph: {
    title: "Diurna.pt - Últimas Notícias 🇵🇹",
    description: "Acompanhe as últimas notícias de Portugal em tempo real. O Diurna.pt agrega as principais notícias dos maiores meios de comunicação portugueses num único local.",
    url: "https://diurna.pt",
    siteName: "Diurna.pt",
    locale: "pt_PT",
    type: "website",
    images: [
      {
        url: "https://diurna.pt/og.png",
        width: 1200,
        height: 630,
        alt: "Diurna.pt - Últimas Notícias de Portugal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Diurna.pt - Últimas Notícias 🇵🇹",
    description: "Acompanhe as últimas notícias de Portugal em tempo real. O Diurna.pt agrega as principais notícias dos maiores meios de comunicação portugueses num único local.",
    images: ["https://diurna.pt/og.png"],
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body className={inter.className}>
        <Search />
        {children}
        <footer className="footer">
          <span>Diurna.pt - </span>
          <a href="https://github.com/andrepcg/pt-news" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </footer>
        <NewsletterSubscribe />
        <Script async src="https://cloud.umami.is/script.js" data-website-id="90d47290-1591-4504-b584-20444b33daa6" />
      </body>
    </html>
  );
}
