import Head from "next/head";
import LoginPage from "@/Layouts/LoginPage";
import MainLayout from "@/Layouts/MainLayout";
import { ChakraProvider } from "@chakra-ui/react";
import { chakraTheme } from "@/utils/chakraTheme";

export default function Home() {
  return (
    <ChakraProvider theme={chakraTheme}>
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
