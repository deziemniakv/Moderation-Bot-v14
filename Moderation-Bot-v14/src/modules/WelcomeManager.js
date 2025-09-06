const { EmbedBuilder } = require('discord.js');

class WelcomeManager {
    constructor(client) {
        this.client = client;
        this.config = client.config.welcome;
    }

    async handleWelcome(member) {
        if (!this.config.enabled) return;

        const channel = member.guild.channels.cache.get(this.config.channel);
        if (!channel) {
            this.client.handler.logger.log('NORMAL', `Nie znaleziono kanału powitalnego: ${this.config.channel}`);
            return;
        }

        try {
            const welcomeEmbed = new EmbedBuilder()
                .setColor(this.config.color.welcome)
                .setDescription(
                    this.config.messages.welcome
                        .replace('{user}', member)
                        .replace('{server}', member.guild.name)
                        .replace('{count}', member.guild.memberCount)
                );

            if (this.config.thumbnail) {
                welcomeEmbed.setThumbnail("https://media.discordapp.net/attachments/1383370082595639338/1413636116485116045/Screenshot_2025-07-07-10-01-44-105_com.facebook.katana.jpg?ex=68bca6ba&is=68bb553a&hm=e8f143d769cdfe8fb2d18cabf665aa6a853ad4b5f64510d99c1c6d6da0b18a37&=&format=webp&width=421&height=959");
            }

            if (this.config.showTimestamp) {
                welcomeEmbed.setTimestamp();
            }

            await channel.send({ embeds: [welcomeEmbed] });
            this.client.handler.logger.log('DEBUG', `Wysłano wiadomość powitalną dla ${member.user.tag}`);
        } catch (error) {
            this.client.handler.logger.log('NORMAL', `Błąd podczas wysyłania wiadomości powitalnej: ${error.message}`);
        }
    }

    async handleLeave(member) {
        if (!this.config.enabled) return;

        const channel = member.guild.channels.cache.get(this.config.channel);
        if (!channel) {
            this.client.handler.logger.log('NORMAL', `Nie znaleziono kanału pożegnalnego: ${this.config.channel}`);
            return;
        }

        try {
            const leaveEmbed = new EmbedBuilder()
                .setColor(this.config.color.leave)
                .setDescription(
                    this.config.messages.leave
                        .replace('{user}', member.user.tag)
                        .replace('{server}', member.guild.name)
                        .replace('{count}', member.guild.memberCount)
                );

            if (this.config.thumbnail) {
                leaveEmbed.setThumbnail("https://media.discordapp.net/attachments/1383370082595639338/1413636116485116045/Screenshot_2025-07-07-10-01-44-105_com.facebook.katana.jpg?ex=68bca6ba&is=68bb553a&hm=e8f143d769cdfe8fb2d18cabf665aa6a853ad4b5f64510d99c1c6d6da0b18a37&=&format=webp&width=421&height=959");
            }

            if (this.config.showTimestamp) {
                leaveEmbed.setTimestamp();
            }

            await channel.send({ embeds: [leaveEmbed] });
            this.client.handler.logger.log('DEBUG', `Wysłano wiadomość pożegnalną dla ${member.user.tag}`);
        } catch (error) {
            this.client.handler.logger.log('NORMAL', `Błąd podczas wysyłania wiadomości pożegnalnej: ${error.message}`);
        }
    }
}

module.exports = WelcomeManager; 