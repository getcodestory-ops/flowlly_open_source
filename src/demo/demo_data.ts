export const change_orders: {
  [key: string]: {
    week: string;
    date: string;
    "change order": { "change order": string; description: string };
  }[];
} = {
  "Generator Change Order": [
    {
      week: "38",
      date: "September 17",
      "change order": {
        "change order": "Generator Change Order",
        description:
          "A change order for a generator and quick connections is submitted, originally priced at $59,000.",
      },
    },
    {
      week: "38",
      date: "September 18",
      "change order": {
        "change order": "Generator Change Order",
        description:
          "The Owner requests a revised change order excluding the generator itself, reducing the price to $50,000.",
      },
    },
    {
      week: "39",
      date: "September 24",
      "change order": {
        "change order": "Generator Change Order",
        description:
          "The revised change order, priced at $23,000, is presented to the Owner for approval. The original $59,000 change order is also available for consideration.",
      },
    },
    {
      week: "39",
      date: "September 24",
      "change order": {
        "change order": "Generator Change Order",
        description:
          "After discussion, the Owner decides to proceed with the original $59,000 change order that includes the generator.",
      },
    },
    {
      week: "40",
      date: "October 1",
      "change order": {
        "change order": "Generator Change Order",
        description:
          "The revised change order, priced at $23,000, is presented to the Owner for approval. The original $59,000 change order is also available for consideration.",
      },
    },
    {
      week: "40",
      date: "October 1",
      "change order": {
        "change order": "Generator Change Order",
        description:
          "After discussion, the Owner decides to proceed with the original $59,000 change order that includes the generator.",
      },
    },
  ],
  "Steel Stud Change Order for Workshop": [
    {
      week: "38",
      date: "September 18",
      "change order": {
        "change order": "Steel Stud Change Order for Workshop",
        description:
          "The change order for the steel stud installation is awaiting the client's clarification.",
      },
    },
    {
      week: "38",
      date: "September 20",
      "change order": {
        "change order": "Steel Stud Change Order for Workshop",
        description:
          "The change order is deemed too expensive, and the Owner is considering reducing the scope.",
      },
    },
    {
      week: "41",
      date: "October 9",
      "change order": {
        "change order": "Steel Stud Change Order for Workshop",
        description:
          "K-GC has not yet signed the change order. Lucas suggests sending it to Sam for signing.",
      },
    },
  ],
  "Mechanic Shop Walls Change Order": [
    {
      week: "38",
      date: "September 20",
      "change order": {
        "change order": "Mechanic Shop Walls Change Order",
        description:
          "The Owner requests pricing for the framing of a wall in the mechanic shop.",
      },
    },
    {
      week: "41",
      date: "October 9",
      "change order": {
        "change order": "Mechanic Shop Walls Change Order",
        description:
          "The change order, including the wall framing and heat pump, has been approved.",
      },
    },
    {
      week: "42",
      date: "October 16",
      "change order": {
        "change order": "Mechanic Shop Walls Change Order",
        description:
          "Lucas confirms that the change order for the mechanic shop wall has been sent to the client for approval.",
      },
    },
  ],
  "Overhead Doors Change Order for Mechanic Shop": [
    {
      week: "38",
      date: "September 20",
      "change order": {
        "change order": "Overhead Doors Change Order for Mechanic Shop",
        description:
          "The team anticipates an upcoming change order for motorizing the overhead doors in the mechanic shop. They are awaiting pricing information from ESL.",
      },
    },
    {
      week: "41",
      date: "October 9",
      "change order": {
        "change order": "Overhead Doors Change Order for Mechanic Shop",
        description:
          "ESL is actively working on the pricing for the motorized doors.",
      },
    },
  ],
  "Workshop Building Concrete Seal Change Order": [
    {
      week: "41",
      date: "October 8",
      "change order": {
        "change order": "Workshop Building Concrete Seal Change Order",
        description:
          "The change order has been approved, but the work has not started.",
      },
    },
  ],
};

