const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('The answer is pong!'),
        
    execute: async (interaction) => {
        await interaction.reply('**Pong! 🏓**');
    }
};