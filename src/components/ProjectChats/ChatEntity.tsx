import React, { useState } from "react";
import { Flex, Button } from "@chakra-ui/react";
// import { useQuery } from "@tanstack/react-query";
// import { getAgentChatEntities } from "@/api/agentRoutes";
// import { useStore } from "@/utils/store";
import { FaPhoneAlt } from "react-icons/fa";
import RegisterPhoneChats from "./RegisterPhoneChats";

function ChatEntity() {
	const [isOpen, setIsOpen] = useState(false);
	const onClose = () => setIsOpen(false);
	// const [selectedChatId, setSelectedChatId] = useState("");

	// const { session, setActiveChatEntity, activeProject } =
	//   useStore((state) => ({
	//     session: state.session,
	//     setActiveChatEntity: state.setActiveChatEntity,
	//     activeProject: state.activeProject,
	//   }));

	// const { data: chatEntities, isLoading: chatsLoading } = useQuery({
	//   queryKey: ["chatEntityList", session, activeProject],
	//   queryFn: () => {
	//     if (!session || !activeProject) {
	//       return Promise.reject("No session or active project");
	//     }
	//     return getAgentChatEntities(session, activeProject.project_id);
	//   },
	//   enabled: !!session?.access_token,
	// });

	// const handleSelectChat = (e: React.ChangeEvent<HTMLSelectElement>) => {
	//   const chatId = e.target.value;
	//   if (!chatEntities) {
	//     return;
	//   }
	//   const selectedChat = chatEntities.find((chat) => chat.id === chatId);
	//   setSelectedChatId(chatId);
	//   if (selectedChat) {
	//     setActiveChatEntity(selectedChat);
	//   }
	// };

	return (
		<Flex gap={8} mt={8}>
			{/* <Flex>
        <Select placeholder="Select chat" onChange={handleSelectChat}>
          {chatEntities &&
            chatEntities.map((chatEntity) => (
              <option key={chatEntity.id} value={chatEntity.id}>
                {chatEntity.chat_name}
              </option>
            ))}
        </Select>
      </Flex> */}

			<Flex cursor="pointer" onClick={() => setIsOpen(true)}>
				<Button bg="brand.accent" leftIcon={<FaPhoneAlt />}>
          Register
				</Button>
				<RegisterPhoneChats isOpen={isOpen} onClose={onClose} />
			</Flex>
		</Flex>
	);
}

export default ChatEntity;
