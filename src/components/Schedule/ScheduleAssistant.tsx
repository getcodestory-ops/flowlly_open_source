import React from "react";
import { Box, InputGroup, Textarea } from "@chakra-ui/react";

function ScheduleAssistant({ handleChatSubmit, setChatInput, chatInput }: any) {
	return (
		<Box color="white" w="full">
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
					color="brand.dark"
					onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
						setChatInput(e.target.value)
					}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							handleChatSubmit();
						}
					}}
					placeholder="Conversations..."
					value={chatInput}
					minH="3rem"
					// h="auto"
					resize="none"
					overflow="auto"
					// height={`${chatInput.length / 20}rem`}
				/>
			</InputGroup>
		</Box>
	);
}

export default ScheduleAssistant;
