import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Button,
  Heading,
  Icon,
  Text,
  Grid,
  GridItem,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import { IoChevronDownOutline } from "react-icons/io5";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getProjects, deleteProject } from "@/api/projectRoutes";
import { getAgentChatEntities } from "@/api/agentRoutes";
import { ProjectEntity } from "@/types/projects";
import FileHandler from "./FileHandler";
import CSVUploader from "@/components/Schedule/CSVUpload/CSVUploader";
import { getMembers, createNewMemberEntry } from "@/api/membersRoutes";
import { MemberEntity } from "@/types/members";
import { FiEdit, FiSave } from "react-icons/fi";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { IoIosCloseCircle, IoIosCloseCircleOutline } from "react-icons/io";

function ProjectSetup() {
  const {
    session,
    activeProject,
    setActiveProject,
    activeChatEntity,
    setActiveChatEntity,
  } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
    setActiveProject: state.setActiveProject,
    activeChatEntity: state.activeChatEntity,
    setActiveChatEntity: state.setActiveChatEntity,
  }));
  const [settingsView, setSettingsView] = useState<string>("folders");
  const [newMember, setNewMember] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "",
  });
  const [addingMember, setAddingMember] = useState(false);
  const [Members, setMembers] = useState<any>([]);

  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projectList", session],
    queryFn: () => getProjects(session!),
    enabled: !!session?.access_token,
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["memberList", session, activeProject],
    queryFn: async () => {
      if (!session || !activeProject) {
        return Promise.reject("No session or active project");
      }
      try {
        return await getMembers(session, activeProject.project_id);
      } catch (error) {
        // Handle or log the error as needed
        console.error(error);
        return []; // Return an empty array or a suitable default value
      }
    },
    enabled: !!session?.access_token,
  });

  const handleInputChange = (e: any, field: any) => {
    setNewMember({ ...newMember, [field]: e.target.value });
  };

  const handleAddMemberClick = () => {
    setAddingMember(!addingMember);
  };

  const handleSaveMember = async () => {
    try {
      if (!session || !activeProject) {
        return Promise.reject("No session or active project");
      }
      // Prepare the projectDetails object, including additional fields
      const projectDetails = {
        ...newMember, // This includes first_name, last_name, email, phone, role
        project_id: activeProject?.project_id, // Assuming activeProject contains project_id
        // user_id: "", // Set the user_id if available or required
        responsibilities: "", // Set default or get from form
        skills: "", // Set default or get from form
        active: true, // Set default active status
      };

      // Call the API to create the new member entry
      const savedMember = await createNewMemberEntry(
        session,
        activeProject?.project_id,
        projectDetails
      );

      // Update members list with the newly saved member
      setMembers((prevMembers: any) => ({
        ...prevMembers,
        // data: [...prevMembers, newMember],
        projectDetails,
      }));

      // Reset new member state and hide the add member row
      setNewMember({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        role: "",
      });
      setAddingMember(false);
    } catch (error) {
      // Handle error (e.g., display an error message)
      console.error("Error saving member:", error);
    }
  };

  useEffect(() => {
    // console.log("session", session);
    setMembers(members?.data);
    // console.log("members", members?.data);
  }, [members]);

  useEffect(() => {
    console.log("newMember", newMember);
    console.log("Members", Members);
  }, [newMember, Members]);

  const folderAndFIles = () => {
    return (
      <Grid templateColumns="repeat(2, 1fr)" gap={"24"} w={"60%"} mt={"8"}>
        <GridItem colSpan={1}>
          <Flex direction={"column"}>
            <Text fontSize={"md"} as={"b"} mb={"4"}>
              Project Files
            </Text>
            <FileHandler />
          </Flex>
        </GridItem>
        <GridItem colSpan={1}>
          <Flex direction={"column"}>
            <Text fontSize={"md"} as={"b"} mb={"4"}>
              Schedule Files
            </Text>
            <CSVUploader />
          </Flex>
        </GridItem>
      </Grid>
    );
  };

  const projectMembers = () => {
    // Ensure members.data is a valid array
    if (!members?.data || !Array.isArray(members.data)) {
      return null; // or some fallback UI
    }

    return (
      <Flex direction={"column"} mt={"10"} p={"4"}>
        <Flex pl={"4"}>
          <Button
            size={"xs"}
            bg={"brand.light"}
            _hover={{ bg: "brand.dark", color: "white" }}
            onClick={handleAddMemberClick}
          >
            Add Member
          </Button>
        </Flex>

        <TableContainer mt={"4"}>
          <Table variant="unstyled">
            <Thead>
              <Tr>
                <Th>First Name</Th>
                <Th>Last Name</Th>
                <Th>Email</Th>
                <Th>Phone Number</Th>
                <Th>Role</Th>
              </Tr>
            </Thead>
            <Tbody>
              {addingMember && (
                <Tr fontSize={"sm"}>
                  <Td>
                    <input
                      type="text"
                      placeholder="First Name"
                      onChange={(e) => handleInputChange(e, "first_name")}
                    />
                  </Td>
                  <Td>
                    <input
                      type="text"
                      placeholder="Last Name"
                      onChange={(e) => handleInputChange(e, "last_name")}
                    />
                  </Td>
                  <Td>
                    <input
                      type="email"
                      placeholder="Email"
                      onChange={(e) => handleInputChange(e, "email")}
                    />
                  </Td>
                  <Td>
                    <input
                      type="text"
                      placeholder="Phone Number"
                      onChange={(e) => handleInputChange(e, "phone")}
                    />
                  </Td>
                  <Td>
                    <input
                      type="text"
                      placeholder="Role"
                      onChange={(e) => handleInputChange(e, "role")}
                    />
                  </Td>
                  <Td>
                    <Icon
                      as={FiSave}
                      onClick={handleSaveMember}
                      mr={"4"}
                      cursor={"pointer"}
                    />
                    <Icon
                      as={IoIosCloseCircleOutline}
                      onClick={handleAddMemberClick}
                      cursor={"pointer"}
                    />
                  </Td>
                </Tr>
              )}
              {members?.data.map((member: MemberEntity) => (
                <Tr key={member.id} fontSize={"sm"}>
                  <Td>{member.first_name}</Td>
                  <Td>{member.last_name}</Td>
                  <Td>{member.email}</Td>
                  <Td>{member.phone}</Td>
                  <Td>{member.role}</Td>
                  <Td>
                    <Flex>
                      <Flex mr={"4"} cursor={"pointer"}>
                        <FiEdit />
                      </Flex>
                      <Flex cursor={"pointer"}>
                        <MdOutlineDeleteOutline />
                      </Flex>
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Flex>
    );
  };

  // console.log("projects", projects);

  return (
    <Flex direction={"column"} w={"100%"} p={"10"}>
      <Flex
        direction={"column"}
        // alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Flex direction={"column"}>
          <Menu>
            <MenuButton>
              <Flex alignItems={"center"} fontSize={"2xl"} fontWeight={"black"}>
                <Text mr={"2"}>
                  {activeProject?.name ? activeProject.name : "Select Project"}
                </Text>
                <Icon as={IoChevronDownOutline} />
              </Flex>
            </MenuButton>
            <MenuList>
              <MenuItem>+ Create new project</MenuItem>
              <MenuDivider borderColor={"gray.500"} />
              {isLoading && <Heading color="white">Loading...</Heading>}
              {!isLoading &&
                projects &&
                projects.map((project: ProjectEntity) => (
                  <>
                    <MenuItem
                      onClick={() => setActiveProject(project)}
                      as={"b"}
                    >
                      {project.name}
                    </MenuItem>
                  </>
                ))}
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
      {activeProject ? (
        <>
          <Flex
            direction={"column"}
            // alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Flex
              className="menu"
              w={"450px"}
              justifyContent={"space-between"}
              mt={"6"}
            >
              <Button
                bg={settingsView === "folders" ? "brand.accent" : "brand.light"}
                _hover={{ bg: "brand.dark", color: "white" }}
                onClick={() => setSettingsView("folders")}
              >
                Folders and Files
              </Button>
              <Button
                bg={settingsView === "members" ? "brand.accent" : "brand.light"}
                _hover={{ bg: "brand.dark", color: "white" }}
                onClick={() => setSettingsView("members")}
              >
                Members
              </Button>
              <Button
                bg={
                  settingsView === "resources" ? "brand.accent" : "brand.light"
                }
                _hover={{ bg: "brand.dark", color: "white" }}
                onClick={() => setSettingsView("resources")}
              >
                Resources
              </Button>
            </Flex>
          </Flex>
          {settingsView === "folders" && folderAndFIles()}
          {settingsView === "members" && projectMembers()}
        </>
      ) : (
        <>
          <Flex
            fontSize={"3xl"}
            fontWeight={"black"}
            color={"brand.mid"}
            justifyContent={"center"}
            alignItems={"center"}
            h={"100%"}
          >
            {" "}
            Select or create a project at the top left corner
          </Flex>
        </>
      )}
    </Flex>
  );
}

export default ProjectSetup;
