import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { sourcePrompt } from "./index.mjs";

const sourceText = JSON.stringify({
  results: [
    { url: "https://nodejs.org/en/blog", excerpts: ["LTS release notes"] },
  ],
});

function caller(reply) {
  const requests = [];
  const fetchImpl = async (url, options) => {
    const body = JSON.parse(options.body);
    requests.push({ url, options, body });
    if (reply) {
      const response = await reply(body, options);
      if (response) {
        return response;
      }
    }
    if (body.method === "notifications/initialized") {
      return new Response(undefined, { status: 202 });
    }
    return Response.json({
      jsonrpc: "2.0",
      id: body.id,
      result:
        body.method === "initialize"
          ? { protocolVersion: "2025-03-26" }
          : { content: [{ type: "text", text: sourceText }] },
    });
  };
  return { requests, fetchImpl };
}

test("handshake, anonymous destination, User-Agent and source consumption", async () => {
  const { requests, fetchImpl } = caller();
  const prompt = await sourcePrompt(
    "Find release notes",
    ["Node.js LTS release notes"],
    { fetchImpl },
  );
  assert.ok(prompt.startsWith("Find release notes\n\n"));
  assert.ok(prompt.includes("untrusted reference material"));
  assert.ok(prompt.includes(sourceText));
  assert.deepEqual(
    requests.map(({ body }) => body.method),
    ["initialize", "notifications/initialized", "tools/call"],
  );
  for (const { url, options } of requests) {
    assert.equal(url, "https://search.parallel.ai/mcp");
    assert.equal(options.method, "POST");
    assert.equal(
      options.headers["User-Agent"],
      "next-simple-chatgpt/parallel-search-example",
    );
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.equal(options.headers.Accept, "application/json, text/event-stream");
    assert.equal(options.headers["MCP-Protocol-Version"], "2025-03-26");
    assert.equal(options.headers.Authorization, undefined);
    assert.ok(options.signal instanceof AbortSignal);
  }
  assert.equal(requests[1].body.id, undefined);
  const call = requests[2].body;
  assert.equal(call.params.name, "web_search");
  assert.equal(call.params.arguments.objective, "Find release notes");
  assert.deepEqual(call.params.arguments.search_queries, [
    "Node.js LTS release notes",
  ]);
  assert.match(call.params.arguments.session_id, /^[a-f0-9-]{36}$/u);
});

for (const [name, makeResponse, expected] of [
  [
    "HTTP quota",
    () => new Response("Quota exceeded", { status: 429 }),
    /HTTP 429: Quota exceeded/u,
  ],
  [
    "JSON-RPC error",
    (id) =>
      Response.json({
        jsonrpc: "2.0",
        id,
        error: { message: "Invalid params" },
      }),
    /Invalid params/u,
  ],
  [
    "tool error",
    (id) =>
      Response.json({
        jsonrpc: "2.0",
        id,
        result: {
          isError: true,
          content: [{ type: "text", text: "Search unavailable" }],
        },
      }),
    /Search unavailable/u,
  ],
  [
    "empty content",
    (id) => Response.json({ jsonrpc: "2.0", id, result: { content: [] } }),
    /no source text/u,
  ],
  [
    "mismatched response",
    () => Response.json({ jsonrpc: "2.0", id: 999, result: {} }),
    /Unexpected.*response/u,
  ],
  ["malformed JSON", () => new Response("not JSON"), /JSON/u],
]) {
  test(`${name} rejects without retrying`, async () => {
    const { requests, fetchImpl } = caller((body) =>
      body.method === "tools/call" ? makeResponse(body.id) : undefined,
    );
    await assert.rejects(
      sourcePrompt("Question", ["search query"], { fetchImpl }),
      expected,
    );
    assert.equal(requests.length, 3);
  });
}

for (const kind of ["cancel", "timeout"]) {
  test(`${kind} reaches the active search request`, async () => {
    const controller = new AbortController();
    const signal =
      kind === "cancel" ? controller.signal : AbortSignal.timeout(10);
    const { fetchImpl } = caller((body, options) => {
      if (body.method !== "tools/call") {
        return;
      }
      assert.equal(options.signal, signal);
      return new Promise((resolve, reject) => {
        const timer = setTimeout(resolve, 1_000);
        const rejectOnAbort = () => {
          clearTimeout(timer);
          reject(options.signal.reason);
        };
        options.signal.addEventListener("abort", rejectOnAbort, { once: true });
        if (options.signal.aborted) {
          rejectOnAbort();
        }
        if (kind === "cancel") {
          controller.abort();
        }
      });
    });
    await assert.rejects(
      sourcePrompt("Question", ["search query"], { fetchImpl, signal }),
      { name: kind === "cancel" ? "AbortError" : "TimeoutError" },
    );
  });
}

test("invalid input makes no request", async () => {
  const { requests, fetchImpl } = caller();
  for (const args of [
    [undefined, []],
    ["Question", []],
    ["Question", [" "]],
  ]) {
    await assert.rejects(
      sourcePrompt(...args, { fetchImpl }),
      /objective.*query/u,
    );
  }
  assert.equal(requests.length, 0);
});

test("CLI prints sources with no credentials or installed dependencies", () => {
  const preload = `globalThis.fetch = async (_url, options) => {
    const body = JSON.parse(options.body);
    if (body.method === 'notifications/initialized') return new Response(null, {status: 202});
    return Response.json({jsonrpc: '2.0', id: body.id, result:
      body.method === 'initialize' ? {protocolVersion: '2025-03-26'} :
      {content: [{type: 'text', text: ${JSON.stringify(sourceText)}}]}});
  };`;
  const result = spawnSync(
    process.execPath,
    [
      "--import",
      `data:text/javascript,${encodeURIComponent(preload)}`,
      fileURLToPath(new URL("index.mjs", import.meta.url)),
      "Find release notes",
      "Node.js LTS release notes",
    ],
    { env: {}, encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, "");
  assert.ok(result.stdout.includes(sourceText));
  assert.ok(result.stdout.startsWith("Find release notes\n\n"));
});

test("CLI reports invalid usage on stderr with a nonzero exit", () => {
  const result = spawnSync(
    process.execPath,
    [fileURLToPath(new URL("index.mjs", import.meta.url))],
    { env: {}, encoding: "utf8" },
  );
  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /objective.*query/u);
});
