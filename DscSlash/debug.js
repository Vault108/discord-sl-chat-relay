const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const os = require('os');
const Discord = require('discord.js');
const config = require('../config.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("debug")
    .setDescription("Displays debug information.")
    .addSubcommand(subcommand => subcommand
      .setName('checkperms')
      .setDescription('Checks relay channel permissions.'))
    .addSubcommand(subcommand => subcommand
      .setName('checkconfig')
      .setDescription('Checks configured relay channel mappings.')),

  async execute(interaction) {
    if (interaction.options.getSubcommand(false) === 'checkperms') {
      await interaction.deferReply({ ephemeral: true });
      const embed = new EmbedBuilder()
        .setTitle('Permissions Check')
        .setColor('#0099ff')
        .setDescription([
          `Bot: **${interaction.client.user.tag}**`,
          `Checked relays: **${config.relays.size}**`,
        ].join('\n'))
        .setTimestamp();

      for (const [slUUID, channelId] of config.relays.entries()) {
        try {
          const channel = await interaction.client.channels.fetch(channelId);
          const botMember = await channel.guild.members.fetch(interaction.client.user.id);
          const permissions = channel.permissionsFor(botMember);
          const hasView = permissions.has(Discord.PermissionsBitField.Flags.ViewChannel);
          const hasSend = permissions.has(Discord.PermissionsBitField.Flags.SendMessages);
          const hasWebhooks = permissions.has(Discord.PermissionsBitField.Flags.ManageWebhooks);

          const formatPermission = granted => granted ? '**Enabled**' : '**Missing**';
          embed.addFields({
            name: `SL Group ${slUUID}`,
            value: [
              `**Channel:** ${channel} (#${channel.name})`,
              `**Server:** ${channel.guild.name}`,
              `**View Channel:** ${formatPermission(hasView)}`,
              `**Send Messages:** ${formatPermission(hasSend)}`,
              `**Manage Webhooks:** ${formatPermission(hasWebhooks)}`,
            ].join('\n'),
            inline: false,
          });
        } catch (error) {
          embed.addFields({
            name: `SL Group ${slUUID}`,
            value: [
              `**Status:** Error`,
              `**Channel ID:** ${channelId}`,
              `**Message:** ${error.message}`,
            ].join('\n'),
            inline: false,
          });
        }
      }

      if (config.relays.size === 0) {
        embed.setDescription(`${embed.data.description}\n\nNo relay mappings configured.`);
      }

      return interaction.editReply({ embeds: [embed] });
    }

    if (interaction.options.getSubcommand(false) === 'checkconfig') {
      await interaction.deferReply({ ephemeral: true });
      const embed = new EmbedBuilder()
        .setTitle('Configuration Check')
        .setColor('#0099ff')
        .setDescription([
          `Logged in as **${interaction.client.user.tag}**`,
          `Connected servers: **${interaction.client.guilds.cache.size}**`,
          `Configured relays: **${config.relays.size}**`,
        ].join('\n'))
        .setTimestamp();

      for (const [slUUID, channelId] of config.relays.entries()) {
        try {
          const channel = await interaction.client.channels.fetch(channelId);
          embed.addFields({
            name: `SL Group ${slUUID}`,
            value: [
              `**Status:** Configured`,
              `**Channel:** ${channel} (#${channel.name})`,
              `**Server:** ${channel.guild.name}`,
              `**Server ID:** ${channel.guild.id}`,
            ].join('\n'),
            inline: false,
          });
        } catch (error) {
          embed.addFields({
            name: `SL Group ${slUUID}`,
            value: [
              `**Status:** Error`,
              `**Channel ID:** ${channelId}`,
              `**Message:** ${error.message}`,
            ].join('\n'),
            inline: false,
          });
        }
      }

      if (config.relays.size === 0) {
        embed.setDescription(`${embed.data.description}\n\nNo relay mappings configured.`);
      }

      return interaction.editReply({ embeds: [embed] });
    }

    const botPing = Date.now() - interaction.createdTimestamp; // Calculate bot latency
    const DebugEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('STATISTICS')
      .addFields(
        { name: 'System OS', value: `${os.type()} ${os.release()} (${os.arch()})`, inline: false },
        { name: 'CPU', value: `${os.cpus()[0].model}`, inline: false },
        { name: 'Total Memory', value: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`, inline: false },
        { name: 'Free Memory', value: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`, inline: false },
        { name: 'Ping', value: `Bot: **${botPing}ms**\nAPI: **${interaction.client.ws.ping}ms**`, inline: false },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [DebugEmbed] });
  },
};