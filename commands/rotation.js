const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rotation')
        .setDescription('Apresenta a rotação dos campeões grátis'),

    async execute(interaction) {
        try {
            await interaction.deferReply(); // ✅ Isso evita que o Discord expire a interação

            const response = await axios.get('https://br1.api.riotgames.com/lol/platform/v3/champion-rotations', {
                headers: { 'X-Riot-Token': process.env.RIOT_API }
            });

            const freeChampionIds = response.data.freeChampionIds;
            await interaction.editReply(`🔹 Campeões gratuitos da semana (IDs): \n${freeChampionIds.join(', ')}`);
        } catch (error) {
            console.error("Erro ao buscar dados da API:", error);
            await interaction.editReply("❌ Ocorreu um erro ao buscar os campeões gratuitos.");
        }
    }

};