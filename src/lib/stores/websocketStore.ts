import { writable } from 'svelte/store';

type WebSocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export const webSocketStatus = writable<WebSocketStatus>('disconnected');

// TODO: Add store for received messages if needed 