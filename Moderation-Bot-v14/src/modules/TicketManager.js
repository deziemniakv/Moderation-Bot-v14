const { 
    EmbedBuilder, 
    ButtonBuilder, 
    ActionRowBuilder, 
    ButtonStyle,
    PermissionFlagsBits,
    ChannelType,
    ComponentType,
    GuildChannel
} = require('discord.js');
const config = require('../config.json');
class TicketManager {
    constructor(client) {
        this.client = client;
        this.config = client.config.tickets;
    }

    async ensureCategory(guild, categoryConfig, categoryKey) {
        let category;

        if (categoryConfig.categoryId) {
            category = guild.channels.cache.get(categoryConfig.categoryId);
            if (category) {
                this.client.handler.logger.log('DEBUG', `Found existing category by ID: ${category.name} (${category.id})`);
                return category;
            }
        }

        const categoryIdentifier = `[${categoryKey}]`; 
        category = guild.channels.cache.find(channel => 
            channel.type === ChannelType.GuildCategory && 
            channel.name.startsWith(categoryIdentifier)
        );

        if (!category) {
            try {
                category = await guild.channels.create({
                    name: `${categoryIdentifier} ${categoryConfig.name}`, 
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [
                        {
                            id: guild.id,
                            deny: [PermissionFlagsBits.ViewChannel],
                        },
                        {
                            id: this.config.staffRole,
                            allow: [
                                PermissionFlagsBits.ViewChannel, 
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ManageChannels
                            ],
                        }
                    ]
                });

                categoryConfig.categoryId = category.id;
                this.client.handler.logger.log('NORMAL', `Created new category: ${category.name} (${category.id})`);
            } catch (error) {
                this.client.handler.logger.log('NORMAL', `Error creating category: ${error.message}`);
                throw error;
            }
        } else {
            categoryConfig.categoryId = category.id;
            this.client.handler.logger.log('DEBUG', `Found existing category by key: ${category.name} (${category.id})`);
        }

        return category;
    }

    async hasTicketInCategory(guild, userId, categoryId) {
        const channels = guild.channels.cache.filter(channel => 
            channel.type === ChannelType.GuildText && 
            channel.parentId === categoryId && 
            channel.topic === userId 
        );

        return channels.size > 0;
    }

    async findTicketChannel(guild, userId, categoryId) {
        return guild.channels.cache.find(channel => 
            channel.type === ChannelType.GuildText &&
            channel.parentId === categoryId && 
            channel.topic === userId
        );
    }

    async createTicketPanel(channel) {
        const embed = new EmbedBuilder()
            .setTitle('Ticket System')
            .setDescription('Click the "Help" or "Submissions" button to open a private channel to speak with the Staff Team.')
            .setColor('#786b9e');

        const buttons = Object.entries(this.config.categories).map(([id, category]) => {
            return new ButtonBuilder()
                .setCustomId(`ticket_create_${id}`)
                .setLabel(category.name)
                .setStyle(ButtonStyle.Secondary);
        });

        const row = new ActionRowBuilder().addComponents(buttons);

        await channel.send({
            embeds: [embed],
            components: [row]
        });
    }

