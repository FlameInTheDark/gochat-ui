<script lang="ts">
	// Remove ServerIcon import, already in ServerList
	// import ServerIcon from '$lib/components/ServerIcon.svelte'; 
	// import AppOverlays from '$lib/components/AppOverlays.svelte'; // REMOVE OLD IMPORT
	import { page } from '$app/stores';
	// Remove getServers import, already in ServerList
	// import { getServers } from '$lib/api/servers.js';
	// Remove showCreateServerModal import, already in ServerList
	// import { showCreateServerModal } from '$lib/stores/overlayStore.js';
	// Remove messages import, already in ServerList
	// import * as m from '$lib/paraglide/messages.js';
	import ServerList from '$lib/components/ServerList.svelte'; // Import the new component
	import { connectWebSocket, disconnectWebSocket } from '$lib/services/websocketService'; // Import WS functions
	import { onDestroy, onMount } from 'svelte'; // Import onDestroy & onMount
	import type { User } from '$lib/api/client'; // Import User type for props
	import OverlayManager from '$lib/components/OverlayManager.svelte'; // Use default import syntax
	import type { Snippet } from 'svelte';

    // NEW Context Menu Imports
    import { overlayManagerStore } from '$lib/stores/overlayManagerStore';
    import type { MenuItem } from '$lib/stores/contextMenuStore';
	
	// NEW: Navigation and DM API
	import { goto } from '$app/navigation';
	import { createDMChannel } from '$lib/api/dms.js';
	import { deleteMessage } from '$lib/api/messages.js'; // Import deleteMessage
	import { removeMessageFromStore } from '$lib/stores/messageStore'; // Import store helper
	
	// --- Props from Load Function --- 
	const { data, children }: { data: { currentUser: User | null }, children: Snippet } = $props();
	const currentUser = $derived(data.currentUser);
	
	// --- Reactive Variables for Child Layouts/Pages (Passed via context or props) ---
	// Note: Child layouts might need adjustments if they relied on props from server load
	// For now, we pass currentUser via slot props for simplicity now.
	
	// Restore activePath for DM link highlighting
	const activePath = $derived($page.url.pathname);

    // --- WebSocket Connection Effect ---
    $effect(() => {
        if (currentUser) {
            connectWebSocket();
        } else {
            disconnectWebSocket();
        }
    });

    // --- WebSocket Cleanup on Destroy ---
    onDestroy(() => {
        disconnectWebSocket();
        // Also remove context menu listener
        if (typeof window !== 'undefined') {
            window.removeEventListener('contextmenu', handleWindowContextMenu, true);
        }
    });

    // --- NEW Context Menu Logic ---
    function handleWindowContextMenu(event: MouseEvent) {
         if (!(event.target instanceof Element)) return;
         
         let targetElement: Element | null = event.target;
         const MAX_LEVELS = 6; // Increase traversal depth
         let foundMessageId: string | null = null;
         let foundUserId: string | null = null;
         let foundChannelId: string | null = null;
         let foundServerId: string | null = null;
         let menuTargetElement: Element | null = null;

         // Traverse up to find relevant data attributes
         for (let level = 0; targetElement && level < MAX_LEVELS; level++) {
             const dataset = (targetElement as HTMLElement).dataset;
             // Prioritize finding specific targets
             if (dataset.messageId && !foundMessageId) {
                 foundMessageId = dataset.messageId;
                 menuTargetElement = targetElement;
                 if (dataset.authorId && !foundUserId) foundUserId = dataset.authorId; // Use authorId for messages
             }
             if (dataset.userId && !foundUserId && !foundMessageId) { // User ID not from a message author
                 foundUserId = dataset.userId;
                 if (!menuTargetElement) menuTargetElement = targetElement;
             }
             if (dataset.channelId && !foundChannelId) {
                 foundChannelId = dataset.channelId;
                 if (!menuTargetElement) menuTargetElement = targetElement;
             }
             if (dataset.serverId && !foundServerId) {
                 foundServerId = dataset.serverId;
                 if (!menuTargetElement) menuTargetElement = targetElement;
             }
             targetElement = targetElement.parentElement;
         }

         // Log found values after traversal
         console.log("[Layout ContextMenu] Traversal Results:", {
             foundMessageId,
             foundUserId,
             foundChannelId,
             foundServerId,
             menuTargetElement: menuTargetElement?.tagName
         });

         if (!menuTargetElement) return; 

         event.preventDefault();
         const position = { x: event.clientX, y: event.clientY };
         let items: MenuItem[] = [];
         const contextData = { messageId: foundMessageId, userId: foundUserId, channelId: foundChannelId, serverId: foundServerId };

         // --- Determine Menu Items --- (Implement actions)
         if (foundMessageId) {
             const isOwn = currentUser?.id === BigInt(foundUserId || '0'); 
             const text = menuTargetElement.textContent || ''; 
             const messageIdBigInt = BigInt(foundMessageId);
             const channelIdBigInt = BigInt(foundChannelId || '0'); // Need channel ID too

             items.push({ label: 'Copy Text', action: () => navigator.clipboard.writeText(text) });
             if (isOwn && channelIdBigInt) { // Only allow delete if we have channelID
                 items.push({ label: 'Edit Message', action: () => console.log('Edit:', contextData) }); 
                 items.push({ 
                    label: 'Delete Message', 
                    danger: true, 
                    action: () => {
                        // Define the actual delete logic separately
                        const performDelete = async () => {
                            try {
                                await deleteMessage(channelIdBigInt, messageIdBigInt);
                                removeMessageFromStore(channelIdBigInt, messageIdBigInt);
                            } catch (err) {
                                console.error("Failed to delete message:", err);
                                alert(`Error deleting message: ${err instanceof Error ? err.message : 'Unknown error'}`);
                            }
                            // Optionally dismiss modal here if needed, or rely on modal's own logic
                            // overlayManagerStore.dismiss();
                        };

                        // Need message content for confirmation
                        // This is tricky as the layout doesn't have direct access to the message content
                        // For now, use a generic confirmation message
                        const msgPreview = menuTargetElement.querySelector('p')?.textContent?.substring(0, 50) || 'this message';

                        // Show the confirmation modal
                        overlayManagerStore.showConfirmDeleteMessageModal({
                            messageContent: msgPreview, 
                            onConfirm: performDelete 
                        });
                    } 
                });
             } else if (foundUserId){
                 items.push({ label: 'Reply', action: () => console.log('Reply:', contextData) }); // Placeholder
                 items.push({ label: 'Message User', action: async () => { // Implement Message User
                    if (!foundUserId) return;
                    try {
                        const userIdBigInt = BigInt(foundUserId);
                        const channel = await createDMChannel(userIdBigInt);
                        // Assuming API now returns the channel or we handle lookup elsewhere
                        if (channel?.id) {
                             goto(`/app/me/${channel.id.toString()}`);
                        } else {
                            console.error('Failed to get channel ID after creating DM');
                            // TODO: Show user error
                        }
                    } catch (err) {
                        console.error('Error creating or navigating to DM:', err);
                        // TODO: Show user error
                    }
                 } });
             }
         } else if (foundUserId) {
             const userIdBigInt = BigInt(foundUserId);
             items.push({ label: 'View Profile', action: () => goto(`/app/user/${foundUserId}`) }); // Implement View Profile
             items.push({ label: 'Message', action: async () => { // Implement Message User
                    try {
                        const channel = await createDMChannel(userIdBigInt);
                        if (channel?.id) {
                             goto(`/app/me/${channel.id.toString()}`);
                        } else {
                            console.error('Failed to get channel ID after creating DM');
                        }
                    } catch (err) {
                        console.error('Error creating or navigating to DM:', err);
                    }
             } });
         } else if (foundChannelId) {
             items.push({ label: 'Edit Channel', action: () => console.log('Edit Channel:', contextData) }); // Placeholder
             items.push({ label: 'Delete Channel', action: () => console.log('Delete Channel:', contextData), danger: true }); // Placeholder
         } else if (foundServerId) {
             items.push({ label: 'Server Settings', action: () => goto(`/app/${foundServerId}/settings`) }); // Implement Server Settings
             items.push({ label: 'Leave Server', action: () => console.log('Leave:', contextData), danger: true }); // Placeholder
         }
         // --- End Determine Menu Items ---

         if (items.length > 0) {
             console.log("[Layout] Attempting to show context menu. Items:", items, "Position:", position);
             overlayManagerStore.showContextMenu({ position, items, contextData });
         }
    }

    onMount(() => {
        // Add context menu listener
        if (typeof window !== 'undefined') {
             window.addEventListener('contextmenu', handleWindowContextMenu, true);
        }
    });

