import "./globals.css";
// import { CSPostHogProvider } from "./providers";
export const metadata = {
	title: "Flowlly",
	description: "Your personal assistant for construction professionals",
	icons: {
		icon: "/icon.svg",
		apple: "/apple-icon.svg",
	},
};

export default function RootLayout({
	children,
}: {
  children: React.ReactNode;
}) {
	return (
		<html lang="en">
			{/* <CSPostHogProvider> */}
			<body className="bg-background text-foreground relative">{children}</body>
			{/* </CSPostHogProvider> */}
		</html>
	);
}
