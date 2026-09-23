import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Bench Adoption | Van Cortlandt Park",
    template: "%s | Van Cortlandt Park Bench Adoption",
  },
  description:
    "Browse and adopt a bench in Van Cortlandt Park — see which benches are already dedicated, by whom, and for how long.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-screen bg-[#f6f3ec] text-[#1f2a1a]">
        <header className="border-b border-[#d8d0bc] bg-[#2f3b26] text-[#f6f3ec]">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/" className="font-serif text-xl font-semibold">
              Van Cortlandt Park &middot; Bench Adoption
            </Link>
            <span className="text-sm text-[#cfd6c4]">
              A gift that lasts, a seat with a story
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
        <footer className="border-t border-[#d8d0bc] py-6 text-center text-sm text-[#6b6350]">
          Van Cortlandt Park Bench Adoption Program
        </footer>
      </body>
    </html>
  );
}
