import type { Metadata } from "next";
import { Alex_Brush, Fraunces, Inter } from "next/font/google";
import { CookieConsent } from "@/components/CookieConsent";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
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

export const metadata: Metadata = {
  title: "Casa Elody — Villa frente al mar en Ribadeo",
  description:
    "Reserva Casa Elody, una villa privada frente al Atlántico en Ribadeo, a minutos de la Playa de las Catedrais.",
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
