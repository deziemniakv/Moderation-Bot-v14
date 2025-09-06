const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Mutes the user for a specified period of time')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to mute')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('time')
                .setDescription('Mute time in minutes')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(40320)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for mute')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    execute: async (interaction) => {
        const target = interaction.options.getMember('user');
        const duration = interaction.options.getInteger('time');
        const reason = interaction.options.getString('reason') || '.';

        if (!target) {
            return await interaction.reply({
                content: 'User not found.',
                ephemeral: true
            });
        }

        if (!target.moderatable) {
            return await interaction.reply({
                content: 'I cant mute this user.',
                ephemeral: true
            });
        }

        try {
            await target.timeout(duration * 60 * 1000, reason);
            await interaction.reply({
                content: `User successfully muted ${target.user.tag} on ${duration} minutes\nReason: ${reason}`
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'An error occurred while trying to mute the user.',
                ephemeral: true
            });
        }
    }
}; 