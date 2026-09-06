require('dotenv').config({
    path: require('path').join(__dirname, '../.env'),
});
const logger = require('./Logger.js');
module.exports = function (SLbot, discordClient) {
    // Ensure you define the target Discord user ID in your .env file
    const targetDiscordUserId = process.env.DISCORD_ADMIN_ID;

    if (!targetDiscordUserId) {
        logger.warn("[DM Relay] Warning: DISCORD_ADMIN_ID is not set in your .env file. DM relaying is disabled.");
        return;
    }

    SLbot.clientEvents.onInstantMessage.subscribe(async (im) => {
        try {
            // Check if the IM is a personal message (DialogTypes can vary, 0 is typically personal/from agent)
            // or verify it's not a group notice/chat depending on openmetaverse specs.
            if (im && im.message) {
                const senderName = im.fromName || "Unknown Resident";
                const messageBody = im.message;

                // Fetch the Discord user
                const discordUser = await discordClient.users.fetch(targetDiscordUserId);
                
                if (discordUser) {
                    await discordUser.send(`**[SL DM]** From **${senderName}**: \n> ${messageBody}`);
                    logger.log(`[DM Relay] Relayed DM from ${senderName} to Discord user ID ${targetDiscordUserId}`);
                }
            }
        } catch (error) {
            logger.error("[DM Relay] Error relaying SL DM to Discord:", error);
        }
    });

    logger.success("[DM Relay] Plugin initialized successfully.");
};