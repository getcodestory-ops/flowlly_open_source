import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
	return (
		<>
			<Head>
				<title>Construction Documentation</title>
				<meta
					content="Your personal assistant for construction professionals"
					name="description"
				/>
				<meta content="width=device-width, initial-scale=1" name="viewport" />
				<link href="/favicon.ico" rel="icon" />
			</Head>
			<Component {...pageProps} />
		</>
	);
}
