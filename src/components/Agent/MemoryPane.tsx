import { Box, Heading } from "@chakra-ui/react";

const AgentMemoryPane = ({}) => {
	return (
		<Box
			backgroundColor="brand.mid"
			color="white"
			height="100vh"
			padding="4"
			width="full"
		>
			<Box marginBottom="4">
				<Heading as="h2" size="md">
          Workspaces
				</Heading>
			</Box>
			<Box marginBottom="4" />
		</Box>
	);
};

export default AgentMemoryPane;
