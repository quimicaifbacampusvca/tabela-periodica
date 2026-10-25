/* Format JSON whitespace without reserializing scientific numeric literals. */
const fs = require('node:fs'),
  path = require('node:path');
const ignored = new Set(['.git', 'node_modules', 'dist', '__pycache__']);
function files(dir = '.') {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      ignored.has(entry.name)
        ? []
        : entry.isDirectory()
          ? files(path.join(dir, entry.name))
          : /\.(json|webmanifest)$/.test(entry.name)
            ? [path.join(dir, entry.name)]
            : [],
    );
}
for (const file of files()) {
  const text = fs.readFileSync(file, 'utf8');
  JSON.parse(text);
  const tokens = text.match(
    /"(?:\\.|[^"\\])*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null|[{}\[\],:]/g,
  );
  let indent = 0,
    output = '';
  const newline = () => {
    output += '\n' + '  '.repeat(indent);
  };
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === '{' || token === '[') {
      output += token;
      if (tokens[i + 1] === (token === '{' ? '}' : ']')) output += tokens[++i];
      else {
        indent++;
        newline();
      }
    } else if (token === '}' || token === ']') {
      indent--;
      newline();
      output += token;
    } else if (token === ',') {
      output += ',';
      newline();
    } else if (token === ':') output += ': ';
    else output += token;
  }
  fs.writeFileSync(file, output + '\n');
}
console.log('JSON formatted with original string and numeric tokens preserved.');
