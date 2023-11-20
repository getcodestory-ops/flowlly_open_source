import React from "react";
import { Flex, Select, Text, Button, Icon } from "@chakra-ui/react";
import { AiOutlineSave } from "react-icons/ai";
import { LiaEditSolid } from "react-icons/lia";

function MeetingDisplay() {
  const transcript = `**John Smith (PM):** Good morning, everyone. Thank you for joining this safety meeting. Safety is our top priority on this construction project. Let's begin by reviewing our safety procedures. Mike, please start.

  **Mike Johnson (SA):** Absolutely, John. As a reminder, all subcontractors and their workers are required to wear appropriate personal protective equipment (PPE) at all times. This includes hard hats, high-visibility vests, safety goggles, and steel-toed boots. Is there any confusion regarding PPE requirements?
  
  **Sarah Davis (SB):** No, we've been following those guidelines diligently.
  
  **John Smith (PM):** Great to hear. Now, let's discuss site-specific safety concerns. Mike, you're working on the scaffolding. Have there been any issues?
  
  **Mike Johnson (SA):** The scaffolding has been secure, but we've noticed some uneven ground near the eastern edge of the construction site. It might be a trip hazard.
  
  **John Smith (PM):** Thank you for bringing that up, Mike. Sarah, your team is responsible for excavation near that area. Please ensure the ground is leveled and properly marked for potential hazards.
  
  **Sarah Davis (SB):** Will do, John. Safety is our priority as well.
  
  **John Smith (PM):** Excellent. Now, let's talk about reporting incidents. If anyone witnesses or experiences a safety incident, whether it's a near miss, an injury, or a potential hazard, it's crucial to report it immediately. We have a designated reporting system in place, and it's vital that we use it.
  
  **Mike Johnson (SA):** Understood. We've been using the incident reporting system and have found it helpful in addressing issues promptly.
  
  **Sarah Davis (SB):** Agreed, John. We've had a few minor incidents, and the system allowed us to address them effectively.
  
  **John Smith (PM):** That's good to hear. Remember, reporting incidents helps us improve safety on the site. Now, does anyone have any questions or concerns regarding safety?
  
  **Mike Johnson (SA):** I have one question, John. What's the protocol for severe weather conditions, like thunderstorms or high winds?
  
  **John Smith (PM):** Excellent question, Mike. In case of severe weather, we have designated shelter areas on-site. Please ensure your teams are aware of these locations and that they seek shelter when necessary. Additionally, we will have a weather monitoring system in place to provide timely alerts.
  
  **Sarah Davis (SB):** Thank you for clarifying that, John. It's good to know there's a plan in place for extreme weather situations.
  
  **John Smith (PM):** You're welcome, Sarah. Safety is a collective effort. If there are no further questions or concerns, let's conclude this meeting. Remember, safety is non-negotiable, and it's everyone's responsibility.
  `;

  const email = `Subject: Summary of Safety Meeting Discussion - November 16, 2023

  Dear Team,
  
  I hope this email finds you well. I wanted to provide a summary of our recent safety meeting held on November 16, 2023, to ensure that everyone is on the same page regarding our construction project's safety protocols and concerns discussed during the meeting.
  
  Safety Procedures Review:
  
  We emphasized that safety is our top priority on this construction project.
  All subcontractors and their workers must wear appropriate personal protective equipment (PPE) at all times, including hard hats, high-visibility vests, safety goggles, and steel-toed boots.
  No confusion was reported regarding PPE requirements.
  Site-Specific Safety Concerns:
  
  Mike Johnson (Subcontractor A) reported that the scaffolding has been secure.
  However, Mike identified uneven ground near the eastern edge of the construction site, potentially posing a trip hazard.
  Sarah Davis (Subcontractor B) acknowledged the concern and committed to ensuring the ground is leveled and properly marked for potential hazards.
  Incident Reporting:
  
  We highlighted the importance of promptly reporting safety incidents, whether near misses, injuries, or potential hazards.
  Our designated incident reporting system is in place to address these issues effectively.
  Both subcontractors confirmed that they have been using the incident reporting system and found it helpful in addressing issues promptly.
  Severe Weather Protocol:
  
  Mike inquired about the protocol for severe weather conditions, such as thunderstorms or high winds.
  In response, we mentioned that we have designated shelter areas on-site for such situations.
  All teams should be aware of these locations and seek shelter when necessary.
  We will also have a weather monitoring system in place to provide timely alerts.
  In conclusion, safety remains non-negotiable on our project, and it is the responsibility of every team member to prioritize it. If you have any additional questions or concerns regarding safety, please do not hesitate to reach out.
  
  Thank you for your commitment to safety, and let's continue working together to ensure a safe and successful construction project.
  
  Best regards,
  
  John Smith
  Construction Project Manager`;

  const transcriptDisplay = () => {
    return (
      <Flex direction={"column"} mt={"10"} mb={"16"}>
        <Text fontSize={"lg"} as={"b"} mb={"6"}>
          Safety Meeting 21/11/23
        </Text>
        <Flex direction={"row"} justifyContent={"space-between"}>
          <Flex direction={"column"} w={"48%"}>
            <Flex alignItems={"center"} mb={"3"}>
              <Text fontSize={"sm"} as={"b"} ml={"2"}>
                ✏️ Transcript
              </Text>
            </Flex>
            <Flex bg={"brand2.mid"} p={"4"} rounded={"2xl"} h={"57%"}>
              <Text overflowY={"auto"}>{transcript}</Text>
            </Flex>
          </Flex>
          <Flex direction={"column"} w={"48%"}>
            <Flex
              justifyContent={"space-between"}
              // mt={"6"}
              alignItems={"center"}
              mb={"2"}
              px={"2"}
            >
              <Flex alignItems={"center"}>
                <Text fontSize={"sm"} as={"b"} mr={"2"}>
                  🤖 AI Assistant Actions
                </Text>
                <Select size={"xs"} w={"200px"}>
                  <option value="option1">Write Email</option>
                  <option value="option2">Extract Tasks</option>
                  <option value="option2">Summarize Meeting</option>
                </Select>
              </Flex>
              <Flex pr={"8"}>
                <Icon
                  as={AiOutlineSave}
                  mr={"3"}
                  cursor={"pointer"}
                  _hover={{ color: "brand.accent" }}
                />
                <Icon
                  as={LiaEditSolid}
                  cursor={"pointer"}
                  _hover={{ color: "brand.accent" }}
                />
              </Flex>
            </Flex>
            <Flex bg={"brand2.mid"} p={"5"} rounded={"2xl"} h={"57%"}>
              <Text overflowY={"auto"}>{email}</Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    );
  };

  return (
    <Flex direction={"column"}>
      <Flex
        alignItems={"center"}
        justifyContent={"space-between"}
        w={"50%"}
        px={"8"}
        pt={"8"}
      >
        <Select
          placeholder="Select Meeting Transcript"
          mr={"4"}
          size={"sm"}
          w={"320px"}
        >
          <option value="option1">Safety meeting 21/11/23</option>
          <option value="option2">Owner meeting 29/10/23</option>
        </Select>
        <Text mr={"4"}> or </Text>
        <Button
          size={"sm"}
          w={"320px"}
          _hover={{ bg: "brand.dark", color: "white" }}
        >
          Upload Meeting Audio Recording
        </Button>
      </Flex>
      <Flex px={"8"}>{transcriptDisplay()}</Flex>
    </Flex>
  );
}

export default MeetingDisplay;
