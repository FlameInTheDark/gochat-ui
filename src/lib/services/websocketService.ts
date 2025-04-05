import { browser } from '$app/environment';
import { webSocketStatus } from '$lib/stores/websocketStore';
// Assume getAuthToken is exported from client.js
import { getAuthToken } from '$lib/api/client';
// Import from servers.js now
import { getCurrentUserGuilds } from '$lib/api/servers.js'; // <-- Import guild fetch function
import type { Guild } from '$lib/api/client'; // <-- Import Guild type if needed
import { PUBLIC_WEBSOCKET_URL } from '$env/static/public'; // <-- Import env var
import JSONBig from 'json-bigint'; // <-- Import json-bigint
import { addMessageToStore, removeMessageFromStore } from '$lib/stores/messageStore'; // <-- Import store functions
import type { Message, Channel, Attachment } from '$lib/types.d.ts'; // <-- Add Attachment

// --- Constants --- 
// TODO: Move to environment variables if they differ between environments
const WEBSOCKET_URL = PUBLIC_WEBSOCKET_URL; 

// --- State --- 
let socket: WebSocket | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;
let dynamicHeartbeatIntervalMs: number | null = null; // Store dynamic interval

// --- JSON Structures --- 
interface AuthRequest {
    op: 1;
    d: { token: string; };
}

// Base interface for message data payloads
interface BaseMessageData {}

// Data for Op Code 0 (New Chat Message)
interface ChatMessageData extends BaseMessageData {
    guild_id?: bigint | null; // Optional for DMs?
    message: { 
        id: bigint;
        channel_id: bigint;
        author: { 
            id: bigint;
            name: string;
            discriminator: string;
            // Add avatar if provided by WS
        };
        content: string;
        attachments?: Attachment[]; // Add optional attachments array
    };
    t?: number; // Sequence number?
}

// NEW: Data for Op Code 1 (Hello/Ready containing Heartbeat Interval)
interface HelloData extends BaseMessageData {
    heartbeat_interval: number;
    // Add other fields from the 'Hello' payload if needed
}

// NEW: Structure for Op 0, Type 106 (Channel Create)
interface ChannelCreateData extends BaseMessageData {
    guild_id: bigint;
    channel: Channel; // Use the imported Channel type
}

// NEW: Structure for Op 0, Type 109 (Channel Delete)
interface ChannelDeleteData extends BaseMessageData {
    guild_id: bigint;
    channel_id: bigint; // ID of the deleted channel
}

// NEW: Structure for Op 0, Type 107 (Message Delete)
interface MessageDeleteData extends BaseMessageData {
    channel_id: bigint;
    message_id: bigint;
    guild_id?: bigint | null; // Optional guild ID
}

// Discriminated union for server messages based on Op Code (op)
type ServerMessage =
    | { op: 0; d: ChatMessageData; t?: number } 
    | { op: 0; d: ChannelCreateData; t: 106 } // Channel Create
    | { op: 0; d: ChannelDeleteData; t: 109 } // Channel Delete
    | { op: 0; d: MessageDeleteData; t: 107 } // Message Delete
    | { op: 1; d: HelloData }                   
    // | { op: 10; d: PongData? } // Op 10: Pong response?
    // Add other expected Op Codes

interface HeartbeatPayload {
    since: number; // Representing seconds
}

interface HeartbeatMessage {
    op: 2;
    d: HeartbeatPayload | null; // Allow null if 'since' isn't strictly needed
}

// NEW: Subscription message structure
interface SubscribePayload {
    channel?: bigint | null; // Optional channel ID
    guilds?: bigint[] | null; // Optional list of guild IDs
}
interface SubscribeMessage {
    op: 5;
    d: SubscribePayload;
}

// interface MqMessage { // Optional: Define if using sendMessageToServer
    // Based on internal/mq/mqmsg/message.go
// }

// --- Private Functions --- 

function stopHeartbeat() {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
        dynamicHeartbeatIntervalMs = null; // Reset dynamic interval
    }
}

function startHeartbeat(ws: WebSocket) {
    stopHeartbeat(); 

    if (dynamicHeartbeatIntervalMs === null || dynamicHeartbeatIntervalMs <= 0) {
        console.error('[WebSocketService] Cannot start heartbeat: Invalid dynamic interval.', dynamicHeartbeatIntervalMs);
        return;
    }

    // Calculate interval minus 1 second, ensuring it's positive (min 500ms)
    const adjustedIntervalMs = Math.max(500, dynamicHeartbeatIntervalMs - 1000);

    heartbeatInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            const heartbeatMsg: HeartbeatMessage = { 
                op: 2, 
                d: { since: 0 } 
            }; 
            try {
                ws.send(JSON.stringify(heartbeatMsg));
            } catch (err) {
                 console.error('[WebSocketService] Failed to send heartbeat (op: 2): ', err);
            }
        } else {
            console.warn('[WebSocketService] WebSocket not open, stopping heartbeat.');
            stopHeartbeat(); 
        }
    }, adjustedIntervalMs); // Use adjusted interval
}

