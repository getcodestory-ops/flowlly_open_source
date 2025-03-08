import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
	Box,
	Button,
	FormControl,
	FormLabel,
	Input,
	Flex,
	Center,
	Text,
	Heading,
	useToast,
	Image,
} from "@chakra-ui/react";
import supabase from "@/utils/supabaseClient";
import { useStore } from "@/utils/store";

export default function LoginPage() {
	const router = useRouter();
	const toast = useToast();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const setAppView = useStore((state) => state.setAppView);

	const handleLogin = async(email: string, password: string) => {
		const { data: user, error } = await supabase.auth.signInWithPassword({
			email: email,
			password: password,
		});
		if (error) {
			let message = "An error occured";
			if (error.name === "AuthApiError") {
				message =
          "Please verify your email before logging in. Check your spam folder if you can't find the email in main inbox.";
			}
			toast({
				title: error.message,
				description: message,
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "top-right",
			});
			return;
		}

		router.push("/").then(() => window.location.reload());
	};

	useEffect(() => {
		async function loginCheck() {
			const { data } = await supabase.auth.getSession();

			if (data?.session?.user) {
				router.replace("/");
				setAppView("updates");
			} else {
				setAppView("login");
				//console.log("Sign in to continue !");
			}
		}
		loginCheck();
	}, [router]);

	return (
		<Flex w="100vw">
			<Center
				alignItems="center"
				bg="brand.dark"
				display="flex"
				flexDirection="column"
				height="100vh"
				p="2"
				width="full"
			>
				<Box
					borderRadius={8}
					p={6}
					width="full"
				>
					<Heading
						alignItems="center"
						color="brand.accent"
						display="flex"
						flexDirection="column"
						fontWeight="bold"
						letterSpacing="tight"
						mb={4}
						size="xl"
						textAlign="center"
					>
						<Image
							alt="logo"
							mb={4}
							src="https://qfktimnmlcnfowxuoune.supabase.co/storage/v1/object/public/logos/logo_full.svg"
							w={60}
						/>
            AI Project Management Assistant
					</Heading>
				</Box>
				<Box
					backgroundColor="brand.mid"
					borderRadius="md"
					m="8"
					p={8}
					textColor="white"
					width="sm"
				>
					<FormControl id="email" mb="4">
						<FormLabel>Email address</FormLabel>
						<Input
							onChange={(e) => setEmail(e.target.value)}
							type="email"
							value={email}
						/>
					</FormControl>
					<FormControl id="password" mb="4">
						<FormLabel>Password</FormLabel>
						<Input
							onChange={(e) => setPassword(e.target.value)}
							onKeyPress={(e) => {
								if (e.key === "Enter") {
									handleLogin(email, password);
								}
							}}
							type="password"
							value={password}
						/>
						<Button
							colorScheme="gray"
							mt={4}
							onClick={() => handleLogin(email, password)}
							textColor="black"
						>
              Login with Email
						</Button>
					</FormControl>
				</Box>
			</Center>
		</Flex>
	);
}
