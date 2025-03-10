const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');

const RIOT_DDRAGON_URL = 'https://ddragon.leagueoflegends.com/cdn/15.5.1/data/en_US/champion.json';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('build')
        .setDescription('Mostra a build de um campeão no Mobalytics')
        .addStringOption(option =>
            option.setName('campeao')
                .setDescription('Nome do campeão')
                .setRequired(true)
        ),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            let userInput = interaction.options.getString('campeao').toLowerCase();

            // Busca os campeões na API da Riot
            const response = await axios.get(RIOT_DDRAGON_URL);
            const championsData = response.data.data;

            // Encontra o nome correto do campeão
            let championKey = Object.keys(championsData).find(key =>
                championsData[key].name.toLowerCase().replace(/[^a-z]/g, '') === userInput.replace(/[^a-z]/g, '')
            );

            if (!championKey) {
                return interaction.editReply('❌ Campeão não encontrado. Verifique o nome e tente novamente.');
            }

            // Formata a URL para o Mobalytics
            const buildUrl = `https://mobalytics.gg/lol/champions/${championKey.toLowerCase()}/build`;

            // Cria um botão interativo
            const button = new ButtonBuilder()
                .setLabel(`Abrir build de ${championsData[championKey].name}`)
                .setURL(buildUrl)
                .setStyle(ButtonStyle.Link);

            const row = new ActionRowBuilder().addComponents(button);

            // Responde com o botão interativo
            await interaction.editReply({
                content: `🔹 Build de **${championsData[championKey].name}** no Mobalytics:`,
                components: [row]
            });

        } catch (error) {
            console.error('Erro ao buscar a build:', error);
            await interaction.editReply('❌ Ocorreu um erro ao buscar a build. Tente novamente.');
        }
    }
};
