export interface Group {
  id?: number;
  name: string;
  description?: string;
  created_by?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
}

export interface GroupResponse {
  id: number;
  name: string;
  description?: string;
  created_by?: number;
  created_at: Date;
  member_count?: number;
}

export interface GroupMember {
  id?: number;
  group_id: number;
  user_id: number;
  joined_at?: Date;
}
