// REVIEWED - 05
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { PropsWithChildren } from "react";
import "./globals.css";

const p = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Yeagerists Project",
  description: "Created by Yeagerists Team.",
};

const RootLayout = function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" className="h-full">
      <body className={`${p.className} h-full`}>{children}</body>
    </html>
  );
};

export default RootLayout;
