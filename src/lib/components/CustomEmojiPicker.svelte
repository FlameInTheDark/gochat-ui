<script lang="ts">
    import { onMount, onDestroy, tick } from 'svelte';
    import { emojiData } from '$lib/data/emojis/index.js'; 
    import * as m from '$lib/paraglide/messages.js'; 

    // Log the imported data
    console.log('[CustomEmojiPicker] Initial emojiData:', emojiData); // <-- Log 1

    // Define interface directly
    interface EmojiItem {
        emoji: string;
        label: string;
        tags?: string[];
    }

    // Use $props with explicit types
    interface Props {
        targetElement: HTMLElement | null;
        onEmojiSelect: (emoji: string) => void;
        onDismiss: () => void;
    }
    const { targetElement, onEmojiSelect, onDismiss }: Props = $props();

    /** @type {Record<string, EmojiItem[]>} */ // Keep JSDoc for potential JS users? Or remove if TS only.
    const categorizedEmojis: Record<string, EmojiItem[]> = emojiData; 
    /** @type {string[]} */
    const categories: string[] = Object.keys(categorizedEmojis); 
    
    let selectedCategory = $state(categories[0]);
    let searchTerm = $state('');
    let filteredEmojis = $state<EmojiItem[]>([]); // <-- New $state variable
    let rootElement: HTMLDivElement | null = $state(null); // For checking contains
    let pickerStyle = $state('visibility: hidden; position: fixed; top: -9999px; left: -9999px; z-index: 9999;');

    console.log('[CustomEmojiPicker] Initial selectedCategory:', selectedCategory);

    // Icons for main categories
    /** @type {Record<string, string>} */
    const categoryIcons: Record<string, string> = {
        'Smileys & Emotion': '😀',
        'People & Body': '🧑',
        'Animals & Nature': '🦋',
        'Food & Drink': '🍎',
        'Travel & Places': '🌍',
        'Activities': '⚽',
        'Objects': '💡',
        'Symbols': '🔣',
        'Flags': '🏳️'
    };

    // --- Helper Functions ---
    /** 
     * @param {string} categoryName 
     * @returns {EmojiItem[]} 
     */
    function getEmojisByCategory(categoryName: string): EmojiItem[] {
        if (categoryName && categorizedEmojis[categoryName]) {
            return categorizedEmojis[categoryName];
        }
        return [];
    }
    /** 
     * @param {string} term 
     * @returns {EmojiItem[]}
     */
    function searchEmojis(term: string): EmojiItem[] {
        const lowerSearchTerm = term.toLowerCase();
        if (!lowerSearchTerm) return [];
        const allEmojis: EmojiItem[] = Object.values(categorizedEmojis).flat(); 
        // @ts-ignore - Allow implicit any for filter callback in JS
        return allEmojis.filter(emoji =>
                emoji.label.toLowerCase().includes(lowerSearchTerm) ||
                (emoji.tags && emoji.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm)))
            );
    }

    // NEW Effect to calculate filtered emojis
    $effect(() => {
        console.log('[CustomEmojiPicker Effect] Calculating filteredEmojis...', { searchTerm, selectedCategory });
        let result: EmojiItem[] = [];
        if (searchTerm) {
            result = searchEmojis(searchTerm);
        } else if (selectedCategory) {
            result = getEmojisByCategory(selectedCategory);
        }
        console.log('[CustomEmojiPicker Effect] filteredEmojis result count:', result.length);
        filteredEmojis = result; // <-- Update the state variable
    });

    /** @param {string} categoryName */
    function handleCategorySelect(categoryName: string) {
        console.log('[CustomEmojiPicker] Category selected:', categoryName); // <-- Keep Log 5
        selectedCategory = categoryName;
        searchTerm = '';
    }

    /** @param {string} emoji */
    function handleEmojiClick(emoji: string) {
        onEmojiSelect(emoji);
        onDismiss();
    }

    function handleFocusOut(event: FocusEvent) {
        console.log("[CustomEmojiPicker] FocusOut triggered. Related target:", event.relatedTarget);
        // If focus is moving outside the component's root element, request dismiss
        if (rootElement && !rootElement.contains(event.relatedTarget as Node | null)) {
            console.log("[CustomEmojiPicker] Focus moved outside. Requesting dismiss.");
            onDismiss();
        } else {
            console.log("[CustomEmojiPicker] Focus moved inside or is null. Doing nothing.");
        }
    }

    // Effect for Positioning (NEW)
    $effect(() => {
        const target = targetElement;
        const picker = rootElement;

        if (target && picker) {
            // Use tick to wait for potential DOM updates after rootElement is bound
            void tick().then(() => {
                // Use rAF for measurements after layout
                requestAnimationFrame(() => {
                     if (!target || !picker) return; // Double check elements still exist

                    const currentHeight = picker.offsetHeight;
                    const pickerWidth = picker.offsetWidth;
                    console.log('[CustomEmojiPicker Position Effect] rAF check:', { height: currentHeight, width: pickerWidth });

                    if (currentHeight > 0) {
                        const rect = target.getBoundingClientRect(); // Use getBoundingClientRect for viewport-relative coords
                        const gap = 8;
                        const windowInnerWidth = window.innerWidth;
                        const windowInnerHeight = window.innerHeight; // Need height too

                        // Calculate initial top (prefer above target)
                        let top = rect.top - currentHeight - gap;
                        // If too high (or goes offscreen top), place below target
                        if (top < 5) { 
                            top = rect.bottom + gap; 
                        }
                        // Ensure it doesn't go offscreen bottom
                        if (top + currentHeight > windowInnerHeight - 5) {
                            top = windowInnerHeight - currentHeight - 5; // Adjust if still too low
                            if (top < 5) top = 5; // Prevent negative top after adjustment
                        }

                        // Calculate initial left (Right-aligned with target)
                        let left = rect.right - pickerWidth;
                        // If too far left (goes offscreen left), align left edge with viewport edge
                        if (left < 5) { 
                            left = 5; 
                        }
                        // Ensure it doesn't go offscreen right
                        if (left + pickerWidth > windowInnerWidth - 5) {
                            left = windowInnerWidth - pickerWidth - 5;
                        }

                        const finalStyle = `visibility: visible; position: fixed; top: ${top}px; left: ${left}px; z-index: 9999;`;
                        console.log('[CustomEmojiPicker Position Effect] Setting final style:', finalStyle);
                        pickerStyle = finalStyle;
                    }
                });
            });
        } else {
            // If no target or picker, ensure it's hidden
            const hiddenStyle = 'visibility: hidden; position: fixed; top: -9999px; left: -9999px; z-index: 9999;';
            if (pickerStyle !== hiddenStyle) {
                console.log('[CustomEmojiPicker Position Effect] No target/picker, ensuring hidden style.');
                pickerStyle = hiddenStyle;
            }
        }
    });

    // Click Outside Handler (NEW)
    function handleClickOutside(event: MouseEvent) {
        const path = event.composedPath && event.composedPath();
        if (!path) return;

        // Check if click is outside the picker element AND outside the original target element
        if (rootElement && !path.includes(rootElement) && 
            targetElement && !path.includes(targetElement)) {
            console.log('[CustomEmojiPicker] Click detected outside picker and target. Dismissing.');
            onDismiss();
        } else {
            console.log('[CustomEmojiPicker] Click inside picker or target. Ignoring.');
        }
    }

    // --- Lifecycle --- (NEW)
    onMount(() => {
        console.log('[CustomEmojiPicker] Mounted.');
        document.addEventListener('click', handleClickOutside, true); // Use capture phase
        // Optional: Focus the picker container when it mounts
        void tick().then(() => rootElement?.focus());
    });

    onDestroy(() => {
        console.log('[CustomEmojiPicker] Destroyed.');
        document.removeEventListener('click', handleClickOutside, true);
    });

