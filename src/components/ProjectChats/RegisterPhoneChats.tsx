import React, { useState, useEffect } from "react";
import {
	Box,
	Button,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	Input,
	Text,
	useToast,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/utils/store";
import { addPhoneChats } from "@/api/registrationRoutes";

interface AddNewRegistrationModal {
  isOpen: boolean;
  onClose: () => void;
}

function RegisterPhoneChats({ isOpen, onClose }: AddNewRegistrationModal) {
	const queryClient = useQueryClient();
	const toast = useToast();

	const { session, activeProject, activeChatEntity, selectedContext } =
    useStore((state) => ({
    	session: state.session,
    	activeProject: state.activeProject,
    	activeChatEntity: state.activeChatEntity,
    	selectedContext: state.selectedContext,
    }));
	const [phoneError, setPhoneError] = useState<boolean>(false);
	const [phoneNumber, setPhoneNumber] = useState<string>("");

	//validate phone number
	const validatePhoneNumber = (phoneNumber: string) => {
		const regex = /^[0-9]{10}$/;
		return regex.test(phoneNumber);
	};

	useEffect(() => {
		if (phoneNumber.length === 10) {
			setPhoneError(validatePhoneNumber(phoneNumber));
		}
	}, [phoneNumber]);

	const mutation = useMutation({
		mutationFn: () => {
			if (!session || !activeProject) {
				toast({
					title: "Error",
					description: "No session or active project",
					status: "error",
					duration: 5000,
					isClosable: true,
					position: "bottom-right",
				});
				return Promise.reject("No session or active project");
			}
			return addPhoneChats(session, activeProject.project_id, {
				phone_number: phoneNumber,
				brain_id: selectedContext?.id,
			});
		},
		onError: (error: Error & { response?: any }) => {
			toast({
				title: "Error",
				description: error.response?.data.detail ?? "Something went wrong",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom-right",
			});
		},
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Phone Number successfully registered !",
				status: "success",
				duration: 5000,
				isClosable: true,
				position: "bottom-right",
			});
			queryClient.invalidateQueries({ queryKey: ["chatEntityList"] });
		},
	});

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Register Phone Number </ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<Box mb={4}>
						<Input
							onChange={(e) => {
								setPhoneNumber(e.target.value);
							}}
							placeholder="Phone Number ex. +14164567898"
							value={phoneNumber}
						/>
					</Box>
					{!phoneError && (
						<Text color="red.400" fontSize="xs">
              Enter Correct phone number
						</Text>
					)}
				</ModalBody>
				<ModalFooter>
					<Button
						colorScheme="blue"
						mr={3}
						onClick={() => {
							mutation.mutate();
							onClose();
						}}
					>
            Save
					</Button>
					<Button onClick={onClose} variant="ghost">
            Cancel
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

export default RegisterPhoneChats;
