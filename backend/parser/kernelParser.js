// backend/parser/kernelParser.js
function parseKernelLog(content) {
  const lines = content.trim().split('\n');
  const parsed = [];

  for (const line of lines) {
    const match = line.match(/^\[\s*([\d.]+)]\s(.+)$/);
    if (match) {
      const timestamp = parseFloat(match[1]);
      const message = match[2].trim();

      parsed.push({
        timestamp: new Date(), // Replace with real timestamp if available
        level: 'INFO',
        message,
        source: 'kernel',
      });
    }
  }

  return parsed;
}

function canParse(line) {
  return /^\[\s*\d+\.\d+\]\s.+/.test(line);
}


module.exports = {
  canParse,
  parse: parseKernelLog
};
