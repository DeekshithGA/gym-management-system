/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
  return re.test(String(email).toLowerCase());
}

/**
 * Validate password (min 8 chars, 1 uppercase, 1 number)
 * @param {string} password
 * @returns {boolean}
 */
export function validatePassword(password) {
  const re = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  return re.test(password);
}

/**
 * Format date to yyyy-mm-dd string
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().split('T')[0];
}

/**
 * Format currency in USD
 * @param {number} amount
 * @param {string} currency
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

/**
 * Debounce function to limit frequent calls
 * @param {function} fn
 * @param {number} delay ms delay
 * @returns {function}
 */
export function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Generate random alphanumeric string for IDs or tokens
 * @param {number} length
 * @returns {string}
 */
export function generateRandomString(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for(let i = 0; i < length; i++){
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Capitalize each word in a string
 * @param {string} text
 * @returns {string}
 */
export function toTitleCase(text) {
  return text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

/**
 * Generate UUID v4 string
 * @returns {string}
 */
export function generateUUID() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

/**
 * Validate required fields present in an object
 * @param {object} obj
 * @param {string[]} fields
 * @returns {boolean|string} true if valid, else error message
 */
export function validateRequired(obj, fields) {
  for (const field of fields) {
    if (!obj[field] || obj[field].toString().trim() === '') {
      return `Field ${field} is required`;
    }
  }
  return true;
}

/**
 * Sort array of objects by key ascending
 * @param {Array} arr
 * @param {string} key
 * @returns {Array}
 */
export function sortByKey(arr, key) {
  return arr.sort((a, b) => {
    if(a[key] < b[key]) return -1;
    if(a[key] > b[key]) return 1;
    return 0;
  });
}
