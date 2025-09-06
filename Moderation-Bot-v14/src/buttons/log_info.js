const { EmbedBuilder } = require("discord.js");

module.exports = {
  customId: "log_info",
  staffOnly: true,
  async execute(interaction, client) {
    try {
      const ticketId = interaction.customId.split("_")[2];
      const ticketChannel = interaction.guild.channels.cache.get(ticketId);

      if (!ticketChannel) {
        await interaction.reply({
          content: "❌ This ticket no longer exists!",
          ephemeral: true,
        });
        return;
      }

      const creatorId = ticketChannel.topic.split("|")[0];
      const user = await client.users.fetch(creatorId);
      const member = await interaction.guild.members.fetch(creatorId);

      const createdTimestamp = Math.floor(member.user.createdTimestamp / 1000);
      const joinedTimestamp = Math.floor(member.joinedTimestamp / 1000);

      const infoEmbed = new EmbedBuilder()
        .setColor("#2F3136")
        .setDescription(
          `## Review
-# ** • Username: ${user.username} (<@${user.id}>)**
-# ** • ID: ${user.id}**

-# ** • Account creation date: <t:${createdTimestamp}:F> (<t:${createdTimestamp}:R>)**
-# ** • Joined the server: <t:${joinedTimestamp}:F> (<t:${joinedTimestamp}:R>)**

## Role
-# ** • Number of roles: ${member.roles.cache.size - 1} **
-# ** • Top role: ${member.roles.highest.name} **
-# **• Role list: ${member.roles.cache
              .filter((role) => role.id !== interaction.guild.id)
              .map((role) => role.name)
              .join(", ")}** `
        )
        .setTimestamp();

      await interaction.reply({
        embeds: [infoEmbed],
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      client.handler.logger.log(
        "NORMAL",
        `Error in log_info button: ${error.message}`
      );
      await interaction.reply({
        content:
          "❌ An error occurred while retrieving user information!",
        ephemeral: true,
      });
    }
  },
};
