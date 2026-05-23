const errMsg = '{"code":"PGRST205","details":null,"hint":null,"message":"Could not find the \'_version\' column of \'products\' in the schema cache"}';
function extractMissingColumn(errMsg) {
  const m1 = errMsg.match(/Could not find the '([^']+)' column/);
  if (m1) return m1[1];
  const m2 = errMsg.match(/column '([^']+)'/);
  if (m2) return m2[1];
  const m3 = errMsg.match(/column ([^\s]+) does not exist/);
  if (m3) {
      let extracted = m3[1];
      if (extracted.includes('.')) extracted = extracted.split('.')[1];
      return extracted;
  }
  return null;
}
console.log(extractMissingColumn(errMsg));
