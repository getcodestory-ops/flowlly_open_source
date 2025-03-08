export const change_orders: {
  [key: string]: {
    week: string;
    date: string;
    "change order": { "change order": string; description: string };
  }[];
} = {
	"field club washrooms ift to ifc conversion": [
		{
			week: "41",
			date: "October 15th",
			"change order": {
				"change order": "Field Club Washrooms IFT to IFC Conversion",
				description:
          "This change order from Houle is for $250,000 and relates to converting the field club washrooms from IFT to IFC.",
			},
		},
	],
	"corner club condensing units relocation": [
		{
			week: "41",
			date: "October 15th",
			"change order": {
				"change order": "Corner Club Condensing Units Relocation",
				description:
          "This change order is for $110,000 and relates to relocating condensing units and other equipment from Electric Room 5 to Electric Room 6.",
			},
		},
	],
	"field club elevator underground plumbing": [
		{
			week: "40",
			date: "October 9th",
			"change order": {
				"change order": "Field Club Elevator Underground Plumbing",
				description:
          "This change order relates to the revised scope of work for the underground plumbing related to the field club elevator.",
			},
		},
	],
};

export const delay_factors: {
  [key: string]: {
    [key: string]: { factor: string; description: string }[];
  };
} = {
	40: {
		"October 8": [
			{
				factor: "Contract and Change Order Process",
				description:
          "Delays and confusion surrounding the contract and change order process are impacting the project's progress. Subcontractors are hesitant to proceed with significant changes without formal change orders, and there are outstanding costs related to site instructions and RFIs. In a subcontractor discussion, it is revealed that there is confusion and frustration surrounding the contract documents and the process for issuing change orders. Subcontractors are seeking clarification on the scope of work included in their base quotes and what constitutes a change order.",
			},
			{
				factor: "Con Meter Contractor Registration",
				description:
          "Delays in registering the Con Meter contractor have put the meter installation on hold, potentially causing delays in project completion. In a subcontractor discussion, it is revealed that the meter installation is on hold due to delays in contractor registration. It is estimated that the registration might be finalized by 2:30 PM that day.",
			},
			{
				factor: "Feeder SI",
				description:
          "The Feeder SI (Site Instruction) was delayed, impacting the electrical subcontractor's ability to proceed with the work. During a subcontractor discussion, it is mentioned that the Feeder SI is expected to be issued later that day. However, as of the time of the discussion, the subcontractor had not yet received it.",
			},
		],
		"October 9": [
			{
				factor:
          "Underground Plumbing and Electrical IFC Drawings for Field Club Elevator Project",
				description:
          "The underground plumbing and electrical drawings for the Field Club elevator project were not included in the initial IFC set. This caused delays for the subcontractor, who did not have sufficient information to proceed with the work. During an internal meeting, the issue of missing IFC drawings for the underground plumbing and electrical for the Field Club elevator is raised. There is a debate about whether the subcontractor should proceed with the work based on sketches and markups or wait for a complete IFC set.",
			},
			{
				factor: "Coordination of Documents and Drawings",
				description:
          "There are ongoing issues with document and drawing coordination, causing confusion and delays for subcontractors. Drawings are not consistently labeled or issued correctly, making it challenging to determine the appropriate scope of work and proceed efficiently. An Etro Internal Team meeting reveals further issues with drawing coordination. It is noted that IFC drawings are not being issued consistently for different project phases, causing confusion about the correct scope of work.",
			},
		],
	},
	41: {
		"October 16": [
			{
				factor:
          "Underground Plumbing and Electrical IFC Drawings for Field Club Elevator Project",
				description:
          "The underground plumbing and electrical drawings for the Field Club elevator project were not included in the initial IFC set. This caused delays for the subcontractor, who did not have sufficient information to proceed with the work. In a weekly meeting between ETRO and PavCo, it is mentioned that there have been delays on the vertical transportation phase 1b package due to the exploratory works. The target date for receiving these drawings is October 18th.",
			},
		],
		"October 21": [
			{
				factor:
          "Underground Plumbing and Electrical IFC Drawings for Field Club Elevator Project",
				description:
          "The underground plumbing and electrical drawings for the Field Club elevator project were not included in the initial IFC set. This caused delays for the subcontractor, who did not have sufficient information to proceed with the work. In another weekly meeting between ETRO and PavCo, a representative from ETRO follows up on the geotechnical exploratory work results, which are needed to finalize the design and produce the IFC drawings. As of this date, the results have not been received, further delaying the issuance of the drawings.",
			},
		],
	},
	42: {
		"October 22": [
			{
				factor: "Grease Interceptor Location",
				description:
          "The proposed location for the grease interceptor in the Field Club project was deemed unsuitable because it was situated right in front of the display kitchen. During a design/construction meeting, concerns were raised about the proposed location of the grease interceptor. A request was made to move it as far away from the display kitchen as possible. As of this date, it is being determined if this change is possible.",
			},
			{
				factor: "Contract and Change Order Process",
				description:
          "Delays and confusion surrounding the contract and change order process are impacting the project's progress. Subcontractors are hesitant to proceed with significant changes without formal change orders, and there are outstanding costs related to site instructions and RFIs. During an OAC meeting, further discussion takes place regarding the contract conversion and the change order process. It is mentioned that PavCo has requested to convert to CCDC2 contracts, which would then allow for the issuance of change orders.",
			},
			{
				factor: "Lighting Design for Field Club Washrooms",
				description:
          "Delays in finalizing and approving the lighting design for the Field Club washrooms have impacted the ordering of long lead lighting materials, potentially delaying the installation schedule. During a Design/Construction meeting, concerns are raised about the lighting design for the washrooms. The need for a prompt design finalization is emphasized due to long lead times for lighting materials.",
			},
		],
	},
};

