const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();



const bot = new TelegramBot(process.env.token, { polling: true });

const standingsURL = 'https://v3.football.api-sports.io/standings';
const scorersURL = 'https://v3.football.api-sports.io/players/topscorers'
const assistsURL = 'https://v3.football.api-sports.io/players/topassists'
const leagueId = 203; // Süper Lig ID
const season = 2023; // Current Season

const apiOptions = {
    headers: {
        'x-apisports-key': process.env.apiKey
    },
    params: {
        league: leagueId,
        season: season
    }
};


const sendHelpMessage = (chatId) => {
    const helpMessage = `İşte kullanabileceğiniz komutlar:\n\n` +
        '- Puan tablosunu görüntüle: /puan\n' +
        '- Gol kralı: /gol\n' +
        '- Asist kralı: /asist\n' +
        '-Bu sayfayı tekrar göster: /yardim ';



    bot.sendMessage(chatId, helpMessage);
};

// help 
bot.onText("/yardim", (msg) => {
    const chatId = msg.chat.id;
    sendHelpMessage(chatId);
});

//  start 
bot.onText("/start", (msg) => {
    const chatId = msg.chat.id;
    sendHelpMessage(chatId);
});

// points table
bot.onText("/puan", (msg) => {
    const chatId = msg.chat.id;

    axios.get(standingsURL, apiOptions)
        .then(response => {
            const standings = response.data.response[0].league.standings[0];
            let tableMessage = 'Süper Lig Puan Tablosu:\n\n';

            standings.forEach((team, index) => {
                tableMessage += `${index + 1}. ${team.team.name} - ${team.points} puan\n`;
            });

            bot.sendMessage(chatId, tableMessage);
        })
        .catch(error => {
            console.error('Bir hata oluştu:', error);
            bot.sendMessage(chatId, 'Lütfen daha sonra tekrar deneyin.');
        });
});

// assists
bot.onText("/asist", (msg) => {
    const chatId = msg.chat.id;

    axios.get(assistsURL, apiOptions)
        .then(response => {
            const data = response.data.response[0];
            const assist = data.player.name;
            const num = data.statistics[0].goals.assists;
            const photo = data.player.photo;
            let assistMessage = `Asist kralı: ${num} asist ile ${assist}`;

            bot.sendMessage(chatId, assistMessage);
            bot.sendPhoto(chatId, photo);
        })
        .catch(error => {
            console.error('Bir hata oluştu:', error);
            bot.sendMessage(chatId, 'Lütfen daha sonra tekrar deneyin.');
        });
});

// goals
bot.onText("/gol", (msg) => {
    const chatId = msg.chat.id;

    axios.get(scorersURL, apiOptions)
        .then(response => {
            const data = response.data.response[0];
            const goal = data.player.name;
            const num = data.statistics[0].goals.total;
            const photo = data.player.photo;
            let goalMessage = `Gol kralı: ${num} gol ile ${goal}`;

            bot.sendMessage(chatId, goalMessage);
            bot.sendPhoto(chatId, photo);
        })
        .catch(error => {
            console.error('Bir hata oluştu:', error);
            bot.sendMessage(chatId, 'Lütfen daha sonra tekrar deneyin.');
        });
});
