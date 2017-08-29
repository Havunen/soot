import { isFunction } from "soot-shared";

/**
 * Links given data to event as first parameter
 * @param {*} data data to be linked, it will be available in function as first parameter
 * @param {Function} event Function to be called when event occurs
 * @returns {Object} Return null when event is not valid, to avoid creating unnecessary event handlers
 */
export function linkEvent(data, event) {
  if (isFunction(event)) {
    return { data, event };
  }
  return null;
}