export const rfi: {
  [key: string]: {
    [key: string]: { RFI: string; description: string }[];
  };
} = {
	40: {
		// Week 41: October 8 - October 14, 2024
		"October 8, 2024": [
			{
				RFI: "RFI 62",
				description:
          "RFI 62 was created and forwarded to Chris from WSP, as it primarily concerns architectural elements. Eleni confirmed that the electrical team has no issues with the proposed solution.",
			},
		],
		"October 15, 2024": [
			{
				RFI: "RFI Related to Field Club Elevator",
				description:
          "This RFI was discussed during a meeting. Abdullah expressed the need for an SI to reflect changes to the plumbing scope and ensure proper documentation. Sameer noted that the Field Club elevator drawings would be issued as a separate package from the initial Field Club drawings. Ali suggested an offline discussion to determine the next steps in issuing the SI.",
			},
		],
	},
	41: {
		// Week 42: October 15 - October 21, 2024
		"October 22, 2024": [
			{
				RFI: "RFI Related to Corner Club Lighting",
				description:
          "Eleni from Metro requested an update on the lighting design from Ben at WSP. Ben confirmed that he was working on finalizing the design and planned to have it ready that day.",
			},
			{
				RFI: "RFI Related to Field Club Elevator",
				description:
          "A follow-up conversation occurred during a meeting. Abdullah emphasized the need for a prompt SI to document changes and enable work to proceed. Sameer explained that the revised drawings are undergoing peer review by the Engineer of Record (EOR) and will be issued as part of the Field Club elevator package (PR20). Ali proposed an offline discussion with the EOR to explore issuing the SI immediately.",
			},
			{
				RFI: "RFI Related to Fire Booster Panel Location",
				description:
          "During a meeting, Chris inquired about the resolution of the Fire Booster Panel location. Chris confirmed it had been resolved, with the panel now located in the janitor room.",
			},
			{
				RFI: "RFI Related to Grease Interceptor Location",
				description:
          "During a meeting, the status of the grease interceptor relocation was discussed. Chris inquired about updates, and Ali mentioned that Lowell was still investigating the feasibility of moving the interceptor. The meeting participants agreed that the proposed location directly in front of the display kitchen was unsuitable.",
			},
			{
				RFI: "RFI Related to Field Club Elevator Left",
				description:
          "Angela expressed concerns that the team had not received a response from GITEC despite Andrew's initial indication that they would address the query.",
			},
		],
	},
	42: {
		// Week 43: October 22 - October 28, 2024
		"October 29, 2024": [
			{
				RFI: "RFI Related to Grease Interceptor Location",
				description:
          "The discussion regarding the relocation of the grease interceptor continues. Abdullah highlights that the current drawings provided insufficient detail for the relocation and expresses concerns about the lack of coordination in the design documents. Sameer and Ali agree to discuss the grease interceptor location further offline.",
			},
			{
				RFI: "RFI Related to Underground Drain Line",
				description:
          "Abdullah raised concerns regarding a design conflict with an existing drain line that was not reflected in the provided drawings. He emphasizes the need for improved drawing coordination.",
			},
		],
	},
};

