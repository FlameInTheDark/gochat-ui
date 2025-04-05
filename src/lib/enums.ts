/**
 * Defines the different types of channels based on the ACTUAL API responses.
 * NOTE: This may differ from the Swagger spec.
 */
export enum ChannelType {
    GUILD_TEXT = 0,       // As seen for #general
    DM = 1,               // Assuming from previous enum
    GUILD_CATEGORY = 2,   // << CORRECTED: As seen for #text category
    GROUP_DM = 3,         // Assuming from previous enum
    GUILD_VOICE = 4,      // << Tentative: Swapped with Category, needs API verification
    GUILD_ANNOUNCEMENT = 5, // Assuming from previous enum
    // Add other types like GUILD_STORE, GUILD_STAGE_VOICE if applicable
}

// Ensure this file is treated as a module
export {};
