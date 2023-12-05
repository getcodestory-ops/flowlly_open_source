import React, { useEffect } from "react";
import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import dynamic from "next/dynamic";
const Chart = dynamic(
  () => import("react-apexcharts").then((mod) => mod.default),
  {
    ssr: false,
  }
);
import { BiSolidCircle } from "react-icons/bi";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import TopBar from "@/components/TopBar";
import { useStore } from "@/utils/store";
import GraphSection from "@/components/ProjectDashboard/GraphsSection";
import RSSsection from "@/components/ProjectDashboard/RSSsection";

function ProjectDashboard() {
  const {
    session,
    activeProject,
    setActiveProject,
    activeChatEntity,
    setActiveChatEntity,
    userActivities,
  } = useStore((state) => ({
    session: state.session,
    activeProject: state.activeProject,
    setActiveProject: state.setActiveProject,
    activeChatEntity: state.activeChatEntity,
    setActiveChatEntity: state.setActiveChatEntity,
    userActivities: state.userActivities,
  }));

  // const options = {
  //   chart: {
  //     id: "apexchart-example",
  //     zoom: {
  //       enabled: false,
  //     },
  //   },
  //   xaxis: {
  //     categories: [
  //       "J-23",
  //       "F-23",
  //       "M-23",
  //       "A-23",
  //       "M-23",
  //       "J-23",
  //       "J-23",
  //       "A-23",
  //       "S-23",
  //       "O-23",
  //       "N-23",
  //       "D-23",
  //       "J-24",
  //       "F-24",
  //     ],
  //   },
  //   forecastDataPoints: {
  //     count: 7,
  //   },
  //   tickAmount: 6,
  // };

  // const series = [
  //   {
  //     name: "Expected",
  //     data: [
  //       8.3, 16.6, 24.9, 33.2, 41.5, 49.8, 58.1, 66.4, 74.7, 83, 91.3, 100,
  //     ],
  //   },
  //   {
  //     name: "Actual",
  //     data: [5, 10, 24, 30, 37, 40, 55, 60, 65, 72, 85, 93, 100],
  //   },
  // ];

  // const options4 = {
  //   chart: {
  //     id: "apexchart-example",
  //     zoom: {
  //       enabled: false,
  //     },
  //   },
  //   xaxis: {
  //     categories: [
  //       "J-23",
  //       "F-23",
  //       "M-23",
  //       "A-23",
  //       "M-23",
  //       "J-23",
  //       "J-23",
  //       "A-23",
  //       "S-23",
  //       "O-23",
  //       "N-23",
  //       "D-23",
  //     ],
  //   },
  //   forecastDataPoints: {
  //     count: 7,
  //   },
  // };

  // const series4 = [
  //   {
  //     name: "Original Estimation",
  //     data: [300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300],
  //   },
  //   {
  //     name: "Current Estimation",
  //     data: [300, 310, 300, 290, 340, 340, 340, 340, 340, 340, 340, 340],
  //   },
  // ];
  // const options2 = {
  //   chart: {
  //     id: "apexchart-example",
  //     zoom: {
  //       enabled: false,
  //     },
  //   },
  //   xaxis: {
  //     categories: [
  //       "J-23",
  //       "F-23",
  //       "M-23",
  //       "A-23",
  //       "M-23",
  //       "J-23",
  //       "J-23",
  //       "A-23",
  //       "S-23",
  //       "O-23",
  //       "N-23",
  //       "D-23",
  //       "J-24",
  //       "F-24",
  //     ],
  //   },

  //   tickAmount: 6,
  //   yaxis: {
  //     min: 0,
  //     max: 100,
  //   },
  //   fill: {
  //     type: "gradient",
  //     gradient: {
  //       opacityFrom: 0.6,
  //       opacityTo: 0.8,
  //     },
  //   },
  // };

  // const series2 = [
  //   {
  //     name: "Delay Risk (%)",
  //     data: [0, 0, 5, 2, 40, 35, 15, 20],
  //   },
  // ];

  // const options3 = {
  //   chart: {
  //     id: "apexchart-example",
  //     zoom: {
  //       enabled: false,
  //     },
  //   },
  //   xaxis: {
  //     categories: [
  //       "J-23",
  //       "F-23",
  //       "M-23",
  //       "A-23",
  //       "M-23",
  //       "J-23",
  //       "J-23",
  //       "A-23",
  //       "S-23",
  //       "O-23",
  //       "N-23",
  //       "D-23",
  //     ],
  //   },
  // };

  // const series3 = [
  //   {
  //     name: "Expected",
  //     data: [10, 12, 5, 24, 18, 6, 11, 8, 16, 6, 11, 15],
  //   },
  //   {
  //     name: "Actual",
  //     data: [4, 16, 5, 8, 16, 35, 15],
  //   },
  // ];

  useEffect(() => {
    console.log("user activities", userActivities);
  }, [userActivities]);

  return (
    <Flex direction={"column"} maxWidth={"1366px"} w={"100%"}>
      {activeProject?.name ? (
        <Flex direction={"column"} pl={"10"} pt={"2"}>
          <Flex direction={"column"} width={"full"} mb={"3"}>
            <Flex direction={"column"}>
              <Flex
                direction={"row"}
                fontSize={"md"}
                mt={"2"}
                alignItems={"center"}
                mb={"4"}
                color={"#FFA840"}
              >
                <Icon as={BiSolidCircle} mr={"2"} />
                <Text as={"b"}>At Risk</Text>
              </Flex>
            </Flex>
          </Flex>
          <Flex mb={"4"} h={"63%"}>
            <Flex w={"65%"}>
              <GraphSection />
            </Flex>
            <Flex minW={"35%"}>
              <RSSsection />
            </Flex>
            {/* <Flex
              borderColor={"brand.light"}
              bg={"brand.light"}
              rounded={"md"}
              p={"4"}
              direction={"column"}
              mt={"6"}
              mr={"6"}
            >
              <Text fontSize={"sm"} as={"b"} mb={"2"}>
                Progress
              </Text>
              <Flex>
                <Flex direction={"column"} mr={"5"} p={"2"}>
                  <Text as={"i"} fontSize={"2xs"}>
                    Actual
                  </Text>
                  <Flex alignItems={"center"}>
                    <Text as={"b"} fontSize={"lg"}>
                      40%
                    </Text>
                    <Flex
                      ml={"3"}
                      color={"red.400"}
                      alignItems={"center"}
                      fontSize={"sm"}
                    >
                      <Flex bg={"red.100"} p={"1"} rounded={"full"} mr={"1"}>
                        <Icon as={FaArrowDown} size={"md"} />
                      </Flex>
                      <Text as={"b"} mr={"1"}>
                        10%
                      </Text>
                      <Text color={"brand.mid"} fontSize={"2xs"}>
                        compared to expected
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
              <Flex justifyContent={"center"}>
                <Chart
                  options={options}
                  series={series}
                  type="line"
                  width={500}
                  height={320}
                />
              </Flex>
            </Flex>
            <Flex
              borderColor={"brand.light"}
              bg={"brand.light"}
              rounded={"md"}
              p={"4"}
              direction={"column"}
              mt={"6"}
              mr={"6"}
            >
              <Text fontSize={"sm"} as={"b"} mb={"2"}>
                Project Duration
              </Text>
              <Flex>
                <Flex direction={"column"} mr={"5"} p={"2"}>
                  <Text as={"i"} fontSize={"2xs"}>
                    Actual
                  </Text>
                  <Flex alignItems={"center"}>
                    <Text as={"b"} fontSize={"lg"}>
                      340 days
                    </Text>
                    <Flex
                      ml={"3"}
                      color={"red.400"}
                      alignItems={"center"}
                      fontSize={"sm"}
                    >
                      <Flex bg={"red.100"} p={"1"} rounded={"full"} mr={"1"}>
                        <Icon as={FaArrowUp} size={"md"} />
                      </Flex>
                      <Text as={"b"} mr={"1"}>
                        40 days
                      </Text>
                      <Text color={"brand.mid"} fontSize={"2xs"}>
                        compared to original estimate
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
              <Flex justifyContent={"center"}>
                <Chart
                  options={options4}
                  series={series4}
                  type="line"
                  width={500}
                  height={320}
                />
              </Flex>
            </Flex>
            <Flex
              borderColor={"brand.light"}
              bg={"brand.light"}
              rounded={"md"}
              p={"4"}
              direction={"column"}
              mt={"6"}
              mr={"6"}
            >
              <Text fontSize={"sm"} as={"b"} mb={"2"}>
                Project Delay Risk
              </Text>
              <Flex>
                <Flex direction={"column"} mr={"5"} p={"2"}>
                  <Text as={"i"} fontSize={"2xs"}>
                    Current
                  </Text>
                  <Flex alignItems={"center"}>
                    <Text as={"b"} fontSize={"lg"}>
                      20%
                    </Text>
                    <Flex
                      ml={"3"}
                      color={"red.400"}
                      alignItems={"center"}
                      fontSize={"sm"}
                    >
                      <Flex bg={"red.100"} p={"1"} rounded={"full"} mr={"1"}>
                        <Icon as={FaArrowUp} size={"md"} />
                      </Flex>
                      <Text as={"b"} mr={"1"}>
                        5%
                      </Text>
                      <Text color={"brand.mid"} fontSize={"2xs"}>
                        compared to last month
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
              <Flex justifyContent={"center"}>
                <Chart
                  options={options2}
                  series={series2}
                  type="area"
                  width={500}
                  height={320}
                />
              </Flex>
            </Flex>
            <Flex
              borderColor={"brand.light"}
              bg={"brand.light"}
              rounded={"md"}
              p={"4"}
              direction={"column"}
              mt={"6"}
            >
              <Text fontSize={"sm"} as={"b"} mb={"2"}>
                Expenses
              </Text>
              <Flex>
                <Flex direction={"column"} mr={"5"} p={"2"}>
                  <Text as={"i"} fontSize={"2xs"}>
                    Total to Date
                  </Text>
                  <Flex alignItems={"center"}>
                    <Text as={"b"} fontSize={"lg"}>
                      $3,576,289.00
                    </Text>
                    <Flex
                      ml={"3"}
                      color={"green.400"}
                      alignItems={"center"}
                      fontSize={"sm"}
                    >
                      <Flex bg={"green.100"} p={"1"} rounded={"full"} mr={"1"}>
                        <Icon as={FaArrowDown} size={"md"} />
                      </Flex>
                      <Text as={"b"} mr={"1"}>
                        15%
                      </Text>
                      <Text color={"brand.mid"} fontSize={"2xs"}>
                        compared to total expected to date
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
              <Flex justifyContent={"center"}>
                <Chart
                  options={options3}
                  series={series3}
                  type="bar"
                  width={500}
                  height={320}
                />
              </Flex>
            </Flex> */}
          </Flex>
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
          {" "}
          Select a project at the top left corner
        </Flex>
      )}
    </Flex>
  );
}

export default ProjectDashboard;
