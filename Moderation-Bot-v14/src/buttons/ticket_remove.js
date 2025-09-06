const { 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ActionRowBuilder 
} = require('discord.js');

module.exports = {
    customId: 'ticket_remove',
    staffOnly: true,
    async execute(interaction, client) {
        const modal = new ModalBuilder()
            .setCustomId('ticket_remove_modal')
            .setTitle('Remove User');

        const userInput = new TextInputBuilder()
            .setCustomId('user_id')
            .setLabel('User ID')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const row = new ActionRowBuilder().addComponents(userInput);
        modal.addComponents(row);
        
        await interaction.showModal(modal);
    }
}; 