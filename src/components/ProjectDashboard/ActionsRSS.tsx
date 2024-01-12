import React from "react";
import { Flex, Icon, Text } from "@chakra-ui/react";
import { useStore } from "@/utils/store";
import RSSCard from "./RSSCard";
// import { convertDateToTimeText } from "../../utils/timeSinceLastSignificantEvent";

function ActionsRSSsection() {
  interface ContingencyPlan {
    title: string;
    description: string;
  }

  function extractContingencyPlans(text: string): ContingencyPlan[] {
    // Adjusted regular expression to capture the last item correctly
    const planRegex =
      /(\d+)\.\s*\*\*(.*?)\*\*:\s*([\s\S]*?)(?=(?:\n\s*\d+\.)|\n\s*$)/g;
    const plans: ContingencyPlan[] = [];
    let match;

    while ((match = planRegex.exec(text)) !== null) {
      const title = match[2].trim();
      const description = match[3].trim().replace(/\n\s*/g, " ");
      plans.push({ title, description });
    }

    return plans;
  }

  // Example usage:
  const text = `Given the revisions for the construction project due to the unexpected delay in the demolition of the main structure from asbestos discovery, here is a suggested contingency plan:

  1. **Resource Reallocation**: Examine the possibility of reallocating resources (e.g., labor, equipment) that were originally scheduled for demolition to other tasks that do not depend on the demolition being completed. This helps in utilizing the unexpected idle time efficiently, possibly accelerating other parts of the project. 
  
  2. **Parallel Processing**: Identify activities that can be done in parallel that were originally scheduled to be done sequentially. For example, you might be able to start some site improvement or repair/modification work while waiting for the demolition to be completed, assuming it doesn't interfere with those activities.
  
  3. **Overtime & Shift Adjustments**: Evaluate whether overtime work or adding extra shifts, once demolition resumes, could hasten the project's progress. This might help catch up with the schedule; however, the cost implications and workers’ availability need to be assessed.
  
  4. **Procurement and Fabrication**: Use the delay period to ensure that all materials and any prefabricated elements are on-site and ready to go as soon as the demolition is completed. This can prevent further delays later on due to material procurement issues.
  
  5. **Modify Contracts**: Review contracts with suppliers and subcontractors to see if faster delivery or expedited work can be negotiated, perhaps at an additional cost. However, be aware of the associated costs and implications for project budgets.
  
  6. **Critical Path Method (CPM) Reassessment**: Evaluate the updated project schedule using CPM to determine the impact on the project's critical path. This may reveal buffer times that were not previously accounted for and could be utilized to mitigate delays.
  
  7. **Communication Plan**: Maintain transparent and frequent communication with all stakeholders, informing them of delays, reassessments, and changes to the project timetable. Proper communication can help in managing expectations and coordinating efforts to get the project back on track.
  
  8. **Review Legal Impacts**: Assess the legal implications of the delay, particularly concerning any contractual deadlines that the project may miss. If necessary, negotiate delay clauses to avoid penalties.
  
  9. **Continued Monitoring and Adjustment**: Stay vigilant regarding the project's progress and the effectiveness of the contingency plan. Be ready to make further adjustments as new information comes in, and certain strategies prove to be more effective than others.
  
  10. **Contingency Reserve**: Make use of any contingency reserve (time and budget) built into the original plan to deal with such circumstances. If it's not already included, consider developing a reserve for future incidents.
  
  By employing these strategies, the project may not completely return to the original schedule but can mitigate the delays to some degree and reduce the overall impact on the project's delivery date and budget.`; // (Your entire text here)
  const contingencyPlans = extractContingencyPlans(text);
  const planDate = "2023-12-05 14:35";

  return (
    <Flex w={"full"} direction={"column"} overflowY={"auto"}>
      <Text fontSize={"lg"} fontWeight={"bold"} mb={"2"}>
        Sugested Actions
      </Text>
      <Flex direction={"column"}>
        {/* {contingencyPlans &&
          contingencyPlans.map((action: any, index: any) => (
            <RSSCard
              title={action.title}
              date={convertDateToTimeText(planDate)}
              explanation={action.description}
              key={index}
              source="action"
            />
          ))} */}
      </Flex>
    </Flex>
  );
}

export default ActionsRSSsection;
