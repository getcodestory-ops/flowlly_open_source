export interface EmailTemplate {
	id: string;
	name: string;
	description?: string;
	html: string;
}

// Notion-style HTML template
export const NOTION_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meeting Minutes</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif;
            color: #37352f;
            line-height: 1.6;
            margin: 0; padding: 0;
            background: #fff;
        }
        .page-content { max-width: 600px; margin: 0 auto; padding: 40px; }
        h1 { font-size: 32px; font-weight: 700; margin: 0 0 20px; }
        .properties { margin-bottom: 30px; color: #787774; font-size: 14px; }
        .property-row { display: flex; margin-bottom: 8px; align-items: center; }
        .prop-name { width: 120px; display: flex; align-items: center; }
        .prop-value { background: rgba(227, 226, 224, 0.5); padding: 2px 8px; border-radius: 3px; color: #37352f; }
        .person-tag { display: inline-flex; align-items: center; margin-right: 6px; }
        .person-tag::before { content: '@'; color: #999; margin-right: 1px; }
        .timestamp-link {
            color: #EB5757; 
            background: rgba(235, 87, 87, 0.1);
            padding: 1px 6px;
            border-radius: 4px;
            text-decoration: none;
            font-size: 0.85em;
            font-weight: 500;
            margin-right: 8px;
        }
        h2 { margin-top: 2em; border-bottom: 1px solid #e9e9e8; padding-bottom: 8px; font-size: 1.5em; }
        h3 { font-size: 1.2em; font-weight: 600; margin-top: 1.5em; display: flex; align-items: center; }
        blockquote { border-left: 3px solid #37352f; margin: 1em 0; padding-left: 1em; font-style: italic; color: #555; }
        .callout {
            background-color: #F1F1EF; padding: 16px 16px 16px 12px;
            border-radius: 4px; display: flex; gap: 10px; margin: 1em 0;
        }
        details { margin-bottom: 8px; }
        summary { cursor: pointer; font-weight: 600; padding: 4px; display: flex; align-items: center;}
        summary::before { content: '▶ '; font-size: 0.8em; color: #999; margin-right: 8px; }
        details[open] summary::before { content: '▼ '; }
        .toggle-content { padding-left: 28px; padding-bottom: 10px; }
        .checkbox-item { display: flex; align-items: start; margin-bottom: 6px; }
        input[type="checkbox"] { margin-top: 5px; margin-right: 10px; accent-color: #37352f; }
    </style>
</head>
<body>
<div class="page-content">
    <h1>{{MEETING_TITLE}}</h1>
    <div class="properties">
        <div class="property-row">
            <div class="prop-name">Date</div>
            <div class="prop-value">{{DATE}}</div>
        </div>
        <div class="property-row">
            <div class="prop-name">Participants</div>
            <div>{{PARTICIPANTS_TAGS}}</div>
        </div>
    </div>
    <div class="callout">
        <div style="font-size: 1.5em;">💡</div>
        <div><strong>Executive Summary:</strong> {{EXECUTIVE_SUMMARY}}</div>
    </div>
    <h2>Team Updates</h2>
    <div class="toggle-list">
        <details open>
            <summary>
                <a href="#" class="timestamp-link">{{TIMESTAMP_1}}</a> 
                {{UPDATE_TITLE}}
            </summary>
            <div class="toggle-content">
                {{UPDATE_CONTENT}}
            </div>
        </details>
    </div>
    <h2>Discussion Log</h2>
    <h3>
        <a href="#" class="timestamp-link">{{TIMESTAMP_2}}</a> 
        {{DISCUSSION_TITLE}}
    </h3>
    <blockquote>"{{KEY_QUOTE}}"</blockquote>
    <p>{{DISCUSSION_DETAILS}}</p>
    <h2>Action Items</h2>
    <div class="checkbox-item">
        <input type="checkbox">
        <span>
            <a href="#" class="timestamp-link">{{TIMESTAMP_3}}</a>
            <strong>{{ASSIGNEE}}</strong>: {{ACTION_ITEM}}
        </span>
    </div>
</div>
</body>
</html>`;

// Executive summary template
export const EXECUTIVE_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            color: #1a1a1a;
            line-height: 1.7;
            margin: 0; padding: 0;
            background: #fff;
        }
        .container { max-width: 600px; margin: 0 auto; padding: 40px; }
        .header { border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        h1 { font-size: 24px; font-weight: 600; margin: 0 0 8px; color: #1a1a1a; }
        .meta { color: #6b7280; font-size: 14px; }
        .summary-box { background: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; margin: 24px 0; }
        .summary-box h2 { font-size: 14px; text-transform: uppercase; color: #2563eb; margin: 0 0 12px; letter-spacing: 0.5px; }
        .summary-box p { margin: 0; color: #1e40af; }
        h3 { font-size: 16px; color: #374151; margin: 28px 0 12px; }
        ul { margin: 0; padding-left: 20px; }
        li { margin-bottom: 8px; color: #4b5563; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>{{MEETING_TITLE}}</h1>
        <div class="meta">{{DATE}} · {{PARTICIPANT_COUNT}} participants</div>
    </div>
    <div class="summary-box">
        <h2>Executive Summary</h2>
        <p>{{EXECUTIVE_SUMMARY}}</p>
    </div>
    <h3>Key Decisions</h3>
    <ul>
        <li>{{DECISION_1}}</li>
        <li>{{DECISION_2}}</li>
    </ul>
    <h3>Action Items</h3>
    <ul>
        <li><strong>{{ASSIGNEE_1}}</strong>: {{ACTION_1}}</li>
        <li><strong>{{ASSIGNEE_2}}</strong>: {{ACTION_2}}</li>
    </ul>
    <div class="footer">
        This is an automated summary. Full meeting minutes available upon request.
    </div>
</div>
</body>
</html>`;

// Detailed construction meeting template - professional and clean
export const DETAILED_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            color: #1a1a1a;
            line-height: 1.5;
            margin: 0; padding: 0;
            background: #fff;
            font-size: 13px;
        }
        .container { max-width: 700px; margin: 0 auto; padding: 40px; }
        .header { border-bottom: 2px solid #1a1a1a; padding-bottom: 16px; margin-bottom: 24px; }
        .header h1 { font-size: 20px; font-weight: bold; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.5px; }
        .header-subtitle { font-size: 14px; color: #555; margin: 0; }
        .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .meta-table td { padding: 6px 0; vertical-align: top; }
        .meta-label { font-weight: bold; width: 120px; color: #333; }
        .meta-value { color: #1a1a1a; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #ccc; padding-bottom: 6px; margin-bottom: 12px; color: #1a1a1a; }
        .attendee-list { margin: 0; padding: 0; list-style: none; }
        .attendee-list li { padding: 3px 0; }
        .attendee-name { font-weight: 500; }
        .attendee-title { color: #666; font-style: italic; }
        .topic-block { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px dotted #ddd; }
        .topic-block:last-child { border-bottom: none; }
        .topic-title { font-weight: bold; font-size: 13px; margin-bottom: 8px; color: #1a1a1a; }
        .bullet-list { margin: 0 0 0 20px; padding: 0; }
        .bullet-list li { margin-bottom: 6px; color: #333; }
        .decision-list { margin: 0; padding: 0; list-style: none; }
        .decision-list li { padding: 8px 0; border-bottom: 1px solid #eee; display: flex; align-items: flex-start; }
        .decision-list li:last-child { border-bottom: none; }
        .decision-bullet { width: 18px; height: 18px; border: 2px solid #1a1a1a; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; flex-shrink: 0; font-size: 12px; font-weight: bold; }
        .action-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .action-table th { text-align: left; font-weight: bold; padding: 10px 8px; background: #f5f5f5; border: 1px solid #ddd; text-transform: uppercase; font-size: 11px; }
        .action-table td { padding: 10px 8px; border: 1px solid #ddd; vertical-align: top; }
        .action-table tr:nth-child(even) { background: #fafafa; }
        .special-section { background: #f9f9f9; border: 1px solid #e0e0e0; padding: 16px; margin-bottom: 16px; }
        .special-section-title { font-weight: bold; font-size: 12px; text-transform: uppercase; margin-bottom: 10px; color: #333; }
        .safety-alert { background: #fff8e6; border-left: 4px solid #e6a700; padding: 12px 16px; margin-bottom: 16px; }
        .safety-alert-title { font-weight: bold; color: #996600; margin-bottom: 4px; }
        .rfi-item, .change-order-item { padding: 10px 0; border-bottom: 1px solid #eee; }
        .rfi-item:last-child, .change-order-item:last-child { border-bottom: none; }
        .item-number { font-weight: bold; color: #333; }
        .item-status { display: inline-block; padding: 2px 8px; font-size: 11px; font-weight: 500; background: #e8e8e8; color: #555; }
        .item-status.open { background: #fff3cd; color: #856404; }
        .item-status.closed { background: #d4edda; color: #155724; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #ccc; font-size: 11px; color: #888; }
        .footer p { margin: 4px 0; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>{{MEETING_TITLE}}</h1>
        <p class="header-subtitle">Meeting Minutes</p>
    </div>

    <table class="meta-table">
        <tr>
            <td class="meta-label">Date:</td>
            <td class="meta-value">{{DATE}}</td>
        </tr>
        <tr>
            <td class="meta-label">Location:</td>
            <td class="meta-value">{{LOCATION}}</td>
        </tr>
        <tr>
            <td class="meta-label">Project:</td>
            <td class="meta-value">{{PROJECT_NAME}}</td>
        </tr>
        <tr>
            <td class="meta-label">Recorded By:</td>
            <td class="meta-value">{{RECORDED_BY}}</td>
        </tr>
    </table>

    <div class="section">
        <div class="section-title">Attendees</div>
        <table class="meta-table">
            <tr>
                <td class="meta-label">Present:</td>
                <td class="meta-value">{{ATTENDEES_PRESENT}}</td>
            </tr>
            <tr>
                <td class="meta-label">Absent:</td>
                <td class="meta-value">{{ATTENDEES_ABSENT}}</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Safety Issues</div>
        <div class="safety-alert">
            <div class="safety-alert-title">{{SAFETY_TITLE}}</div>
            <div>{{SAFETY_NOTES}}</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Previous Meeting Review</div>
        <ul class="bullet-list">
            <li>{{PREV_REVIEW_1}}</li>
            <li>{{PREV_REVIEW_2}}</li>
        </ul>
    </div>

    <div class="section">
        <div class="section-title">Project Updates</div>
        
        <div class="topic-block">
            <div class="topic-title">{{TOPIC_1_TITLE}}</div>
            <ul class="bullet-list">
                <li>{{TOPIC_1_POINT_1}}</li>
                <li>{{TOPIC_1_POINT_2}}</li>
                <li>{{TOPIC_1_POINT_3}}</li>
            </ul>
        </div>

        <div class="topic-block">
            <div class="topic-title">{{TOPIC_2_TITLE}}</div>
            <ul class="bullet-list">
                <li>{{TOPIC_2_POINT_1}}</li>
                <li>{{TOPIC_2_POINT_2}}</li>
            </ul>
        </div>

        <div class="topic-block">
            <div class="topic-title">{{TOPIC_3_TITLE}}</div>
            <ul class="bullet-list">
                <li>{{TOPIC_3_POINT_1}}</li>
                <li>{{TOPIC_3_POINT_2}}</li>
            </ul>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Decisions</div>
        <ul class="decision-list">
            <li><span class="decision-bullet">✓</span> {{DECISION_1}}</li>
            <li><span class="decision-bullet">✓</span> {{DECISION_2}}</li>
            <li><span class="decision-bullet">✓</span> {{DECISION_3}}</li>
        </ul>
    </div>

    <div class="section">
        <div class="section-title">Action Items</div>
        <table class="action-table">
            <thead>
                <tr>
                    <th style="width: 45%">Action</th>
                    <th style="width: 25%">Responsible</th>
                    <th style="width: 30%">Deadline</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{{ACTION_1_TASK}}</td>
                    <td>{{ACTION_1_OWNER}}</td>
                    <td>{{ACTION_1_DUE}}</td>
                </tr>
                <tr>
                    <td>{{ACTION_2_TASK}}</td>
                    <td>{{ACTION_2_OWNER}}</td>
                    <td>{{ACTION_2_DUE}}</td>
                </tr>
                <tr>
                    <td>{{ACTION_3_TASK}}</td>
                    <td>{{ACTION_3_OWNER}}</td>
                    <td>{{ACTION_3_DUE}}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Change Orders</div>
        <div class="change-order-item">
            <span class="item-number">{{CO_1_NUMBER}}</span> - {{CO_1_DESC}} 
            <span class="item-status {{CO_1_STATUS_CLASS}}">{{CO_1_STATUS}}</span>
        </div>
        <div class="change-order-item">
            <span class="item-number">{{CO_2_NUMBER}}</span> - {{CO_2_DESC}} 
            <span class="item-status {{CO_2_STATUS_CLASS}}">{{CO_2_STATUS}}</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">RFIs (Requests for Information)</div>
        <div class="rfi-item">
            <span class="item-number">{{RFI_1_NUMBER}}</span> - {{RFI_1_DESC}} 
            <span class="item-status {{RFI_1_STATUS_CLASS}}">{{RFI_1_STATUS}}</span>
        </div>
        <div class="rfi-item">
            <span class="item-number">{{RFI_2_NUMBER}}</span> - {{RFI_2_DESC}} 
            <span class="item-status {{RFI_2_STATUS_CLASS}}">{{RFI_2_STATUS}}</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Next Meeting</div>
        <table class="meta-table">
            <tr>
                <td class="meta-label">Date:</td>
                <td class="meta-value">{{NEXT_MEETING_DATE}}</td>
            </tr>
            <tr>
                <td class="meta-label">Time:</td>
                <td class="meta-value">{{NEXT_MEETING_TIME}}</td>
            </tr>
            <tr>
                <td class="meta-label">Location:</td>
                <td class="meta-value">{{NEXT_MEETING_LOCATION}}</td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <p>Minutes prepared by: {{RECORDED_BY}}</p>
        <p>Distribution: All attendees and project stakeholders</p>
        <p>Please review and submit any corrections within 48 hours.</p>
    </div>
</div>
</body>
</html>`;

// Minimal template
export const MINIMAL_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Georgia, "Times New Roman", serif;
            color: #333;
            line-height: 1.8;
            margin: 0; padding: 0;
            background: #fff;
        }
        .container { max-width: 580px; margin: 0 auto; padding: 48px 24px; }
        h1 { font-size: 28px; font-weight: normal; margin: 0 0 8px; }
        .date { color: #888; font-size: 14px; margin-bottom: 32px; }
        p { margin: 0 0 16px; }
        .section { margin-top: 32px; }
        .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-bottom: 12px; }
        ul { margin: 0; padding-left: 18px; }
        li { margin-bottom: 6px; }
    </style>
</head>
<body>
<div class="container">
    <h1>{{MEETING_TITLE}}</h1>
    <div class="date">{{DATE}}</div>
    <p>{{EXECUTIVE_SUMMARY}}</p>
    <div class="section">
        <div class="section-title">Attendees</div>
        <p>{{PARTICIPANTS}}</p>
    </div>
    <div class="section">
        <div class="section-title">Discussion</div>
        <p>{{DISCUSSION_SUMMARY}}</p>
    </div>
    <div class="section">
        <div class="section-title">Next Steps</div>
        <ul>
            <li>{{ACTION_1}}</li>
            <li>{{ACTION_2}}</li>
        </ul>
    </div>
</div>
</body>
</html>`;

// All available templates
export const EMAIL_TEMPLATES: EmailTemplate[] = [
	{ 
		id: "notion", 
		name: "Notion Style", 
		description: "Clean, expandable sections with timestamps",
		html: NOTION_TEMPLATE 
	},
	{ 
		id: "executive", 
		name: "Executive Summary", 
		description: "Brief overview for leadership",
		html: EXECUTIVE_TEMPLATE 
	},
	{ 
		id: "detailed", 
		name: "Detailed Minutes", 
		description: "Professional format with full agenda, decisions, RFIs & action items",
		html: DETAILED_TEMPLATE 
	},
	{ 
		id: "minimal", 
		name: "Minimal", 
		description: "Simple, elegant format",
		html: MINIMAL_TEMPLATE 
	},
];

// Sample data for preview
export const SAMPLE_TEMPLATE_DATA: Record<string, string> = {
	MEETING_TITLE: "Weekly Project Coordination Meeting",
	DATE: new Date().toLocaleDateString("en-US", { 
		weekday: "long", 
		year: "numeric", 
		month: "long", 
		day: "numeric" 
	}),
	DURATION: "45 min",
	PARTICIPANTS_TAGS: '<span class="person-tag">John Smith</span><span class="person-tag">Jane Doe</span><span class="person-tag">Bob Wilson</span>',
	PARTICIPANTS: "John Smith, Jane Doe, Bob Wilson",
	PARTICIPANT_COUNT: "6",
	ATTENDEE_TAGS: `
		<div class="attendee-tag"><span class="attendee-avatar">JS</span>John Smith</div>
		<div class="attendee-tag"><span class="attendee-avatar">JD</span>Jane Doe</div>
		<div class="attendee-tag"><span class="attendee-avatar">BW</span>Bob Wilson</div>
	`,
	EXECUTIVE_SUMMARY: "Team reviewed Q1 progress and aligned on upcoming sprint priorities. Key blockers identified and assigned owners for resolution.",
	TIMESTAMP_1: "02:15",
	TIMESTAMP_2: "08:42",
	TIMESTAMP_3: "15:30",
	UPDATE_TITLE: "Engineering Updates (John, Jane)",
	UPDATE_CONTENT: "Completed authentication module refactoring. API performance improved by 40%. Started work on dashboard redesign.",
	DISCUSSION_TITLE: "Q1 Planning Review",
	KEY_QUOTE: "We need to prioritize the mobile experience for the next release.",
	DISCUSSION_DETAILS: "Team agreed to shift focus to mobile-first development approach. Resources will be reallocated from desktop features to ensure mobile parity by end of Q1.",
	ASSIGNEE: "John Smith",
	ACTION_ITEM: "Prepare mobile development roadmap by Friday",
	DECISION_1: "Approved revised foundation schedule with 2-week extension",
	DECISION_2: "Steel fabrication to proceed with alternate supplier",
	DECISION_3: "Weekly safety inspections to increase to bi-weekly during concrete pour",
	ASSIGNEE_1: "John Smith",
	ASSIGNEE_2: "Jane Doe",
	ACTION_1: "Prepare mobile development roadmap by Friday",
	ACTION_2: "Schedule stakeholder review meeting",
	DISCUSSION_SUMMARY: "The team discussed Q1 priorities, reviewed current progress on key initiatives, and identified blockers requiring immediate attention.",
	// Detailed construction template specific
	LOCATION: "Project Site Office / Conference Room A",
	PROJECT_NAME: "Riverside Commercial Complex - Phase 2",
	RECORDED_BY: "Sarah Mitchell, Project Coordinator",
	ATTENDEES_PRESENT: "John Smith (Project Manager), Mike Johnson (Site Superintendent), Lisa Chen (Architect), Robert Davis (Structural Engineer), Tom Wilson (MEP Coordinator), Sarah Mitchell (Project Coordinator)",
	ATTENDEES_ABSENT: "David Brown (Owner Representative) - excused",
	SAFETY_TITLE: "Scaffolding Inspection Required",
	SAFETY_NOTES: "All scaffolding in Zone B must be re-inspected before work resumes. Safety officer to complete inspection by EOD Tuesday. Hard hat compliance reminder issued to all crews.",
	PREV_REVIEW_1: "Action item from 01/06: Foundation waterproofing completed - CLOSED",
	PREV_REVIEW_2: "Action item from 01/06: Electrical panel delivery rescheduled to 01/20 - IN PROGRESS",
	TOPIC_1_TITLE: "Foundation & Structural Work",
	TOPIC_1_POINT_1: "Foundation pour for Building C completed on schedule",
	TOPIC_1_POINT_2: "Rebar inspection passed with minor corrections noted",
	TOPIC_1_POINT_3: "Concrete curing on track, forms to be stripped by Friday",
	TOPIC_2_TITLE: "MEP Coordination",
	TOPIC_2_POINT_1: "Electrical rough-in 60% complete in Building A",
	TOPIC_2_POINT_2: "HVAC ductwork installation begins next week pending structural sign-off",
	TOPIC_3_TITLE: "Schedule & Timeline",
	TOPIC_3_POINT_1: "Overall project tracking 3 days ahead of baseline schedule",
	TOPIC_3_POINT_2: "Weather contingency days may be utilized week of Jan 27",
	ACTION_1_TASK: "Submit revised MEP coordination drawings",
	ACTION_1_OWNER: "Tom Wilson",
	ACTION_1_INITIAL: "T",
	ACTION_1_DUE: "January 17, 2026",
	ACTION_2_TASK: "Coordinate with steel fabricator on delivery schedule",
	ACTION_2_OWNER: "Mike Johnson",
	ACTION_2_INITIAL: "M",
	ACTION_2_DUE: "January 15, 2026",
	ACTION_3_TASK: "Review and approve Shop Drawing SD-045",
	ACTION_3_OWNER: "Lisa Chen",
	ACTION_3_INITIAL: "L",
	ACTION_3_DUE: "January 20, 2026",
	CO_1_NUMBER: "CO-012",
	CO_1_DESC: "Additional waterproofing at elevator pit",
	CO_1_STATUS: "Pending Approval",
	CO_1_STATUS_CLASS: "open",
	CO_2_NUMBER: "CO-011",
	CO_2_DESC: "Upgraded fire suppression system",
	CO_2_STATUS: "Approved",
	CO_2_STATUS_CLASS: "closed",
	RFI_1_NUMBER: "RFI-089",
	RFI_1_DESC: "Clarification on roof drain locations",
	RFI_1_STATUS: "Open",
	RFI_1_STATUS_CLASS: "open",
	RFI_2_NUMBER: "RFI-088",
	RFI_2_DESC: "Structural connection detail at grid line 5",
	RFI_2_STATUS: "Closed",
	RFI_2_STATUS_CLASS: "closed",
	NEXT_MEETING_DATE: "January 20, 2026",
	NEXT_MEETING_TIME: "10:00 AM",
	NEXT_MEETING_LOCATION: "Project Site Office",
	NEXT_MEETING_TOPIC: "Sprint Planning & Mobile Roadmap Review"
};

// Function to render template with data
export const renderTemplate = (template: string, data: Record<string, string>): string => {
	let rendered = template;
	Object.entries(data).forEach(([key, value]) => {
		const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
		rendered = rendered.replace(regex, value);
	});
	return rendered;
};

// Get template by ID
export const getTemplateById = (id: string): EmailTemplate | undefined => {
	return EMAIL_TEMPLATES.find(t => t.id === id);
};

