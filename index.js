const tmi = require('tmi.js');

const {
	NODE_ENV,
	TMI_NAME: username,
	TMI_PASS: password,
	TMI_CHANNEL: joinChannels,
	MOD_ACTION,
	BAN_REASON: banReason = 'Anti-art moderation bot',
	TIMEOUT_SECONDS: timeoutSeconds,
	SAFE_LEVEL = 'sub'
} = process.env;

let envIsGood = false;

if(!username || !password) {
	console.log('Missing TMI_NAME or TMI_PASS in environment (bot username/password)');
}
else if(!joinChannels) {
	console.log('Missing TMI_CHANNEL in environment (csv list of channels)');
}
else {
	envIsGood = true;
}

if(!envIsGood) {
	process.exit();
}

const ranges = [
	{
		name: 'boxDrawing',
		range: [ [ 0x2500, 0x257F ] ]
	},{
		name: 'block',
		range: [ [ 0x2580, 0x259F ] ]
	},{
		name: 'braille',
		range: [ [ 0x2800, 0x28FF ] ]
	}
];

// TODO: Get from env (include/exlude)
const rangePicks = [ 'braille', 'boxDrawing', 'block' ];

const toUnicodeRegex = n => `\\u${n.toString(16)}`;
const regexRanges = ranges.filter(n => rangePicks.includes(n.name));
const regexRangeText = regexRanges.map(({ range }) => range.map(r => {
	if(Array.isArray(r)) {
		return r.map(toUnicodeRegex).join('-');
	}
	return toUnicodeRegex(r);
}).join(''));
const regexText = `[${regexRangeText.join('')}]`;
const regexFlags = '';

const regex = new RegExp(regexText, regexFlags);

const modAction = {
	ban,
	b: ban,

	timeout,
	to: timeout,
	t: timeout,

	deletemessage,
	delete: deletemessage,
	d: deletemessage
}[MOD_ACTION.toLowerCase()] || deletemessage;

/** @type {'moderator' | 'subscriber' | 'vip'} */
const safeLevel = {
	moderator: 'moderator',
	mod: 'moderator',
	m: 'moderator',

	subscriber: 'subscriber',
	sub: 'subscriber',
	s: 'subscriber',

	vip: 'vip',
	v: 'vip',

	// TODO: Followers?
}[SAFE_LEVEL.toLowerCase()] || 'subscriber';

console.log({ username, regex, modAction, safeLevel, timeoutSeconds });

/** @type {tmi.Client} */
const client = new tmi.Client({
	options: { debug: NODE_ENV === 'development' },
	identity: { username, password },
	connection: { secure: true, reconnect: true },
	channels: joinChannels.split(',')
});

client.connect().catch(err => console.error(err));

client.on('message', (channel, tags, message, self) => {
	if(self) {
		return;
	}
	const badges = tags.badges || {};
	if(isSafe(badges)) {
		return;
	}
	const hasBadText = regex.test(message);
	if(hasBadText) {
		modAction(channel, tags);
	}
});

function isSafe(badges) {
	// Moderators and broadcaster are always safe
	if(badges.moderator || badges.broadcaster) {
		return true;
	}
	switch(safeLevel) {
		// No one is safe
		case 'moderator': {
			break;
		}
		// Only subscribers are safe
		case 'subscriber': {
			if(badges.subscriber) {
				return true;
			}
			break;
		}
		// VIP and subscribers are safe
		case 'vip': {
			if(badges.vip || badges.subscriber) {
				return true;
			}
			break;
		}
		// TODO: Followers?
	}
	return false;
}

function logModAction(action, channel, username) {
	console.log(`\u001b[31m${action} bad message\u001b[0m`);
}

function ban(channel, { username }) {
	logModAction('Banning', channel, username);
	client.ban(channel, username, banReason);
}

function timeout(channel, { username }) {
	logModAction('Timing out', channel, username);
	client.timeout(channel, username, timeoutSeconds, banReason);
}

function deletemessage(channel, { id, username }) {
	logModAction('Deleting', channel, username);
	client.deletemessage(channel, id);
}