export const risk_register: {
  [key: string]: {
    [key: string]: {
      Risk: string;
      "Impact Potential": {
        score: string;
        description: string;
      };
      Likelihood: {
        score: string;
        description: string;
      };
    }[];
  };
} = {
	40: {
		"October 8": [
			{
				Risk: "Smoke Seat Solution",
				"Impact Potential": {
					score: "High",
					description:
            "Delays in project progress if the proposed solution is not accepted. Potential need for alternative solutions.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The likelihood of the solution being rejected is not explicitly stated, but the uncertainty indicates a moderate probability.",
				},
			},
			{
				Risk: "Core Location for Electrical Panel",
				"Impact Potential": {
					score: "Mid",
					description:
            "Potential delays in electrical work if the core location is not finalized.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The lack of a specified status suggests ongoing discussions and a moderate likelihood of delays.",
				},
			},
			{
				Risk: "Scheduling Conflicts",
				"Impact Potential": {
					score: "High",
					description:
            "Project delays and missed deadlines if meetings are not scheduled promptly.",
				},
				Likelihood: {
					score: "High",
					description:
            "The ongoing nature of the scheduling difficulties indicates a high likelihood of continued delays.",
				},
			},
			{
				Risk: "Temporary Glazing Alterations",
				"Impact Potential": {
					score: "Mid",
					description:
            "Potential discrepancies and conflicts if alterations are not properly documented and communicated to all stakeholders.",
				},
				Likelihood: {
					score: "Low",
					description:
            "The resolution of the issue through a reverse RFI suggests a low likelihood of further issues.",
				},
			},
			{
				Risk: "Lighting Design Input",
				"Impact Potential": {
					score: "Mid",
					description:
            "Delays in finalizing the ceiling design and potential rework if the lighting design is not integrated promptly.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The lack of a specified status suggests ongoing coordination and a moderate likelihood of delays.",
				},
			},
			{
				Risk: "Con Meter Contractor Registration",
				"Impact Potential": {
					score: "High",
					description:
            "Project delays, particularly for phase one, if the registration is not obtained promptly.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The pending status and reliance on a specific individual for the registration indicate a moderate likelihood of delays.",
				},
			},
			{
				Risk: "Feeder SI Delay",
				"Impact Potential": {
					score: "High",
					description:
            "Delays in electrical work progress if the SI is not received promptly.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The pending status and expectation of receiving the SI late in the day suggest a moderate likelihood of delays.",
				},
			},
			{
				Risk: "Corner Club Scope Clarification",
				"Impact Potential": {
					score: "High",
					description:
            "Scope creep, cost overruns, and disputes if the scope of work is not clearly defined and agreed upon.",
				},
				Likelihood: {
					score: "High",
					description:
            "The ongoing discussions and the involvement of a sole-source contractor indicate a high likelihood of scope and contractual issues.",
				},
			},
		],
		"October 9": [
			{
				Risk: "Field Club Innovators Coordination",
				"Impact Potential": {
					score: "High",
					description:
            "Delays, rework, and additional costs due to coordination issues.",
				},
				Likelihood: {
					score: "High",
					description:
            "The lack of clarity and potential risks associated with proceeding without a dedicated IFC set suggest a high likelihood of coordination issues.",
				},
			},
			{
				Risk: "Field Club Innovators IFC Set",
				"Impact Potential": {
					score: "High",
					description:
            "Potential liability issues, discrepancies, and disputes if works are not executed based on approved IFC documentation.",
				},
				Likelihood: {
					score: "High",
					description:
            "The reliance on sketches and the lack of formal documentation indicate a high likelihood of errors and disputes.",
				},
			},
			{
				Risk: "Quality Control Processes",
				"Impact Potential": {
					score: "High",
					description:
            "Quality issues, rework, and delays if proper QC procedures are not implemented.",
				},
				Likelihood: {
					score: "High",
					description:
            "The lack of standardized QC processes and concerns about shift handovers suggest a high likelihood of quality issues and delays.",
				},
			},
		],
	},
	41: {
		"October 15": [
			{
				Risk: "Field Club Booster Panel Location",
				"Impact Potential": {
					score: "High",
					description:
            "Potential need for alternative locations and delays in fire suppression system installation if a code-compliant location is not found.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The resolution of the issue suggests a moderate initial likelihood of delays, which has now been mitigated.",
				},
			},
			{
				Risk: "Corner Club Elevator Model",
				"Impact Potential": {
					score: "Mid",
					description:
            "Potential for inaccurate clash detection and coordination issues if the correct model version is not used.",
				},
				Likelihood: {
					score: "Low",
					description:
            "The resolution of the issue and confirmation of the latest model suggest a low likelihood of further issues.",
				},
			},
			{
				Risk: "Topographical Survey Need",
				"Impact Potential": {
					score: "High",
					description:
            "Difficulty in designing an accessible entrance and potential need for redesign if the survey is not conducted, leading to delays and cost overruns.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The lack of a specified status suggests ongoing work and a moderate likelihood of delays.",
				},
			},
		],
		"October 16": [
			{
				Risk: "Asbestos Reporting",
				"Impact Potential": {
					score: "High",
					description:
            "Potential safety hazards, legal issues, and reputational damage if asbestos handling procedures are not aligned and properly followed.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The pending status and the need for further clarification suggest a moderate likelihood of ongoing discrepancies.",
				},
			},
			{
				Risk: "Consultant Orientation Attendance",
				"Impact Potential": {
					score: "High",
					description:
            "Increased risk of safety incidents and project delays if consultants are not adequately oriented to the site and its hazards.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The pending status and ongoing efforts to ensure attendance suggest a moderate likelihood of continued low attendance.",
				},
			},
			{
				Risk: "Field Club Washroom Functionality",
				"Impact Potential": {
					score: "Mid",
					description:
            "Potential need for additional electrical work and event setup challenges if the functionality is not aligned with requirements.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The lack of a specified status suggests ongoing work and a moderate likelihood of issues.",
				},
			},
			{
				Risk: "Field Club Elevator Design Confirmation",
				"Impact Potential": {
					score: "Mid",
					description:
            "Potential rework and delays if the design changes significantly between IFTs and IMCs.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The pending status and the need for confirmation suggest a moderate likelihood of design changes.",
				},
			},
		],
	},
	42: {
		"October 21": [
			{
				Risk: "Dressing Room Schedule Shift",
				"Impact Potential": {
					score: "High",
					description:
            "Delays in the overall project timeline and potential need for alternative arrangements (mobile shower units) for opening games.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The pending status and the need to consult the events team suggest a moderate likelihood of schedule impacts.",
				},
			},
			{
				Risk: "Geotechnical Report Delay",
				"Impact Potential": {
					score: "High",
					description:
            "Delays in the structural design and construction progress if the geotechnical report is not received promptly.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The pending status and ongoing efforts to expedite the report suggest a moderate likelihood of continued delays.",
				},
			},
			{
				Risk: "Contract Conversion Delay",
				"Impact Potential": {
					score: "High",
					description:
            "Delays in project execution and potential disputes if the contract conversion is not finalized promptly.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The pending status and the ongoing delay in the conversion process suggest a moderate likelihood of continued delays.",
				},
			},
			{
				Risk: "Payment Processing Issues",
				"Impact Potential": {
					score: "High",
					description:
            "Financial strain on Etro and potential project disruptions if payment issues are not addressed promptly.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The pending status and the lack of progress on the August draw suggest a moderate likelihood of continued payment issues.",
				},
			},
			{
				Risk: "Field Club Lighting Access",
				"Impact Potential": {
					score: "Mid",
					description:
            "Potential need for additional electrical work and delays in event setup if the lighting and power situation is not confirmed promptly.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The pending status and the need for confirmation suggest a moderate likelihood of delays.",
				},
			},
		],
		"October 22": [
			{
				Risk: "Grease Interceptor Location",
				"Impact Potential": {
					score: "Mid",
					description:
            "Potential interference with kitchen operations and aesthetic issues if the grease interceptor is not relocated.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The pending status and ongoing feasibility assessment suggest a moderate likelihood of relocation challenges.",
				},
			},
			{
				Risk: "Washroom Lighting Lead Times",
				"Impact Potential": {
					score: "High",
					description:
            "Project delays if the lighting material is not ordered in a timely manner.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The lack of a specified status and the emphasis on expediting the process suggest a moderate likelihood of delays.",
				},
			},
			{
				Risk: "Corner Club Elevator Clarification",
				"Impact Potential": {
					score: "Mid",
					description:
            "Potential delays and improper installation if clear instructions are not received from GITEC.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The pending status and reliance on clarification from GITEC suggest a moderate likelihood of delays.",
				},
			},
			{
				Risk: "Kony Shop Drawings Verification",
				"Impact Potential": {
					score: "Mid",
					description:
            "Delays in fabrication and installation if shop drawings are not submitted promptly.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The pending status and the need for further information before submission suggest a moderate likelihood of delays.",
				},
			},
			{
				Risk: "CAD File Provision",
				"Impact Potential": {
					score: "Mid",
					description:
            "Potential delays and difficulties in coordination for Metro if CAD files are not provided as requested.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The pending status and the need for internal discussion suggest a moderate likelihood of delays.",
				},
			},
			{
				Risk: "Sliding Door Specification",
				"Impact Potential": {
					score: "Mid",
					description:
            "Potential delays and difficulty in finding a suitable door option if the specifications are not clarified promptly.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The pending status and the ongoing search for a suitable option suggest a moderate likelihood of delays.",
				},
			},
			{
				Risk: "Washroom Accessibility Questions",
				"Impact Potential": {
					score: "High",
					description:
            "Potential non-compliance with accessibility regulations and rework if issues are not addressed promptly.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The pending status and the need for further clarification suggest a moderate likelihood of ongoing accessibility issues.",
				},
			},
			{
				Risk: "Washroom Water Shutdown Coordination",
				"Impact Potential": {
					score: "Mid",
					description:
            "Delays in washroom plumbing work if the water shutdown is not properly coordinated and executed.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The pending status and the need for coordination with PavCo suggest a moderate likelihood of delays.",
				},
			},
			{
				Risk: "Change Directive Process",
				"Impact Potential": {
					score: "High",
					description:
            "Delays, disputes, and budget overruns if a clear process is not established and followed for change management.",
				},
				Likelihood: {
					score: "High",
					description:
            "The ongoing discussions and the need for clarification suggest a high likelihood of ongoing process ambiguity.",
				},
			},
			{
				Risk: "Field Club Elevator Mud Slab Inspection",
				"Impact Potential": {
					score: "High",
					description:
            "Potential structural issues and non-compliance if the inspection is not conducted.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The pending status and the need for confirmation of the geotechnical engineer's availability suggest a moderate likelihood of delays.",
				},
			},
			{
				Risk: "Underslab Work Review",
				"Impact Potential": {
					score: "High",
					description:
            "Potential clashes, rework, and delays if underslab work is not reviewed and approved before concrete pouring.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The pending status and the need for discussion suggest a moderate likelihood of delays.",
				},
			},
			{
				Risk: "Site Instruction Documentation",
				"Impact Potential": {
					score: "High",
					description:
            "Communication breakdowns, tracking errors, and potential disputes if site instructions are not properly documented and numbered.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The resolution of the numbering issue suggests a moderate initial likelihood of documentation issues, which has now been mitigated.",
				},
			},
			{
				Risk: "Occupancy Documentation Coordination",
				"Impact Potential": {
					score: "High",
					description:
            "Delays in obtaining occupancy permits and potential handover issues if documentation is not properly coordinated and submitted.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The pending status and the need for coordination suggest a moderate likelihood of delays.",
				},
			},
			{
				Risk: "Building Permit Acquisition",
				"Impact Potential": {
					score: "High",
					description:
            "Inability to obtain occupancy permits and potential legal issues if the building permit is not acquired in a timely manner.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The pending status and the criticality of the permit suggest a moderate likelihood of delays.",
				},
			},
			{
				Risk: "Waste Manifest Accuracy",
				"Impact Potential": {
					score: "High",
					description:
            "Environmental compliance issues and potential penalties if waste is not properly tracked and disposed of.",
				},
				Likelihood: {
					score: "High",
					description:
            "The reliance on subcontractors for accurate manifests suggests a high likelihood of inaccuracies.",
				},
			},
			{
				Risk: "Lead Education Point Replacement",
				"Impact Potential": {
					score: "High",
					description:
            "Failure to meet sustainability targets and potential loss of LEED points if a suitable replacement strategy is not implemented.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The pending status and ongoing discussions suggest a moderate likelihood of delays in finding a replacement.",
				},
			},
			{
				Risk: "Procore RFI and Submittal Closure",
				"Impact Potential": {
					score: "Mid",
					description:
            "Communication breakdowns and potential project delays if RFIs and submittals are not promptly addressed and closed out.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The pending status and the need for Etro to review and close out items suggest a moderate likelihood of delays.",
				},
			},
			{
				Risk: "Field Review Report Timeliness",
				"Impact Potential": {
					score: "Mid",
					description:
            "Project delays and potential rework if field review findings are not communicated promptly.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The pending status and the potential for delayed reports suggest a moderate likelihood of delays.",
				},
			},
			{
				Risk: "Sanitary Line Connection Report",
				"Impact Potential": {
					score: "Low",
					description:
            "Potential documentation gaps and lack of clarity regarding the connection if a report is not provided.",
				},
				Likelihood: {
					score: "Low",
					description:
            "The clarification that a report is not required suggests a low likelihood of issues.",
				},
			},
			{
				Risk: "Banquet Room Accessibility",
				"Impact Potential": {
					score: "Mid",
					description:
            "Potential delays in inspections and project progress if access to the banquet room is restricted.",
				},
				Likelihood: {
					score: "Mid",
					description:
            "The pending status and the need for coordination suggest a moderate likelihood of access restrictions.",
				},
			},
		],
	},
};

