import React, { useState, useEffect, use } from "react";
import {
  Grid,
  GridItem,
  Text,
  Flex,
  useDisclosure,
  Button,
  Tooltip,
  Select,
  Icon,
  Image,
} from "@chakra-ui/react";
import {
  MdOutlinePlayCircleOutline,
  MdOpenInNew,
  MdOutlineEmail,
  MdOutlinePeopleAlt,
  MdOutlineSmsFailed,
  MdOutlineMessage,
  MdOutlineNote,
  MdOutlineInsertDriveFile,
  MdFiberNew,
} from "react-icons/md";

import { useStore } from "@/utils/store";
import { IoDocumentTextOutline, IoPlayCircleOutline } from "react-icons/io5";
import { AiOutlineAlert } from "react-icons/ai";
import { convertDateToTimeText } from "@/utils/timeSinceLatestSignificantEvent";
import { useQuery } from "@tanstack/react-query";
import ProcessHistoryButton from "../Schedule/ProcessHistory/ProcessHistoryButton";
import { getUpdates } from "@/api/update_routes";
import { UpdateProperties } from "@/types/updates";
import EditorBlock from "@/components/DocumentEditor/Editor";

const NEW_UpdatesPage = () => {
  const { documentId, setDocumentId, session, activeProject } = useStore(
    (state) => ({
      documentId: state.documentId,
      setDocumentId: state.setDocumentId,
      session: state.session,
      activeProject: state.activeProject,
    })
  );

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [previewCardContent, setPreviewCardContent] = useState<
    Record<string, any>
  >({});
  const [objectView, setObjectView] = useState<string>("content");

  const {
    data: updates,
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: ["updates", session, activeProject],
    queryFn: () => {
      if (!session || !activeProject) {
        return Promise.reject("Set session first !");
      }

      return getUpdates(session, activeProject.project_id);
    },

    enabled: !!session?.access_token && !!activeProject?.project_id,
  });

  // const updatesObject = {
  //   1: {
  //     id: 1,
  //     type: "email",
  //     title: "Material delivery delayed",
  //     date: "2023-08-01",
  //     impact: "negative",
  //     projectImpact:
  //       "Significant negative impact due to material delivery delays, causing potential construction timeline delays, cost overruns, scheduling issues, contractual risks, and affecting stakeholder confidence.",
  //     content:
  //       "Dear [Project Manager's Name],\n\nI hope this email finds you well. I am writing to inform you of an unforeseen issue that has arisen with our supply chain, which is likely to impact our delivery schedule for the construction materials for your project, specifically the [specific materials, e.g., steel beams, concrete].\n\nDue to unexpected disruptions at our manufacturing facility, combined with ongoing transportation strikes, there will be a significant delay in the supply of these materials. We anticipate this could set back our delivery schedule by approximately [number of weeks/months delay].\n\nWe understand the critical role these materials play in your construction timeline and are doing everything we can to minimize the delay. However, under the current circumstances, these delays are unfortunately unavoidable.\n\nWe will keep you updated on any further developments. In the meantime, we apologize for any inconvenience this may cause and appreciate your understanding.\n\nBest regards,\n\n[Supplier's Name]\n[Supplier's Company Name]\n[Contact Information]",
  //     risk: [
  //       {
  //         title: "Delayed Construction Timeline",
  //         description:
  //           "The delay in receiving key materials will likely result in a halt or slowdown of certain construction phases, affecting the overall project timeline.",
  //       },
  //       {
  //         title: "Cost Overruns",
  //         description:
  //           "Extended project duration may lead to increased costs due to prolonged labor and equipment rental, as well as potential penalty clauses for late completion.",
  //       },
  //       {
  //         title: "Resource Scheduling Issues",
  //         description:
  //           "The delay may disrupt the planned scheduling of workforce and machinery, potentially causing idle time or conflicts with other project schedules.",
  //       },
  //       {
  //         title: "Contractual Obligations",
  //         description:
  //           "The project may face penalties or legal implications due to the inability to meet contractual deadlines, affecting profitability and client relations.",
  //       },
  //       {
  //         title: "Stakeholder Confidence",
  //         description:
  //           "Delays can undermine the confidence of clients, investors, and partners, necessitating additional efforts to manage relationships and expectations.",
  //       },
  //     ],
  //     actions: [
  //       {
  //         title: "Communicate with Stakeholders",
  //         description:
  //           "Inform all stakeholders about the delay and its potential impact, maintaining transparency to preserve trust and manage expectations.",
  //       },
  //       {
  //         title: "Revise Project Schedule",
  //         description:
  //           "Adjust the project schedule to identify tasks that can be advanced or done in parallel, mitigating the impact of the delay.",
  //       },
  //       {
  //         title: "Seek Alternative Suppliers",
  //         description:
  //           "Explore sourcing the delayed materials from alternative suppliers to minimize the delay, even if it comes at a higher cost.",
  //       },
  //       {
  //         title: "Legal Review",
  //         description:
  //           "Consult with legal advisors to review contracts and explore options for extensions, renegotiations, or understanding penalties.",
  //       },
  //       {
  //         title: "Cost Management",
  //         description:
  //           "Reassess the project budget to identify areas for cost reduction to offset the additional expenses incurred due to the delay.",
  //       },
  //       {
  //         title: "Optimize Resources",
  //         description:
  //           "Reschedule the workforce and machinery to other tasks or projects where possible, reducing idle time and optimizing resource utilization.",
  //       },
  //       {
  //         title: "Frequent Monitoring",
  //         description:
  //           "Increase monitoring frequency to swiftly identify and address any further issues or ripple effects caused by the delay.",
  //       },
  //       {
  //         title: "Document Everything",
  //         description:
  //           "Maintain detailed records of all communications, decisions, and actions related to the delay for future reference and potential claims.",
  //       },
  //     ],
  //   },
  //   2: {
  //     id: 2,
  //     type: "message",
  //     title: "Crane malfunction",
  //     date: "2023-11-05",
  //     impact: "negative",
  //     projectImpact:
  //       "Major negative impact from crane malfunction leading to immediate work stoppages, project delays, increased costs, safety concerns, and workforce management issues.",
  //     content:
  //       "SMS from [Site Manager's Name]: 'Urgent: Site Incident. Crane malfunctioned this AM. No injuries, but crane inoperable. Awaiting inspection results. Likely delays in heavy lifting operations.' Reply from [Project Manager]: 'Understood. Please ensure site safety and keep me updated on inspection findings and timelines.'",
  //     risk: [
  //       {
  //         title: "Equipment Failure",
  //         description:
  //           "The malfunctioning crane halts all operations that require heavy lifting, causing immediate work stoppages in critical areas of the construction.",
  //       },
  //       {
  //         title: "Project Delays",
  //         description:
  //           "The inoperable crane directly delays the project timeline, especially for tasks dependent on heavy lifting.",
  //       },
  //       {
  //         title: "Increased Costs",
  //         description:
  //           "Delays and equipment repairs or replacements may lead to increased project costs, including potential penalties for delayed completion.",
  //       },
  //       {
  //         title: "Safety Concerns",
  //         description:
  //           "The incident raises concerns about site safety and the reliability of other equipment, potentially requiring additional safety checks and measures.",
  //       },
  //       {
  //         title: "Workforce Management",
  //         description:
  //           "The disruption in the workflow may lead to inefficient use of labor, requiring rescheduling or reallocation of the workforce.",
  //       },
  //     ],
  //     actions: [
  //       {
  //         title: "Immediate Site Safety Assessment",
  //         description:
  //           "Conduct an immediate assessment to ensure site safety and prevent any further incidents.",
  //       },
  //       {
  //         title: "Equipment Inspection and Repair",
  //         description:
  //           "Arrange for a thorough inspection and quick repair of the crane, or consider renting a replacement if necessary.",
  //       },
  //       {
  //         title: "Adjust Project Schedule",
  //         description:
  //           "Revise the project schedule to prioritize tasks that do not require the crane, minimizing the impact of the delay.",
  //       },
  //       {
  //         title: "Communicate with Stakeholders",
  //         description:
  //           "Inform stakeholders about the incident and potential delays, maintaining transparency.",
  //       },
  //       {
  //         title: "Review Safety Protocols",
  //         description:
  //           "Review and reinforce safety protocols to prevent similar incidents and ensure worker safety.",
  //       },
  //       {
  //         title: "Manage Workforce Allocation",
  //         description:
  //           "Reallocate or reschedule the workforce to maintain productivity and minimize idle time.",
  //       },
  //       {
  //         title: "Monitor Financial Impact",
  //         description:
  //           "Closely monitor the financial implications of the delay and take measures to control costs.",
  //       },
  //       {
  //         title: "Document the Incident and Response",
  //         description:
  //           "Keep detailed records of the incident, response actions, and any changes made to the project plan.",
  //       },
  //     ],
  //   },
  //   3: {
  //     id: 3,
  //     type: "note",
  //     title: "Unexpected zoning regulation changes",
  //     date: "2024-01-23",
  //     impact: "negative",
  //     projectImpact:
  //       "Substantial negative impact from unexpected zoning regulation changes requiring project redesign, compliance challenges, permitting delays, cost increases, and potential stakeholder relationship issues.",
  //     content:
  //       "Meeting Subject: Unexpected Zoning Regulation Changes\n\nParticipants: Project Manager, Legal Advisor, Construction Team Heads\n\n- Project Manager: 'We've just been informed of new zoning regulations that impact our project design. These changes require immediate attention.'\n- Legal Advisor: 'The new regulations mandate additional environmental assessments and modifications to our planned structure height.'\n- Construction Team Head: 'This will impact our current design and construction timeline significantly.'\n- Project Manager: 'Let's strategize on compliance while minimizing project disruptions. We need a revised plan ASAP.'",
  //     risk: [
  //       {
  //         title: "Regulatory Compliance",
  //         description:
  //           "New zoning regulations necessitate changes to project design, potentially leading to significant modifications in construction plans.",
  //       },
  //       {
  //         title: "Project Redesign",
  //         description:
  //           "Adapting to regulatory changes may require a comprehensive redesign of the project, impacting timelines and costs.",
  //       },
  //       {
  //         title: "Permitting Delays",
  //         description:
  //           "The need for additional environmental assessments and approvals could result in delays in obtaining necessary permits.",
  //       },
  //       {
  //         title: "Increased Project Costs",
  //         description:
  //           "Compliance with new regulations and redesign efforts may lead to escalated project costs.",
  //       },
  //       {
  //         title: "Stakeholder Relations",
  //         description:
  //           "Changes in project scope and timeline can affect relationships with clients, investors, and other stakeholders.",
  //       },
  //     ],
  //     actions: [
  //       {
  //         title: "Regulatory Review and Compliance Plan",
  //         description:
  //           "Work with legal advisors to fully understand the new regulations and develop a compliance plan.",
  //       },
  //       {
  //         title: "Project Redesign and Approval",
  //         description:
  //           "Collaborate with architects and engineers to redesign the project as needed and obtain necessary approvals.",
  //       },
  //       {
  //         title: "Stakeholder Communication",
  //         description:
  //           "Proactively communicate with all stakeholders about the changes, the reasons behind them, and the expected impacts.",
  //       },
  //       {
  //         title: "Cost Assessment and Budget Adjustment",
  //         description:
  //           "Evaluate the financial impact of the changes and adjust the project budget accordingly.",
  //       },
  //       {
  //         title: "Schedule Revision",
  //         description:
  //           "Revise the project timeline to accommodate the new requirements and design changes.",
  //       },
  //       {
  //         title: "Risk Management",
  //         description:
  //           "Implement risk management strategies to mitigate potential negative impacts of the changes.",
  //       },
  //       {
  //         title: "Continuous Monitoring",
  //         description:
  //           "Regularly monitor the progress of the project in light of these changes and adjust strategies as necessary.",
  //       },
  //       {
  //         title: "Documentation and Record Keeping",
  //         description:
  //           "Maintain thorough documentation of all changes, decisions, and communications related to the regulatory changes.",
  //       },
  //     ],
  //   },
  //   4: {
  //     id: 4,
  //     type: "file",
  //     title: "Severe weather impact analysis",
  //     date: "2023-10-05",
  //     impact: "negative",
  //     projectImpact:
  //       "Severe negative impact due to weather conditions causing material and equipment damage, safety hazards, work delays, increased costs, and reputational risk.",
  //     content:
  //       "Report Title: Severe Weather Impact Analysis on Construction Project\n\nPrepared by: [Site Safety Officer's Name]\n\nExecutive Summary: This report outlines the significant impact of the recent severe weather conditions on the construction project. Prolonged heavy rains and strong winds have caused damage to some construction materials and equipment, as well as safety hazards on site. An immediate assessment and action plan are required to address these issues and mitigate further risks.\n\nDetailed Findings: [Include specific findings related to material damage, safety hazards, work stoppages, etc.]\n\nRecommendations: [Include specific recommendations for immediate and long-term actions].",
  //     risk: [
  //       {
  //         title: "Material and Equipment Damage",
  //         description:
  //           "The severe weather has resulted in damage to construction materials and equipment, potentially causing delays and additional costs for repairs or replacements.",
  //       },
  //       {
  //         title: "Safety Hazards",
  //         description:
  //           "Weather-related damage may have created safety hazards on the construction site, necessitating immediate attention to ensure worker safety.",
  //       },
  //       {
  //         title: "Work Delays",
  //         description:
  //           "The adverse weather conditions have led to work stoppages, impacting the project timeline and productivity.",
  //       },
  //       {
  //         title: "Increased Costs",
  //         description:
  //           "Repairing or replacing damaged materials and equipment, along with work delays, are likely to result in increased project costs.",
  //       },
  //       {
  //         title: "Reputational Risk",
  //         description:
  //           "Failure to effectively manage the aftermath of severe weather can impact the reputation of the company, especially in terms of safety and reliability.",
  //       },
  //     ],
  //     actions: [
  //       {
  //         title: "Damage Assessment",
  //         description:
  //           "Conduct a thorough assessment of the damage caused by the weather to materials and equipment.",
  //       },
  //       {
  //         title: "Safety Measures",
  //         description:
  //           "Implement immediate safety measures to address hazards and ensure the safety of the construction site.",
  //       },
  //       {
  //         title: "Resource Allocation",
  //         description:
  //           "Allocate resources for the repair or replacement of damaged materials and equipment.",
  //       },
  //       {
  //         title: "Project Schedule Revision",
  //         description:
  //           "Revise the project schedule to account for the delays caused by the weather and subsequent recovery efforts.",
  //       },
  //       {
  //         title: "Stakeholder Communication",
  //         description:
  //           "Communicate with stakeholders about the impact of the weather on the project and the steps being taken to address it.",
  //       },
  //       {
  //         title: "Cost Management",
  //         description:
  //           "Review and adjust the project budget to manage the increased costs due to the weather impact.",
  //       },
  //       {
  //         title: "Risk Management Plan",
  //         description:
  //           "Update the project's risk management plan to include strategies for dealing with similar weather-related issues in the future.",
  //       },
  //       {
  //         title: "Documentation",
  //         description:
  //           "Document all impacts, actions taken, and lessons learned for future reference and improvement.",
  //       },
  //     ],
  //   },

  //   5: {
  //     id: 5,
  //     type: "email",
  //     title: "Scheduled power outage",
  //     date: "2023-09-05",
  //     impact: "neutral",
  //     projectImpact:
  //       "Moderate neutral impact from scheduled power outage, requiring backup power arrangements, task rescheduling, enhanced safety measures, and stakeholder communication, but manageable with proper planning.",
  //     content:
  //       "Subject: Scheduled Power Outage Notification\n\nFrom: [Utility Company Name]\n\nTo: [Project Manager's Name]\n\nDear [Project Manager's Name],\n\nWe are writing to inform you of a scheduled power outage that will affect your project site. This outage is part of our routine maintenance and upgrade of the electrical grid in your area. The outage is scheduled for [date] and will last approximately [number of hours].\n\nWe understand this may affect your operations, so we recommend taking any necessary precautions to mitigate the impact. This could include securing backup power sources or rescheduling tasks that require electrical power. We assure you that our teams are working to ensure the outage period is as brief and efficient as possible.\n\nThank you for your understanding and cooperation. If you have any questions or need further assistance, please feel free to contact us.\n\nBest regards,\n\n[Representative's Name]\n[Utility Company Name]\n[Contact Information]",
  //     risk: [],
  //     actions: [
  //       {
  //         title: "Arrange Backup Power",
  //         description:
  //           "Organize backup power sources, such as generators, to ensure critical operations can continue during the outage.",
  //       },
  //       {
  //         title: "Reschedule Power-Dependent Tasks",
  //         description:
  //           "Identify and reschedule any tasks that require electrical power to times outside of the scheduled outage.",
  //       },
  //       {
  //         title: "Notify Site Personnel",
  //         description:
  //           "Inform all site personnel about the scheduled outage and any changes in operations or schedules.",
  //       },
  //       {
  //         title: "Safety Precautions",
  //         description:
  //           "Implement additional safety measures to manage any risks associated with the power outage.",
  //       },
  //       {
  //         title: "Communicate with Stakeholders",
  //         description:
  //           "Proactively communicate with stakeholders about the scheduled outage and how it is being managed.",
  //       },
  //       {
  //         title: "Document Adjustments",
  //         description:
  //           "Keep records of all operational adjustments and communications made in response to the scheduled outage.",
  //       },
  //     ],
  //   },
  //   6: {
  //     id: 6,
  //     type: "message",
  //     title: "Site safety inspection",
  //     date: "2023-09-05",
  //     impact: "positive",
  //     projectImpact:
  //       "Positive impact as the site safety inspection found no major issues, ensuring continued project progress without safety-related delays or concerns.",
  //     content:
  //       "SMS from [Site Safety Officer's Name]: 'Site safety inspection completed. No major issues found. Minor issues identified and addressed. No impact on schedule.' Reply from [Project Manager]: 'Great news. Thanks for the update.'",
  //     risk: [],
  //     actions: [],
  //   },
  //   7: {
  //     id: 7,
  //     type: "note",
  //     title: "Site safety inspection report",
  //     date: "2023-09-05",
  //     impact: "positive",
  //     projectImpact:
  //       "Positive impact with the site safety inspection report confirming no major safety issues, reinforcing project safety standards and smooth progression.",
  //     content:
  //       "Report Title: Site Safety Inspection Report\n\nPrepared by: [Site Safety Officer's Name]\n\nExecutive Summary: This report outlines the findings of the site safety inspection conducted on [date]. The inspection found no major issues, with only minor issues identified and addressed. The inspection did not impact the project schedule.\n\nDetailed Findings: [Include specific findings related to safety hazards, equipment issues, etc.]\n\nRecommendations: [Include specific recommendations for immediate and long-term actions].",
  //     risk: [],
  //     actions: [],
  //   },
  // };

  const previewCard = (update: UpdateProperties) => {
    return (
      <Flex
        w="full"
        justifyContent={"center"}
        h={"full"}
        // alignItems={"center"}
        direction={"column"}
      >
        <Flex alignItems={"center"} justifyContent={"space-between"}>
          <Flex alignItems={"center"}>
            {update?.type === "email" && (
              <Icon as={MdOutlineEmail} mr={"0.5"} boxSize={"3"} />
            )}
            {update?.type === "message" && (
              <Icon as={MdOutlineMessage} mr={"0.5"} boxSize={"3"} />
            )}
            {update?.type === "note" && (
              <Icon as={MdOutlineNote} mr={"0.5"} boxSize={"3"} />
            )}
            {update?.type === "file" && (
              <Icon as={MdOutlineInsertDriveFile} mr={"0.5"} boxSize={"3"} />
            )}
            <Text fontSize={"10px"} fontStyle={"italic"}>
              {update.type}
            </Text>
          </Flex>
          <Flex>
            <Flex fontSize={"10px"}>
              {convertDateToTimeText(update.created_at)}
            </Flex>
            <Icon as={MdFiberNew} color={"purple.400"} boxSize={"5"} ml={"2"} />
          </Flex>
        </Flex>
        <Text fontSize={"12px"} my={"2"} fontWeight={"semibold"}>
          {update.update.message + "..."}
        </Text>

        <Flex>
          <Text fontSize={"10px"} mr={"1"}>
            Status:
          </Text>
          <Text
            fontSize={"10px"}
            fontWeight={"bold"}
            color={`${update.update.status === "negative" ? "red" : ""}`}
          >
            {update.update.status}
          </Text>
        </Flex>
      </Flex>
    );
  };

  return (
    <Grid templateColumns="repeat(6, 1fr)" gap={4} w="full" h={"full"}>
      <GridItem
        colSpan={2}
        h="full"
        overflowY={"auto"}
        className="custom-scrollbar"
      >
        <Flex alignItems={"center"} mb={"2"} justifyContent={"space-between"}>
          <Text fontSize={"14px"} fontWeight={"bold"}>
            Updates
          </Text>
          <ProcessHistoryButton />
        </Flex>
        <Flex alignItems={"center"} mb={"2"}>
          <Text fontSize={"12px"} fontWeight={"bold"}>
            Filter:
          </Text>
          <Select size={"xs"} w={"90px"} className="custom-selector">
            <option value="all">All</option>
            <option value="email">Email</option>
            <option value="message">Message</option>
            <option value="note">Note</option>
            <option value="note">File</option>
          </Select>
        </Flex>
        <Flex direction={"column"}>
          {updates &&
            updates.length > 0 &&
            updates.map((update) => (
              <Flex
                key={update.id}
                onClick={() => setPreviewCardContent(update)}
                w="full"
                mb={"2"}
                p={"2"}
                background={"brand.background"}
                dropShadow={"lg"}
                cursor={"pointer"}
                display="flex"
                flexDirection="column"
                borderRadius={"md"}
                _hover={{ bg: "brand.dark", color: "white" }}
              >
                {previewCard(update)}
              </Flex>
            ))}
        </Flex>
      </GridItem>
      <GridItem
        // bg={"brand.background"}
        // border={"1px"}
        // borderColor={"brand.gray"}
        rounded={"lg"}
        colSpan={4}
        h={"full"}
        overflowY={"scroll"}

        // className="custom-shadow"
      >
        <Flex h={"full"}>
          {!Object.keys(previewCardContent).length && (
            <Flex
              w={"full"}
              h={"full"}
              py={"2"}
              px={"4"}
              bg={"brand.background"}
              rounded={"lg"}
              overflowY={"auto"}
              className="custom-scrollbar"
              direction={"column"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Text fontSize={"36px"} color={"gray.300"} fontWeight={"black"}>
                Select Update from the list
              </Text>
            </Flex>
          )}
          {Object.keys(previewCardContent).length > 0 &&
            previewCardContent.update && (
              <Flex
                w={"full"}
                h={"full"}
                py={"2"}
                px={"4"}
                bg={"brand.background"}
                rounded={"lg"}
                overflowY={"auto"}
                className="custom-scrollbar"
                direction={"column"}
              >
                {/* <Flex alignItems={"center"} mb={"2"}>
                  {previewCardContent.type === "email" && (
                    <Icon as={MdOutlineEmail} mr={"0.5"} boxSize={"3"} />
                  )}
                  {previewCardContent.type === "message" && (
                    <Icon as={MdOutlineMessage} mr={"0.5"} boxSize={"3"} />
                  )}
                  {previewCardContent.type === "note" && (
                    <Icon as={MdOutlineNote} mr={"0.5"} boxSize={"3"} />
                  )}
                  {previewCardContent.type === "file" && (
                    <Icon
                      as={MdOutlineInsertDriveFile}
                      mr={"0.5"}
                      boxSize={"3"}
                    />
                  )}
                  <Text fontSize={"12px"} fontStyle={"italic"}>
                    {previewCardContent.type}
                  </Text>
                </Flex>
                <Text fontSize={"14px"} fontWeight={"bold"} mb={"6"}>
                  {previewCardContent.update.message}
                </Text> */}
                <Flex>
                  {previewCardContent.document_access_id && (
                    <EditorBlock
                      id={previewCardContent.document_access_id}
                      previewCardContent={previewCardContent}
                    />
                  )}
                </Flex>
              </Flex>
            )}
        </Flex>
      </GridItem>
    </Grid>
  );
};

export default NEW_UpdatesPage;