// Add function to send initial guild subscription
async function sendInitialGuildSubscription() {
    try {
        const guilds: Guild[] | null = await getCurrentUserGuilds(); 
        
        if (guilds && guilds.length > 0) {
            const guildIds = guilds.map(g => g.id); // Assuming g.id is BigInt
            sendSubscriptionUpdate({ guilds: guildIds });
        } else {
            sendSubscriptionUpdate({ guilds: [] }); // Send empty array if no guilds
        }
    } catch (error) {
        console.error('[WebSocketService] Failed to fetch guilds for initial subscription:', error);
        // Optionally send empty subscription on error too, or handle differently
        sendSubscriptionUpdate({ guilds: [] });
    }
}

function setupEventListeners(ws: WebSocket, authToken: string) {
    ws.onopen = () => {
        webSocketStatus.set('connecting'); // Status update

        // *** Use CORRECT AuthRequest structure ***
        const authPayload: AuthRequest = { 
            op: 1, 
            d: { token: authToken } 
        }; 
        try {
            ws.send(JSON.stringify(authPayload));
        } catch (err) {
            console.error('[WebSocketService] Failed to send auth message:', err);
            webSocketStatus.set('error');
            ws.close();
        }
    };

    ws.onmessage = (event) => {
        let message: any; 
        try {
            const JSONBigNative = JSONBig({ useNativeBigInt: true });
            message = JSONBigNative.parse(event.data);

            if (typeof message === 'object' && message !== null && typeof message.op === 'number') {
                const opCode = message.op;
                const payload = message.d;
                const typeCode = message.t;

                switch (opCode) {
                    case 0: { 
                        if (typeCode === 106) { // Channel Create
                            const channelCreatePayload = payload as ChannelCreateData;
                            handleChannelCreate(channelCreatePayload);
                        } else if (typeCode === 109) { // Channel Delete
                            const channelDeletePayload = payload as ChannelDeleteData;
                            handleChannelDelete(channelDeletePayload);
                        } else if (typeCode === 107) { // Message Delete
                            const messageDeletePayload = payload as MessageDeleteData;
                            handleMessageDelete(messageDeletePayload);
                        } else { // Assume Chat Message otherwise for Op 0
                            const chatPayload = payload as ChatMessageData; 
                            handleNewChatMessage(chatPayload);
                        }
                        break;
                    }
                    case 1: { // Hello / Ready
                        const helloPayload = payload as HelloData;
                        if (helloPayload?.heartbeat_interval && typeof helloPayload.heartbeat_interval === 'number') {
                            const interval = helloPayload.heartbeat_interval;
                            dynamicHeartbeatIntervalMs = interval;
                            webSocketStatus.set('connected'); 
                            startHeartbeat(ws);
                            sendInitialGuildSubscription(); 
                        } else {
                             console.warn('[WebSocketService] Received Op 1 but missing/invalid heartbeat_interval:', payload);
                        }
                        break;
                    }
                    // case 10: { // Pong - Use block scope
                    //     console.log('[WebSocketService] Received Pong (Op 10)');
                    //     break;
                    // }
                    default: {
                        console.warn(`[WebSocketService] Received unhandled op code: ${opCode}`);
                        break;
                    }
                } // End switch
            } else {
                 console.warn('[WebSocketService] Received non-opcode message or unknown structure:', message);
            }

        } catch (error) {
            console.error('[WebSocketService] Failed to parse or handle incoming message:', event.data, error);
        }
    };

     ws.onerror = (error) => {
        console.error('[WebSocketService] Error:', error);
        webSocketStatus.set('error');
        // Consider closing the socket here depending on the error
        // ws.close(); 
    };

    ws.onclose = (event) => {
        stopHeartbeat();
        socket = null;
        webSocketStatus.set('disconnected');
        // TODO: Implement reconnection logic if desired
        // Example: setTimeout(() => connectWebSocket(), 5000); // Simple reconnect attempt
    };
}

