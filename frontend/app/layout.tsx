import { Toaster } from "sonner";
import "./globals.css";
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <Providers>
           <Toaster position="top-right" />
          {children}
        </Providers>
      </body>
    </html>
  );
}