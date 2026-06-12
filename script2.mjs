import fs from "fs";

let content = fs.readFileSync("src/App.tsx", "utf-8");

// Remove export functions for checker
content = content.replace(/  const exportClean = \(\) => \{[\s\S]*?\}\;\n/g, "");
content = content.replace(/  const exportBound = \(\) => \{[\s\S]*?\}\;\n/g, "");
content = content.replace(/  const exportRov = \(\) => \{[\s\S]*?\}\;\n/g, "");
content = content.replace(/  const exportAllValid = \(\) => \{[\s\S]*?\}\;\n/g, "");
content = content.replace(/  const exportAllValidJson = \(\) => \{[\s\S]*?\}\;\n/g, "");

content = content.replace(/  const clearLog = \(\) => \{[\s\S]*?\}\;\n/g, "");
content = content.replace(/  const stopChecker = \(\) => \{[\s\S]*?\}\;\n/g, "");
content = content.replace(/  const startChecker = async \(\) => \{[\s\S]*?\}\;\n/g, "");
content = content.replace(/  const checkAccount = async \([\s\S]*?\}\;\n/g, "");
content = content.replace(/  const checkNext = \(\) => \{[\s\S]*?\}\;\n/g, "");

content = content.replace(/  const addLog = \([\s\S]*?\}\;\n/g, "");

// Remove checker-related state declarations
content = content.replace(/  const \[combo, setCombo\] = useState\(""\);\n/g, "");
content = content.replace(/  const \[running, setRunning\] = useState\(false\);\n/g, "");
content = content.replace(/  const \[validAccounts, setValidAccounts\] = useState<AccountResult\[\]>\(\[\]\);\n/g, "");
content = content.replace(/  const \[invalidCount, setInvalidCount\] = useState\(0\);\n/g, "");
content = content.replace(/  const \[totalChecked, setTotalChecked\] = useState\(0\);\n/g, "");
content = content.replace(/  const \[logs, setLogs\] = useState<LogEntry\[\]>\(\[\]\);\n/g, "");

content = content.replace(/  const comboRef = useRef\(""\);\n/g, "");
content = content.replace(/  const runningRef = useRef\(false\);\n/g, "");
content = content.replace(/  const currentCheckingRef = useRef\(0\);\n/g, "");
content = content.replace(/  const activeThreadsRef = useRef\(0\);\n/g, "");

content = content.replace(/validAccounts=\{validAccounts\}/g, "");
content = content.replace(/totalChecked=\{totalChecked\}/g, "");

fs.writeFileSync("src/App.tsx", content, "utf-8");

