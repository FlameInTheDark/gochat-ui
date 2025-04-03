<script>
    // Removed onMount import
    import { emojiData } from '$lib/data/emojis/index.js'; // Updated import path

    export let onEmojiSelect = (/** @type {string} */ emoji) => {};

    /**
     * @typedef {{ 
     *  emoji: string; 
     *  label: string; 
     *  tags?: string[]; 
     * }} EmbeddedEmojiData
     */

    /** @type {Record<string, Array<EmbeddedEmojiData>>} */
    const categorizedEmojis = emojiData; // Directly use the imported data
    /** @type {string[]} */
    const categories = Object.keys(categorizedEmojis); // Get categories from imported data
    /** @type {string} */
    let selectedCategory = categories[0]; // Default to first category
    let searchTerm = '';
    // No isLoading needed anymore
    // filteredEmojis is now defined reactively below

    // Icons for main categories (ensure keys match emojiData keys)
    const categoryIcons = {
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

    // Reactive declaration for filtered emojis
    $: filteredEmojis = (() => {
        console.log(`CustomEmojiPicker: Recalculating filtered emojis (Search: '${searchTerm}', Category: ${selectedCategory})...`);
        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            const results = Object.values(categorizedEmojis)
                .flat()
                .filter(emoji =>
                    emoji.label.toLowerCase().includes(lowerSearchTerm) ||
                    (emoji.tags && emoji.tags.some(/** @param {string} tag */ tag => tag.toLowerCase().includes(lowerSearchTerm)))
                );
            console.log(`CustomEmojiPicker: Found ${results.length} search results.`);
            return results;
        } else if (selectedCategory && categorizedEmojis[selectedCategory]) {
            const results = categorizedEmojis[selectedCategory];
            console.log(`CustomEmojiPicker: Displaying ${results.length} emojis for category ${selectedCategory}.`);
            return results;
        } else {
            console.log('CustomEmojiPicker: No category/search, showing 0 emojis.');
            return [];
        }
    })();

    /** @param {string} categoryName */
    function handleCategorySelect(categoryName) {
        console.log('CustomEmojiPicker: Category selected:', categoryName);
        selectedCategory = categoryName;
        searchTerm = '';
    }

    /** @param {string} emoji */
    function handleEmojiClick(emoji) {
        onEmojiSelect(emoji);
    }

</script>

<!-- Template remains largely the same, using the calculated variables -->
<div class="emoji-picker-container bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
    <!-- Search Input -->
    <div class="p-2">
        <input
            type="search"
            bind:value={searchTerm}
            placeholder="Search emojis"
            class="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100 dark:placeholder-gray-400"
        />
    </div>

    <!-- Category Tabs -->
    <div class="category-tabs border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        {#each categories as categoryName (categoryName)}
            <button
                type="button"
                class="category-tab text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 {selectedCategory === categoryName ? 'active text-gray-900 dark:text-white' : ''}"
                on:click={() => handleCategorySelect(categoryName)}
                aria-label={`Category: ${categoryName}`}
                title={categoryName}
            >
                <span class="text-lg">{(/** @type {Record<string, string>} */ (categoryIcons))[categoryName] || '?'}</span> 
            </button>
        {/each}
    </div>

    <!-- Emoji Grid -->
    <div class="emoji-grid scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent overflow-x-hidden">
        <!-- Removed isLoading check -->
        {#if filteredEmojis.length === 0}
            <p class="no-results-text text-gray-500 dark:text-gray-400">No emojis found.</p>
        {:else}
             {#if searchTerm}
                 <h3 class="category-header text-gray-500 dark:text-gray-400">Search Results</h3>
             {:else}
                 <h3 class="category-header text-gray-500 dark:text-gray-400">{selectedCategory || 'Category'}</h3>
             {/if}
            <div class="emoji-grid-inner">
                 {#each filteredEmojis as item (item.emoji)}
                    <button
                        type="button"
                        class="emoji-button hover:bg-gray-100 dark:hover:bg-gray-700"
                        on:click={() => handleEmojiClick(item.emoji)}
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

.category-header,
.search-results-header {
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
