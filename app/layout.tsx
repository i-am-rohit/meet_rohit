import type { Metadata, Viewport } from "next";
import { Fredoka, Manrope, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700", "800"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
});

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Rohit Gusain — AI & Digital Transformation",
  description:
    "Rohit Gusain is a Programme Manager for AI and Digital Transformation. Generative AI, machine learning, computer vision, NLP, and enterprise delivery. Delhi NCR.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "64x64" },
      {
        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23080808'/%3E%3Ctext x='32' y='47' text-anchor='middle' font-family='Arial Black,Helvetica Neue,Arial,sans-serif' font-size='36' font-weight='900' fill='%23FF5A1F' letter-spacing='-1.5'%3ER%7CG%3C/text%3E%3C/svg%3E",
        type: "image/svg+xml",
      },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#080808",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${outfit.variable} ${manrope.variable} ${fredoka.variable}`}>
      <body className="bg-[#080808] font-body text-white antialiased">{children}</body>
    </html>
  );
}
