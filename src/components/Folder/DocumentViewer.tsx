import React, { useState } from "react";
import { Flex, Grid, GridItem, Button } from "@chakra-ui/react";
import { GrAdd } from "react-icons/gr";
import { GrImage } from "react-icons/gr";
import DocumentEntityViewer from "./DocumentEntityViewer";
import { HiOutlineDocumentReport } from "react-icons/hi";

import DailyReports from "../Dailies/DailyReport";

function DocumentViewer() {
	const [documentViewer, setDocumentViewer] = useState<
    "Document" | "Reports" | "Media"
  >("Reports");

	return (
		<Grid
			bg="brand.light"
			borderRadius="lg"
			gap={6}
			height="100%"
			p="4"
			templateColumns="repeat(8, 1fr)"
			w="full"
		>
			<GridItem colSpan={1}>
				<Flex flexDir="column" gap="8">
					<Flex>
						<Button
							borderRadius="lg"
							colorScheme="yellow"
							leftIcon={<GrAdd />}
							pr="4"
							size="sm"
						>
              Add New
						</Button>
					</Flex>
					<Flex flexDir="column" gap="4">
						<Flex fontWeight="bold">Folders</Flex>
						<Flex
							_hover={{ bg: "gray.200" }}
							borderLeft={documentViewer === "Media" ? "2px solid gray" : ""}
						>
							<Button
								color="black"
								colorScheme=""
								leftIcon={<GrImage />}
								onClick={() => setDocumentViewer("Media")}
								size="sm"
							>
                Media
							</Button>
						</Flex>
					</Flex>
					<Flex flexDir="column" gap="4">
						<Flex fontWeight="bold">Reports</Flex>
						<Flex
							_hover={{ bg: "gray.200" }}
							borderLeft={documentViewer === "Reports" ? "2px solid gray" : ""}
						>
							<Button
								color="black"
								colorScheme=""
								leftIcon={<HiOutlineDocumentReport />}
								onClick={() => setDocumentViewer("Reports")}
								size="sm"
							>
                Daily Reports
							</Button>
						</Flex>
					</Flex>
				</Flex>
			</GridItem>
			<GridItem
				bg="white"
				borderRadius="lg"
				className="custom-scrollbar"
				colSpan={7}
				h="full"
				overflow="auto"
				p="4"
			>
				{documentViewer === "Reports" ? (
					<DailyReports />
				) : (
					<DocumentEntityViewer />
				)}
			</GridItem>
		</Grid>
	);
}

export default DocumentViewer;
