const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const replacement = 'let errorMsg = e.response?.data?.error || e.message || "Unknown Error";\n          if (typeof errorMsg === "object") errorMsg = JSON.stringify(errorMsg);\n          setDbErrorDetail(`Backend API لمسبأکِ؄ذبص أ؏ع('OFFLINE) : ${ errorMsg }`);'; ��*6-H6(�#�.J	�ё�S�JH�	�
�\��ܓ\��N��N
J�N