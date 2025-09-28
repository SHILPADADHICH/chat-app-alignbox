export interface Message {
  id?: number;
  group_id: number;
  user_id: number;
  content: string;
  is_anonymous: boolean;
  created_at?: Date;
}

export interface CreateMessageRequest {
  group_id: number;
  content: string;
  is_anonymous?: boolean;
}

export interface MessageResponse {
  id: number;
  group_id: number;
  user_id: number;
  content: string;
  is_anonymous: boolean;
  created_at: Date;
  username?: string;
  user_avatar?: string;
}

export interface GetMessagesRequest {
  group_id: number;
  page?: number;
  limit?: number;
}
