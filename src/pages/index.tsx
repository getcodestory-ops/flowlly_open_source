import Head from "next/head";
import LoginPage from "@/Layouts/OldMainLayout";
import MainLayout from "@/Layouts/MainLayout";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

import colors from "../styles/theme";

const theme = extendTheme({
  colors,
  styles: {
    global: {
      "&::-webkit-scrollbar": {
        width: "10px",
      },
      "&::-webkit-scrollbar-track": {
        backgroundColor: "transparent", // This hides the track
      },
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: "#888", // Change this color for your desired thumb color
        borderRadius: "5px",
      },
      "&::-webkit-scrollbar-thumb:hover": {
        backgroundColor: "#555",
      },
      scrollbarWidth: "none", // This will hide the scrollbar for Firefox
    },
  },
});

export default function Home() {
  return (
    <ChakraProvider theme={theme}>
      <Head>
        <title>Construction Documentation</title>
        <meta
          name="description"
          content="Your personal assistant for construction professionals"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <MainLayout>
          <LoginPage />
        </MainLayout>
      </main>
    </ChakraProvider>
  );
}
