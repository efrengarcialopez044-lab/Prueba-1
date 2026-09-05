import type { Metadata } from "next";
import { Alex_Brush, Fraunces, Inter } from "next/font/google";
import { CookieConsent } from "@/components/CookieConsent";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { SITE_URL } from "@/lib/site-config";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const alexBrush = Alex_Brush({
  variable: "--font-alex-brush",
  subsets: ["latin"],
  weight: "400",
});

const title = "Casa Elody — Villa frente al mar en Ribadeo";
const description =
  "Reserva Casa Elody, una villa privada frente al Atlántico en Ribadeo, a minutos de la Playa de las Catedrais. 9 habitaciones, 6 baños, hasta 18 huéspedes.";
const ogImage = "/property/ribadeo-2-aerial-bay.webp";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: "%s — Casa Elody",
  },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "Casa Elody",
    images: [{ url: ogImage, width: 1706, height: 1280 }],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${fraunces.variable} ${alexBrush.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-sand-50 text-foreground font-sans">
        {children}
        <CookieConsent />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
