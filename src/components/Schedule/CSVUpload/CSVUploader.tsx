// CSVUploader.tsx

import React from "react";
import {
	Flex,
	Button,
	Input,
	Text,
	Modal,
	ModalOverlay,
	ModalBody,
	ModalCloseButton,
	ModalFooter,
	ModalContent,
	ModalHeader,
	Select,
	Spinner,
	Icon,
	Box,
} from "@chakra-ui/react";
import { CreateNewActivity } from "@/types/activities";
import { useCSVUploader } from "./useCsvUpload";
import { FiUpload } from "react-icons/fi";

const CSVUploader: React.FC = () => {
	const {
		fileRef,
		isModalOpen,
		unmatchedHeaders,
		csvHeaders,
		headerMappings,
		isPending,
		selectedFile,
		setHeaderMappings,
		setSelectedFile,
		handleHeaderMappingChange,
		handleCsvFileHeaderCheck,
		setModalOpen,
		handleUpload,
	} = useCSVUploader();

	// useEffect(() => {
	//   if (selectedFile === null) return;
	//   handleCsvFileHeaderCheck();
	// }, [selectedFile]);

	return (
		<Flex direction="column" w="full">
			{/* <Flex>
        <Heading as="h2" size="sm" color="brand.dark" mt={2} mb={4}>
          Upload Project Schedule in CSV format
        </Heading>
      </Flex> */}
			<Flex
				_hover={{ bg: "brand.dark", color: "white" }}
				align="center"
				alignItems="center"
				as="b"
				bg="brand.light"
				border="1px solid"
				borderColor="brand.light"
				borderRadius="md"
				color="brand.dark"
				direction="column"
				fontSize="14px"
				gap={2}
				justifyContent="center"
				p={1}
				position="relative"
				w="full"
			>
				<Flex alignItems="center">
					<Icon as={FiUpload} mr={2} />
					{selectedFile !== null ? selectedFile.name : "Upload csv file"}
					<Input
						accept=".csv"
						left={-1}
						onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
						opacity={0}
						position="absolute"
						py={1}
						ref={fileRef}
						type="file"
					/>
				</Flex>
				<Box>
					{selectedFile !== null ? (
						<Button onClick={handleCsvFileHeaderCheck} size="xs">
              process
						</Button>
					) : null}
				</Box>
			</Flex>
			<Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>
						{isPending
							? "processing"
							: "We did not find corresponding headers, please match them manually"}
					</ModalHeader>
					<ModalCloseButton />
					{!isPending && (
						<>
							<ModalBody>
								{unmatchedHeaders.map((header, index) => (
									<Flex key={`${header}-${index}`}>
										<span>{header}</span>
										<Select
											onChange={(e) => {
												handleHeaderMappingChange(
													header,
                          e.target.value as keyof CreateNewActivity,
												);
											}}
											placeholder="Select corresponding header"
											value={headerMappings[header] || ""}
										>
											{csvHeaders.map((key, index) => (
												<option
													color="black"
													key={`${key}-${index}`}
													onChange={() =>
														setHeaderMappings((prev) => ({
															...prev,
															[key]: header,
														}))
													}
													value={key}
												>
													{key}
												</option>
											))}
										</Select>
									</Flex>
								))}
							</ModalBody>
							<ModalFooter>
								<Button
									colorScheme="blue"
									mr={3}
									onClick={handleUpload}
								>
                  Upload
								</Button>
								<Button onClick={() => setModalOpen(false)} variant="ghost">
                  Cancel
								</Button>
							</ModalFooter>
						</>
					)}
					{isPending && <Spinner />}
				</ModalContent>
			</Modal>
		</Flex>
	);
};

export default CSVUploader;
