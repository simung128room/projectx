const { execSync } = require('child_process');
console.log(execSync('ps -ef | grep node').toString());
