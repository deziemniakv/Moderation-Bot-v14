const { 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ActionRowBuilder 
} = require('discord.js');

module.exports = {
    customId: 'ticket_rename',
    staffOnly: true,
    async execute(interaction, client) {
        const modal = new ModalBuilder()
            .setCustomId('ticket_rename_modal')
            .setTitle('Change Name Ticket');

        const nameInput = new TextInputBuilder()
            .setCustomId('new_name')
            .setLabel('New Name')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const row = new ActionRowBuilder().addComponents(nameInput);
        modal.addComponents(row);
        
        await interaction.showModal(modal);
    }
}; 