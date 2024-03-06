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
import FileHandler from "./FileHandler";
import CSVUploader from "@/components/Schedule/CSVUpload/CSVUploader";
import { MemberEntity } from "@/types/members";
import { FiEdit, FiSave } from "react-icons/fi";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { IoIosCloseCircleOutline } from "react-icons/io";
import ProjectChats from "@/components/ProjectChats/ProjectChats";
import { usePhoneRegistration } from "@/components/PhoneRegistration/usePhoneRegistration";

function ProjectSetup({ settingView }: { settingView?: string }) {
  const { activeProject, appView, setAppView } = useStore((state) => ({
    activeProject: state.activeProject,
    appView: state.appView,
    setAppView: state.setAppView,
  }));
  const [settingsView, setSettingsView] = useState<string>("folders");

  const {
    registerPhoneNumber,
    deleteMember,
    members,
    handleSaveMember,
    handleInputChange,
    handleMemberEdit,
    addingMember,
    setAddingMember,
    editMember,
    newMember,
    setEditMember,
    updatememberDetails,
  } = usePhoneRegistration();

  const handleAddMemberClick = () => {
    setAddingMember(!addingMember);
  };

  const folderAndFIles = () => {
    return (
      <Grid templateColumns="repeat(2, 1fr)" gap={"24"} mt={"8"}>
        <GridItem colSpan={1}>
          <Flex direction={"column"}>
            <Text fontSize={"14px"} as={"b"} mb={"4"}></Text>
            <FileHandler />
          </Flex>
        </GridItem>
        <GridItem colSpan={1}>
          <Flex direction={"column"}>
            <Text fontSize={"14px"} as={"b"} mb={"4"}>
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
      <Flex direction={"column"} pt={"4"} overflow={"auto"}>
        <Flex>
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
                <Th>Enroll IN SMS</Th>
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
                      value={newMember.first_name}
                      onChange={(e) => handleInputChange(e, "first_name")}
                    />
                  </Td>
                  <Td>
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={newMember.last_name}
                      onChange={(e) => handleInputChange(e, "last_name")}
                    />
                  </Td>
                  <Td>
                    <input
                      type="email"
                      placeholder="Email"
                      value={newMember.email}
                      onChange={(e) => handleInputChange(e, "email")}
                    />
                  </Td>
                  <Td>
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={newMember.phone}
                      onChange={(e) => handleInputChange(e, "phone")}
                    />
                  </Td>
                  <Td>
                    <input
                      type="checkbox"
                      checked={newMember.enable_sms}
                      onChange={(e) => handleInputChange(e, "enable_sms")}
                    />
                  </Td>
                  <Td>
                    <input
                      type="text"
                      placeholder="Role"
                      value={newMember.role}
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
                  {editMember?.id !== member.id && (
                    <>
                      <Td>{member.first_name}</Td>
                      <Td>{member.last_name}</Td>
                      <Td>{member.email}</Td>
                      <Td>{member.phone}</Td>
                      <Td>
                        {!member.phone && <b>Add phone number to enroll</b>}
                        {member.phone && (
                          <input
                            type="checkbox"
                            checked={
                              !!member?.phone_registration?.[0]?.phone_number ??
                              false
                            }
                            onChange={(e) =>
                              registerPhoneNumber(e, member.phone)
                            }
                          ></input>
                        )}
                      </Td>
                      <Td>{member.role}</Td>
                      <Td>
                        <Flex>
                          <Flex
                            mr={"4"}
                            cursor={"pointer"}
                            onClick={() => {
                              const { phone_registration, ...otherProps } =
                                member;
                              setEditMember({
                                ...otherProps,
                              });
                            }}
                          >
                            <FiEdit />
                          </Flex>
                          <Flex
                            cursor={"pointer"}
                            onClick={() => deleteMember(member.email)}
                          >
                            <MdOutlineDeleteOutline />
                          </Flex>
                        </Flex>
                      </Td>
                    </>
                  )}

                  {editMember?.id === member.id && (
                    <>
                      <Td>
                        <input
                          type="text"
                          placeholder="First Name"
                          value={editMember.first_name}
                          onChange={(e) => handleMemberEdit(e, "first_name")}
                        />
                      </Td>
                      <Td>
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={editMember.last_name}
                          onChange={(e) => handleMemberEdit(e, "last_name")}
                        />
                      </Td>
                      <Td>
                        <input
                          type="email"
                          placeholder="Email"
                          value={editMember.email}
                          onChange={(e) => handleMemberEdit(e, "email")}
                        />
                      </Td>
                      <Td>
                        <input
                          type="text"
                          placeholder="Phone Number"
                          value={editMember.phone}
                          onChange={(e) => handleMemberEdit(e, "phone")}
                        />
                      </Td>

                      <Td>
                        <input
                          type="checkbox"
                          checked={editMember.enable_sms}
                          onChange={(e) => handleMemberEdit(e, "enable_sms")}
                        />
                      </Td>
                      <Td>
                        <input
                          type="text"
                          placeholder="Role"
                          value={editMember.role}
                          onChange={(e) => handleMemberEdit(e, "role")}
                        />
                      </Td>
                      <Td>
                        <Icon
                          as={FiSave}
                          onClick={updatememberDetails}
                          mr={"4"}
                          cursor={"pointer"}
                        />
                        <Icon
                          as={IoIosCloseCircleOutline}
                          onClick={() => {
                            setAddingMember(false);
                            setEditMember(null);
                          }}
                          cursor={"pointer"}
                        />
                      </Td>
                    </>
                  )}
                  {/* <>{editMember && editMember.email}</> */}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Flex>
    );
  };

  return (
    <Flex
      direction={"column"}
      w={"100%"}
      bg={"brand.background"}
      h="full"
      rounded={"xl"}
      p={"4"}
    >
      {activeProject ? (
        <Flex direction={"column"}>
          <Flex direction={"column"} justifyContent={"space-between"}>
            <Flex className="menu" gap="4"></Flex>
          </Flex>
          <Flex>
            {appView === "folders" && folderAndFIles()}
            {appView === "members" && projectMembers()}
          </Flex>
          {/* //{setting === "chats" && <ProjectChats />} */}
        </Flex>
      ) : (
        <Flex
          fontSize={"3xl"}
          fontWeight={"black"}
          color={"brand.mid"}
          justifyContent={"center"}
          alignItems={"center"}
          h={"100%"}
        >
          Select or create a project at the top left corner
        </Flex>
      )}
    </Flex>
  );
}

export default ProjectSetup;
