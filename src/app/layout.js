// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata = {
  title: "Últimas Notícias 🇵🇹 "
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <footer className="footer">
          <a href="https://github.com/andrepcg/pt-news" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </footer>
      </body>
    </html>
  );
}
