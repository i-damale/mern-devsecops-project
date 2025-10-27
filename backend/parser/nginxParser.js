// backend/parser/nginxParser.js

function parseNginxLog(line) {
  // Regex for nginx access log
  const accessLogRegex = /^(\S+) - (\S+) \[([^\]]+)] "(\S+) (\S+)(?: HTTP\/[0-9.]*)?" (\d{3}) (\d+|-)/;

  // Improved regex for nginx error log with message isolation and optional fields
  const errorLogRegex =
    /^(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)] (\d+)#(\d+): \*(\d+) (.+?)(?=, client:|, server:|, request:|, upstream:|, host:|, referrer:|$)(?:, client: ([\d.]+))?(?:, server: ([^,]+))?(?:, request: "([^"]+)")?(?:, upstream: "([^"]+)")?(?:, host: "([^"]+)")?(?:, referrer: "([^"]+)")?/;

  let match = accessLogRegex.exec(line);
  if (match) {
    const [, ip, user, datetime, method, url, status, size] = match;
    return {
      ip,
      user,
      timestamp: new Date(datetime.replace(':', ' ').replace(/\//g, ' ')),
      method,
      url,
      status: parseInt(status),
      size: size === '-' ? 0 : parseInt(size),
      source: 'nginx',
      message: `${method} ${url} => ${status}`
    };
  }

  match = errorLogRegex.exec(line);
  if (match) {
    const [
      ,
      timestamp,
      level,
      pid,
      tid,
      connectionId,
      message,
      clientIp,
      server,
      request,
      upstream,
      host,
      referrer
    ] = match;

    return {
      timestamp: new Date(timestamp),
      level: level.toUpperCase(),
      pid: parseInt(pid),
      tid: parseInt(tid),
      connectionId: parseInt(connectionId),
      message: message?.trim() || '(no message)',
      clientIp: clientIp || '-',
      server: server || '-',
      request: request || '-',
      upstream: upstream || '-',
      host: host || '-',
      referrer: referrer || '-',
      source: 'nginx'
    };
  }

  // Uncomment for debugging unmatched lines
  // console.warn('❌ Unmatched line:', line);

  return null;
}

function canParse(line) {
  // Detect nginx access log or error log lines
  const accessLogPattern = /\d+\.\d+\.\d+\.\d+ - - \[/;
  const errorLogPattern = /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2} \[\w+]\s\d+#\d+: \*\d+/;

  return accessLogPattern.test(line) || errorLogPattern.test(line);
}

module.exports = {
  canParse,
  parse: parseNginxLog
};
