const { GitHubBot } = require('github-bot');
const { GeminiAI } = require('gemini-ai');
const { NayanBotCommands } = require('nayan-bot-commands');
const fs = require('fs');

const jagatState = JSON.parse(fs.readFileSync('jagatstate.json', 'utf8'));
const apostate = JSON.parse(fs.readFileSync('apostate.json', 'utf8'));

const bot = new GitHubBot({
  botName: jagatState.bot_name,
  ownerUID: jagatState.owner_uid,
  ownerName: jagatState.owner_name,
  prefix: jagatState.prefix,
  token: jagatState.token,
});

const geminiAI = new GeminiAI({
  apiKey: 'YOUR_GEMINI_API_KEY',
});

const nayanBotCommands = new NayanBotCommands({
  bot,
});

bot.on('message', async (message) => {
  if (message.text.startsWith(bot.prefix)) {
    const command = message.text.slice(bot.prefix.length).split(' ')[0];
    const args = message.text.slice(bot.prefix.length + command.length + 1);

    switch (command) {
      case 'Gemini':
        geminiHandler(message, args);
        break;
      case 'kick':
        kickHandler(message, args);
        break;
      case 'quiz':
        quizHandler(message);
        break;
      case 'video':
        if (args.startsWith('download')) {
          videoDownloadHandler(message, args.slice(9));
        } else {
          message.reply('Unknown command');
        }
        break;
      case 'dalle':
        dalleHandler(message, args);
        break;
      case 'help':
        helpHandler(message);
        break;
      case 'about':
        aboutHandler(message);
        break;
      case 'ping':
        pingHandler(message);
        break;
      case 'echo':
        echoHandler(message, args);
        break;
      case 'roll':
        rollHandler(message);
        break;
      case 'coinflip':
        coinflipHandler(message);
        break;
      default:
        message.reply('Unknown command');
    }
  }
});

async function geminiHandler(message, args) {
  const response = await geminiAI.respond(args);
  message.reply(response);
}

async function kickHandler(message, args) {
  if (message.chat.type === 'group') {
    const memberID = args;
    try {
      await bot.kickMember(message.chat.id, memberID);
      message.reply(`Kicked ${memberID} from the group`);
    } catch (error) {
      message.reply('Failed to kick member');
    }
  } else {
    message.reply('This command can only be used in a group');
  }
}

async function quizHandler(message) {
  const quiz = nayanBotCommands.getQuiz();
  message.reply(quiz);
}

async function videoDownloadHandler(message, args) {
  const url = args;
  try {
    const video = await bot.downloadVideo(url);
    message.reply(`Downloaded video: ${video}`);
  } catch (error) {
    message.reply('Failed to download video');
  }
}

async function dalleHandler(message, args) {
  const prompt = args;
  try {
    const image = await bot.generateImage(prompt);
    message.reply(`Generated image: ${image}`);
  } catch (error) {
    message.reply('Failed to generate image');
  }
}

async function helpHandler(message) {
  const commands = apostate.commands;
  const helpMessage = `Available commands:\n\n`;
  for (const command of commands) {
    helpMessage += `.${command.name} - ${command.description}\n`;
  }
  message.reply(helpMessage);
}

async function aboutHandler(message) {
  message.reply(`This is ${bot.botName}, a GitHub bot created by ${bot.ownerName}.`);
}

async function pingHandler(message) {
  const startTime = Date.now();
  message.reply('Pong!');
  const endTime = Date.now();
  message.reply(`Response time: ${endTime - startTime}ms`);
}

async function echoHandler(message, args) {
  message.reply(args);
}

async function rollHandler(message) {
  const roll = Math.floor(Math.random() * 100) + 1;
  message.reply(`You rolled a ${roll}`);
}

async function coinflipHandler(message) {
  const flip = Math.random() < 0.5 ? 'Heads' : 'Tails';
  message.reply(`You flipped a ${flip}`);
}

bot.start();
