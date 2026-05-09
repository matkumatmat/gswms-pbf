// source/_module/logging/ILogger.js
const ILogger = {
  // interface methods, akan diimplementasikan oleh adapter server atau client
  log: function(level, message, context) {
    throw new Error("Not implemented");
  },
  info: function(message, context) { this.log("INFO", message, context); },
  warn: function(message, context) { this.log("WARN", message, context); },
  error: function(message, context) { this.log("ERROR", message, context); },
  debug: function(message, context) { this.log("DEBUG", message, context); }
};