</script>

<!-- Template remains largely the same, using the calculated variables -->
<div
    bind:this={rootElement}
    class="emoji-picker-container bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
    style={pickerStyle}
    tabindex="-1"
    onfocusout={handleFocusOut}
>
    <div class="p-2">
        <input
            type="search"
            bind:value={searchTerm}
            placeholder={m.search_placeholder()}
            class="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100 dark:placeholder-gray-400"
        />
    </div>

    <div class="category-tabs border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        {#each categories as categoryName (categoryName)}
            <button
                type="button"
                class="category-tab text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 {selectedCategory === categoryName ? 'active text-gray-900 dark:text-white' : ''}"
                onclick={() => handleCategorySelect(categoryName)}
                aria-label={m.emoji_category_label({ categoryName })}
                title={categoryName}
            >
                <span class="text-lg">{categoryIcons[categoryName] || '?'}</span> 
            </button>
        {/each}
    </div>

    <div class="emoji-grid scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent overflow-x-hidden">
        {#if filteredEmojis.length === 0}
            <p class="no-results-text text-gray-500 dark:text-gray-400">{m.no_emojis_found()}</p>
        {:else}
            {#if searchTerm}
                <h3 class="category-header text-gray-500 dark:text-gray-400">{m.search_results_header()}</h3>
            {:else}
                <h3 class="category-header text-gray-500 dark:text-gray-400">{selectedCategory || 'Category'}</h3>
            {/if}
            <div class="emoji-grid-inner">
                {#each filteredEmojis as item (item.emoji)}
                    <button
                        type="button"
                        class="emoji-button hover:bg-gray-100 dark:hover:bg-gray-700"
                        onclick={() => handleEmojiClick(item.emoji)}
                        aria-label={item.label}
                        title={item.label}
                    >
                        {item.emoji}
                    </button>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
.emoji-picker-container {
    width: 320px;
    height: 350px;
    display: flex;
    flex-direction: column;
    /* Removed background/border here, handled by Tailwind */
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    overflow: hidden;
}

/* Remove CSS variable definitions and :global(.dark) rules */

.category-tabs {
    display: flex;
    /* border-bottom handled by Tailwind */
    flex-shrink: 0;
    /* background handled by Tailwind */
}

.category-tab {
    flex: 1;
    padding: 0.5rem 0.25rem;
    text-align: center;
    cursor: pointer;
    border: none;
    background: none;
    font-size: 0.9rem;
    /* color handled by Tailwind */
    transition: background-color 0.1s ease-in-out, color 0.1s ease-in-out;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* hover handled by Tailwind */

.category-tab.active {
    /* active color handled by Tailwind */
    box-shadow: inset 0 -2px 0 0 #4f46e5; /* Use actual color or CSS var if defined globally */
}

.emoji-grid {
    flex-grow: 1;
    overflow-y: auto;
    padding: 0.5rem;
}

.emoji-grid-inner {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 2px;
}

.emoji-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    font-size: 1.5rem;
    border-radius: 0.25rem;
    cursor: pointer;
    background: none;
    border: none;
    transition: background-color 0.1s ease-in-out;
}

/* hover handled by Tailwind */

.category-header {
    font-size: 0.75rem;
    font-weight: 600;
    /* color handled by Tailwind */
    padding: 0.25rem 0.1rem 0.5rem;
    text-transform: uppercase;
}

.no-results-text {
    text-align: center;
    padding: 2rem 1rem;
    font-size: 0.9rem;
}

.scrollbar-thin {
  scrollbar-width: thin;
}

/* Explicit scrollbar styling to match other areas */
.scrollbar-thumb-gray-800 {
   scrollbar-color: #202225 transparent;
}
.scrollbar-thumb-gray-800::-webkit-scrollbar-thumb {
   background-color: #202225;
}
.scrollbar-thumb-gray-800::-webkit-scrollbar-thumb:hover {
   background-color: #2f3136;
}

</style>
