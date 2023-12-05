import React from "react";
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
import { useStore } from "@/utils/store";
import { type } from "os";

interface GraphCardProps {
  options: any;
  series: any;
  type: any;
  title: string;
  actualValue?: string;
  valueChange?: string;
  changeType?: string;
  changeImpact?: string;
}

function GraphCard({
  options,
  series,
  type,
  title,
  actualValue,
  valueChange,
  changeType,
  changeImpact,
}: GraphCardProps) {
  return (
    <Flex direction={"row"} flexWrap={"wrap"} mb={"4"}>
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
          {title}
        </Text>
        <Flex>
          {actualValue && (
            <Flex direction={"column"} mr={"5"} p={"2"}>
              <Text as={"i"} fontSize={"2xs"}>
                Actual
              </Text>
              <Flex alignItems={"center"}>
                <Text as={"b"} fontSize={"lg"}>
                  {actualValue}
                </Text>
                <Flex
                  ml={"3"}
                  color={"red.400"}
                  alignItems={"center"}
                  fontSize={"sm"}
                >
                  {changeType === "down" && (
                    <Flex
                      bg={changeImpact === "negative" ? "red.200" : "green.200"}
                      p={"1"}
                      rounded={"full"}
                      mr={"1"}
                    >
                      <Icon as={FaArrowDown} size={"md"} />
                    </Flex>
                  )}
                  {changeType === "up" && (
                    <Flex
                      bg={changeImpact === "negative" ? "red.200" : "green.200"}
                      p={"1"}
                      rounded={"full"}
                      mr={"1"}
                    >
                      <Icon as={FaArrowUp} size={"md"} />
                    </Flex>
                  )}
                  <Text as={"b"} mr={"1"}>
                    {valueChange}
                  </Text>
                  <Text color={"brand.mid"} fontSize={"2xs"}>
                    compared to expected
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          )}
        </Flex>
        <Flex justifyContent={"center"}>
          <Chart
            options={options}
            series={series}
            type={type}
            width={360}
            height={300}
          />
        </Flex>
      </Flex>
    </Flex>
  );
}

export default GraphCard;
