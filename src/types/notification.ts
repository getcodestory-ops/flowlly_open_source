enum NotificationsStatusEnum {
  Pending = "Pending",
  Approved = "Approved",
  Done = "Done",
}

// TypeScript interface for NotificationAction
interface NotificationAction {
  email?: string;
  phone?: string;
  whatsapp?: string;
  chat?: string;
  call?: string;
  notification: boolean;
  relay?: string;
  project_id?: string;
}

// TypeScript interface for Notification
export interface Notification {
  id: string;
  datetime: string;
  chat_id?: string;
  message?: string;
  action: NotificationAction;
  status: NotificationsStatusEnum;
}
