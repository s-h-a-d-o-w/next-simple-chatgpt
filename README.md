# next-simple-chatgpt

A very simple ChatGPT UI that I created because I have trust issues and talk to ChatGPT about all sorts of things. 😅 (And because one of the popular UI projects here triggered Windows Defender and uses obscure dependencies. I'm using relatively few dependencies that front-end engineers are likely familiar with.)

## UX Decisions

- No support for attachments because I never discuss images with ChatGPT.

## TODO

- Maybe: Make textareas expand in height when very long prompts are being written.

## Dev notes

- Auth.js [claims that they can figure out address the user uses](https://authjs.dev/getting-started/deployment#auth_url). But [it actually can't always](https://github.com/nextauthjs/next-auth/issues/10928#issuecomment-2247877624). When visiting the server from a different machine on a LAN, `AUTH_URL` has to be set to `http://<IP>:3000/api/auth`.
