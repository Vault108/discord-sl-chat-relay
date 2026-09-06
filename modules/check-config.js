require('dotenv').config({
    path: require('path').join(__dirname, '../.env'),
});
const logger = require('./Logger.js');
const { Client, GatewayIntentBits } = require('discord.js');
const config = require('../config.js');

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] 
});

client.once('clientReady', async () => {
    logger.log(`Logged in as ${client.user.tag}!\n`);
    logger.log(`--- Connected Servers (Guilds) ---`);
    client.guilds.cache.forEach(guild => {
        logger.log(`- Server Name: "${guild.name}" (ID: ${guild.id})`);
    });
    logger.log(`----------------------------------\n`);

    logger.log(`--- Checking config.js Channel Mappings ---`);
    for (const [slUUID, channelId] of config.relays.entries()) {
        try {
            const channel = await client.channels.fetch(channelId);
            logger.success(`SL Group ${slUUID} maps to Channel #${channel.name} inside Server: "${channel.guild.name}" (ID: ${channel.guild.id})`);
        } catch (error) {
            logger.fatal(`SL Group ${slUUID} maps to Channel ID ${channelId} -> ERROR: Could not find channel. (Bot is likely missing from the server or ID is wrong).`);
        }
    }
    logger.log(`-------------------------------------------`);
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);