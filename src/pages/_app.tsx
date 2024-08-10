import "@/styles/globals.css";
import type { AppProps } from "next/app";
// import { MsalProvider } from "@azure/msal-react";
// import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "../components/EmailIntegration/Microsoft/authConfig";
import Head from "next/head";

// const msalInstance = new PublicClientApplication(msalConfig);

export default function App({ Component, pageProps }: AppProps) {
  return (
    // <MsalProvider instance={msalInstance}>
    <>
      <Head>
        <title>Construction Documentation</title>
        <meta
          name="description"
          content="Your personal assistant for construction professionals"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
    // </MsalProvider>
  );
}
