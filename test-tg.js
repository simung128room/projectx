import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';

const client = new TelegramClient(new StringSession(''), 2040, 'b18441a1ff607e10a989891a5462e627', { connectionRetries: 1, useWSS: true });

client.start({
    phoneNumber: "1234567890",
    phoneCode: async () => {
        console.log("Asking for phone code!");
        return "12345";
    },
    password: async () => "pass",
    onError: (e) => console.log("Error:", e.message)
}).then(() => console.log("Started"))
  .catch((e) => console.log("Catch:", e.message));

console.log("Called client.start");