export const task_progress: {
  [key: string]: {
    [key: string]: {
      Task: string;
      description: string;
    }[];
  };
} = {
	40: {
		"October 8": [
			{
				Task: "Low Voltage Work",
				description: "The work is in progress.",
			},
		],
		"October 9": [
			{
				Task: "Underground plumbing for the Field Club elevator",
				description:
          "Work is proceeding based on sketches and markups, raising concerns about liability. An SI was requested, but Sls cannot be issued until after IFC documents. Etro is pushing for WSP to issue the required IFCs.",
			},
		],
	},
	41: {
		"October 15": [
			{
				Task: "Temporary glazing",
				description: "Resolved.",
			},
			{
				Task: "Ceiling coordination",
				description:
          "Proceeding with IFT, with minor coordination work to be done later with KEL. Electrical designers to be added to the next meeting.",
			},
			{
				Task: "Corner Club Elevator Architectural Model",
				description:
          "Ian (from WSP) to confirm. The model is published regularly on Friday nights.",
			},
			{
				Task: "Topographical survey around Corner Club entrance lobby",
				description: "Etro to take a few topographical points around the area.",
			},
		],
		"October 16": [
			{
				Task: "Field Club Completion",
				description:
          "Slab pouring scheduled for next Friday, followed by cleanup and staging. Washroom framing and plumbing rough-in ongoing.",
			},
			{
				Task: "Field Club Washroom Project-Completion",
				description:
          "Night shift work being explored to expedite the project. CMU wall nearly complete. Plumbing rough-in ongoing, with some RFIs issued by Hul.",
			},
		],
	},
	42: {
		"October 22": [
			{
				Task: "Fire Booster Panel location",
				description: "Resolved.",
			},
			{
				Task: "Grease interceptor location",
				description:
          "Lowell (from PavCo) is looking into alternative locations.",
			},
			{
				Task: "Lighting design for washrooms",
				description: "Expected to be completed on October 22nd, 2024.",
			},
			{
				Task: "HVAC SI",
				description:
          "Set instruction package including the revised SI expected by the end of the day on October 22nd, 2024.",
			},
			{
				Task: "Kony shop drawings",
				description: "Drawings to be submitted soon.",
			},
			{
				Task: "Banquet room sliding doors",
				description:
          "PavCo to provide information on the door. Samir suggested a potential supplier (TorMax), but it may not meet the project's needs.",
			},
			{
				Task: "Mud Slab Inspection in Field Club Elevator",
				description: "To be inspected by geotech on Monday or Tuesday morning.",
			},
			{
				Task: "CAD file sharing schedule",
				description: "WSP to discuss internally.",
			},
			{
				Task: "Change Order Process",
				description:
          "Etro to start sending change orders; the process for site instructions with cost changes to be determined.",
			},
		],
	},
	43: {
		"October 29": [
			{
				Task: "Mud Slab Inspection in Field Club Elevator",
				description: "To be inspected by geotech on Monday or Tuesday morning.",
			},
		],
	},
};