export const delay_factors: {
  [key: string]: {
    [key: string]: { factor: string; description: string }[];
  };
} = {
  "38": {
    "September 17": [
      {
        factor: "DoorMaster (Door Supplier)",
        description:
          "DoorMaster's inability to provide doors on schedule, with a delay of at least one week, affects the project timeline. The doors were initially expected to be installed on September 17, but their late arrival pushes the task back by a week.",
      },
      {
        factor: "K-GC (General Contractor)",
        description:
          "Delays in boarding the admin building are attributed to K-GC. Although the original schedule indicated boarding would begin on September 17, it is pushed back to September 20 due to measurement and material delivery issues. K-GC also faces criticism for not following a logical sequence in construction activities.",
      },
    ],
    "September 18": [
      {
        factor: "Mechanik (Mechanical Subcontractor)",
        description:
          "Mechanik is behind schedule in the mechanical building due to delayed material delivery.",
      },
    ],
  },
  "39": {
    "September 24": [
      {
        factor: "Owner Representatives (Client)",
        description:
          "The Owner's decision-making process regarding change orders contributes to delays. Multiple individuals are involved in the approval process, leading to extended wait times. For example, a change order for urinals remains open despite being practically completed, awaiting final approval from the Owner.",
      },
    ],
    "September 25": [
      {
        factor: "ARQUI (Architect and Engineering Firm)",
        description:
          "Slow response times from ARQUI on RFIs contribute to project delays. As of September 27, three RFIs remain open, impacting the progress of various tasks, including the gas supply and HVAC installation.",
      },
    ],
  },
  "41": {
    "October 8": [
      {
        factor: "DoorMaster (Door Supplier)",
        description:
          "DoorMaster continues to experience difficulties in delivering materials on schedule. The wooden doors are now expected to arrive sometime between October 16 and 17.",
      },
      {
        factor: "Omar (Appliance Supplier)",
        description:
          "Omar's slow response and potential credit issues lead to concerns about procuring washing appliances. This could potentially impact the project's finishing stages.",
      },
      {
        factor: "K-GC (General Contractor)",
        description:
          "K-GC acknowledges being two weeks behind the overall project schedule. They attribute this delay to material shortages and a lack of urgency among some subcontractors.",
      },
    ],
  },
  "42": {
    "October 16": [
      {
        factor: "Creative Door (Overhead Door Supplier)",
        description:
          "Uncertainty surrounding the delivery date for overhead doors poses a risk to the schedule. Although tentatively scheduled for the week of September 23, a firm date has yet to be confirmed.",
      },
      {
        factor: "K-GC (General Contractor)",
        description:
          "Delays in boarding activities impact the start date for millwork. The originally scheduled start date of October 4 is pushed back by at least a week.",
      },
    ],
    "October 17": [
      {
        factor: "Mechanik (Mechanical Subcontractor)",
        description:
          "Despite having the main units on-site, Mechanik still awaits various components, including motors and dampers. These missing items hinder their progress, particularly in the workshop and mechanics buildings.",
      },
    ],
  },
  "43": {
    "October 23": [
      {
        factor: "Electrical Panel Supplier",
        description:
          "Long lead times for electrical panel interiors (6-8 weeks) pose a significant risk to the project's electrical installation timeline.",
      },
    ],
  },
};

