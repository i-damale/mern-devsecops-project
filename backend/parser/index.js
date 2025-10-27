const apacheParser = require('./apacheParser');
const nginxParser = require('./nginxParser');
const jsonParser = require('./jsonParser');
const syslogParser = require('./syslogParser');
const dockerParser = require('./dockerParser');
const kernelParser = require('./kernelParser');

// Each parser module must export canParse(line) and parse(line)
const parsers = [
  apacheParser,
  nginxParser,
  jsonParser,
  syslogParser,
  dockerParser,
  kernelParser
];

function getParserForLine(line) {
  return parsers.find(parser => parser.canParse && parser.canParse(line));
}

module.exports = {
  parsers,
  getParserForLine
}; 