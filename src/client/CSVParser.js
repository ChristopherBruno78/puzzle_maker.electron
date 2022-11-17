function parseCSVToRows(data, delimiter = ",") {
  const lines = data.split("\n");
  let l = lines.length,
    i = 0;
  const rows = [];
  for (; i < l; i++) {
    const rowStr = lines[i].trim();
    if (rowStr.indexOf(",") > -1) {
      rows.push(_parseRow(rowStr, delimiter));
    }
  }
  return rows;
}

function CSVRowToString(row) {
  let i = 0,
    str = "";
  for (const item of row) {
    if (i > 0) {
      str += ",";
    }
    str += '"';
    str += item;
    str += '"';
    i++;
  }
  return str;
}

function _stripQuotes(data) {
  if (data.charAt(0) === '"') {
    data = data.substring(1);
  }
  if (data.charAt(data.length - 1) === '"') {
    data = data.substring(0, data.length - 1);
  }
  return data;
}

function _parseRow(data, delimiter) {
  const items = data.split(delimiter);
  const row = [];
  let l = items.length,
    i = 0;
  let currentStr = "";
  let insideEscape = false;
  for (; i < l; i++) {
    let item = items[i];
    if (item.startsWith('"')) {
      insideEscape = true;
    }
    if (item.endsWith('"') && insideEscape) {
      insideEscape = false;
    }
    currentStr += item;

    if (!insideEscape) {
      row.push(_stripQuotes(currentStr.trim()));
      currentStr = "";
    } else {
      currentStr += delimiter;
    }
  }
  return row;
}

export { parseCSVToRows, CSVRowToString };
