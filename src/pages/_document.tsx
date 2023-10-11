import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
        <Script
          async
          src="https://acrobatservices.adobe.com/view-sdk/viewer.js"
        />
      </body>
    </Html>
  );
}
