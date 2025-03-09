const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { RIOT_CHAMP_V3 } = process.env;
const sqlite3 = require('sqlite3').verbose();

const DB_NAME = 'league_of_legends.db';

// Função para buscar o nome de um campeão pela "key"
function getChampionName(championKey, callback) {
    const db = new sqlite3.Database(DB_NAME);

    db.get("SELECT name FROM champions WHERE key = ?", [championKey], (err, row) => {
        if (err) {
            callback(err, null);
        } else if (row) {
            callback(null, row.name);
        } else {
            callback(null, null);
        }
    });

    db.close();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rotation")
        .setDescription("Apresenta a rotação dos campeões grátis"),
    async execute(interaction) {
        try {
            // Adia a resposta para evitar o erro de tempo limite
            await interaction.deferReply();

            // Faz a requisição à API da Riot para obter a rotação de campeões grátis
            const response = await axios.get(RIOT_CHAMP_V3, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
                    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                    'Accept-Charset': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Origin': 'https://developer.riotgames.com'
                }
            });

            // Extrai os IDs dos campeões grátis
            const freeChampionsIds = response.data.freeChampionIds;

            // Array para armazenar os nomes dos campeões
            const championNames = [];

            // Função para buscar os nomes dos campeões de forma assíncrona
            const fetchChampionNames = async () => {
                for (const championKey of freeChampionsIds) {
                    await new Promise((resolve, reject) => {
                        getChampionName(championKey, (err, name) => {
                            if (err) {
                                console.error('Erro ao buscar o nome do campeão:', err.message);
                                resolve(); // Continua mesmo com erro
                            } else if (name) {
                                championNames.push(name);
                                resolve();
                            } else {
                                console.log(`Campeão com key ${championKey} não encontrado no banco de dados.`);
                                resolve();
                            }
                        });
                    });
                }
            };

            // Busca os nomes dos campeões
            await fetchChampionNames();

            // Formata a lista de campeões para exibição
            const championsList = championNames.map(name => `- ${name}`).join('\n');

            // Envia a resposta para o Discord
            await interaction.editReply(`🔹 **Campeões gratuitos da semana:**\n${championsList}`);
        } catch (error) {
            console.error('Houve um erro:', error);
            await interaction.editReply('Ocorreu um erro ao buscar a rotação de campeões. Tente novamente mais tarde.');
        }
    }
};