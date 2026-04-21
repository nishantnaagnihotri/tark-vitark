/**
 * Returns the substring of `css` that starts at the nth occurrence of `mediaQuery`
 * and ends just before the next `@media` rule (or at the end of the string).
 *
 * Throws an Error — compatible with both Vitest and Cucumber — when the requested
 * occurrence is not found.
 */
export function mediaBlock(css: string, mediaQuery: string, occurrence = 1): string {
    if (!Number.isInteger(occurrence) || occurrence < 1) {
        throw new Error(
            `mediaBlock: "occurrence" must be a positive integer; received ${occurrence}.`
        );
    }

    let startIndex = -1;
    let searchFrom = 0;

    for (let count = 0; count < occurrence; count += 1) {
        startIndex = css.indexOf(mediaQuery, searchFrom);
        if (startIndex < 0) {
            throw new Error(
                `Expected media query "${mediaQuery}" occurrence ${count + 1} to be present; found ${count} occurrence${count === 1 ? '' : 's'}.`
            );
        }
        searchFrom = startIndex + mediaQuery.length;
    }

    const nextMediaIndex = css.indexOf('@media', startIndex + mediaQuery.length);
    return nextMediaIndex === -1 ? css.slice(startIndex) : css.slice(startIndex, nextMediaIndex);
}
