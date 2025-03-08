const { REST, Routes, Client, GatewayIntentBits, Collection } = require('discord.js');


const dotenv = require('dotenv');
dotenv.config()
const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;



const fs = require('node:fs');
const path = require('node:path');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection()

const commandsPath = path.join(__dirname, 'commands');
const commandsFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
console.log(commandsFiles);

const commands = []

for (const file of commandsFiles) {

    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());

}

const rest = new REST({version: '10'}).setToken(TOKEN);

(async () => {
    try {
        console.log(`Resetando ${commands.length} comandos...`)

        const data = await rest.put(

            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            {body: commands}
        )
        console.log('Comandos registrados com sucesso')
    }

    catch (error){
        console.error(error)
    }

})()