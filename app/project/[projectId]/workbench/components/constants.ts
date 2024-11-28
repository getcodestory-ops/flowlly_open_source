export const SPECIAL_NODE_IDS = {
  DETERMINE_ACTION_ITEMS: "determine_action_items",
  RECORD_MEETING: "record_meeting",
  SAVE_MINUTES: "save_minutes_in_project_documents",
} as const;

export const STATUS_STYLES = {
  completed: "bg-green-100 text-green-800",
  failed: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  default: "bg-blue-100 text-blue-800",
} as const;
