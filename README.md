# next-simple-chatgpt

A very simple ChatGPT UI that I created because one can't use the ChatGPT playground on more than 2 or 3 devices at the same time and their captcha implementation has serious accessibility problems. Also, I was skeptical to trust "random" projects on GitHub with my ChatGPT data to begin with and then one of the popular UI projects here uses obscure dependencies and triggered Windows Defender.

I'm using relatively few dependencies that front-end engineers are likely familiar with.

## UX Decisions

- No support for attachments because I never discuss images with ChatGPT.

## Prerequisites

- A GitHub OAuth app (provides ID and SECRET values for `.env`)
- ChatGPT API key

## Getting started (dev)

- Clone, install dependencies
- Install `mkcert`
- Run `pnpm create-certificate`
- (Optional: If you want to access the UI from mobile devices on your LAN, I would recommend installing mkcert's CA certificate. Best ask an AI how. 😄)
- Create your `.env.local` based on `.env.schema`
- `pnpm dev`
- Ignore Next.js claiming `Network:      http://<IP>:3000` - it's `https`.

## Using local production bundle

- Create a certificate for `localhost` using `mkcert`
- Put/uncomment the `AUTH_URL` in your `.env.local`
- Create another OAuth app for localhost, put its ID and SECRET into your `.env.local`
- `pnpm build`
- `pnpm start:local` (Will probably ask you about installing `local-ssl-proxy` the first time)
- Wait for `Started proxy: https://localhost:3001 → http://localhost:3000`

(Thanks to [Miguel Oller for this](https://www.makeswift.com/blog/accessing-your-local-nextjs-dev-server-using-https)!)

## TODO

- Maybe: Make textareas expand in height when very long prompts are being written.

## Dev notes

- Why node scripts for infrastructure tasks? Easy cross-platform compatibility.
- Why HTTPS? Because of `ClipboardItem`. Browsers make an exception for `localhost` but not other devices on the LAN. (To spare others the pain: `nginx` and `http-proxy` don't work. Only the experimental Next.js method. At least with things like server actions and redirects.)