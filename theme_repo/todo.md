# Exness Checker Web - TODO

## Backend
- [x] Database schema: check_sessions, checked_accounts, proxy_stats tables
- [x] tRPC router: session management (create, get, list, delete)
- [x] tRPC router: account checker logic (parse file, run checks, stream progress)
- [x] tRPC router: proxy rotation and stats
- [x] tRPC router: export valid accounts as .txt
- [x] SSE/polling endpoint for real-time progress updates

## Frontend
- [x] Global Typographic Brutalist CSS theme (dark bg, white text, heavy sans-serif)
- [x] Dashboard page: real-time stats (total checked, valid, invalid, total balance)
- [x] File upload component: drag-and-drop, parse email:password, preview list
- [x] Checker progress page: animated progress bar, per-account live status
- [x] Proxy status panel: active proxies, failed proxies, rotation stats
- [x] Valid Accounts table: email, balance, verified, country with sort/filter
- [x] Export button: download valid accounts as .txt
- [x] Session history: list past check sessions with summary
- [x] Navigation: sidebar or top nav linking all sections

## Testing
- [x] Vitest: session creation and retrieval
- [x] Vitest: account parsing logic
- [x] Vitest: export format validation
