// backend/parser/jsonParser.js
function parseJsonLog(content) {
  const lines = content.trim().split('\n');
  const parsed = [];

  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      const logLine = entry.log?.trim();
      const time = entry.time;

      if (!logLine || !time) continue;

      let message = stripAnsi(logLine);
      let level = 'INFO';
      let source = 'json';

      try {
        const nested = JSON.parse(logLine);
        message = nested.message || logLine;
        level = (nested.level || level).toUpperCase();
        source = nested.service || source;
      } catch {
        // fallback: use regex for source from Mongoose or [tag]
        const match = logLine.match(/\[([^\]]+)]/);
        if (match) source = match[1];
        else if (/mongoose/i.test(logLine)) source = 'mongoose';

        if (/error/i.test(logLine)) level = 'ERROR';
        else if (/warn/i.test(logLine)) level = 'WARN';
        else if (/debug/i.test(logLine)) level = 'DEBUG';
      }

      parsed.push({
        timestamp: new Date(time),
        level,
        message,
        source,
      });
    } catch (err) {
      console.warn('⚠️ Invalid JSON log:', line);
    }
  }

  return parsed;
}

function canParse(line) {
  try {
    JSON.parse(line);
    return true;
  } catch {
    return false;
  }
}

// Remove ANSI codes like \u001b[0;36m
function stripAnsi(str) {
  return str.replace(
    // eslint-disable-next-line no-control-regex
    /\u001b\[.*?m/g,
    ''
  );
}

module.exports = {
  canParse,
  parse: parseJsonLog
};
