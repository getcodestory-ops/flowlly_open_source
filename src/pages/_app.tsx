import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import colors from "../styles/theme";
import NavBars from "@/Layouts/NavBars";
import NewLayout from "@/Layouts/MainLayout";

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

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      {/* <NavBars> */}

      <NewLayout>
        <Component {...pageProps} />
      </NewLayout>
      {/* </NavBars> */}
    </ChakraProvider>
  );
}