export const trade_assessment: {
  [key: string]: {
    [key: string]: {
      Trade: string;
      "Risk score": number;
      Tasks: string;
      Rationale: string;
    }[];
  };
} = {
	40: {
		"October 8-14": [
			{
				Trade: "WSP Electrical (specifically F&H Electrical)",
				"Risk score": 2,
				Tasks: "Field review reports",
				Rationale:
          "Repeatedly failed to meet deadlines for field review reports. On September 20th, 2024, they conducted a review of MB cable rerouting. Though the work was completed on September 21st, a report wasn't issued until much later. On September 26th, ETRO requested a final review so they could close out their permit with the City of Vancouver, but this has yet to be completed. These delays have caused frustration and could lead to project setbacks.",
			},
			{
				Trade: "WSP Structural",
				"Risk score": 4,
				Tasks: "Review of exploratory works",
				Rationale:
          "Has been generally responsive to ETRO's needs. Notably, they found the scans and documentation provided by ETRO to be useful for their review of exploratory works. This effective communication has facilitated a smooth workflow.",
			},
			{
				Trade: "A49",
				"Risk score": 3,
				Tasks: "Coordination with other disciplines",
				Rationale:
          "A49's coordination with other disciplines has been lacking, resulting in clashes and potential rework. For example, there was a clash between the sump placement and the raft step in the Field Club innovator project. The electrical design packages submitted have also been incomplete and uncoordinated, leading to confusion and requests for clarification. This lack of coordination has caused frustration and potential delays for ETRO.",
			},
			{
				Trade: "Pacific Demolition",
				"Risk score": 2,
				Tasks: "Asbestos removal",
				Rationale:
          "Failed to follow PavCo's procedures for asbestos removal. Their actions raised safety concerns and required intervention from PavCo's safety team. PavCo insists that moving forward, ETRO should only utilize one of their three approved contractors for asbestos removal to avoid similar issues.",
			},
			{
				Trade: "KEL",
				"Risk score": 3,
				Tasks: "Model coordination",
				Rationale:
          "KEL's use of CAD software instead of Revit poses challenges for model coordination with the rest of the project team. This difference in software necessitates exporting drawings to CAD format for KEL's use, introducing an extra step that could lead to errors or delays. While not insurmountable, this discrepancy highlights a potential area for improvement in terms of project-wide software compatibility.",
			},
		],
	},
	41: {
		"October 15-21": [
			{
				Trade: "WSP Geotech",
				"Risk score": 1,
				Tasks:
          "Providing reports and information related to the foundation design",
				Rationale:
          "Has been incredibly slow in providing necessary reports and information related to the foundation design. As of October 21st, ETRO was still awaiting a determination on whether the foundation would utilize a raft or piles. This lack of information is delaying decision-making and could significantly impact the project schedule.",
			},
			{
				Trade: "Keith & Son Contracting",
				"Risk score": 3,
				Tasks: "Underground plumbing for the field club elevator",
				Rationale:
          "Performance has been inconsistent. They have been involved in misunderstandings and delays. For example, confusion arose regarding which project the underground plumbing for the field club elevator was associated with, causing scheduling conflicts. Additionally, they have not provided a definitive schedule for all of their projects.",
			},
			{
				Trade: "KONE",
				"Risk score": 3,
				Tasks:
          "Providing shop drawings for the field club and corner club elevators",
				Rationale:
          "Has been slow in providing shop drawings, specifically for the field club and corner club elevators. ETRO requested these drawings on October 15th. As of October 16th, KONE had received feedback from ETRO regarding the shop drawings for the Field Club and were working on revisions. As of October 22nd, they had yet to provide an updated timeline for the revised shop drawings. This delay is holding up progress for both ETRO and other trades.",
			},
		],
	},
	42: {
		"October 22-28": [
			{
				Trade: "Populous",
				"Risk score": 3,
				Tasks: "Communication regarding design changes and updates",
				Rationale:
          "Populous's communication regarding design changes and updates has been unclear, leading to confusion and potential rework. For example, they provided a 2D footprint for seating in the Field Club, but the teams were still requesting more information. They were supposed to provide a 3D perspective but hadn't done so yet. They also made a last-minute change to the layout of the washrooms in Media A, causing frustration for the teams. Clear and timely communication is crucial for a successful project.",
			},
		],
	},
};

