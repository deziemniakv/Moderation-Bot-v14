const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName("createticketpanel")
    .setDescription("Creates a panel with buttons for creating tickets"),
  async execute(interaction) {
    if (
      !interaction.member.roles.cache.has(
        interaction.client.config.tickets.adminRole
      )
    ) {
      return interaction.reply({
        content: "You do not have permissions for this command!",
        ephemeral: true,
      });
    }

    await interaction.client.ticketManager.createTicketPanel(
      interaction.channel
    );
    await interaction.reply({
      content: "Ticket panel has been created!",
      ephemeral: true,
    });
  },
};
