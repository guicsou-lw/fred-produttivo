const fs = require('fs');
const path = require('path');

const mkDirRecursive = (filepath) => {

  const dirname = path.dirname(filepath);

  if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true });
}

const json = (filepath, data) => {

  mkDirRecursive(filepath);
  
  fs.writeFileSync(filepath, JSON.stringify(data));
}

module.exports = {
  json,
};
