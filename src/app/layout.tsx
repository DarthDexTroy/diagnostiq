import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "A Diagnostic Assistant",
  description: "Capture clinician-patient conversations and translate to data, diagnoses, and insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col text-slate-900 bg-[#F8F9FA]">
        {children}
      </body>
    </html>
  );
}
