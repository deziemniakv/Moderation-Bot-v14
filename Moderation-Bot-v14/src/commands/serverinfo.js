const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Displays information about the server'),

    execute: async (interaction) => {
        const guild = interaction.guild;
        const owner = await guild.fetchOwner();
        
        const channels = guild.channels.cache;
        const textChannels = channels.filter(c => c.type === ChannelType.GuildText).size;
        const voiceChannels = channels.filter(c => c.type === ChannelType.GuildVoice).size;
        const categoryChannels = channels.filter(c => c.type === ChannelType.GuildCategory).size;

        const members = guild.members.cache;
        const totalMembers = members.size;
        const humans = members.filter(member => !member.user.bot).size;
        const bots = members.filter(member => member.user.bot).size;

        const roles = guild.roles.cache.size - 1;

        const createdTimestamp = Math.floor(guild.createdTimestamp / 1000);

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Server information')
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: 'Server name', value: guild.name, inline: true },
                { name: 'ID servers', value: guild.id, inline: true },
                { name: 'Owner', value: `${owner.user.tag}`, inline: true },
                { name: 'Created date', value: `<t:${createdTimestamp}:R>`, inline: true },
                { name: 'Region', value: guild.preferredLocale, inline: true },
                { name: 'Boost level', value: `${guild.premiumTier}`, inline: true },
                { name: 'Number of boosts', value: `${guild.premiumSubscriptionCount || 0}`, inline: true },
                { name: 'Members', value: `Everyone: ${totalMembers}\nPeople: ${humans}\nBots: ${bots}`, inline: true },
                { name: 'Channels', value: `Text Channel: ${textChannels}\nVoice Channel: ${voiceChannels}\nCategory: ${categoryChannels}`, inline: true },
                { name: `Roles (${roles})`, value: roles > 0 ? `${roles} role` : 'no roles' }
            )
            .setFooter({ text: `Triggered by ${interaction.user.tag}` })
            .setTimestamp();

        if (guild.banner) {
            embed.setImage(guild.bannerURL({ dynamic: true }));
        }

        await interaction.reply({ embeds: [embed] });
    }
}; 