    async createTicket(interaction, categoryId) {
        const category = this.config.categories[categoryId];
        if (!category) return;

        try {

            const categoryChannel = await this.ensureCategory(interaction.guild, category, categoryId);

            const existingTicket = await this.findTicketChannel(
                interaction.guild,
                interaction.user.id,
                categoryChannel.id
            );

            if (existingTicket) {
                await interaction.reply({
                    content: `You already have an open ticket in the category ${category.name}! ${existingTicket}`,
                    ephemeral: true
                });
                return;
            }

            await interaction.deferReply({ ephemeral: true });

            const channel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: categoryChannel.id,
                topic: `${interaction.user.id}|creator`,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel, 
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ],
                    },
                    {
                        id: this.config.staffRole,
                        allow: [
                            PermissionFlagsBits.ViewChannel, 
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.ManageChannels
                        ],
                    }
                ]
            });

            const controlButtons = [
                new ButtonBuilder()
                    .setCustomId('ticket_close')
                    .setLabel('Close')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('ticket_rename')
                    .setLabel('Change Name Ticket')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('ticket_add')
                    .setLabel('Add User')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('ticket_remove')
                    .setLabel('Remove User')
                    .setStyle(ButtonStyle.Secondary)
            ];

            const controlRow = new ActionRowBuilder().addComponents(controlButtons);

            const embed = new EmbedBuilder()
                .setTitle('Ticket created')
                .setDescription(`Hello ${interaction.user}! Staff will take care of you soon.`)
                .setColor('#786b9e')
                .addFields(
                    { name: 'Category', value: category.name },
                    { name: 'User ID', value: interaction.user.id }
                );

            await channel.send({
                embeds: [embed],
                components: [controlRow]
            });

            await this.logTicketAction(interaction.guild, {
                action: 'create',
                user: interaction.user,
                ticketId: channel.id
            });

            await interaction.editReply({
                content: `Ticket created! ${channel}`,
                ephemeral: true
            });

        } catch (error) {
            this.client.handler.logger.log('NORMAL', `Error creating ticket: ${error.message}`);
            
            if (!interaction.deferred && !interaction.replied) {
                await interaction.reply({
                    content: 'An error occurred while creating your ticket. Please try again later..',
                    ephemeral: true
                });
            } else {
                await interaction.editReply({
                    content: 'An error occurred while creating your ticket. Please try again later.',
                    ephemeral: true
                });
            }
        }
    }

    async logTicketAction(guild, { action, user, ticketId, extra = {} }) {
        if (!this.config.loggingChannel) {
            this.client.handler.logger.log('NORMAL', 'Login channel is not configured');
            return;
        }

        try {
            const channel = this.client.channels.cache.get(config.tickets.loggingChannel);
            if (!channel) {
                this.client.handler.logger.log('NORMAL', `Login channel ID not found: ${config.tickets.loggingChannel}`);
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle('📝 Ticket Log')
                .setColor('#0099ff')
                .setTimestamp();

            const ticketChannel = guild.channels.cache.get(ticketId);
            const ticketLink = ticketChannel ? `[Go to ticket](${ticketChannel.url})` : 'The channel does not exist';

            switch (action) {
                case 'create':
                    embed.setDescription(`🎫 Ticket created by ${user.tag}\n${ticketLink}`)
                        .setColor('#00ff00');
                    break;
                case 'close':
                    embed.setDescription(`🔒 Ticket closed by ${user.tag}`)
                        .setColor('#ff0000');
                    break;
                case 'rename':
                    embed.setDescription(`✏️ Ticket changed by ${user.tag}\n${ticketLink}`)
                        .addFields({ name: 'New Name', value: extra.newName })
                        .setColor('#ffff00');
                    break;
                case 'adduser':
                    embed.setDescription(`➕ User added to ticket by ${user.tag}\n${ticketLink}`)
                        .addFields({ name: 'Added User', value: extra.targetUser })
                        .setColor('#00ff00');
                    break;
                case 'removeuser':
                    embed.setDescription(`➖ User removed from ticket by ${user.tag}\n${ticketLink}`)
                        .addFields({ name: 'Removed User', value: extra.targetUser })
                        .setColor('#ff9900');
                    break;
            }

            const components = [];
            if (action === 'create' && ticketChannel) {
                const buttons = [
                    new ButtonBuilder()
                        .setCustomId(`log_delete_${ticketId}`)
                        .setLabel('🗑️ Delete Ticket')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId(`log_info_${ticketId}`)
                        .setLabel('ℹ️ User Info')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setLabel('🔗 Go to Ticket')
                        .setStyle(ButtonStyle.Link)
                        .setURL(ticketChannel.url)
                ];
                components.push(new ActionRowBuilder().addComponents(buttons));
            }

            await channel.send({
                embeds: [embed],
                components: components
            });
        } catch (error) {
            this.client.handler.logger.log('NORMAL', `Error logging in ticket action: ${error.message}`);
        }
    }
}

module.exports = TicketManager; 