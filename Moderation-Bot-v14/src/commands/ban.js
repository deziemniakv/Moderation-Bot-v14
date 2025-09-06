const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans the user from the server')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to be banned')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Bans Reason')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    execute: async (interaction) => {
        const target = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') || '.';

        if (!target) {
            return await interaction.reply({
                content: 'User not found.',
                ephemeral: true
            });
        }

        if (!target.bannable) {
            return await interaction.reply({
                content: 'I cant ban this user.',
                ephemeral: true
            });
        }

        try {
            await target.ban({ reason });
            await interaction.reply({
                content: `User successfully banned ${target.user.tag}\nReason: ${reason}`
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'An error occurred while attempting to ban the user.',
                ephemeral: true
            });
        }
    }
}; 