// import LoginPage from "@/Layouts/OldMainLayout";
import LoginPage from "@/Layouts/LoginPage";
import FormPage from "@/components/ChatInput/Forms/FormPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function Home() {
  return (
    <>
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
