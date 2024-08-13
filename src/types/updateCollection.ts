export type NotificationInterface = {
  title?: string;
  message?: string;
  status?: string;
  url?: string;
  read?: string;
  chat_id?: string;
};

export type UserUpdateCollectionType = {
  notification?: { projectId: string; notification: NotificationInterface[] };
  chatResponses?: { chatId: string[] };
};

export type UserNotifications = {
  [projectId: string]: NotificationInterface[];
};
