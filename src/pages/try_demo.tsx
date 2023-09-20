import Head from "next/head";
import DemoLayout from "@/Layouts/DemoLayout";

export default function Home() {
  return (
    <>
      <Head>
        <title>Construction Documentation 2</title>
        <meta name="description" content="Personal assistant for construction professionals" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <DemoLayout />
      </main>
    </>
  );
}
