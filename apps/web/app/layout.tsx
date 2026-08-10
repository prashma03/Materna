import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Materna",
  description: "Maternal health coordination for rural care teams.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        {children}
      </body>
    </html>
  );
}
