import { writable } from 'svelte/store';

/** @typedef {import('$lib/types').Channel} Channel */

/** @type {import('svelte/store').Writable<Channel | null>} */
export const selectedChannelStore = writable(null); 