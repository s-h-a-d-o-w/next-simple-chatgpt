<p align="center"><img src="./assets/logo.png" width="100px" /></p>

# next-simple-chatgpt

https://github.com/user-attachments/assets/03ef50d5-4a05-471f-bf69-ba8f523c73c9

A very simple ChatGPT UI that I created because one can't use the ChatGPT playground on more than 2 or 3 devices at the same time _and_ their captcha implementation has some accessibility problems. Also, I was skeptical to trust "random" projects on GitHub with my ChatGPT data to begin with and then one of the popular UI projects here uses obscure dependencies and triggered Windows Defender.

I'm using relatively few dependencies that front-end engineers are likely familiar with.

## UX Decisions

- White-list authentication exists so that one can have it publicly available without random people being able to use it. (Maybe I'll remove it at some point and require users to enter the ChatGPT API key client-side instead. But... for now, it seems safer to me for everybody to just run their own instance of this. E.g. vercel free plan is sufficient.)
- No support for attachments because I never discuss images with ChatGPT.

## Prerequisites

- A GitHub OAuth app (provides ID and SECRET values for `.env`)
- ChatGPT API key

## Getting started

- Add secrets to whatever environment you will run this in based on `.env.schema`.
- (At least with the combination of CapRover and cloudflare for HTTPS, it is necessary to tick "WebSocket support" in the app settings in CapRover for streaming to work. I don't know why, since that is done via fetch, not websockets but that's what I've observed.)
- Deploy like any node app. 🚀 (See `Dockerfile`, `deploy.sh` and the github workflow for inspiration if you're not using a platform that automatically does these things for you.)

## Getting started (dev)

1. Clone, install dependencies
1. Create your `.env.local` based on `.env.schema`
1. `pnpm dev`
1. (Optional: Use ngrok and set `AUTH_URL` accordingly to use features that require HTTPS, like copying to the clipboard, and easy compatibility with LAN devices, WSL, etc.)

### E2E tests

Run `pnpm dev:e2e` before using playwright in any situation other than testing the production bundle (which is done by running `build:e2e` and `e2e` - double-check your `AUTH_URL` if you have issues with auth).
(We could do some thing with saving cookies, reusing them in playwright and whatnot but that seemed too cumbersome to me compared to temporarily running a different dev server.)

## TODO

- Maybe: Make textareas expand in height when very long prompts are being written.

## Dev notes

- Why node scripts for infrastructure tasks? Easy cross-platform compatibility.
- Why stick with port 3000? Being able to reuse the same OAuth app for dev.
- Why `react-window` for virtualized history? Scrolling is jankier than `react-virtuoso` but it takes fewer scrollbar pulls to get to the bottom => better estimates/measurements. (tanstack virtual apparently uses patterns that the React team finds problematic: https://github.com/facebook/react/blob/main/compiler/packages/babel-plugin-react-compiler/src/HIR/DefaultModuleTypeProvider.ts And the scrollbar behavior likely would be similar to the other two based on their dynamic demo anyway.)
