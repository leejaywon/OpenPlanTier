import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the OpenPlanTier catalog", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>OpenPlanTier — Open-source platform builder<\/title>/i);
  assert.match(html, /Build your own/);
  assert.match(html, /Open-source catalog/);
  assert.match(html, /Stack builder/);
  assert.match(html, /PostgreSQL/);
  assert.match(html, /Cytoscape\.js/);
  assert.match(html, /Valkey/);
  assert.match(html, /Ollama/);
  assert.match(html, /177k/);
  assert.match(html, /Download manifest/);
  assert.match(html, /openplantier-logo\.png/);
  assert.match(html, /class="brand-logo"/);
  assert.doesNotMatch(html, /_vinext\/image/);
  assert.doesNotMatch(html, /brand-mark/);
  assert.doesNotMatch(html, /Open-source platform index/i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
  assert.doesNotMatch(html, /Your composition/i);
  assert.match(html, /octicon-law/);
  assert.doesNotMatch(html, /license-mark/);
  assert.doesNotMatch(html, /project-monogram/);
  assert.doesNotMatch(html, /\/Users\/jerry\//);
});
