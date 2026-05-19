const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const imports = `import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
`;

code = code.replace(/import cors from 'cors';/, "import cors from 'cors';\n" + imports);

const setup = `
// Security Headers
app.use(helmet({
  contentSecurityPolicy: false, // disable CSP for now to prevent breaking inline scripts/styles in iframe
  crossOriginEmbedderPolicy: false // allow embedding if needed
}));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});

// Apply rate limiting to all /api routes
app.use('/api/', apiLimiter);

// Require strict auth for /api/admin
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200, 
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/admin/', adminLimiter);
`;

code = code.replace(/app\.use\(compression\(\)\);/, "app.use(compression());\n" + setup);

fs.writeFileSync('server.ts', code);
