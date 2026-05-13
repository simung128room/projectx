const axios = require('axios');
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, SlashCommandBuilder, ChannelType, REST, Routes } = require('discord.js');

// โหลดตั้งค่า (แนะนำให้แอดมินแก้ไข config ในหน้าจัดการ)
let config = {};
try {
    config = require('./bot_config.js');
} catch (e) {
    console.error('[Bot] ไม่พบไฟล์ bot_config.js ใช้การตั้งค่าเริ่มต้นแบบไม่มี Token');
    config = {
        token: 'YOUR_BOT_TOKEN', 
        adminIds: ['YOUR_ADMIN_ID'], 
        apiUrl: 'http://127.0.0.1:3000' 
    };
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on('ready', async () => {
    console.log(`[Bot] 🤖 เข้าสู่ระบบในชื่อ ${client.user.tag}`);
    
    // ตั้งค่ากิจกรรมบอท
    try {
        client.user.setPresence({
            activities: [{ name: 'ระบบรับยศ 24/7' }],
            status: 'online'
        });
    } catch (error) {}
    
    const commands = [
        new SlashCommandBuilder()
            .setName('setup')
            .setDescription('[แอดมิน] 🔑 ตั้งค่าระบบรับยศ')
            .addStringOption(option => option.setName('title').setDescription('หัวข้อหลัก').setRequired(true))
            .addStringOption(option => option.setName('description').setDescription('หัวข้อรอง').setRequired(true))
            .addStringOption(option => option.setName('image').setDescription('ลิ้งรูปภาพ').setRequired(true))
            .addStringOption(option => option.setName('button_name').setDescription('ชื่อปุ่ม').setRequired(true))
            .addRoleOption(option => option.setName('role').setDescription('ยศที่จะได้เมื่อกรอกคีย์สำเร็จ').setRequired(true))
    ];

    const rest = new REST({ version: '10' }).setToken(config.token);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('[Bot] 📝 ลงทะเบียน Slash Commands แล้ว: /setup');
    } catch (error) {
        console.error('[Bot] ❌ ไม่สามารถลงทะเบียน Commands ได้:', error.message);
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'setup') {
            if (!config.adminIds.includes(interaction.user.id)) {
                return interaction.reply({ embeds: [new EmbedBuilder().setTitle('❌ คุณไม่มีสิทธิ์ใช้คำสั่งนี้').setColor(0xFF0000)], ephemeral: true });
            }
            
            const title = interaction.options.getString('title');
            const description = interaction.options.getString('description');
            const image = interaction.options.getString('image');
            const buttonName = interaction.options.getString('button_name');
            const role = interaction.options.getRole('role');

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(0x1E90FF)
                .setFooter({ text: 'ระบบรับยศอัตโนมัติ' });

            if (image) {
                try {
                    embed.setImage(image);
                } catch(e) {}
            }

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`redeem_btn_role_${role.id}`)
                    .setLabel(buttonName)
                    .setStyle(ButtonStyle.Primary)
            );

            await interaction.channel.send({ embeds: [embed], components: [row] });
            await interaction.reply({ content: '✅ สร้างระบบรับยศเรียบร้อยแล้ว!', ephemeral: true });
        }
    }

    if (interaction.isButton()) {
        if (interaction.customId.startsWith('redeem_btn_role_')) {
            const roleId = interaction.customId.replace('redeem_btn_role_', '');
            
            const modal = new ModalBuilder()
                .setCustomId(`modal_redeem_${roleId}`)
                .setTitle('กรอกคีย์รับยศ');
                
            const keyInput = new TextInputBuilder()
                .setCustomId('key_input')
                .setLabel('คีย์ของคุณ')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('ตัวอย่าง: XXXX-YYYY-ZZZZ')
                .setRequired(true);
                
            modal.addComponents(new ActionRowBuilder().addComponents(keyInput));
            await interaction.showModal(modal);
        }
    }

    if (interaction.isModalSubmit()) {
        if (interaction.customId.startsWith('modal_redeem_')) {
            const roleId = interaction.customId.replace('modal_redeem_', '');
            const key = interaction.fields.getTextInputValue('key_input').trim();
            
            await interaction.deferReply({ ephemeral: true });
            
            try {
                const apiUrl = config.apiUrl || 'http://127.0.0.1:3000';
                const res = await axios.post(`${apiUrl}/api/discord-redeem`, {
                    key: key,
                    discord_id: interaction.user.id,
                    secret: 'MY_SECRET_DISCORD_TOKEN_1234'
                });
                
                if (res.data.success) {
                    try {
                        const member = await interaction.guild.members.fetch(interaction.user.id);
                        const role = interaction.guild.roles.cache.get(roleId);
                        
                        if (role) {
                            await member.roles.add(role);
                            const embed = new EmbedBuilder()
                                .setTitle('✅ ยืนยันคีย์สำเร็จ')
                                .setDescription(`คีย์ถูกต้อง! คุณได้รับยศ <@&${roleId}> เรียบร้อยแล้ว`)
                                .setColor(0x00FF00);
                            await interaction.editReply({ embeds: [embed] });
                            console.log(`[Bot] ให้ยศแก่ ${interaction.user.tag} แล้ว (Key: ${key})`);
                        } else {
                            await interaction.editReply({ content: '❌ ไม่พบยศในห้องดิสนี้ กรุณาติดต่อแอดมิน'});
                        }
                    } catch (roleError) {
                        console.error('[Bot] ให้ยศไม่ได้:', roleError.message);
                        const embed = new EmbedBuilder()
                            .setTitle('⚠️ คีย์ถูกต้องแล้ว')
                            .setDescription('แต่บอทไม่สามารถให้ยศคุณได้ อาจเป็นเพราะบอทยศต่ำกว่า หรือไม่มีสิทธิ์ จัดการ Roles (โปรดติดต่อแอดมิน)')
                            .setColor(0xFFA500);
                        await interaction.editReply({ embeds: [embed] });
                    }
                } else {
                    await interaction.editReply({ embeds: [new EmbedBuilder().setTitle('❌ ข้อผิดพลาด').setDescription(res.data.error || 'คีย์ไม่ถูกต้องหรือถูกใช้ไปแล้ว').setColor(0xFF0000)] });
                }
            } catch (e) {
                const errMsg = e.response?.data?.error || 'เซิร์ฟเวอร์เว็บไม่ตอบสนอง หรือคีย์ไม่ถูกต้อง';
                await interaction.editReply({ embeds: [new EmbedBuilder().setTitle('❌ ข้อผิดพลาด').setDescription(errMsg).setColor(0xFF0000)] });
            }
        }
    }
});

if (config.token && config.token !== 'YOUR_BOT_TOKEN' && config.token !== 'YOUR_BOT_TOKEN_HERE') {
    client.login(config.token).catch(err => {
        console.error('[Bot] ❌ ล็อกอินไม่สำเร็จ กรุณาตรวจสอบ Token:', err.message);
    });
} else {
    console.log('[Bot] ⚠️ กรุณาตั้งค่า Token ในไฟล์ bot_config.js ก่อนรันบอท');
}

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});