export const weekly_priorities: {
  [key: string]: {
    // Week number (e.g., "38")
    week_name: string;
    priorities: {
      topic: string;
      description: string;
    }[];
  };
} = {
	40: {
		week_name: "October 8 - October 14",
		priorities: [
			{
				topic: "Hilti Smoke Stop Solution for Wall Penetration",
				description:
          "Obtain confirmation from Ryan (PavCo) regarding the acceptability of the Hilti smoke stop solution proposed for a wall penetration.",
			},
			{
				topic: "Electrical Panel Core Location RFI",
				description:
          "Address RFI #621 concerning the core location for the electrical panel, primarily an architectural concern. Chris (Etro Construction Limited) to review and provide input.",
			},
			{
				topic: "Red Group and Corner Club Page Turns",
				description:
          "Schedule page turns for the Red Group SD (issued October 11th) and Corner Club Phase 2 pre-IFT (due October 8th) with PavCo representatives.",
			},
			{
				topic: "Temporary Glazing Line Alterations Documentation",
				description:
          "Document the decision to proceed with alterations for the temporary glazing line as discussed between Duane Ferreira (Etro Construction Limited) and PavCo. Potentially issue a reverse RFI to the consultant group for record-keeping purposes.",
			},
			{
				topic: "Sodexo Coordination for Field Club",
				description:
          "Address outstanding coordination issues for the Sodexo kitchen in Field Club, including updating drawings based on the latest equipment cut sheets.",
			},
			{
				topic: "Lead Item Deficiency Resolution",
				description:
          "Work with Esther (Populous) to identify suitable replacement strategies to regain four LEED points lost due to the flush wall design.",
			},
			{
				topic: "Paint Draw Down Lead Content Information",
				description:
          "Provide PavCo with lead content information for the paint draw downs submitted for selection.",
			},
			{
				topic: "Corner Club Elevator Rigging Support Design",
				description:
          "Andrew (WSP) to prioritize the design of rigging supports for the Corner Club elevator, a critical element for the project.",
			},
			{
				topic: "Field Club Geotechnical Investigation",
				description:
          "Schedule geotechnical investigations for the Field Club, potentially for Wednesday or Thursday of the following week, pending approval from PavCo and Etro Construction Limited.",
			},
			{
				topic: "Corner Club Elevator Geotechnical Report",
				description:
          "Follow up and obtain the geotechnical report for the Corner Club elevator testing completed on Friday, October 12th, 2024. Share a copy of the report with the team.",
			},
			{
				topic: "Field Club Elevator Underground Plumbing Site Instruction",
				description:
          "Issue a site instruction outlining the changes to the underground plumbing scope for the Field Club elevator project to facilitate pricing and construction.",
			},
		],
	},
	41: {
		week_name: "October 15 - October 21",
		priorities: [
			{
				topic: "Fire Booster Panel Relocation",
				description:
          "Confirm relocation of the Fire Booster Panel to the janitor room in the Field Club.",
			},
		],
	},
	42: {
		week_name: "October 22 - October 28",
		priorities: [
			{
				topic: "Grease Interceptor Relocation in Field Club",
				description:
          "Ali (Etro Construction Limited) to provide an update on the feasibility of relocating the grease interceptor in Field Club further from the display kitchen. Lowell is currently investigating potential inversions.",
			},
			{
				topic: "Washroom Lighting Submittal",
				description:
          "Ben (Etro Construction Limited) to provide a timeline for issuing the lighting submittal for the washrooms, a long lead item.",
			},
			{
				topic: "Field Club HVAC Set Instruction Package",
				description:
          "Ali (Etro Construction Limited) to issue a set instruction package for the Field Club HVAC, incorporating revisions made to the external static pressure in the previous submittal.",
			},
			{
				topic: "Field Club Elevator Geotech Lift Details RFI",
				description:
          "Andrew (WSP) to address a follow-up RFI from Angela (Etro Construction Limited) seeking clarification on the geotechnical requirements for lifts in the Field Club elevator.",
			},
			{
				topic: "Kony Shop Drawings",
				description:
          "Abdullah (Etro Construction Limited) to issue the Kony shop drawings for both the Field Club elevator and Corner Club after final verification of the pin dimension.",
			},
			{
				topic: "CAD File Submission Schedule",
				description:
          "Chris (Etro Construction Limited) to discuss internally and with WSP the feasibility of providing CAD files to Metro on a scheduled basis, potentially including them with milestone deliverables. The focus is on providing base layout plans, RCPs, and dimensioned grids in CAD format.",
			},
			{
				topic: "Red Group 50% DD Page Turn",
				description:
          "Schedule a page turn with PavCo for the Red Group 50% design development submission issued on Friday, October 18th, 2024.",
			},
			{
				topic: "KEL Integration into Design/Construction Meetings",
				description:
          "Include representatives from KEL, the lighting consultant, in the upcoming design/construction meetings for the Corner Club. Coordinate a suitable time slot for their participation, potentially at the beginning or end of the meeting.",
			},
			{
				topic: "LMDG Corner Club Drawing Review Follow Up",
				description:
          "Follow up with LMDG regarding the review of Corner Club drawings submitted by Miranda (PavCo).",
			},
			{
				topic:
          "Corner Club Entrance Lobby Topographical Survey Area Clarification",
				description:
          "Provide Chris (Etro Construction Limited) with a marked-up plan indicating the general area around the Corner Club entrance lobby on Level 150 requiring a topographical survey.",
			},
			{
				topic:
          "Revised Underground Plumbing Site Instruction and IFC Set for Field Club Elevator",
				description:
          "Ali (Etro Construction Limited) to confirm the approach for documenting the revised underground plumbing scope related to the Field Club elevator. Issue either a comprehensive site instruction reflecting the latest agreements or a formal IFC set specifically for the underground works.",
			},
			{
				topic: "Testing Room V-Items",
				description:
          "Ali (Etro Construction Limited) to provide a list of V-items for the Testing Room project, which Procore has reportedly finalized.",
			},
			{
				topic: "Field Club Elevator Vertical Transportation Contract Status",
				description:
          "Abdullah (Etro Construction Limited) to confirm the status of the vertical transportation contract for the Field Club elevator and whether the contractor is onboard.",
			},
			{
				topic: "Site Measurements for Levels 2 and 4",
				description:
          "Abdullah (Etro Construction Limited) to update Andrew (WSP) on the progress of obtaining the requested site measurements on levels 2 and 4. The survey team was onsite the day before, and updates are pending.",
			},
			{
				topic: "Banquet Room Sliding Doors Information Request",
				description:
          "Identify the manufacturer, model, or any relevant information for the four-panel sliding glass doors specified for the banquet rooms in Field Club. lan (KEL) is seeking this information.",
			},
			{
				topic: "Geotechnical Report for Field Club Elevator Mud Slab",
				description:
          "Arrange for the geotechnical engineer, Ryan, to conduct an inspection of the mud slab in the Field Club elevator on Monday or Tuesday morning before the pour.",
			},
			{
				topic: "Schedule of Values for Occupancy",
				description:
          "Provide Chris (Etro Construction Limited) with schedule of values to facilitate the verification of substantial performance prior to occupancy, particularly for the washrooms. The relevance of this given the project's unique contractual structure and phased occupancy needs to be clarified.",
			},
			{
				topic: "Occupancy Documentation Checklist",
				description:
          "Develop a comprehensive checklist or responsibility matrix outlining the required occupancy documentation for each project phase. Clarify responsibilities for consultants, contractors, and subcontractors to ensure a smooth transition to occupancy.",
			},
		],
	},
};
