function parseApacheLog(content) {
  const lines = content.split('\n');
  const logs = [];

  const regex = /^(\S+) \S+ \S+ \[([^\]]+)] "(\S+) (\S+) \S+" (\d+)/;

  for (const line of lines) {
    const match = regex.exec(line);
    if (match) {
      const [, ip, dateStr, method, path, status] = match;

      // 🛠️ Convert Apache date to ISO format
      const date = parseApacheDate(dateStr);

      logs.push({
        timestamp: date,
        level: parseInt(status) >= 400 ? 'ERROR' : 'INFO',
        message: `${method} ${path} => ${status}`,
        source: ip,
      });
    }
  }

  return logs;
}

function parseApacheDate(apacheDate) {
  // Format: 27/Jul/2025:10:00:00 +0000
  const parts = apacheDate.match(/^(\d{2})\/(\w{3})\/(\d{4}):(\d{2}):(\d{2}):(\d{2}) ([+\-]\d{4})$/);
  if (!parts) return new Date(NaN);

  const [, day, monStr, year, hour, min, sec, tz] = parts;
  const months = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
  };
  const month = months[monStr];

  // Construct ISO format: YYYY-MM-DDTHH:mm:ss+00:00
  const iso = `${year}-${month}-${day}T${hour}:${min}:${sec}${tz.slice(0, 3)}:${tz.slice(3)}`;
  return new Date(iso);
}

function canParse(line) {
  // Simple check for Apache log format
  return line.includes('HTTP/1.1"') && line.includes('] "GET');
}

module.exports = {
  canParse,
  parse: parseApacheLog
};
