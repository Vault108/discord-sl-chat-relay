const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Pongs when pinged."),
  async execute(interaction) {
    const botPing = Date.now() - interaction.createdTimestamp;
    const pingEmbed = new EmbedBuilder()
      .setTitle('Pong!')
      .setColor('#0099ff')
      .addFields(
        { name: 'Bot Latency', value: `**${botPing}ms**`, inline: true },
        { name: 'API Latency', value: `**${Math.round(interaction.client.ws.ping)}ms**`, inline: true },
      )
      .setTimestamp();

    await interaction.reply({
      embeds: [pingEmbed],
      ephemeral: true,
    });
  },
};



