import { Flex } from "@chakra-ui/react";
import React from "react";
import { Antartifact } from "@/types/agentChats";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import MarkDownDisplay from "../Markdown/MarkDownDisplay";

function ArtifactViewerByChatId({ antartifact }: { antartifact: Antartifact }) {
	const tags = [
		"schedule_update",
		"schedule_addition",
		"schedule_removal",
		"invoke_reference",
		"log_safety",
		"log_minutes",
		"log_daily",
	];

	switch (antartifact.attributes?.type) {
		case "invoke_reference":
			return (
				<Flex
					alignItems="center"
					bg="brand.light"
					borderRadius="lg"
					gap="4"
					justifyContent="center"
					p="2"
				>
					{antartifact.result ? (
						<>
							<MarkDownDisplay content={antartifact.result} />
						</>
					) : (
						<>
							{" "}
							<Flex>Searching...</Flex>
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

		case "schedule_update":
			return (
				<Flex
					alignItems="center"
					borderRadius="lg"
					gap="4"
					justifyContent="center"
					p="2"
				>
					<Flex>Your schedule interaction...</Flex>
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
				</Flex>
			);

		case "log_minutes":
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
						<>
							<MarkDownDisplay content={antartifact.result} />
						</>
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

		default:
			return <Flex>Viewer</Flex>;
	}
}
export default ArtifactViewerByChatId;
