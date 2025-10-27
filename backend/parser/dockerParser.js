function parseDockerLog(content) {
  const lines = content.trim().split('\n');
  const parsed = [];

  for (const line of lines) {
    try {
      const json = JSON.parse(line);

      let logLine = json.log || '';
      let timestamp = json.time ? new Date(json.time) : new Date();

      let level = 'INFO'; // default
      if (logLine.toLowerCase().includes('error')) level = 'ERROR';
      else if (logLine.toLowerCase().includes('warn')) level = 'WARN';
      else if (logLine.toLowerCase().includes('debug')) level = 'DEBUG';

      parsed.push({
        timestamp,
        level,
        message: logLine.trim(),
        source: 'docker'
      });
    } catch (err) {
      // skip malformed lines
      continue;
    }
  }

  return parsed;
}

function canParse(line) {
  return line.includes('"log":') && line.includes('"time":');
}

module.exports = {
  canParse,
  parse: parseDockerLog
};
