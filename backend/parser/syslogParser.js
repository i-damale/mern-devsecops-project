function parseSyslog(content) {
  const lines = content.trim().split('\n');
  const parsed = [];

  const regex = /^(\w{3})\s+(\d{1,2})\s+(\d{2}:\d{2}:\d{2})\s+(\S+)\s+([\w\-.]+)(?:\[\d+\])?:\s+(.*)$/;

  for (const line of lines) {
    const match = line.match(regex);
    if (match) {
      const [, monthStr, day, time, host, service, message] = match;

      // Combine date parts — current year
      const now = new Date();
      const timestamp = new Date(`${monthStr} ${day} ${now.getFullYear()} ${time}`);

      let level = 'INFO';
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes('error')) level = 'ERROR';
      else if (lowerMsg.includes('warn')) level = 'WARN';
      else if (lowerMsg.includes('debug')) level = 'DEBUG';

      parsed.push({
        timestamp,
        level,
        message: message.trim(),
        source: service || 'syslog'
      });
    }
  }

  return parsed;
}

function canParse(line) {
  return /^\w{3} \d{1,2} \d{2}:\d{2}:\d{2}/.test(line);
}

module.exports = {
  canParse,
  parse: parseSyslog
};
