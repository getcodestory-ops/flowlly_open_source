import React from "react";
import {
  Flex,
  Icon,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { FaChevronDown } from "react-icons/fa";
import { useStore } from "@/utils/store";
import { FaRegBuilding } from "react-icons/fa";
import MediaRecorderButton from "../ChatInput/MediaRecorderButton";
import { FaCheck } from "react-icons/fa6";
import NotificationButton from "../Notifications/NotificationButton";

import { Archivo_Black } from "next/font/google";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Search } from "@/components/ProjectDashboard/components/Search";
import ProjectSwitcher from "@/components/ProjectDashboard/components/ProjectSwitcher";
import { UserNav } from "@/components/ProjectDashboard/components/UserNav";

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
});

function ProjectInfoDisplay() {
  const { userProjects, activeProject, setActiveProject } = useStore(
    (state) => ({
      userProjects: state.userProjects,
      activeProject: state.activeProject,
      setActiveProject: state.setActiveProject,
    })
  );

  return (
    <div className="flex flex-col w-full bg-white">
      {/* <Flex justifyContent="space-between" gap="8" w="full">
        <div className="flex color-white text-white gap-4">
          <Flex w="150px">
            <Image
              src="https://upthcaewktgrqjieqiya.supabase.co/storage/v1/object/public/images/logo_full.svg"
              alt="logo"
              w="100px"
            />
          </Flex>
          <Flex gap="2" justifyContent={"center"} alignItems={"center"}>
            <Flex fontSize="sm">
              <Icon as={FaRegBuilding} boxSize={"4"} />
            </Flex>
            <Flex>
              {userProjects && userProjects.length > 0 && (
                <Menu>
                  <MenuButton fontSize="lg" fontWeight={"bold"}>
                    <Flex alignItems={"center"}>
                      {activeProject?.name ? activeProject.name : "No Project"}
                      <Icon as={FaChevronDown} ml={"3"} boxSize={"4"} />
                    </Flex>
                  </MenuButton>
                  <MenuList
                    maxHeight={"70vh"}
                    overflowY={"auto"}
                    className="custom-scrollbar"
                    color="black"
                    fontSize="sm"
                  >
                    {userProjects.map((project, index) => (
                      <MenuItem
                        key={`project-menu-${project.project_id}`}
                        onClick={(e) => {
                          setActiveProject(project);
                        }}
                      >
                        <Flex alignItems={"center"} px="6" py="1" gap="2">
                          {project.project_id === activeProject?.project_id && (
                            <Icon as={FaCheck} ml="-5" color="green.400" />
                          )}
                          {project.name}
                        </Flex>
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              )}
            </Flex>
          </Flex>
          <div className="bg-primary rounded-lg text-black invisible  md:visible">
            <MediaRecorderButton />
          </div>
        </div>

        <Flex mr="8">
          <NotificationButton />
        </Flex>
      </Flex> */}

      <div className="hidden flex-col md:flex">
        <div className="border-b">
          <div className="flex h-16 items-center px-4 gap-4">
            <div className={`${archivoBlack.className} text-2xl`}>FLOWLLY</div>
            <ProjectSwitcher />
            <MediaRecorderButton />

            {/* <MainNav className="mx-6" /> */}
            <div className="ml-auto flex items-center space-x-4">
              <Search />
              <UserNav email={"user.email" ?? ""} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectInfoDisplay;