// Function to handle incoming chat messages
function handleNewChatMessage(data: ChatMessageData) {
    // Check required fields
    if (!data?.message?.author || !data.message.id || !data.message.channel_id) {
        console.warn('[WebSocketService] Received Op 0 message with incomplete data:', data);
        return;
    }

    // Transform attachments
    const transformedAttachments = (data.message.attachments || []).map(att => ({
        ...att, // Spread existing fields like filename, size, width, height
        url: `http://localhost/${att.url.startsWith('/') ? att.url.substring(1) : att.url}`, // Prepend base URL
        content_type: 'unknown' // Add placeholder or try to infer later
    }));

    // Transform the message
    const transformedMessage: Message = {
        id: data.message.id, 
        channel_id: data.message.channel_id, 
        content: data.message.content ?? '',
        authorId: data.message.author.id, 
        authorName: data.message.author.name,
        authorAvatarUrl: null, // TODO: Map avatar URL if provided by WS
        timestamp: new Date().toISOString(), // Use current time as placeholder
        attachments: transformedAttachments, // Use transformed attachments
    };

    addMessageToStore(transformedMessage); 
}

// NEW: Handler for Channel Create events
function handleChannelCreate(data: ChannelCreateData) {
    console.log("[WebSocketService] Received Channel Create (Op 0, T 106):", data);
    if (data?.channel && data.guild_id) {
        // Dispatch a custom event with the new channel data
        // Components like ChannelList can listen for this
        document.dispatchEvent(new CustomEvent('ws:channel_create', {
            detail: { 
                guildId: data.guild_id,
                newChannel: data.channel
            }
        }));
    } else {
        console.warn('[WebSocketService] Received channel create message with incomplete data:', data);
    }
}

// NEW: Handler for Channel Delete events
function handleChannelDelete(data: ChannelDeleteData) {
    console.log("[WebSocketService] Received Channel Delete (Op 0, T 109):", data);
    if (data?.channel_id && data.guild_id) {
        document.dispatchEvent(new CustomEvent('ws:channel_delete', {
            detail: { 
                guildId: data.guild_id,
                channelId: data.channel_id
            }
        }));
    } else {
        console.warn('[WebSocketService] Received channel delete message with incomplete data:', data);
    }
}

// NEW: Handler for Message Delete events
function handleMessageDelete(data: MessageDeleteData) {
    console.log("[WebSocketService] Received Message Delete (Op 0, T 107):", data);
    if (data?.channel_id && data.message_id) {
        // Call the store function directly to remove the message
        removeMessageFromStore(data.channel_id, data.message_id);
    } else {
        console.warn('[WebSocketService] Received message delete message with incomplete data:', data);
    }
}

// --- Public API --- 

export function connectWebSocket() {
    if (!browser) {
        return;
    }

    const authToken = getAuthToken(); // Read token from cookie
    if (!authToken) {
        console.error('[WebSocketService] Cannot connect: No auth token found in cookie.');
        webSocketStatus.set('disconnected');
        return;
    }

    if (socket && socket.readyState !== WebSocket.CLOSED) {
         console.warn('[WebSocketService] Already connected or connecting.');
         return;
    }
    
    webSocketStatus.set('connecting');
    try {
        socket = new WebSocket(WEBSOCKET_URL);
        setupEventListeners(socket, authToken);
    } catch (error) {
        console.error('[WebSocketService] Failed to create WebSocket:', error);
        webSocketStatus.set('error');
        socket = null;
    }
}

export function disconnectWebSocket() {
    if (socket) {
        stopHeartbeat(); // Ensure heartbeat is stopped before closing
        socket.close();
        socket = null;
        webSocketStatus.set('disconnected');
    }
}

/**
 * Sends a subscription update message (op: 5) to the WebSocket server.
 * @param {SubscribePayload} payload - The subscription data ({ channel?, guilds? }).
 */
export function sendSubscriptionUpdate(payload: SubscribePayload) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.error('[WebSocketService] Cannot send subscription: WebSocket is not open.');
        return false;
    }

    if (payload.channel === null) {
        console.warn('[WebSocketService] Attempted to send subscription with null channel. Skipping.');
        return false; // Don't send if channel is null
    }

    const message: SubscribeMessage = {
        op: 5,
        d: payload
    };

    try {
        // Use JSONBig.stringify to handle BigInts
        const messageString = JSONBig.stringify(message); 
        socket.send(messageString);
        return true;
    } catch (error) {
        console.error('[WebSocketService] Failed to send subscription update:', error);
        return false;
    }
}

// Existing sendWebSocketMessage (can be removed if not used for other op codes)
// export function sendWebSocketMessage(payload: any) { ... } 