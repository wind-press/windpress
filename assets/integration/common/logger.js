/**
 * Log message to console
 * 
 * @param {string} msg The message to log
 * @param {Object} options The options
 * @param {'log'|'warn'|'error'|'info'} options.type The type of log
 * @param {string} options.module The module name
 */
export function logger(msg, {type = 'log', module = null} = {}) {
    console[type](`%cSiul ⚡ ${module?'['+module+']':''}`, "background: #5a5a5a; color: white; padding: 2px 3px; border-radius: 2px; font-size: 0.8em;", msg);
}