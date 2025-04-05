// src/lib/types.d.ts
declare module '$lib/types' {

  import type { ChannelType } from '$lib/enums';

  // Base type for Snowflake IDs
  type Snowflake = bigint;

  export interface Guild {
    id: Snowflake; // Based on Swagger spec (integer)
    name: string;
    icon: Snowflake | null; // Assuming icon ID can be null
    owner: Snowflake; // Assuming owner ID (integer)
    public: boolean;
    // Add imageUrl derived logic later if needed
  }

  export interface AttachmentUpload {
    id: Snowflake;
    channel_id: Snowflake;
    file_name: string;
    upload_url: string;
  }

  export interface Message {
    id: Snowflake;
    channel_id: Snowflake;
    authorId: Snowflake; // Changed from snake_case
    authorName: string;  // Changed from snake_case
    authorAvatarUrl: string | null; // Changed from snake_case
    timestamp: string; // Added timestamp (assuming ISO string)
    content: string;
    attachments: Attachment[]; // Assuming Attachment type will be defined
    // Add other fields like edited_at if needed
  }

  export interface Member {
    user_id: User; // Assuming User type
    username: string; // Nickname within the guild?
    avatar: Snowflake | null; // Avatar override for the guild?
    join_at: string; // ISO timestamp
    roles: Snowflake[]; // Array of role IDs
    // Add other fields like permissions, deaf, mute if available
  }

  export interface User {
    id: Snowflake;
    name: string;
    discriminator: string;
    avatar: Snowflake | null;
  }

  export interface Attachment {
    content_type: string;
    filename: string;
    height: number | null;
    width: number | null;
    size: number;
    url: string;
  }

  export interface Channel {
    id: Snowflake;
    guild_id: Snowflake | null; // Or null/undefined for DMs?
    name: string;
    type: ChannelType; // Now references the imported type
    topic: string | null;
    position: number;
    parent_id: Snowflake | null; // For nesting under categories
    permissions: Snowflake | null; // Or string array?
    created_at: string; // ISO timestamp
    // Add other fields like last_message_id, recipients (for DMs) if needed
  }


  export interface Message {
    id: Snowflake; // bigint
    channel_id: Snowflake; // bigint
    authorId: Snowflake; // Changed from snake_case
    authorName: string;  // Changed from snake_case
    authorAvatarUrl: string | null; // Changed from snake_case
    timestamp: string; // Added timestamp (assuming ISO string)
    content: string;
    attachments: Attachment[];
  }
  // Define other API types here as they are implemented
  // e.g., Channel
}

// This ensures the module augmentation works correctly
export {}; 