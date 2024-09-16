import { Providers } from "./providers";

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
    <body className="bg-background text-foreground">
      <Providers>{children}</Providers>
    </body>
  );
}
