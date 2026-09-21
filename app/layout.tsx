import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AquaWatch AI — Report Water Problems",
  description:
    "Report public water problems in your area with a photo, location and severity, and track how they get resolved.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface font-body text-ink-900 antialiased">
        {children}
      </body>
    </html>
  );
}
