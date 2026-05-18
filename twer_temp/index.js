const axios = require('axios');
const { 
    Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, 
    ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, 
    TextInputStyle, SlashCommandBuilder, REST, Routes, PermissionFlagsBits 
} = require('discord.js');

const fs = require('fs');
let config = {
    token: '', 
    apiUrl: 'http://127.0.0.1:3000',
    secret: 'MY_SECRET_DISCORD_TOKEN_1234'
};
try {
  config = require('./bot_config.js');
} catch(e) {}

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
    client.user.setPresence({
        activities: [{ name: 'ระบบรับยศอัตโนมัติ' }],
        status: 'online'
    });
    
    const commands = [
        new SlashCommandBuilder()
            .setName('setup')
            .setDescription('🛠️ [แอดมิน] ตั้งค่าระบบรับยศ (ปุ่มกด)')
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addStringOption(option => option.setName('title').setDescription('หัวข้อหลัก').setRequired(true))
            .addStringOption(option => option.setName('description').setDescription('หัวข้อรอง').setRequired(true))
            .addStringOption(option => option.setName('image').setDescription('ลิ้งรูปภาพ (ถ้ามี ใส่ url)').setRequired(false))
            .addStringOption(option => option.setName('button_name').setDescription('ชื่อปุ่ม').setRequired(true))
            .addRoleOption(option => option.setName('role').setDescription('ยศที่จะได้เมื่อกรอกคีย์สำเร็จ').setRequired(true)),
            
        new SlashCommandBuilder()
            .setName('rekey')
            .setDescription('🔑 [แอดมิน] สร้างคีย์ใหม่ลงในระบบหลังบ้าน')
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addStringOption(option => option.setName('key').setDescription('คีย์ที่ต้องการสร้าง (ตัวอย่าง: VIP-1234)').setRequired(true))
            .addStringOption(option => option.setName('plan').setDescription('ชื่อแพ็กเกจ (ค่าเริ่มต้น: premium)').setRequired(false))
    ];

    const rest = new REST({ version: '10' }).setToken(config.token);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('[Bot] 📝 ลงทะเบียน Slash Commands เรียบร้อยแล้ว!');
    } catch (error) {
        console.error('[Bot] ❌ ไม่สามารถลงทะเบียน Commands ได้:', error.message);
    }
});

client.on('interactionCreate', async interaction => {
    // ---- Slash Commands ----
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'setup') {
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

        if (interaction.commandName === 'rekey') {
            const key = interaction.options.getString('key');
            const plan = interaction.options.getString('plan') || 'premium';

            await interaction.deferReply({ ephemeral: true });
            try {
                const res = await axios.post(`${config.apiUrl}/api/discord-rekey`, {
                    key: key,
                    plan: plan,
                    secret: config.secret
                });
                if (res.data.success) {
                    await interaction.editReply(`✅ **เพิ่มคีย์สำเร็จ!**\nคีย์: \`${key}\`\nแพ็กเกจ: \`${plan}\``);
                } else {
                    await interaction.editReply(`❌ **เกิดข้อผิดพลาด:** ${res.data.error || 'ไม่สามารถเพิ่มคีย์ได้'}`);
                }
            } catch (e) {
                const errMsg = e.response?.data?.error || 'เซิร์ฟเวอร์หลังบ้านไม่ตอบสนอง';
                await interaction.editReply(`❌ **เกิดข้อผิดพลาดในการเชื่อมต่อ API:** ${errMsg}`);
            }
        }
    }

    // ---- Button Click ----
    if (interaction.isButton()) {
        if (interaction.customId.startsWith('redeem_btn_role_')) {
            const roleId = interaction.customId.replace('redeem_btn_role_', '');
            
            const modal = new ModalBuilder()
                .setCustomId(`modal_redeem_${roleId}`)
                .setTitle('ระบบรับยศอัตโนมัติ');
                
            const keyInput = new TextInputBuilder()
                .setCustomId('key_input')
                .setLabel('กรุณากรอกคีย์ของคุณ')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('ตัวอย่าง: XXXX-YYYY-ZZZZ')
                .setMaxLength(50)
                .setRequired(true);
                
            modal.addComponents(new ActionRowBuilder().addComponents(keyInput));
            await interaction.showModal(modal);
        }
    }

    // ---- Modal Submit ----
    if (interaction.isModalSubmit()) {
        if (interaction.customId.startsWith('modal_redeem_')) {
            const roleId = interaction.customId.replace('modal_redeem_', '');
            const key = interaction.fields.getTextInputValue('key_input').trim();
            
            await interaction.deferReply({ ephemeral: true });
            
            try {
                const res = await axios.post(`${config.apiUrl}/api/discord-redeem`, {
                    key: key,
                    discord_id: interaction.user.id,
                    secret: config.secret
                });
                
                if (res.data.success) {
                    try {
                        const member = await interaction.guild.members.fetch(interaction.user.id);
                        const role = interaction.guild.roles.cache.get(roleId);
                        
                        if (role) {
                            await member.roles.add(role);
                            const embed = new EmbedBuilder()
                                .setTitle('✅ ยืนยันคีย์สำเร็จ')
                                .setDescription(`คีย์ **${key}** ถูกต้อง!\nคุณได้รับยศ <@&${roleId}> เรียบร้อยแล้ว 🎉`)
                                .setColor(0x00FF00);
                            await interaction.editReply({ embeds: [embed] });
                            console.log(`[Bot] ให้ยศแก่ ${interaction.user.tag} สมบูรณ์ (Key: ${key})`);
                        } else {
                            await interaction.editReply('❌ ไม่พบยศดังกล่าวในเซิร์ฟเวอร์ กรุณาติดต่อแอดมิน');
                        }
                    } catch (roleError) {
                        console.error('[Bot] ให้ยศไม่ได้:', roleError.message);
                        const embed = new EmbedBuilder()
                            .setTitle('⚠️ คีย์ถูกต้องแล้ว')
                            .setDescription('บอทไม่สามารถให้ยศคุณได้ อาจเป็นเพราะบอทยศต่ำกว่าหรือไม่มีสิทธิ์ (โปรดติดต่อแอดมิน)')
                            .setColor(0xFFA500);
                        await interaction.editReply({ embeds: [embed] });
                    }
                } else {
                    await interaction.editReply({ embeds: [new EmbedBuilder().setTitle('❌ ข้อผิดพลาด').setDescription(res.data.error || 'คีย์ไม่ถูกต้องหรือถูกใช้ไปแล้ว').setColor(0xFF0000)] });
                }
            } catch (e) {
                const errMsg = e.response?.data?.error || 'เซิร์ฟเวอร์หน้าเว็บไม่ตอบสนอง';
                await interaction.editReply({ embeds: [new EmbedBuilder().setTitle('❌ ข้อผิดพลาด').setDescription(errMsg).setColor(0xFF0000)] });
            }
        }
    }
});

client.login(config.token).catch(err => {
    console.error('[Bot] ❌ ล็อกอินไม่สำเร็จ กรุณาตรวจสอบ Token:', err.message);
});

process.on('unhandledRejection', error => {
    console.error('[Warning] Unhandled promise rejection:', error);
});
