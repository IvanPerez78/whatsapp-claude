import Anthropic from "@anthropic-ai/sdk";

import pkg from 'whatsapp-web.js';
import qr from 'qrcode-terminal';



const { Client, LocalAuth } = pkg;
const qrcode = qr;

const client = new Client({
    authStrategy: new LocalAuth(), // keeps you logged in between runs
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
        ],
    },
});

const claudeClient = new Anthropic({apiKey: "YOUR-KEY-HERE"});



let currMessage;

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.initialize();

client.on('message_create', message => {});

client.on('message_create', async message => {
    if (!message.body.startsWith('!claude ')) return;

    const prompt = message.body.slice(8).trim();
    try {
        const claudeMessage = await claudeClient.messages.create({
            model: "claude-haiku-5-5",
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }],
        });
        const text = claudeMessage.content
            .filter(block => block.type === 'text')
            .map(block => block.text)
            .join('\n');
        await message.reply(text);
    } catch (err) {
        console.error('Failed to handle !claude message:', err);
    }
});