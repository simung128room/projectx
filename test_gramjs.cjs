const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');

(async () => {
  const client = new TelegramClient(new StringSession(''), 2040, 'b18441a1ff607e10a989891a5462e627', { connectionRetries: 1 });
  try {
    await client.connect();
    console.log("Connected using default apiId/apiHash!");
    await client.disconnect();
  } catch (e) {
    console.log("Failed to connect:", e);
  }
})();
