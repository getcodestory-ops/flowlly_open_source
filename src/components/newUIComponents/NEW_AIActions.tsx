import React, { useEffect } from "react";
import {
  Flex,
  Grid,
  GridItem,
  Select,
  SelectField,
  Input,
  Icon,
  Button,
  Tooltip,
} from "@chakra-ui/react";
import { BsSend } from "react-icons/bs";
import { useStore } from "@/utils/store";
import {
  TbLayoutSidebarLeftExpand,
  TbLayoutSidebarRightExpand,
} from "react-icons/tb";
import { PiRobot } from "react-icons/pi";
import PdfLoader from "../PdfLoader";
import { getBrains } from "@/api/brainRoutes";

function AiActions() {
  const { AiActionsView, setAiActionsView, sessionToken } = useStore(
    (state) => ({
      AiActionsView: state.AiActionsView,
      setAiActionsView: state.setAiActionsView,
      sessionToken: state.session,
    })
  );

  //TEMP DELETE AFTER TESTING
  useEffect(() => {
    const fetchFolderLists = async () => {
      if (!sessionToken) return;
      const brains = await getBrains(sessionToken);
      // setFolderList(brains || null);
      console.log("brains", brains);
    };

    fetchFolderLists();
  }, [sessionToken]);
  useEffect(() => {
    console.log("session token", sessionToken);
  }, [sessionToken]);

  return (
    <>
      {AiActionsView === "open" && (
        <Grid
          h={"full"}
          templateRows="repeat(7, 1fr)"
          bgGradient="linear(brand.gray 5%, white 30% )"
          rounded={"2xl"}
          boxShadow={"lg"}
        >
          <GridItem rowSpan={1} pt={"4"} px={"4"}>
            <Flex direction={"column"} h={"full"} justifyContent={"flex-end"}>
              <Flex
                alignItems={"center"}
                mb={"2"}
                justifyContent={"space-between"}
              >
                <Flex fontSize={"22px"} fontWeight={"bold"}>
                  AI Actions
                </Flex>
                <Flex>
                  <Button
                    bg={"white"}
                    boxShadow={"md"}
                    p={0}
                    size={"sm"}
                    onClick={() => setAiActionsView("expand")}
                    rounded={"full"}
                    _hover={{ bg: "brand.dark", color: "white" }}
                  >
                    <Icon
                      as={TbLayoutSidebarRightExpand}
                      fontWeight={"light"}
                    />
                  </Button>
                  <Tooltip
                    label="Collapse"
                    aria-label="A tooltip"
                    bg="white"
                    color="brand.dark"
                  >
                    <Button
                      bg={"white"}
                      boxShadow={"md"}
                      p={0}
                      size={"sm"}
                      onClick={() => setAiActionsView("close")}
                      rounded={"full"}
                      _hover={{ bg: "brand.dark", color: "white" }}
                    >
                      <Icon
                        as={TbLayoutSidebarLeftExpand}
                        // fontSize={"20px"}
                        fontWeight={"light"}
                      />
                    </Button>
                  </Tooltip>
                </Flex>
              </Flex>
              <Flex>
                <Select
                  mr={"2"}
                  size={"sm"}
                  bg={"white"}
                  border={"white"}
                  rounded={"lg"}
                  className="custom-selector"
                >
                  <option value="search">Search</option>
                  <option value="analyze">Analyze Document</option>
                  <option value="email">Draft Email</option>
                </Select>
                <Select
                  size={"sm"}
                  bg={"white"}
                  border={"white"}
                  rounded={"lg"}
                  placeholder="Folder or File"
                  className="custom-selector"
                >
                  <option value="option1">Option 1</option>
                </Select>
              </Flex>
            </Flex>
          </GridItem>
          <GridItem rowSpan={5} />
          <GridItem
            rowSpan={1}
            display="flex"
            flexDirection="column"
            justifyContent="end"
            pb={"2"}
            px={"2"}
          >
            <Flex
              alignItems={"center"}
              bg={"brand.background"}
              p={"2"}
              rounded={"xl"}
            >
              <Input
                size={"sm"}
                border={"white"}
                rounded={"lg"}
                placeholder={"Flowlly help me ..."}
                className="custom-selector"
              ></Input>

              <Button
                rounded={"full"}
                bg={"white"}
                _hover={{ bg: "brand.dark", color: "white" }}
              >
                <Icon as={BsSend} fontSize={"22px"}></Icon>
              </Button>
            </Flex>
          </GridItem>
        </Grid>
      )}
      {AiActionsView === "close" && (
        <Flex
          h={"full"}
          bgGradient="linear(brand.gray 5%, white 30% )"
          rounded={"2xl"}
          boxShadow={"lg"}
          justifyContent={"center"}
          alignItems={"center"}
          pt={"2"}
        >
          <Tooltip
            label="Expand"
            aria-label="A tooltip"
            bg="white"
            color="brand.dark"
          >
            <Button
              bg={"white"}
              boxShadow={"md"}
              p={0}
              size={"lg"}
              rounded={"full"}
              _hover={{ bg: "brand.dark", color: "white" }}
              onClick={() => setAiActionsView("open")}
            >
              <Icon as={PiRobot} />
            </Button>
          </Tooltip>
        </Flex>
      )}
      {AiActionsView === "expand" && (
        <Grid h={"full"} templateColumns="repeat(14,1fr)" gap={"4"}>
          <GridItem
            colSpan={10}
            bgGradient="linear(brand.gray 5%, white 30% )"
            rounded={"2xl"}
            boxShadow={"lg"}
            w={"full"}
            h={"full"}
            p={"4"}
          >
            {" "}
            <Flex direction={"column"} h="full">
              <Flex mb={"2"}>
                <Tooltip
                  label="Collapse"
                  aria-label="A tooltip"
                  bg="white"
                  color="brand.dark"
                >
                  <Button
                    bg={"white"}
                    boxShadow={"md"}
                    p={0}
                    size={"sm"}
                    onClick={() => setAiActionsView("open")}
                    rounded={"full"}
                    _hover={{ bg: "brand.dark", color: "white" }}
                  >
                    <Icon
                      as={TbLayoutSidebarLeftExpand}
                      // fontSize={"20px"}
                      fontWeight={"light"}
                    />
                  </Button>
                </Tooltip>
              </Flex>
              <Flex h="full">
                <PdfLoader />
              </Flex>
            </Flex>
          </GridItem>
          <GridItem colSpan={4}>
            <Grid
              h={"full"}
              templateRows="repeat(7, 1fr)"
              bgGradient="linear(brand.gray 5%, white 30% )"
              rounded={"2xl"}
              boxShadow={"lg"}
            >
              <GridItem rowSpan={1} pt={"4"} px={"4"}>
                <Flex
                  direction={"column"}
                  h={"full"}
                  justifyContent={"flex-end"}
                >
                  <Flex>
                    <Flex fontSize={"22px"} fontWeight={"bold"} mb={"2"}>
                      AI Actions
                    </Flex>
                  </Flex>
                  <Flex>
                    <Select
                      mr={"2"}
                      size={"sm"}
                      bg={"white"}
                      border={"white"}
                      rounded={"lg"}
                      className="custom-selector"
                    >
                      <option value="search">Search</option>
                      <option value="analyze">Analyze Document</option>
                      <option value="email">Draft Email</option>
                      <option value="report">Create Report</option>
                    </Select>
                    <Select
                      size={"sm"}
                      bg={"white"}
                      border={"white"}
                      rounded={"lg"}
                      placeholder="Folder or File"
                      className="custom-selector"
                    >
                      <option value="option1">Option 1</option>
                    </Select>
                  </Flex>
                </Flex>
              </GridItem>
              <GridItem rowSpan={5} />
              <GridItem
                rowSpan={1}
                display="flex"
                flexDirection="column"
                justifyContent="end"
                pb={"2"}
                px={"2"}
              >
                <Flex
                  alignItems={"center"}
                  bg={"brand.background"}
                  p={"2"}
                  rounded={"xl"}
                >
                  <Input
                    size={"sm"}
                    border={"white"}
                    rounded={"lg"}
                    placeholder="Flowlly help me ..."
                    className="custom-selector"
                  ></Input>

                  <Button
                    rounded={"full"}
                    bg={"white"}
                    _hover={{ bg: "brand.dark", color: "white" }}
                  >
                    <Icon as={BsSend} fontSize={"22px"}></Icon>
                  </Button>
                </Flex>
              </GridItem>
            </Grid>
          </GridItem>
        </Grid>
      )}
    </>
  );
}

export default AiActions;
