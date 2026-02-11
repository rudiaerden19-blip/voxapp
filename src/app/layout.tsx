import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VoxApp - Slimme Receptionist voor uw zaak",
  description: "Mis nooit meer een oproep. VoxApp neemt op, boekt afspraken en beantwoordt vragen. 24/7. Met uw eigen stem.",
  keywords: "receptionist, telefoon, KMO, afspraken, België, Nederland",
  openGraph: {
    title: "VoxApp - Slimme Receptionist",
    description: "Mis nooit meer een oproep. Slimme receptionist voor elke KMO.",
    url: "https://voxapp.tech",
    siteName: "VoxApp",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
