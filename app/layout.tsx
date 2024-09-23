import "./globals.css";
import { CSPostHogProvider } from "./providers";
export const metadata = {
  title: "Construction Documentation",
  description: "Your personal assistant for construction professionals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <CSPostHogProvider>
        <body className="bg-background text-foreground">{children}</body>
      </CSPostHogProvider>
    </html>
  );
}
