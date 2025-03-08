import React, { useState } from "react";
import { Box, InputGroup, Textarea, useToast, Flex } from "@chakra-ui/react";
import { Session } from "@supabase/supabase-js";
import { useStore } from "@/utils/store";

interface ChatInputProps {
  setChatRouteResponse: React.Dispatch<React.SetStateAction<any>>;
  chatRouteCallFunction: (
    session: Session,
    agent_task: string,
    brain_id: string
  ) => Promise<any>;
}

function ChatInput({
	setChatRouteResponse,
	chatRouteCallFunction,
}: ChatInputProps) {
	const toast = useToast();
	const [chatInput, setChatInput] = useState<string>("");
	const session = useStore((state) => state.session!);
	const selectedContext = useStore((state) => state.selectedContext!);

	const handleChatSubmit = async() => {
		const data = await chatRouteCallFunction(
			session,
			chatInput,
      selectedContext?.id!,
		);

		if (!data) {
			toast({
				title: "Error",
				description: "Something went wrong. Please try again.",
				status: "error",
				duration: 9000,
				isClosable: true,
			});
			return;
		} else {
			setChatRouteResponse(data);
		}
	};

	return (
		<Flex
			color="white"
			mt={8}
			w="full"
		>
			<InputGroup size="lg">
				<Textarea
					_focus={{
						// outline: "none",
						borderColor: "brand.dark",
						boxShadow: "0px 0px 8px 1px rgba(255,255,255, 0.8)",
					}}
					_hover={{ boderColor: "brand.dark" }}
					border="1px solid"
					borderColor="brand.dark"
					borderRadius="40px"
					boxShadow="0px 0px 8px 1px rgba(255,255,255, 0.8)"
					color="brand.light"
					h="auto"
					height={`${chatInput.length / 20}rem`}
					minH="3rem"
					onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
						setChatInput(e.target.value)
					}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							handleChatSubmit();
						}
					}}
					overflow="hidden"
					placeholder="Type your questions..."
					resize="none"
					value={chatInput}
				/>
			</InputGroup>
		</Flex>
	);
}

export default ChatInput;
