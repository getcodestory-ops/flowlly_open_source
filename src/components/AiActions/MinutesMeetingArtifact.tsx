import { useState } from "react";
import { Flex } from "@chakra-ui/react";
import MarkDownDisplay from "../Markdown/MarkDownDisplay";
import { Antartifact } from "@/types/agentChats";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoMdSend } from "react-icons/io";
import EmailModal from "./EmailModal";
import ContentEditor from "../DocumentEditor/ContentEditor";
import { Session } from "@supabase/supabase-js";

function MinutesMeetingArtifact({
	antartifact,
	sessionToken,
}: {
  antartifact: Antartifact;
  sessionToken?: Session | null;
}) {
	const [content, setContent] = useState<string | undefined>(undefined);

	return (
		<Flex
			alignItems="center"
			borderRadius="lg"
			flexDir="column"
			gap="4"
			justifyContent="center"
			p="2"
		>
			{antartifact.result ? (
				<Flex flexDir="column">
					<ContentEditor content={antartifact.result} setContent={setContent} />
				</Flex>
			) : (
				<>
					<Flex>Writing minutes...</Flex>
					{antartifact.content && (
						<MarkDownDisplay content={antartifact.content} />
					)}
					<Flex
						alignItems="center"
						animation="spin infinite 2s linear"
						css={{
							"@keyframes spin": {
								"0%": { transform: "rotate(0deg)" },
								"100%": { transform: "rotate(360deg)" },
							},
						}}
						justifyContent="center"
					>
						<AiOutlineLoading3Quarters />
					</Flex>
				</>
			)}
		</Flex>
	);
}

export default MinutesMeetingArtifact;
