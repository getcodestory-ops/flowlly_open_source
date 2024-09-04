import LoginPage from "@/Layouts/LoginPage";
import MainLayout from "@/Layouts/MainLayout";
import { ChakraProvider } from "@chakra-ui/react";
import { chakraTheme } from "@/utils/chakraTheme";

export default function Home() {
  return (
    <ChakraProvider theme={chakraTheme}>
      <main>
        <MainLayout>
          <LoginPage />
        </MainLayout>
      </main>
    </ChakraProvider>
  );
}