</script>

<div class="app-layout">
  <!-- Server Sidebar (Stays in Global Layout) -->
  <nav class="servers-sidebar flex flex-col items-center pt-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
    <!-- Direct Messages Link -->
    <a
        href="/app/me"
        aria-label="Direct Messages"
        class:bg-blue-600={activePath.startsWith('/app/me')} 
        class:rounded-2xl={activePath.startsWith('/app/me')}
        class:bg-gray-700={!activePath.startsWith('/app/me')}
        class="flex items-center justify-center w-12 h-12 mb-2 rounded-full hover:bg-blue-600 hover:rounded-2xl transition-all duration-200 ease-in-out"
    >
        <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M18 0H2C.9 0 0 .9 0 2v12c0 1.1.9 2 2 2h4v3l3-3h9c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2zm-5 9h-2V7h2v2zm-4 0H7V7h2v2zm8 0h-2V7h2v2z"/></svg>
    </a>
    <hr class="w-8 border-t border-gray-600 mb-2" />

    <!-- Render the ServerList component -->
    <ServerList />

    <!-- Removed Server Icons block -->
    
    <!-- Removed Add Server Button -->
    
  </nav>

  <!-- Main Content Area for Child Layouts -->
  <div class="flex-grow flex min-w-0">
      {#if currentUser}
          {@render children()}
      {:else}
          <!-- Show loading state while client-side load runs -->
           <div class="flex-grow flex items-center justify-center text-gray-400">
              Loading...
          </div>
      {/if}
  </div>

  <!-- Render Overlay Manager AT THE END -->
  <OverlayManager />

</div>

<style>
  .app-layout {
    display: flex;
    height: 100vh;
    background-color: #2f3136; /* Base background */
    color: #dcddde; 
  }

  .servers-sidebar {
    width: 72px;
    background-color: #202225;
    flex-shrink: 0;
    padding-top: 8px; /* Align with content area */
    box-sizing: border-box;
  }

  /* Explicit scrollbar styling for servers list */
  .scrollbar-thumb-gray-800 {
      scrollbar-color: #202225 transparent;
  }
  .scrollbar-thumb-gray-800::-webkit-scrollbar-thumb {
      background-color: #202225;
  }
  .scrollbar-thumb-gray-800::-webkit-scrollbar-thumb:hover {
      background-color: #2f3136;
  }

  /* Remove styles related to channels-sidebar, main-content, user-list-sidebar */

</style>
