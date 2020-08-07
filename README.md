# Anti-art moderation bot

This is a simple Twitch chat bot thrown together quickly to do 1 job. Not much
more than a simple regular expression tester as a Twitch chat bot. Bots as a
(usually free) service that do a better job already exist.

## Art types

- Braille (`\u2800-\u28FF`)

## Install

This is a Node.js project. (Use `git clone` or download/unzip)

```bash
$ git clone https://github.com/alcadesign/anti-art-bot.git
$ npm install --production
# Setup environment variables
$ npm start
```

## Environment Variables

- **`TMI_NAME`**:
	Username of the account to authorize with.

- **`TMI_PASS`**:
	OAuth token matching the username with `chat:read`, `chat:edit`,
	`channel:moderate` scopes.

- **`TMI_CHANNEL`**:
	Channel to join and watch. Use a `comma,separated,list` to join multiple
	channels.

- **`MOD_ACTION`**:
	One of `delete`, `timeout`, or `ban`. Defaults to `delete`.

- **`BAN_REASON`**:
	Message to use for ban/timeout like "`Auto-deleted bad
	text`". Detaults to "`Anti-art moderation bot`".

- **`TIMEOUT_SECONDS`**:
	Number of seconds to use in the timeout. Used if `MOD_ACTION` is `timeout`.

### .env file

A `.env` file can automatically be loaded by using `npm start`. You can copy the
`.env.example` file to create the `.env` file.

## TODO

- Add more art types.
	- Allow choosing through environment variables. Permit one of include or
	exclude lists.