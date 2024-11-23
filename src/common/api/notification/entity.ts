/* eslint-disable @typescript-eslint/no-empty-object-type */

export enum DefaultTopic {
  ALL = "ALL",
  ORGANIZER = "ORGANIZER",
}

export interface MessageEntity {
  title: string;
  body: string;
  scheduleTime?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}

export interface UserMessageEntity extends MessageEntity {
  userId: string;
}

export interface BroadcastMessageEntity extends MessageEntity {
  broadcast?: DefaultTopic;
  topic?: string;
}
