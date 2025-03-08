const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');

const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config()
const { TOKEN, CLIENT_ID, GUILD_ID, RIOT_API } = process.env;

const { initDatabase, getChampionKey } = require('./database');

initDatabase().then(() => {
    console.log('Banco de dados carregado!');
});

const championName = 'Ahri';

getChampionKey(championName, (err, key) => {
    if (err) {
        console.error('Erro ao buscar key do campeão:', err.message);
    } else if (key) {
        console.log(`A key de ${championName} é ${key}`);
    } else {
        console.log(`Campeão ${championName} não encontrado no banco de dados.`);
    }
});

const fs = require('node:fs');
const path = require('node:path');


const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection()

const commandsPath = path.join(__dirname, 'commands');
const commandsFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
console.log(commandsFiles);

for (const file of commandsFiles) {

    const filePath = path.join(commandsPath, file);
    const commands = require(filePath);

    if ('data' in commands && 'execute' in commands) {

        client.commands.set(commands.data.name, commands);

    } else {
        console.log(`Esse comando em ${filePath} está com "data" ou "execute" ausentes`);
    }
}

client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
})

client.login(TOKEN);

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`Nenhum comando correspondente encontrado para ${interaction.commandName}`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: '❌ Ocorreu um erro ao executar o comando!', ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN);