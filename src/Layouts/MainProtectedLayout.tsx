"use client";
import React, { useEffect } from "react";
import { Flex } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import checkProjectStatus from "@/utils/checkProjectStatus";
import { ChakraProvider } from "@chakra-ui/react";
import { chakraTheme } from "@/utils/chakraTheme";

import { TooltipProvider } from "@/components/ui/tooltip";
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			staleTime: 30 * 1000,
			retry: 1,
		},
	},
});

function MainLayout() {
	const {
		appView,
		userActivities,

		setProjectStatus,
	} = useStore((state) => ({
		setSessionToken: state.setSession,
		appView: state.appView,
		setAppView: state.setAppView,
		userActivities: state.userActivities,

		setProjectStatus: state.setProjectStatus,
	}));

	useEffect(() => {
		setProjectStatus(checkProjectStatus(userActivities));
	}, [userActivities, setProjectStatus]);

	return (
		<>
			<main>
				<QueryClientProvider client={queryClient}>
					<TooltipProvider>
						<Flex
							bg="#E5E5E5"
							h="calc(100vh - 64px)"
							overflow="auto"
							w="100vw"
						>
							<Flex
								flexDir="column"
								h="calc(100vh - 64px)"
								w="100vw"
								width="full"
							>
								{/* <MainDisplayInLayout appView={appView} /> */}
							</Flex>
						</Flex>
					</TooltipProvider>
				</QueryClientProvider>
			</main>
		</>
	);
}

export default function MainLayoutProvider() {
	return (
		<ChakraProvider theme={chakraTheme}>
			<MainLayout />
		</ChakraProvider>
	);
}
