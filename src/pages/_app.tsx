import "@/styles/globals.css";
import type { AppProps } from "next/app";
// import { MsalProvider } from "@azure/msal-react";
// import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "../components/EmailIntegration/Microsoft/authConfig";

// const msalInstance = new PublicClientApplication(msalConfig);

export default function App({ Component, pageProps }: AppProps) {
  return (
    // <MsalProvider instance={msalInstance}>
    <Component {...pageProps} />
    // </MsalProvider>
  );
}
