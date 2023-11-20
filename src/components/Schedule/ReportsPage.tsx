import React, { useState } from "react";
import { Flex, Select, Text, Button } from "@chakra-ui/react";
import { createRoot } from "react-dom/client";

const ReportsPage = () => {
  const [reportSelected, setReportSelected] = useState<string>("");
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("");
  const [newReport, setNewReport] = useState<boolean>(false);

  const reports = {
    "option 1": `# John Smith
    **Date:** November 15, 2023
    **Project:** Oakwood Estates
    **Location:** 1234 Elm Street, Anytown, USA
    
    **Daily Progress Report**
    
    **Weather Conditions:**
    - Temperature: 72°F
    - Weather: Partly cloudy with no precipitation
    
    **Project Overview:**
    Today marked significant progress on the excavation phase as planned. The team continued to work diligently to achieve project milestones.
    
    **Accomplishments:**
    - Completed excavation of the foundation area.
    - Poured concrete footings for the main building.
    - Installed temporary fencing around the construction site.
    
    **Challenges:**
    - Equipment breakdown: The excavator experienced a hydraulic fluid leak, causing a 2-hour delay in excavation.
    - Minor soil stability issues required additional shoring.
    
    **Upcoming Tasks:**
    - Begin concrete wall construction for the basement.
    - Continue excavation for utilities trench.
    - Schedule inspections for the completed foundation work.
    
    **Resource Allocation:**
    - Labor: 12 workers were on-site, including 4 excavation specialists and 2 concrete workers.
    - Equipment: Excavator, concrete mixer, and backhoe were used. Excavator requires hydraulic repair.
    - Materials: 15 cubic yards of concrete used for footings. Order additional rebar for wall construction.
    
    **Safety and Compliance:**
    - Safety measures were strictly adhered to, including the use of personal protective equipment (PPE).
    - Environmental regulations were followed, and erosion control measures are in place.
    
    **Client Communication:**
    - Discussed progress with the client via a video conference, and they expressed satisfaction with the progress.
    
    **Site Photos:**
    [Attached photos showing excavation, concrete pouring, and temporary fencing.]
    
    **Additional Notes:**
    - The concrete supplier will deliver the additional rebar tomorrow as per the order.
    - Soil stability will continue to be monitored to ensure worker safety during excavation.
    
    **Signature:** John Smith
    `,
    "option 2": `John Smith </br>
    Date: November 7, 2023</br>
    Project: Riverside Apartments</br>
    Location: 567 River Road, Riverdale, USA
    
    **Daily Progress Report**
    
    **Weather Conditions:**
    - Temperature: 60°F
    - Weather: Sunny with occasional clouds
    
    **Project Overview:**
    Today, the focus was on structural framing for the Riverside Apartments project. Substantial progress was made towards framing the first two floors.
    
    **Accomplishments:**
    - Completed framing for the second-floor walls.
    - Commenced installation of floor joists for the third floor.
    - Conducted an inspection with city officials, receiving approval for completed framing work.
    
    **Challenges:**
    - Temporary shortage of framing nails caused a brief delay in work.
    - Coordination with subcontractors for electrical and plumbing rough-ins faced minor scheduling conflicts.
    
    **Upcoming Tasks:**
    - Continue floor joist installation for the third floor.
    - Coordinate with electrical and plumbing subcontractors for rough-ins.
    - Prepare for roofing installation next week.
    
    **Resource Allocation:**
    - Labor: 18 workers on-site, including framers, carpenters, and inspectors.
    - Equipment: Framing nail guns, scissor lifts, and safety harnesses were used.
    - Materials: 12,000 linear feet of lumber used for framing.
    
    **Safety and Compliance:**
    - All safety protocols followed, including fall protection measures.
    - Inspections ensured compliance with local building codes.
    
    **Client Communication:**
    - Provided the client with an update on framing progress via email, and they expressed satisfaction with the work.
    
    **Site Photos:**
    [Attached photos showing framing progress, floor joist installation, and inspection with city officials.]
    
    **Additional Notes:**
    - Framing nails supply issue resolved, and additional nails are in stock.
    - Coordination with subcontractors continues to ensure a smooth workflow.
    
    **Signature:**
    John Smith
    `,
    "option 3": `Jane Doe</br>
    Date: November 1, 2023</br>
    Project: Harborview Marina</br>
    Location: 789 Dockside Drive, Seaview Harbor, USA
    
    **Daily Progress Report**
    
    **Weather Conditions:**
    - Temperature: 55°F
    - Weather: Overcast with occasional rain showers
    
    **Project Overview:**
    Today, the primary focus was on marine construction activities at Harborview Marina. We made substantial progress on the installation of dock pilings and utilities.
    
    **Accomplishments:**
    - Installed 12 out of 20 dock pilings for the marina.
    - Completed the trenching and initial installation of water and electrical utilities for the dock area.
    - Conducted a safety briefing with the marine construction team.
    
    **Challenges:**
    - Weather-related delays due to rain showers slowed down piling installation.
    - Coordination with utility providers for gas and sewage connections faced minor logistical challenges.
    
    **Upcoming Tasks:**
    - Continue piling installation to complete the marina framework.
    - Finalize utility connections and perform pressure tests.
    - Schedule an environmental inspection for compliance.
    
    **Resource Allocation:**
    - Labor: 14 workers on-site, including marine construction specialists and utility installers.
    - Equipment: Crane barge, pile driver, and trenching equipment were utilized.
    - Materials: 20 dock pilings and utility pipes were delivered and used.
    
    **Safety and Compliance:**
    - Strict adherence to marine safety protocols, including life jackets and harnesses.
    - Environmental compliance maintained throughout the construction process.
    
    **Client Communication:**
    - Updated the client about the progress of the marina construction through a phone call, and they expressed understanding of weather-related delays.
    
    **Site Photos:**
    [Attached photos showing piling installation, utility trenching, and safety briefing.]
    
    **Additional Notes:**
    - Weather forecasts indicate improved conditions for the upcoming days, minimizing potential delays.
    - Coordination with utility providers continues to ensure timely connections.
    
    **Signature:**
    Jane Doe`,
  };

  const reportDisplay = () => {
    if (reportSelected === "option1") {
      console.log(typeof reports["option 1"]);
      return reports["option 1"];
    } else if (reportSelected === "option2") {
      return reports["option 2"];
    } else if (reportSelected === "option3") {
      return reports["option 3"];
    } else {
      return null;
    }
  };

  const generateNewReport = () => {
    return (
      <Flex direction={"column"}>
        <Select
          placeholder="Select Timeframe"
          size={"sm"}
          onChange={(e) => setSelectedTimeframe(e.target.value)}
          bg={"white"}
        >
          <option value="option1">Today</option>
          <option value="option2">Yesterday</option>
          <option value="option3">This Week</option>
          <option value="option4">Last Week</option>
          <option value="option5">This Month</option>
        </Select>
        <Button size={"sm"} bg={"brand.dark"} color={"white"} mt={"6"}>
          Generate Report
        </Button>
      </Flex>
    );
  };

  return (
    <Flex mt={"10"} px={"10"} direction={"column"} w={"100%"}>
      <Flex alignItems={"center"}>
        <Select
          placeholder="Open Existing Report"
          size={"sm"}
          onChange={(e) => {
            setReportSelected(e.target.value), setNewReport(false);
          }}
          w={"280px"}
        >
          <option value="option1">November 15th, 2023</option>
          <option value="option2">November 7th, 2023</option>
          <option value="option3">November 1st, 2023</option>
        </Select>
        <Text ml={"5"} mr={"5"} fontSize={"sm"}>
          or
        </Text>
        <Button
          size={"sm"}
          w={"280px"}
          onClick={() => setNewReport(!newReport)}
          _hover={{ bg: "brand.dark", color: "white" }}
        >
          Generate New Report
        </Button>
      </Flex>
      {!newReport ? (
        <Flex overflowY={"auto"} fontSize={"sm"} h={"88%"} mt={"4"}>
          {reportDisplay()}
        </Flex>
      ) : (
        <Flex
          w={"100%"}
          justifyContent={"center"}
          mt={"32"}
          bg={"brand2.mid"}
          p={"10"}
        >
          {generateNewReport()}
        </Flex>
      )}
    </Flex>
  );
};

export default ReportsPage;
