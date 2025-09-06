const { 
    Modal, 
    TextInputBuilder, 
    TextInputStyle,
    ActionRowBuilder 
} = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            client.handler.logger.log('DEBUG', 
                `Użytkownik ${interaction.user.tag} (${interaction.user.id}) ` +
                `użył komendy /${interaction.commandName} na serwerze ${interaction.guild.name}`
            );

            const command = client.handler.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                client.handler.logger.log('NORMAL', 
                    `Nieznana komenda ${interaction.commandName} użyta przez ${interaction.user.tag}`
                );
                return;
            }

            try {
                await command.execute(interaction);
                client.handler.logger.log('DEBUG', 
                    `/${interaction.commandName} made by ${interaction.user.tag}`
                );
            } catch (error) {
                console.error(error);
                client.handler.logger.log('NORMAL', 
                    `Error while executing command /${interaction.commandName} ` +
                    `By ${interaction.user.tag} (${interaction.user.id}): ${error.message}`
                );
                
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ 
                        content: 'An error occurred while executing this command!', 
                        ephemeral: true 
                    });
                } else {
                    await interaction.reply({ 
                        content: 'An error occurred while executing this command!', 
                        ephemeral: true 
                    });
                }
            }
            return;
        }

        if (interaction.isButton()) {
            const { customId } = interaction;
            let buttonHandler;

            if (customId.startsWith('ticket_create_')) {
                buttonHandler = client.handler.buttons.get('ticket_create');
            } 
            else if (customId.startsWith('log_delete_')) {
                buttonHandler = client.handler.buttons.get('log_delete');
            }
            else if (customId.startsWith('log_info_')) {
                buttonHandler = client.handler.buttons.get('log_info');
            }
            else {
                buttonHandler = client.handler.buttons.get(customId);
            }

            if (!buttonHandler) {
                client.handler.logger.log('NORMAL', `Unknown button: ${customId}`);
                return;
            }

            if (buttonHandler.staffOnly && !interaction.member.roles.cache.has(client.config.tickets.staffRole)) {
                await interaction.reply({
                    content: 'You do not have permission to perform this action!',
                    ephemeral: true
                });
                return;
            }

            try {
                await buttonHandler.execute(interaction, client);
            } catch (error) {
                client.handler.logger.log('NORMAL', `Error while operating the button ${customId}: ${error.message}`);
                if (!interaction.replied) {
                    await interaction.reply({
                        content: 'An error occurred while performing this action!',
                        ephemeral: true
                    });
                }
            }
        }

        if (interaction.isModalSubmit()) {
            const { customId } = interaction;

            switch (customId) {
                case 'ticket_rename_modal':
                    const newName = interaction.fields.getTextInputValue('new_name');
                    await interaction.channel.setName(newName);
                    await interaction.reply(`The name of the ticket has been changed to: ${newName}`);
                    break;

                case 'ticket_add_modal':
                    const userIdToAdd = interaction.fields.getTextInputValue('user_id');
                    try {
                        const user = await interaction.client.users.fetch(userIdToAdd);
                        await interaction.channel.permissionOverwrites.create(user, {
                            ViewChannel: true,
                            SendMessages: true
                        });
                        await interaction.reply(`User ${user.tag} was added to the ticket.`);
                    } catch (error) {
                        await interaction.reply({
                            content: 'No user with the specified ID was found..',
                            ephemeral: true
                        });
                    }
                    break;

                case 'ticket_remove_modal':
                    const userIdToRemove = interaction.fields.getTextInputValue('user_id');
                    try {
                        const user = await interaction.client.users.fetch(userIdToRemove);
                        await interaction.channel.permissionOverwrites.delete(user.id);
                        await interaction.reply(`User ${user.tag} was removed from the ticket.`);
                    } catch (error) {
                        await interaction.reply({
                            content: 'No user with the specified ID was found..',
                            ephemeral: true
                        });
                    }
                    break;
            }
        }
    },
}; 