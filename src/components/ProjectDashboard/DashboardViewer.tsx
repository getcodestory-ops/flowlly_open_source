import React from "react";
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardHeader,
  CardBody,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
} from "@chakra-ui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useStore } from "@/utils/store";
import MarkDownDisplay from "../Markdown/MarkDownDisplay";

type DashboardArtifact = {
  identifier: string;
  type: "table" | "text" | "bar_chart";
  title: string;
  data: string;
  summary: string;
};

type DashboardProps = {
  input: string;
};

const parseInputString = (input: string): DashboardArtifact[] => {
  const artifacts: DashboardArtifact[] = [];
  const regex = /<dashboard_artifact[\s\S]*?<\/dashboard_artifact>/g;
  const matches = input.match(regex);

  if (matches) {
    matches.forEach((match) => {
      try {
        const identifierMatch = match.match(/identifier="([^"]*)"/) ?? ["", ""];
        const typeMatch = match.match(/type="([^"]*)"/) ?? ["", ""];
        const titleMatch = match.match(/title="([^"]*)"/) ?? ["", ""];
        const summaryMatch = match.match(/<summary>([\s\S]*?)<\/summary>/);

        if (!identifierMatch[1] || !typeMatch[1] || !titleMatch[1]) {
          throw new Error("Missing required fields in dashboard artifact");
        }

        let content: string;
        if (typeMatch[1] === "text") {
          // For text type, extract content between tags excluding summary
          const fullContent = match
            .replace(/<dashboard_artifact[\s\S]*?>/, "")
            .replace(/<\/dashboard_artifact>/, "")
            .trim();
          content = summaryMatch
            ? fullContent.replace(summaryMatch[0], "").trim()
            : fullContent;
        } else {
          // For other types, use the existing data extraction
          const dataMatch = match.match(/<data>([\s\S]*?)<\/data>/);
          content = dataMatch ? dataMatch[1].trim() : "";
        }

        artifacts.push({
          identifier: identifierMatch[1],
          type: typeMatch[1] as "table" | "text" | "bar_chart",
          title: titleMatch[1],
          data: content,
          summary: summaryMatch ? summaryMatch[1].trim() : "",
        });
      } catch (error) {
        console.error("Error parsing dashboard artifact:", error);
      }
    });
  }

  return artifacts;
};

const TableContent: React.FC<{ data: string }> = ({ data }) => {
  const rows = data.split("\n").map((row) => row.split("|"));
  return (
    <Table variant="simple" size="sm">
      <Thead>
        <Tr>
          {rows[0].map((header, index) => (
            <Th key={index}>{header}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {rows.slice(1).map((row, rowIndex) => (
          <Tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <Td key={cellIndex}>{cell}</Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

const TextContent: React.FC<{ content: string }> = ({ content }) => (
  // <Text whiteSpace="pre-wrap">{content}</Text>
  <MarkDownDisplay content={content} />
);

const BarChartContent: React.FC<{ data: string }> = ({ data }) => {
  try {
    // Remove any leading/trailing whitespace and parse the JSON string
    data = `{ "datasets": ${data.trim()} }`;
    const parsedData = JSON.parse(data);

    // if (
    //   !parsedData.datasets ||
    //   !parsedData.labels ||
    //   !Array.isArray(parsedData.datasets) ||
    //   parsedData.datasets.length === 0
    // ) {
    //   throw new Error("Invalid chart data format");
    // }

    // const chartData = parsedData.datasets[0].data.map(
    //   (value: number, index: number) => ({
    //     name: parsedData.labels[index],
    //     value,
    //   })
    // );

    return (
      <Box h="300px" w="100%">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={parsedData.datasets}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3182CE" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    );
  } catch (error) {
    console.error("Error parsing chart data:", error);
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle mr={2}>Chart Error</AlertTitle>
        <AlertDescription>
          Unable to parse chart data. Please check the data format..
        </AlertDescription>
      </Alert>
    );
  }
};

const DashboardArtifactCard: React.FC<{ artifact: DashboardArtifact }> = ({
  artifact,
}) => (
  <Card mb={6}>
    <CardHeader>
      <Heading size="md">{artifact.title}</Heading>
    </CardHeader>
    <CardBody>
      {artifact.type === "table" && <TableContent data={artifact.data} />}
      {artifact.type === "text" && <TextContent content={artifact.data} />}
      {artifact.type === "bar_chart" && (
        <BarChartContent data={artifact.data} />
      )}
      <Text mt={4} fontSize="sm" color="gray.500">
        <strong>Summary:</strong> {artifact.summary}
      </Text>
    </CardBody>
  </Card>
);

const WeatherForecast: React.FC<{}> = ({}) => {
  const activeProject = useStore((state) => state.activeProject);

  const url = `https://www.meteoblue.com/en/weather/widget/daily/${
    activeProject?.metadata?.latitude ?? 43.71
  }N${activeProject?.metadata?.longitude ?? 79.4}E?layout=light`;

  // add card with iframe <iframe src="https://cdnres.willyweather.com/widget/loadView.html?id=87637" width="100%" height="228" frameborder="0" scrolling="no"></iframe>
  return (
    <Card>
      <CardHeader>
        <Heading size="sm">
          Weather Forecast <br />
          {activeProject?.address ?? ""}
        </Heading>
      </CardHeader>
      <CardBody mx="auto">
        <Flex>
          <iframe scrolling="NO" src={url} width="100%" height="400"></iframe>
        </Flex>
        <Box h="full" w="full" position="absolute" top={0}></Box>
      </CardBody>
    </Card>
  );
};

const DashboardXMLViewer: React.FC<DashboardProps> = ({ input }) => {
  const artifacts = parseInputString(input);

  if (artifacts.length === 0) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <AlertTitle mr={2}>No Data</AlertTitle>
        <AlertDescription>
          No valid dashboard artifacts found in the input.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Box margin="auto" p={8}>
      <Heading as="h1" size="xl" mb={6}>
        Construction Project Dashboard
      </Heading>
      <VStack spacing={6} align="stretch">
        <WeatherForecast />
        {artifacts.map((artifact) => (
          <DashboardArtifactCard
            key={artifact.identifier}
            artifact={artifact}
          />
        ))}
      </VStack>
    </Box>
  );
};

export default DashboardXMLViewer;