export const rfi: {
  [key: string]: {
    [key: string]: { RFI: string; description: string }[];
  };
} = {
  "38": {
    "September 17": [
      {
        RFI: "Gas Supply RFI",
        description:
          "The team submits an RFI questioning the exterior gas system's working pressure, seeking confirmation that it can be increased to two pounds to permit using one-inch pipes.",
      },
    ],
  },
  "39": {
    "September 24": [
      {
        RFI: "Workshop Dividing Wall RFI",
        description:
          "An RFI is submitted regarding the dividing walls within the workshop.",
      },
    ],
  },
  "40": {
    "October 8": [
      {
        RFI: "Solar RFI",
        description:
          "An RFI is submitted concerning the HVAC system in the solar installation, asking whether it should be positioned above or below the mezzanine.",
      },
      {
        RFI: "HVAC and Mechanical Building RFI",
        description:
          "An RFI is raised regarding the placement of HVAC ductwork within the mechanical building.",
      },
      {
        RFI: "Air Handler Unit and VAV RFI",
        description:
          "An RFI is submitted regarding the air handler unit situated on the VAV system.",
      },
    ],
  },
  "42": {
    "October 16": [
      {
        RFI: "Workshop Dividing Wall RFI",
        description:
          "The RFI remains unresolved, and the team awaits specifics about the damper from the consulting team.",
      },
      {
        RFI: "Breaker Space RFI",
        description:
          "An RFI is formally submitted regarding the lack of breaker spaces to accommodate the five new welding plugs in the workshop. These plugs, rated at sixty amps and each needing two spaces, require ten breaker spaces in total.",
      },
    ],
  },
  "43": {
    "October 23": [
      {
        RFI: "Damper RFI",
        description:
          "An RFI is submitted, raising concerns about a damper located in the workshop's storage area.",
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
  "38": {
    "September 17": [
      {
        Risk: "DoorMaster (Door Supplier) fails to deliver doors as scheduled.",
        "Impact Potential": {
          score: "High",
          description:
            "Door installation is a critical path activity, and delays will significantly impact the overall project schedule.",
        },
        Likelihood: {
          score: "High",
          description:
            "DoorMaster has already demonstrated a pattern of unreliable deliveries and poor communication.",
        },
      },
      {
        Risk: "K-GC (General Contractor) experiences continued delays in boarding activities.",
        "Impact Potential": {
          score: "Mid",
          description:
            "Boarding delays will impact the start of subsequent activities, such as drywall and millwork, but may be mitigated with additional crews or overtime.",
        },
        Likelihood: {
          score: "High",
          description:
            "K-GC has already exhibited delays in boarding and has not demonstrated a consistent pace of work.",
        },
      },
    ],
  },
  "39": {
    "September 24": [
      {
        Risk: "Machanik (Mechanical Subcontractor) faces further delays in receiving materials.",
        "Impact Potential": {
          score: "Mid",
          description:
            "Delayed material deliveries will affect the mechanical installation schedule, potentially impacting subsequent trades.",
        },
        Likelihood: {
          score: "Mid",
          description:
            "Machanik has experienced some material delays, but the severity and frequency are not clearly indicated in the sources.",
        },
      },
      {
        Risk: "CD (Overhead Door Supplier) does not confirm a firm delivery date for overhead doors.",
        "Impact Potential": {
          score: "Mid",
          description:
            "Uncertainty regarding the delivery date could disrupt the planned installation schedule and affect the project's progress.",
        },
        Likelihood: {
          score: "Low",
          description:
            "While a firm date is not confirmed, a tentative delivery window has been provided.",
        },
      },
      {
        Risk: "Owner representatives' slow approval process for change orders continues to cause delays.",
        "Impact Potential": {
          score: "Mid",
          description:
            "Delays in change order approvals can hinder the completion of work and potentially affect the overall project schedule.",
        },
        Likelihood: {
          score: "High",
          description:
            "The sources consistently highlight the Owner's slow decision-making process as a recurring issue.",
        },
      },
    ],
  },
  "40": {
    "October 1": [
      {
        Risk: "Omar (Appliance Supplier) cannot deliver washing appliances due to credit issues.",
        "Impact Potential": {
          score: "Low",
          description:
            "While appliance installation is important, it likely occurs towards the end of the project, and delays may have a minimal impact on the overall schedule.",
        },
        Likelihood: {
          score: "Mid",
          description:
            "The sources express concern about Omar's ability to deliver on time but do not definitively state they are experiencing credit problems.",
        },
      },
      {
        Risk: "ARQUI (Architect and Engineering Firm) continues to provide slow responses to RFIs.",
        "Impact Potential": {
          score: "Mid",
          description:
            "Delayed RFI responses can create bottlenecks in decision-making and hinder the progress of various tasks.",
        },
        Likelihood: {
          score: "Mid",
          description:
            "ARQUI's slow response times have been noted in the sources, but the extent of the impact is not entirely clear.",
        },
      },
      {
        Risk: "Millwork material lead time extends project completion date.",
        "Impact Potential": {
          score: "High",
          description:
            "The long lead time for millwork materials could significantly delay the completion of interior finishes.",
        },
        Likelihood: {
          score: "High",
          description:
            "The millwork supplier has already confirmed the extended lead time, making the risk highly likely to occur.",
        },
      },
    ],
  },
  "41": {
    "October 8": [
      {
        Risk: "Lack of clarity surrounding gas line design and responsibility between Urban Systems and the mechanical engineer leads to installation delays.",
        "Impact Potential": {
          score: "Mid",
          description:
            "Delays in gas line installation could affect the start of mechanical work and potentially delay subsequent activities.",
        },
        Likelihood: {
          score: "Mid",
          description:
            "The confusion over responsibility could lead to delays, but the sources do not indicate the severity or potential impact on the schedule.",
        },
      },
      {
        Risk: "Discrepancies in drawings regarding the mezzanine ceiling (drywall vs. T-bar) lead to rework or delays.",
        "Impact Potential": {
          score: "Low",
          description:
            "While rework or delays are possible, the impact is likely to be localized to the mezzanine area and should not significantly affect the overall project schedule.",
        },
        Likelihood: {
          score: "Mid",
          description:
            "Discrepancies in drawings are a common occurrence in construction, increasing the likelihood of this risk materializing.",
        },
      },
      {
        Risk: "Lack of clear communication between subcontractors and the project team causes coordination challenges and potential delays.",
        "Impact Potential": {
          score: "Mid",
          description:
            "Communication breakdowns can lead to scheduling conflicts, rework, and overall project inefficiencies.",
        },
        Likelihood: {
          score: "High",
          description:
            "The sources consistently highlight instances of miscommunication and coordination issues between the project team and subcontractors.",
        },
      },
    ],
  },
  Ongoing: {
    Risks: [
      {
        Risk: "Subcontractor performance remains inconsistent and unreliable.",
        "Impact Potential": {
          score: "High",
          description:
            "Poor subcontractor performance can lead to significant project delays, cost overruns, and quality issues.",
        },
        Likelihood: {
          score: "High",
          description:
            "The sources consistently point to performance issues with specific subcontractors, including K-GC and Machanik.",
        },
      },
      {
        Risk: "Material availability continues to be a challenge, potentially affecting the project's progress.",
        "Impact Potential": {
          score: "High",
          description:
            "Material shortages and delivery delays can significantly impact the project schedule and potentially lead to cost increases.",
        },
        Likelihood: {
          score: "Mid",
          description:
            "While material availability has been an issue, it's unclear how widespread or frequent these challenges are.",
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
  "38": {
    "September 17": [
      {
        Task: "Installation of Door Frames - Admin Building",
        description:
          "The door frames were expected to arrive on Friday the 13th. Their late arrival is causing K-GC to hold off on boarding the rest of the admin building.",
      },
      {
        Task: "Insulation + one side Drywall - Admin Building",
        description:
          "Framing delays have pushed back this task. Originally scheduled to start the week of the 17th, work is now expected to begin tomorrow the 18th.",
      },
      {
        Task: "Drywall closing - Admin Building",
        description:
          "The start date for this task has been pushed to the 19th.",
      },
      {
        Task: "Taping and Mudding - Admin Building",
        description:
          "The taping and mudding of the admin building is expected to be completed by Friday the 20th.",
      },
      {
        Task: "Primer Paint - Admin Building",
        description:
          "Originally expected to start on the 11th, the primer painting of the admin building is now scheduled to begin the week of the 24th.",
      },
      {
        Task: "Millwork Cabinets, and Kitchen - Admin Building",
        description:
          "The millwork lead time is 12 weeks, much longer than initially anticipated.",
      },
      {
        Task: "Steel Stud Walls - Workshop Building",
        description:
          "Though material arrived on the 17th, K-GC is still doing some back framing in the workshop.",
      },
      {
        Task: "Plumbing Rough ins - Workshop Building",
        description:
          "The plumbers are behind and currently only working on the first bay.",
      },
      {
        Task: "Ducting and HVAC Rough ins - Workshop Building",
        description:
          "Evolution is approximately 90% finished with their rough-ins in the workshop and waiting on the VAV units.",
      },
      {
        Task: "Electrical Rough ins in Walls - Workshop Building",
        description:
          "Electricians are currently unable to work due to other trades being behind.",
      },
      {
        Task: "Backing on Walls - Workshop Building",
        description:
          "As this depends on the completion of other rough-ins, this task has not yet begun.",
      },
      {
        Task: "Installation of Door Frames - Workshop Building",
        description:
          "The door frames have not arrived yet. They were ordered on the 12th and expected to arrive on Friday the 13th.",
      },
      {
        Task: "Steel Stud Walls - Mechanic Shop Building",
        description:
          "This is the only work currently happening in the mechanic's shop. Framing is awaiting engineering details for the overhead door.",
      },
      {
        Task: "Plumbing Rough ins - Mechanic Shop Building",
        description:
          "The plumbers are doing roughing in the mechanic shop, though the exact status is unclear.",
      },
    ],
  },
  "39": {
    "September 24": [
      {
        Task: "Installation of Door Frames - Admin Building",
        description:
          "The installation of the admin building door frames took place on Monday the 23rd.",
      },
      {
        Task: "Insulation + one side Drywall - Admin Building",
        description:
          "Boarding commenced on Tuesday the 17th, though it is unclear whether the insulation and drywall followed as scheduled.",
      },
      {
        Task: "Drywall closing - Admin Building",
        description:
          "K-GC is scheduled to begin boarding the admin building tomorrow the 25th, meaning drywall closing likely won't start this week.",
      },
      {
        Task: "Taping and Mudding - Admin Building",
        description:
          "Tapers are expected to complete three bays in the workshop by Monday the 30th. It is not specified whether they will move on to the admin building after this, and if so, how long that will take.",
      },
      {
        Task: "Primer Paint - Admin Building",
        description:
          "Painters are currently on-site working in the admin building.",
      },
      {
        Task: "Millwork Cabinets, and Kitchen - Admin Building",
        description:
          "Millwork has been pushed back a week from the original start date. The installation is not expected to occur before the windows arrive, which isn't scheduled to happen until the 23rd.",
      },
      {
        Task: "Steel Stud Walls - Workshop Building",
        description: "Framing the workshop is complete.",
      },
      {
        Task: "Plumbing Rough ins - Workshop Building",
        description:
          "It is unclear whether plumbing rough-ins have been completed in the workshop.",
      },
      {
        Task: "Ducting and HVAC Rough ins - Workshop Building",
        description:
          "It is unclear whether Evolution has completed their rough-ins in the workshop. They are waiting on materials that are expected to arrive the first week of October.",
      },
      {
        Task: "Electrical Rough ins in Walls - Workshop Building",
        description:
          "ESL will be working in the workshop this week and is expected to finish by the end of the week.",
      },
      {
        Task: "Backing on Walls - Workshop Building",
        description:
          "As this depends on the completion of other rough-ins, this task has likely not yet begun.",
      },
      {
        Task: "Installation of Door Frames - Workshop Building",
        description:
          "The delivery of the doors is scheduled for this week, though it is unclear if that includes the door frames. K-GC will need these before they can finish the walls.",
      },
      {
        Task: "Steel Stud Walls - Mechanic Shop Building",
        description:
          "The framing of the mechanic shop is expected to be finished today.",
      },
      {
        Task: "Plumbing Rough ins - Mechanic Shop Building",
        description:
          "The plumbers are working on rough-ins in the mechanic's shop.",
      },
    ],
  },
  "40": {
    "October 1": [
      {
        Task: "Installation of Door Frames - Admin Building",
        description: "The admin building door frames are installed.",
      },
      {
        Task: "Insulation + one side Drywall - Admin Building",
        description: "This is likely done.",
      },
      {
        Task: "Drywall closing - Admin Building",
        description: "Drywall closing is likely in progress.",
      },
      {
        Task: "Taping and Mudding - Admin Building",
        description:
          "The workshop taping is expected to be completed by the end of next week, and it's likely the tapers will then move on to the admin building.",
      },
      {
        Task: "Primer Paint - Admin Building",
        description: "Painting is underway in the admin building.",
      },
      {
        Task: "Millwork Cabinets, and Kitchen - Admin Building",
        description:
          "It's unclear whether the millwork has begun. It was scheduled to start this week, but K-GC's boarding delays may have impacted this.",
      },
      {
        Task: "Steel Stud Walls - Workshop Building",
        description: "The workshop is fully boarded and taping has begun.",
      },
      {
        Task: "Plumbing Rough ins - Workshop Building",
        description: "It is unclear whether plumbing rough-ins are complete.",
      },
      {
        Task: "Ducting and HVAC Rough ins - Workshop Building",
        description:
          "Evolution has started hanging ducting in the workshop. Materials for the VAV units are expected to arrive this week.",
      },
      {
        Task: "Electrical Rough ins in Walls - Workshop Building",
        description:
          "It is unclear whether ESL has finished their work in the workshop.",
      },
      {
        Task: "Backing on Walls - Workshop Building",
        description:
          "As this depends on the completion of other rough-ins, this task has likely not yet begun.",
      },
      {
        Task: "Installation of Door Frames - Workshop Building",
        description:
          "The workshop doors are installed, but the door frames may not be. It was mentioned that K-GC might have to frame a wall in the workshop due to a lack of details on the ceiling, which could impact door frame installation.",
      },
      {
        Task: "Steel Stud Walls - Mechanic Shop Building",
        description:
          "Drywall work in the mechanic shop is expected to begin next week.",
      },
      {
        Task: "Plumbing Rough ins - Mechanic Shop Building",
        description:
          "It is unclear whether the plumbers have completed their roughing-ins in the mechanic shop.",
      },
    ],
  },
  "41": {
    "October 8": [
      {
        Task: "Installation of Door Frames - Admin Building",
        description: "The admin building door frames are installed.",
      },
      {
        Task: "Insulation + one side Drywall - Admin Building",
        description: "This is likely complete.",
      },
      {
        Task: "Drywall closing - Admin Building",
        description: "Drywall closing is likely complete.",
      },
      {
        Task: "Taping and Mudding - Admin Building",
        description: "Taping is likely in progress.",
      },
      {
        Task: "Primer Paint - Admin Building",
        description: "Painting is likely in progress.",
      },
      {
        Task: "Millwork Cabinets, and Kitchen - Admin Building",
        description:
          "Millwork is likely in progress, but the exact status is unclear.",
      },
      {
        Task: "Steel Stud Walls - Workshop Building",
        description: "The workshop is boarded and taped.",
      },
      {
        Task: "Plumbing Rough ins - Workshop Building",
        description:
          "The status of the workshop plumbing rough-ins is unknown.",
      },
      {
        Task: "Ducting and HVAC Rough ins - Workshop Building",
        description:
          "Hanging the workshop ducting and heating units is underway.",
      },
      {
        Task: "Electrical Rough ins in Walls - Workshop Building",
        description:
          "The status of electrical rough-ins in the workshop is unknown.",
      },
      {
        Task: "Backing on Walls - Workshop Building",
        description: "The status of backing on the workshop walls is unknown.",
      },
      {
        Task: "Installation of Door Frames - Workshop Building",
        description:
          "The status of the workshop door frame installation is unknown.",
      },
      {
        Task: "Steel Stud Walls - Mechanic Shop Building",
        description: "Drywall work in the mechanic shop is underway.",
      },
      {
        Task: "Plumbing Rough ins - Mechanic Shop Building",
        description:
          "The status of the mechanic shop plumbing rough-ins is unknown.",
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
  "38": {
    "September 17": [
      {
        Trade: "Drywallers",
        "Risk score": 4,
        Tasks:
          "Finishing drywall in the admin building; starting on the workshop.",
        Rationale:
          "Drywallers are slightly behind schedule as they were supposed to have finished the table in the admin building today. Timely completion of drywall work is crucial as it precedes other trades.",
      },
      {
        Trade: "Evolution Mechanical",
        "Risk score": 3,
        Tasks:
          "Waiting for change order approval to begin work on the future mechanical installations in the workshop and mechanics buildings.",
        Rationale:
          "Although the change orders are prepared, delays in client approval could push back their start date. The price validity for the work only holds until October 11th, adding pressure to secure approval.",
      },
      {
        Trade: "Tapers",
        "Risk score": 3,
        Tasks: "Scheduled to begin taping in the workshop.",
        Rationale:
          "The tapers' work depends on the drywallers completing their tasks on time. Delays in drywall finishing will impact their schedule.",
      },
      {
        Trade: "Door Installers",
        "Risk score": 2,
        Tasks: "Installing doors in the admin building.",
        Rationale:
          "The doors have been delivered, and installation is progressing. No major issues are currently reported.",
      },
      {
        Trade: "Storefront Installers",
        "Risk score": 2,
        Tasks: "Completed storefront installation in the admin building.",
        Rationale:
          "The storefront installation is finished, indicating good progress in this area.",
      },
      {
        Trade: "Painters",
        "Risk score": 3,
        Tasks:
          "Painting in the admin building; awaiting confirmation on paint colors for the workshop and mechanics buildings.",
        Rationale:
          "The painters' work is dependent on other trades' progress. Obtaining paint color confirmation for the workshop and mechanics buildings is necessary for a smooth workflow.",
      },
      {
        Trade: "Overhead Door Installers",
        "Risk score": 5,
        Tasks:
          "Scheduled to start installing overhead doors on October 15th, starting with the mechanics building.",
        Rationale:
          "No issues are currently reported with the overhead door installation schedule.",
      },
      {
        Trade: "Plumbers",
        "Risk score": 4,
        Tasks: "Performing rough-in work in the mechanics building.",
        Rationale:
          "The plumbers are reported to be a few days behind schedule. This could potentially impact subsequent trades.",
      },
      {
        Trade: "Architects (AQUI)",
        "Risk score": 3,
        Tasks:
          "Clarifying ceiling detail in the mezzanine area of the workshop; providing paint colors for the workshop and mechanics buildings.",
        Rationale:
          "The architects' timely responses to questions are necessary to prevent work stoppages. Clarifying the ceiling detail in the mezzanine is crucial as it will determine the amount of work required by K-GC.",
      },
      {
        Trade: "Door Supplier",
        "Risk score": 1,
        Tasks:
          "Experiencing significant delays in door deliveries, with no clear indication of when all doors will be available.",
        Rationale:
          "The severe delays in door deliveries pose a critical risk to the project. It is impacting the door installers' schedule and will likely have cascading effects on other trades.",
      },
    ],
  },
  "39": {
    "September 24": [
      {
        Trade: "K-GC (Drywall)",
        "Risk score": 2,
        Tasks: "Continuing boarding in the admin and workshop buildings.",
        Rationale:
          "K-GC has ramped up their efforts by bringing more workers on site. They are progressing well with boarding, but dependent on timely window deliveries.",
      },
      {
        Trade: "Evolution Mechanical",
        "Risk score": 4,
        Tasks:
          "Still waiting for materials; anticipated to receive materials this week or next.",
        Rationale:
          "Material delays are pushing back their start date. This could potentially impact the overall project schedule, especially in the mechanics building where their work represents a significant portion of the remaining tasks.",
      },
      {
        Trade: "Window Supplier",
        "Risk score": 1,
        Tasks: "Windows scheduled for delivery on September 23rd.",
        Rationale:
          "Window delivery is significantly behind schedule, impacting K-GC's boarding progress and delaying other trades' work.",
      },
      {
        Trade: "Millwork",
        "Risk score": 2,
        Tasks:
          "Scheduled to start on Thursday, but potentially delayed due to late window delivery.",
        Rationale:
          "The millwork installation is dependent on the completion of window installation. Any delay in windows will directly impact the millwork schedule.",
      },
    ],
  },
  "40": {
    "October 1": [
      {
        Trade: "Electricians",
        "Risk score": 3,
        Tasks:
          "Continuing work in the admin building, focusing on tasks above the ceiling.",
        Rationale:
          "Electrical work is critical for the building's functionality and must be coordinated with other trades.",
      },
      {
        Trade: "T-Bar Ceiling Installers",
        "Risk score": 4,
        Tasks:
          "Scheduled to start installing the T-bar ceiling in the admin building soon.",
        Rationale:
          "The T-bar installation depends on the completion of electrical work above the ceiling. Coordination between the electricians and T-bar installers is crucial to avoid delays. The raised concern about the compatibility of the lighting layout with the T-bar ceiling plan needs to be addressed promptly.",
      },
      {
        Trade: "Architects (AQUI)",
        "Risk score": 3,
        Tasks:
          "Responding to RFIs, reviewing submittals. A question has been raised about the compatibility of the lighting layout with the T-bar ceiling plan in the admin building.",
        Rationale:
          "The architect's timely responses to inquiries and reviews are crucial to prevent work stoppages. The lighting layout issue in the admin building requires prompt attention to ensure that the T-bar installation can proceed smoothly.",
      },
      {
        Trade: "Consultants",
        "Risk score": 3,
        Tasks: "Reviewing submittals related to air handling unit controls.",
        Rationale:
          "Similar to the architects, the consultants' review process needs to be efficient to avoid holding up other trades.",
      },
    ],
  },
  "41": {
    "October 8": [
      {
        Trade: "Accessories Supplier",
        "Risk score": 4,
        Tasks:
          "A quote was received approximately six weeks ago, but the supplier has not been contacted since.",
        Rationale:
          "The lack of communication with the supplier and the need to confirm pricing and availability increases the risk. Sourcing these accessories from another vendor might be necessary.",
      },
      {
        Trade: "Omar (Potential Accessories Supplier)",
        "Risk score": 3,
        Tasks: "Has not yet been contacted for a quote.",
        Rationale:
          "This represents a potential alternative supplier for the accessories. Engaging with them promptly could mitigate the risk associated with the previous supplier.",
      },
    ],
  },
  "42": {
    "October 15": [
      {
        Trade: "K-GC (Drywall)",
        "Risk score": 2,
        Tasks:
          "Boarding up the workshop, aiming to control moisture levels before taping begins.",
        Rationale:
          "Their progress appears to be on track, but managing moisture levels in the workshop is crucial for the successful completion of drywall work.",
      },
      {
        Trade: "Accordion Door Supplier",
        "Risk score": 2,
        Tasks:
          "Shop drawings for the accordion door are still being finalized.",
        Rationale:
          "The lack of finalized shop drawings could potentially delay the installation of the accordion door, which would impact finishing work in the admin building.",
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
  "38": {
    week_name: "September 17 - September 23",
    priorities: [
      {
        topic: "DoorMaster door delivery",
        description:
          "Confirm DoorMaster's door delivery schedule and implement a contingency plan if delays occur.  This is critical, as door installation is on the critical path and will impact the overall project schedule.  Consider identifying alternative suppliers or exploring options to expedite delivery.",
      },
      {
        topic: "K-GC boarding progress",
        description:
          "Monitor K-GC's boarding activities closely and ensure they have the necessary resources (crews, materials, etc.) to meet the schedule.  Address any performance issues promptly and consider incentives for timely completion. ",
      },
      {
        topic: "Millwork material lead time",
        description:
          "Re-evaluate millwork material choices with the Owner to identify alternatives with shorter lead times.  This is crucial to avoid a significant delay in the project completion date.  Explore options to expedite the delivery of chosen materials if alternative materials are not feasible. ",
      },
      {
        topic: "ARQUI responsiveness to RFIs",
        description:
          "Establish clear communication channels with ARQUI and emphasize the importance of timely RFI responses.  Implement a tracking system for all RFIs and escalate unresolved issues promptly to prevent delays in decision-making.  Consider setting response time expectations in future contracts with ARQUI firms. ",
      },
      {
        topic: "USYS coordination on gas line",
        description:
          "Facilitate communication between USYS and the mechanical engineer to clarify design responsibility and ensure timely gas line installation.  This will prevent potential conflicts and delays to the mechanical work schedule. ",
      },
    ],
  },
  "39": {
    week_name: "September 24 - October 1",
    priorities: [
      {
        topic: "Mechanik material delivery",
        description:
          "Confirm Mechanik's material delivery schedule for the HVAC units and related components.  Work with them to mitigate potential delays and explore backup suppliers or expedited shipping options if necessary. ",
      },
      {
        topic: "Creative Door delivery confirmation",
        description:
          "Obtain a firm delivery date from Creative Door for the overhead doors.  Once confirmed, integrate this date into the master schedule and communicate it to all affected trades. ",
      },
      {
        topic: "Owner change order approvals",
        description:
          "Continue to follow up with the Owner on pending change order approvals.  Highlight the potential impact of delays on the project schedule and explore ways to expedite the approval process.  Maintain transparent and proactive communication with the Owner regarding change order status and expected approval timelines. ",
      },
      {
        topic: "Subcontractor communication and coordination",
        description:
          "Implement strategies to improve communication and coordination between subcontractors.  This could include regular site meetings, clear communication protocols, and shared access to project schedules.  Address any instances of miscommunication or coordination issues promptly to prevent conflicts and delays. ",
      },
      {
        topic: "Window delivery confirmation",
        description:
          "Reconfirm the window delivery date of September 23rd and ensure it aligns with the planned boarding activities.  Any changes to the delivery date need to be communicated immediately to K-GC to prevent delays and potential rework. ",
      },
    ],
  },
  "40": {
    week_name: "October 2 - October 8",
    priorities: [
      {
        topic: "DoorMaster door delivery (Contingency)",
        description:
          "If DoorMaster has not delivered the doors as promised, activate the contingency plan.  This might involve procuring doors from an alternative supplier or adjusting the schedule to minimize the impact of the delay.  Clearly communicate any changes to the schedule and affected parties. ",
      },
      {
        topic: "Omar appliance delivery",
        description:
          "Follow up with Omar regarding their credit situation and confirm their ability to deliver the washing appliances on schedule.  Explore alternative appliance suppliers if Omar cannot meet the project's requirements or faces potential delivery delays due to credit issues. ",
      },
      {
        topic: "ARQUI RFI response (Mezzanine ceiling)",
        description:
          "Obtain a clear answer from ARQUI regarding the mezzanine ceiling detail (drywall vs. T-bar).  Communicate this decision to K-GC to prevent rework and ensure the correct materials are ordered.  Include clear ceiling details in future project drawings to prevent similar issues. ",
      },
      {
        topic: "K-GC drywall progress",
        description:
          "Monitor K-GC's drywall progress in the admin building and address any potential delays promptly.  Ensure a smooth transition between electrical rough-in and drywall installation to maintain project momentum. ",
      },
      {
        topic: "Painting in the admin building",
        description:
          "Coordinate with the painting contractor to begin work in the admin building as soon as possible.  With boarding nearing completion and K-GC scheduled to start drywall, painting can likely begin in areas ready for priming. ",
      },
    ],
  },
  "41": {
    week_name: "October 9 - October 15",
    priorities: [
      {
        topic: "Gas line installation confirmation",
        description:
          "Verify with USYS and the mechanical engineer that the gas line installation is proceeding as planned and will be completed in time for Mechanik to begin their work.  Address any outstanding design or coordination issues to prevent delays in the mechanical installation schedule. ",
      },
      {
        topic: "Mechanik exhaust fan installation",
        description:
          "Coordinate with Mechanik to schedule the installation of the exhaust fans in the workshop.  The change order should be signed, and materials are expected to arrive within 2-3 weeks, allowing for the work to be scheduled. ",
      },
      {
        topic: "Three-week look-ahead review",
        description:
          "Conduct a thorough review of the three-week look-ahead schedule with all subcontractors to ensure accuracy and identify potential conflicts or risks.  This will allow for proactive problem-solving and prevent delays caused by scheduling issues. ",
      },
      {
        topic: "Communication and coordination (Workshop access)",
        description:
          "Ensure clear communication and coordination between subcontractors working in the workshop, especially as Stu begins closing up wall openings.  Provide alternative access routes for subcontractors who require scissor lifts to complete their work. ",
      },
      {
        topic: "Painting progress in the admin building",
        description:
          "Monitor the progress of the painting contractor in the admin building and address any potential delays.  The goal is to have painting completed in the admin building to allow for the installation of fixtures and equipment in the following week. ",
      },
    ],
  },
};
