const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

// Nome do banco de dados
const DB_NAME = 'league_of_legends.db';

// Função para inicializar o banco de dados e inserir os campeões
async function initDatabase() {
  const url = 'https://ddragon.leagueoflegends.com/cdn/15.5.1/data/en_US/champion.json';

  try {
    // Buscar os dados dos campeões na API do League of Legends
    const response = await axios.get(url);
    const championsData = response.data.data;

    // Abrir o banco de dados
    const db = new sqlite3.Database(DB_NAME);

    db.serialize(() => {
      // Criar a tabela (se ainda não existir)
      db.run(`CREATE TABLE IF NOT EXISTS champions (
        id TEXT PRIMARY KEY, 
        name TEXT, 
        title TEXT, 
        key INTEGER
      )`);

      // Preparar a inserção de dados
      const stmt = db.prepare("INSERT OR REPLACE INTO champions (id, name, title, key) VALUES (?, ?, ?, ?)");

      // Inserir os dados dos campeões
      for (let championId in championsData) {
        const champion = championsData[championId];
        stmt.run(championId, champion.name, champion.title, champion.key);
      }

      stmt.finalize();
    });

    // Fechar o banco de dados
    db.close();
    console.log('Banco de dados inicializado com sucesso.');
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error.message);
  }
}

// Função para buscar a "key" de um campeão pelo nome
function getChampionName(championKey, callback) {
  const db = new sqlite3.Database(DB_NAME);

  db.get("SELECT name FROM champions WHERE key = ?", [championKey], (err, row) => {
    if (err) {
      callback(err, null);
    } else if (row) {
      callback(null, row.key);
    } else {
      callback(null, null);
    }
  });

  db.close();
}

// Exportar as funções para que possam ser usadas em outro arquivo
module.exports = { initDatabase, getChampionName };
