import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { RefreshOnBack } from "./RefreshOnBack";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

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
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-[var(--cream)] text-[var(--ink)]">
        <RefreshOnBack />
        <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--forest-900)] text-[var(--cream)]">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2.5">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="shrink-0 text-[var(--sky-100)]"
              >
                <path
                  d="M4 21V13.5C4 9.9 6.7 7 10 7s6 2.9 6 6.5V21"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M10 7V3.5M10 3.5c1.5 0 2.5 1 2.5 2.5M10 3.5c-1.5 0-2.5 1-2.5 2.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 21h20M3.5 21v-3.2h4.4V21M14.5 21v-4.6h5V21"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              <span className="font-display text-lg font-semibold leading-tight">
                Van Cortlandt Park
                <span className="block text-xs font-normal text-[var(--sky-100)]">
                  Bench Adoption Program
                </span>
              </span>
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">{children}</main>
        <footer className="border-t border-[var(--border)] py-8 text-center text-sm text-[var(--ink-faint)]">
          Van Cortlandt Park Bench Adoption Program
        </footer>
      </body>
    </html>
  );
}
