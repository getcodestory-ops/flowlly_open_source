// import React, { useState } from "react";
// import {
//   Box,
//   Button,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalFooter,
//   ModalBody,
//   ModalCloseButton,
//   Input,
//   Textarea,
//   Flex,
//   Text,
//   List,
//   ListItem,
// } from "@chakra-ui/react";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { useStore } from "@/utils/store";
// import { createProject } from "@/api/projectRoutes";
// import { timezones } from "@/utils/timezones";
// import { ProjectMetadata } from "@/types/projects";

// interface AddNewProjectModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// function AddNewProjectModal({ isOpen, onClose }: AddNewProjectModalProps) {
//   const { session } = useStore((state) => ({
//     session: state.session,
//   }));

//   const [projectName, setProjectName] = useState<string>("");
//   const [timezoneFilter, setTimezoneFilter] = useState("");
//   const [projectDescription, setProjectDescription] = useState<string>("");
//   const [projectNumber, setProjectNumber] = useState<string>("");
//   const [address, setAddress] = useState<string>("");
//   const [showTimezoneOptions, setShowTimezoneOptions] = useState(false);
//   const [metadata, setMetadata] = useState<ProjectMetadata>({});

//   const queryClient = useQueryClient();

//   const mutation = useMutation({
//     mutationFn: () =>
//       createProject(session!, {
//         name: projectName,
//         description: projectDescription,
//         project_number: projectNumber,
//         address: address,
//         metadata: metadata,
//       }),
//     onError: (error) => {
//       console.log(error);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["projectList"] });
//       queryClient.invalidateQueries({ queryKey: ["initialProjectList"] });
//     },
//   });

//   const filteredTimezones = timezones.filter((tz) =>
//     tz.toLowerCase().includes(timezoneFilter.toLowerCase())
//   );

//   const handleTimezoneChange = (selectedOption: string) => {
//     setMetadata({ ...metadata, timezone: selectedOption });
//     setShowTimezoneOptions(false);
//     setTimezoneFilter(selectedOption);
//   };

//   return (
//     <Modal isOpen={isOpen} onClose={onClose} size={"4xl"}>
//       <ModalOverlay />
//       <ModalContent>
//         <ModalHeader>Create New Project</ModalHeader>
//         <ModalCloseButton />
//         <ModalBody>
//           <Box mb={4}>
//             <Input
//               placeholder="Project Name"
//               value={projectName}
//               onChange={(e) => {
//                 setProjectName(e.target.value);
//               }}
//             />
//           </Box>
//           <Flex mb="4" gap="4" flexDirection={"column"}>
//             <Textarea
//               placeholder="Project Description"
//               value={projectDescription}
//               onChange={(e) => setProjectDescription(e.target.value)}
//             />
//             <Input
//               placeholder="Project Number"
//               value={projectNumber}
//               onChange={(e) => {
//                 setProjectNumber(e.target.value);
//               }}
//             />
//             <Textarea
//               placeholder="Address"
//               value={address}
//               onChange={(e) => setAddress(e.target.value)}
//             />
//           </Flex>
//           <Flex direction={"column"}>
//             <Text as={"b"} fontSize={"12px"}>
//               Time zone
//             </Text>
//             <Box position="relative" mt="2">
//               <Input
//                 placeholder="Filter Timezones"
//                 value={timezoneFilter}
//                 onChange={(e) => setTimezoneFilter(e.target.value)}
//                 onFocus={() => setShowTimezoneOptions(true)}
//               />
//               {showTimezoneOptions && (
//                 <List
//                   spacing={2}
//                   bg="white"
//                   mt={1}
//                   boxShadow="md"
//                   position="absolute"
//                   width="full"
//                   zIndex="dropdown"
//                   maxH="xs"
//                   overflow={"auto"}
//                 >
//                   {filteredTimezones.map((timezone) => (
//                     <ListItem
//                       key={timezone}
//                       p={2}
//                       cursor="pointer"
//                       _hover={{ bg: "gray.100" }}
//                       onClick={() => handleTimezoneChange(timezone)}
//                     >
//                       {timezone}
//                     </ListItem>
//                   ))}
//                   {filteredTimezones.length === 0 && (
//                     <ListItem p={2}>No results found.</ListItem>
//                   )}
//                 </List>
//               )}
//             </Box>
//           </Flex>
//         </ModalBody>

//         <ModalFooter>
//           <Button
//             bg={"brand.dark"}
//             color={"white"}
//             _hover={{ bg: "brand.accent", color: "brand.dark" }}
//             mr={3}
//             onClick={() => {
//               mutation.mutate();
//               onClose();
//             }}
//           >
//             Save
//           </Button>
//           <Button variant="ghost" onClick={onClose}>
//             Cancel
//           </Button>
//         </ModalFooter>
//       </ModalContent>
//     </Modal>
//   );
// }

// export default AddNewProjectModal;
const XXX = () => <></>;
