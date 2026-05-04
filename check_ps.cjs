import fs from 'fs';
import { execSync } from 'child_process';
console.log(execSync('ps -ef | grep node').toString());
