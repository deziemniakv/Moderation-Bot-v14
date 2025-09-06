const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'log_delete',
    staffOnly: true,
    async execute(interaction, client) {
        try {
            if (!interaction.member.roles.cache.has(client.config.tickets.adminRole)) {
                await interaction.reply({
                    content: '❌ You do not have permission to delete tickets!',
                    ephemeral: true
                });
                return;
            }

            const ticketId = interaction.customId.split('_')[2];
            const ticketChannel = interaction.guild.channels.cache.get(ticketId);

            if (!ticketChannel) {
                await interaction.reply({
                    content: '❌ This ticket has already been deleted!',
                    ephemeral: true
                });
                return;
            }

            await interaction.reply({
                content: `✅ I'm deleting the ticket ${ticketChannel.name}...`,
                ephemeral: true
            });

            await ticketChannel.delete();

            const originalMessage = interaction.message;
            const updatedEmbed = EmbedBuilder.from(originalMessage.embeds[0])
                .setColor('#ff0000')
                .setDescription(originalMessage.embeds[0].description + '\n\n🗑️ **Ticket deleted by administrator**');

            await originalMessage.edit({
                embeds: [updatedEmbed],
                components: [] 
            });

        } catch (error) {
            console.error(error);
            client.handler.logger.log('NORMAL', `Error in log_delete button: ${error.message}`);
            if (!interaction.replied) {
                await interaction.reply({
                    content: '❌ An error occurred while deleting the ticket!',
                    ephemeral: true
                });
            }
        }
    }
}; 