import React, { useEffect } from "react";
import { Flex, Select, Text } from "@chakra-ui/react";
import { useStore } from "@/utils/store";

function ContextSelection() {
	const { folderList, selectedContext, setSelectedContext } = useStore(
		(state) => ({
			folderList: state.folderList,
			selectedContext: state.selectedContext,
			setSelectedContext: state.setSelectedContext,
		}),
	);

	useEffect(() => {
		if (folderList && folderList?.length > 0 && folderList !== null) {
			setSelectedContext(folderList[0]);
		}
	}, [folderList]);

	return (
		<Flex
			alignItems="center"
			fontSize="xs"
			justifyContent="end"
			pl="2"
		>
			<Text color="brand.dark" mr="4">
        Search folder
			</Text>
			<Select
				border="none"
				color="gray.400"
				fontSize="xs"
				fontWeight="bold"
				onChange={(e) =>
					setSelectedContext(
						folderList?.filter(
							(folder) => folder.name === e.target.value,
						)?.[0] ?? null,
					)
				}
				placeholder="Search within"
				value={selectedContext?.name ?? ""}
				width="48"
			>
				{folderList?.map((option) => (
					<option
						key={option?.name}
						style={{ backgroundColor: "#393E46" }}
						value={option?.name}
					>
						{option?.name}
					</option>
				))}
			</Select>
		</Flex>
	);
}

export default ContextSelection;
