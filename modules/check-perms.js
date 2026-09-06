require('dotenv').config({
    path: require('path').join(__dirname, '../.env'),
});const { Client, GatewayIntentBits } = require('dotenv').config(); // or standard require
const Discord = require('discord.js');
const logger = require('./Logger.js');
const { bold, green, red } = require('colorette');
const config = require('../config.js');

const client = new Discord.Client({ 
    intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMessages] 
});

client.once('clientReady', async () => {
    logger.info(`Checking permissions for bot: ${client.user.tag}`);

    for (const [slUUID, channelId] of config.relays.entries()) {
        try {
            const channel = await client.channels.fetch(channelId);
            const guild = channel.guild;
            const botMember = await guild.members.fetch(client.user.id);
            const permissions = channel.permissionsFor(botMember);

            const hasView = permissions.has(Discord.PermissionsBitField.Flags.ViewChannel);
            const hasSend = permissions.has(Discord.PermissionsBitField.Flags.SendMessages);
            const hasWebhooks = permissions.has(Discord.PermissionsBitField.Flags.ManageWebhooks);

            const formatPermission = granted => granted ? bold(green('YES')) : bold(red('NO'));

            logger.info(`Server: "${guild.name}" | Channel: #${channel.name}`);
            logger.info(`  - View Channel:      ${formatPermission(hasView)}`);
            logger.info(`  - Send Messages:     ${formatPermission(hasSend)}`);
            logger.info(`  - Manage Webhooks:   ${formatPermission(hasWebhooks)}`);

            if (!hasView) {
                logger.fatal(`  -> WARNING: Missing 'View Channel' permission.`);
            }
            if (!hasSend) {
                logger.fatal(`  -> WARNING: Missing 'Send Messages' permission.`);
            }
            if (!hasWebhooks) {
                logger.fatal(`  -> WARNING: Missing 'Manage Webhooks' will cause webhook creation to fail!`);
            }
        } catch (err) {
            logger.error(`[ERROR] Could not check channel ID ${channelId}: ${err.message}`);
        }
    }
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);