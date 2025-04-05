// src/lib/utils/snowflake.js

// Custom epoch (2008-11-10T23:00:00.000Z) in milliseconds
const CUSTOM_EPOCH = 1226358000000;

/**
 * Extracts the approximate timestamp (in milliseconds since UNIX epoch)
 * from a Snowflake ID based on the custom epoch.
 * 
 * @param {bigint} snowflake The Snowflake ID.
 * @returns {number} The timestamp in milliseconds.
 */
export function getTimestampFromSnowflake(snowflake) {
    // Right shift by 22 bits to get the timestamp offset
    const timestampOffset = snowflake >> 22n; // Use BigInt literal for shift
    // Perform addition using BigInts
    const timestampMsBigInt = timestampOffset + BigInt(CUSTOM_EPOCH);
    // Convert the final result to Number
    return Number(timestampMsBigInt);
} 