const { SlashCommandBuilder } = require("discord.js");
const logger = require("../modules/Logger.js");
const { permlevel } = require('../modules/functions.js');
const config = require('../config.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reboot")
    .setDescription("Shuts down the bot. If running under PM2, bot will restart automatically."),

  async execute(interaction) {
    const userPermLevel = permlevel(interaction);
    const requiredLevel = config.permLevels.find(l => l.name === 'Bot Admin')?.level || 10;
    if (userPermLevel < requiredLevel) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    await interaction.reply({ content: "Bot initiating logout and shutdown..." });

    try {
      await interaction.client.container.SLbot.close();
    } catch (error) {
      // Assuming logger is defined elsewhere
      logger.error(`SL: Error when logging out client`, "error");
      logger.error(error, "error");
    }
    
    process.exit(0);
  },
};