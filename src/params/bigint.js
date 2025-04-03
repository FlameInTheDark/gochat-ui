/**
 * Checks if a string parameter consists only of digits.
 * This can be used for matching IDs that might exceed JavaScript's Number.MAX_SAFE_INTEGER,
 * though it doesn't strictly enforce BigInt parsing here, just the format.
 * @param {string} param The route parameter string.
 * @returns {boolean} True if the parameter contains only digits, false otherwise.
 */
export function match(param) {
    // Use a regular expression to check if the string contains only digits (and is not empty)
    return /^[\d]+$/.test(param);
} 