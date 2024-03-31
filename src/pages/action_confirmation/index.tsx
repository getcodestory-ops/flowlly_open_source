import Head from "next/head";
import LoginPage from "@/Layouts/OldMainLayout";
import FormPage from "@/components/ChatInput/Forms/FormPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();

export default function Home() {
  return (
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
      <main>
        <QueryClientProvider client={queryClient}>
          <FormPage>
            <LoginPage />
          </FormPage>
        </QueryClientProvider>
      </main>
    </>
  );
}
