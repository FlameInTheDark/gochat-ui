/** @type {import('@sveltejs/kit').ParamMatcher} */
export function match(param) {
	// Check if the parameter string consists only of digits
	return /^\d+$/.test(param);
} 