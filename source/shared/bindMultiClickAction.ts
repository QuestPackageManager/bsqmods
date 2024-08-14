/**
 * Binds a multi-click action to an HTML element. The specified callback function
 * will be executed if the element is clicked a certain number of times within a
 * specified timeout period. The click count is reset if no click occurs within
 * the timeout period.
 *
 * @param {HTMLElement} element - The HTML element to bind the click action to.
 * @param {() => void} callback - The callback function to execute after the specified number of clicks.
 * @param {number} [times=5] - The number of clicks required to trigger the callback. Default is 5.
 * @param {number} [resetTimeout=500] - The timeout period (in milliseconds) to reset the click count. Default is 500ms.
 *
 * @example
 * ```javascript
 * // Example usage:
 * const button = document.querySelector('button');
 * bindMultiClickAction(button, () => {
 *   console.log('Button clicked 2 times!');
 * });
 * ```
 */
export function bindMultiClickAction(element: HTMLElement, callback: () => Promise<void> | void, times = 2, resetTimeout = 500) {
  // Initialize click count and timer
  let clickCount = 0;
  let clickTimer: ReturnType<typeof setTimeout> | null = null;

  // Function to reset the click count
  function resetClickCount() {
    clickCount = 0;
  }

  // Add the click event listener to the element
  element.addEventListener("click", async () => {
    clickCount++;

    // If the element is clicked the specified number of times, perform the desired action
    if (clickCount === times) {
      await callback();
      resetClickCount();
    }

    // Reset the click count if no click occurs within the specified timeout period
    if (clickTimer != null) {
      clearTimeout(clickTimer);
    }

    clickTimer = setTimeout(resetClickCount, resetTimeout);
  });
}
