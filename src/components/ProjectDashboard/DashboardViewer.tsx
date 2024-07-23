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
        const dataMatch = match.match(/<data>([\s\S]*?)<\/data>/);
        const summaryMatch = match.match(/<summary>([\s\S]*?)<\/summary>/);

        if (
          !identifierMatch[1] ||
          !typeMatch[1] ||
          !titleMatch[1] ||
          !summaryMatch
        ) {
          throw new Error("Missing required fields in dashboard artifact");
        }

        artifacts.push({
          identifier: identifierMatch[1],
          type: typeMatch[1] as "table" | "text" | "bar_chart",
          title: titleMatch[1],
          data: dataMatch ? dataMatch[1].trim() : "",
          summary: summaryMatch[1].trim(),
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
  <Text whiteSpace="pre-wrap">{content}</Text>
);

const BarChartContent: React.FC<{ data: string }> = ({ data }) => {
  try {
    // Remove any leading/trailing whitespace and parse the JSON string
    data = `{ "datasets": ${data.trim()} }`;
    console.log(data);
    const parsedData = JSON.parse(data);
    console.log(data.trim());

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

const WeatherForecast: React.FC<{}> = ({}) => (
  // add card with iframe <iframe src="https://cdnres.willyweather.com/widget/loadView.html?id=87637" width="100%" height="228" frameborder="0" scrolling="no"></iframe>
  <Card>
    <CardHeader>
      <Heading size="md">Weather Forecast</Heading>
    </CardHeader>
    <CardBody>
      {/* <iframe
        src="https://cdnres.willyweather.com/widget/loadView.html?id=87637"
        width="100%"
      ></iframe> */}
      <iframe
        scrolling="NO"
        src="https://www.meteoblue.com/en/weather/widget/daily/toronto_canada_6167865?geoloc=fixed&amp;days=4&amp;tempunit=CELSIUS&amp;windunit=KILOMETER_PER_HOUR&amp;precipunit=MILLIMETER&amp;coloured=coloured&amp;pictoicon=0&amp;pictoicon=1&amp;maxtemperature=0&amp;maxtemperature=1&amp;mintemperature=0&amp;mintemperature=1&amp;windspeed=0&amp;windspeed=1&amp;windgust=0&amp;winddirection=0&amp;winddirection=1&amp;uv=0&amp;humidity=0&amp;precipitation=0&amp;precipitation=1&amp;precipitationprobability=0&amp;precipitationprobability=1&amp;spot=0&amp;spot=1&amp;pressure=0&amp;layout=light"
        width="100%"
        height="356"
      ></iframe>
    </CardBody>
  </Card>
);

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
    <Box maxWidth="container.xl" margin="auto" p={8}>
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

const data = `
<antthinking>This dashboard_artifact for Today's Tasks is worthy as it provides critical information for daily planning and execution. It's a new artifact for the current day.</antthinking>
<dashboard_artifact identifier="todays-tasks" type="table" title="Today's Tasks - 2024-07-23">
<data>
| Task | Priority | Dependencies | Resources Needed 
| Complete Copper Piping at First Floor | High | None | Plumbers, Copper Piping Materials 
| Complete Sheet Metal First Floor Ruf in | High | None | Sheet Metal Workers, Sheet Metal Materials 
| Monitor Fans Equipment Delivery | Medium | None | Project Coordinator 
| Monitor ERVs Equipment Delivery | Medium | None | Project Coordinator 
</data>
<summary>
Today's tasks focus on completing high-priority construction activities, including copper piping and sheet metal work, with no dependencies. Additionally, monitoring ongoing equipment deliveries such as fans and ERVs is essential.
</summary>
</dashboard_artifact>

<antthinking>This dashboard_artifact for Yesterday's Progress provides valuable insights into completed work and challenges faced. It's a new artifact for the previous day's activities.</antthinking>
<dashboard_artifact identifier="yesterdays-progress" type="text" title="Yesterday's Progress - 2024-07-22">
Yesterday, we successfully completed the following tasks:
- Installed 80% of Copper Piping at First Floor
- Completed 90% of Sheet Metal First Floor Ruf in
- Monitored and received ERVs equipment delivery

Achievements:
- Significant progress in copper piping and sheet metal work
- No safety incidents reported

Incomplete tasks:
- Final 20% of Copper Piping (Reason: Material shortage)
- Final 10% of Sheet Metal Ruf in (Reason: Labor shortage)

<summary>
Yesterday saw significant progress in copper piping and sheet metal work, with most tasks nearly completed. The remaining tasks were not finished due to material and labor shortages. The team maintained a good safety record.
</summary>
</dashboard_artifact>

<antthinking>This dashboard_artifact for Current Project Status provides a comprehensive overview of the project's health. It's a new artifact focusing on current performance metrics.</antthinking>
<dashboard_artifact identifier="current-project-status" type="bar_chart" title="Current Project Status - 2024-07-23">
<data>
{[
              { name: "Schedule Adherence", value: 80 },
              { name: "Budget Performance", value: 85 },
              { name: "Quality Metrics", value: 75 },
              { name: "Safety Compliance", value: 90 },
            ]}
</data>
<summary>
The project is currently performing well with 80% schedule adherence and 85% budget performance. Quality metrics are at 75%, indicating areas needing improvement, while safety compliance remains strong at 90%. Continued focus on quality and maintaining current performance levels is recommended.
</summary>
</dashboard_artifact>

<antthinking>This dashboard_artifact for Current and Upcoming Challenges/Risks provides crucial information for risk management. It's a new artifact focusing on immediate concerns.</antthinking>
<dashboard_artifact identifier="current-challenges-risks" type="text" title="Current and Upcoming Challenges/Risks - 2024-07-23">

Material shortage: Copper piping materials running low
Mitigation: Expedite order from supplier, explore alternative materials
Labor shortage: Insufficient sheet metal workers for final task completion
Mitigation: Hire additional workers, consider overtime for current team
Weather forecast: Potential rain in the coming days
Mitigation: Adjust schedule to prioritize indoor tasks, prepare protective coverings
Permit approval delay: Awaiting final approval for next phase of construction
Mitigation: Follow up with local authorities, prepare all required documentation in advance

<summary>
Key challenges include material shortages, labor shortages, potential weather delays, and permit approval delays. Mitigation strategies focus on proactive planning, alternative sourcing, and improved communication with stakeholders.
</summary>
</dashboard_artifact>

<antthinking>This dashboard_artifact for Safety Issues and Concerns is critical to ensure the well-being of all personnel on site. It's a new artifact focusing on safety.</antthinking>
<dashboard_artifact identifier="safety-issues-concerns" type="text" title="Safety Issues and Concerns - 2024-07-23">

No new safety issues or concerns reported. Continue to adhere to safety protocols and conduct regular inspections to maintain a safe working environment.

<summary>
There are no new safety issues or concerns reported. The team should continue adhering to safety protocols and conduct regular inspections to ensure a safe working environment.
</summary>
</dashboard_artifact>

<antthinking>This dashboard_artifact for Resource Allocation and Utilization provides insights into the efficient use of resources. It's a new artifact focusing on resource management.</antthinking>
<dashboard_artifact identifier="resource-allocation-utilization" type="table" title="Resource Allocation and Utilization - 2024-07-23">
<data>
| Resource | Type | Utilization | Status |
| Plumbers | Personnel | High | Fully allocated to copper piping |
| Sheet Metal Workers | Personnel | Low | Insufficient for task completion |
| Project Coordinator | Personnel | Medium | Managing equipment deliveries |
| Copper Piping Materials | Material | Low | Running low, need reorder |
| Sheet Metal Materials | Material | Medium | Sufficient for current tasks |
| Budget | Financial | 85% | On track |

</data>
<summary>
Resource allocation shows high utilization of plumbers and a shortage of sheet metal workers. Copper piping materials are running low, while other materials are sufficient. The budget is on track with 85% performance.
</summary>
</dashboard_artifact>

<antthinking>This dashboard_artifact for Stakeholder Updates is essential for maintaining transparent communication. It's a new artifact focusing on stakeholder communication.</antthinking>
<dashboard_artifact identifier="stakeholder-updates" type="text" title="Stakeholder Updates - 2024-07-23">

No recent correspondences issued. Ensure regular communication with stakeholders to keep them informed about project progress and any issues.

<summary>
There have been no recent correspondences issued. It's important to maintain regular communication with stakeholders to keep them informed about project progress and any issues.
</summary>
</dashboard_artifact>

<antthinking>This dashboard_artifact for Lessons Learned and Improvements is valuable for continuous improvement. It's a new artifact focusing on learnings and enhancements.</antthinking>
<dashboard_artifact identifier="lessons-learned-improvements" type="text" title="Lessons Learned and Improvements - 2024-07-23">

Lessons Learned:
- Ensure adequate material stock to avoid delays
- Plan for sufficient labor resources in advance
- Maintain regular communication with suppliers and stakeholders

Improvements:
- Implement a more robust inventory management system
- Enhance labor scheduling and allocation processes
- Improve communication protocols with all stakeholders

<summary>
Key lessons include the importance of adequate material stock, labor resource planning, and regular communication. Proposed improvements focus on inventory management, labor scheduling, and stakeholder communication.
</summary>
</dashboard_artifact>

<antthinking>This dashboard_artifact for Next Steps and Priorities is crucial for guiding the project's future actions. It's a new artifact focusing on upcoming priorities.</antthinking>
<dashboard_artifact identifier="next-steps-priorities" type="text" title="Next Steps and Priorities - 2024-07-23">

Next Steps:
- Complete remaining copper piping and sheet metal tasks
- Monitor and manage equipment deliveries
- Expedite material orders and hire additional labor

Priorities:
- Address material and labor shortages
- Maintain schedule adherence and budget performance
- Enhance quality metrics through focused efforts

<summary>
The next steps involve completing remaining tasks, managing deliveries, and addressing material and labor shortages. Priorities include maintaining schedule adherence, budget performance, and enhancing quality metrics.
</summary>
</dashboard_artifact>
`;
