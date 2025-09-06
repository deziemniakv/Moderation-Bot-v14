const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks the user from the server')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to be kicked out')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for kick the server')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    execute: async (interaction) => {
        const target = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') || '.';

        if (!target) {
            return await interaction.reply({
                content: 'User not found.',
                ephemeral: true
            });
        }

        if (!target.kickable) {
            return await interaction.reply({
                content: 'I cant kick this user.',
                ephemeral: true
            });
        }

        try {
            await target.kick(reason);
            await interaction.reply({
                content: `User kicked successfully ${target.user.tag}\nReason: ${reason}`
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'An error occurred while trying to kick the user.',
                ephemeral: true
            });
        }
    }
}; 