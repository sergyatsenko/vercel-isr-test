import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="bg-white p-6 shadow-md">
          <div className="container mx-auto flex justify-center">
            <ul className="flex space-x-12">
              <li>
                <Link
                  href="/"
                  className="text-xl font-bold text-gray-800 hover:text-blue-600 transition duration-300"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/platforms"
                  className="text-xl font-bold text-gray-800 hover:text-blue-600 transition duration-300"
                >
                  Platforms
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-xl font-bold text-gray-800 hover:text-blue-600 transition duration-300"
                >
                  Services
                </Link>
              </li>
            </ul>
          </div>
        </nav>
        <main className="container mx-auto mt-8">{children}</main>
      </body>
    </html>
  );
}
