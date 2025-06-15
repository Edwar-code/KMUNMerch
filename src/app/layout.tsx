import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/components/providers";
import Script from "next/script";
import PushNotificationManager from "@/components/PushNotification";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KeMUN Connect | The Corner for diplomatic experiences.",
  description:
    "Join KeMUN Connect to meet, collaborate, and grow in a dynamic space for recreation and formal engagements.",
  keywords: "KeMUN, diplomatic experiences, networking, growth, recreation, formal engagements",
  openGraph: {
    title: "KeMUN Connect | The Corner for diplomatic experiences.",
    description:
      "Experience a vibrant community at KeMUN Connect, where individuals engage in growth through recreation and formal networking.",
    url: "https://kemun.co.ke",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
  other: {
    "google-adsense-account": "ca-pub-6298992328631082",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-6298992328631082" />

        {/* Google AdSense (ACTIVE) */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6298992328631082"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* Google Tag Manager Script */}
        <Script id="gtm-script" strategy="beforeInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-5KQRS5C6');
          `}
        </Script>

        {/* Cookiebot */}
        <Script
          id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid="16457812-0bf1-4899-8632-825b19dc9492"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5KQRS5C6"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>

        <Providers>
          {children}
        </Providers>

        <SpeedInsights />
        <Analytics />

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-1CGSXFK6JH"
          strategy="afterInteractive"
          async
        />
        <Script id="google-analytics-G1CGSXFK6JH" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1CGSXFK6JH');
          `}
        </Script>

        {/* Google Sign-In Client */}
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
