function detectLogType(content) {
  const lines = content.trim().split('\n');

  // Check if every line is valid JSON (most structured Node/Docker logs)
  const isAllJson = lines.every(line => {
    try {
      JSON.parse(line);
      return true;
    } catch {
      return false;
    }
  });
  if (isAllJson) return 'json';

  // Apache: e.g., 127.0.0.1 - - [date] "GET ...
  if (content.includes('HTTP/1.1"') && content.includes('] "GET')) return 'apache';

  // NGINX: IP - - [date] "GET/POST ...
  if (content.includes('nginx') || content.match(/\d+\.\d+\.\d+\.\d+ - - \[/)) return 'nginx';

  // Syslog: starts with something like "Jul 27 14:03:22 ..."
  if (content.match(/^\w{3} \d{1,2} \d{2}:\d{2}:\d{2}/m)) return 'syslog';

  // Docker logs often have "log": or "stream": keys
  if (content.includes('"log":') && content.includes('"time":')) return 'docker';

  // ✅ Kernel logs: e.g., "[    0.000000] Linux version ..."
  if (content.match(/^\[\s*\d+\.\d+\]\s.+/m)) return 'kernel';

  return 'unknown';
}

module.exports = { detectLogType };
