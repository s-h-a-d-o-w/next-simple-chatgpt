# Bring current web sources into a chat

For questions that need current information, gather source excerpts with
[Parallel Search MCP](https://docs.parallel.ai/integrations/mcp/search-mcp), then
paste them into next-simple-chatgpt. This optional example runs in your terminal;
it does not give the chat UI automatic web access.

The example uses Node.js 24 or later (the same requirement as the app) and built-in
modules only. You do not need to install dependencies, run the app, create a
Parallel account, or set an API key to gather sources. Anonymous search uses Fast
mode and has free-tier rate limits.

From the repository root, run:

```sh
node examples/parallel-search/index.mjs \
  "What does the latest Node.js LTS release change? Prefer official release notes." \
  "Node.js latest LTS release notes"
```

The first argument is your research question; the remaining arguments are related
keyword queries. Quote each argument and keep each query to about 3–6 words. For
broader research, pass two or three queries in the same command.

The command prints your question, a source-handling instruction, and the returned
source material, including URLs and excerpts. Copy that output into a new chat's
prompt and submit it using your chosen model. Review the URLs and excerpts before
sending them; web content can contain mistakes or malicious instructions. The
output asks the model to cite URLs, but you should still check its citations.

Your question and queries are sent to Parallel. The command does not read your
chat history, `.env.local`, saved settings, or API keys. Pasting
the output into chat sends it to the model provider selected in the app.

The command makes one search, exits with an error if the service rejects it, and
does not retry automatically. If you reach the anonymous quota, wait for the
service's indicated reset before trying again. Requests have a 30-second overall
timeout; press Ctrl+C to cancel. Errors go to stderr and set a nonzero exit code.

To run the example's offline checks without app dependencies:

```sh
node --test examples/parallel-search/check.mjs
```
