import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const deploymentScript = fileURLToPath(
  new URL("../scripts/server-deploy-homepage.sh", import.meta.url),
);
const proxy = {
  HTTP_PROXY: "http://bridge.example.invalid:11082",
  HTTPS_PROXY: "http://bridge.example.invalid:11082",
  ALL_PROXY: "http://bridge.example.invalid:11082",
  NO_PROXY: "localhost,127.0.0.1",
};

// Model the boundary between the proxy wrapper, Docker CLI, and build container.
// Docker inherits proxy values only through its client config or build arguments.
const commandStub = `#!/usr/bin/env node
const { spawnSync } = require('node:child_process');
const { writeFileSync } = require('node:fs');
const { basename } = require('node:path');
const command = basename(process.argv[1]);
const args = process.argv.slice(2);
if (command === 'git' && args[0] === 'rev-parse') {
  console.log('a'.repeat(40));
}
if (command === 'reporter' && args[0] === 'create') console.log('123');
if (command === 'mesh-proxy' && args[0] === 'exec') {
  const result = spawnSync(args[1], args.slice(2), {
    env: { ...process.env, ...JSON.parse(process.env.TEST_PROXY) },
    stdio: 'inherit',
  });
  process.exit(result.status ?? 1);
}
if (command === 'docker' && args[0] === 'compose' && args[1] === 'build') {
  const buildProxy = {};
  for (let index = 2; index < args.length; index++) {
    let argument;
    if (args[index] === '--build-arg') argument = args[++index];
    else if (args[index].startsWith('--build-arg=')) argument = args[index].slice(12);
    if (!argument) continue;
    const separator = argument.indexOf('=');
    const name = separator < 0 ? argument : argument.slice(0, separator);
    if (!(name in JSON.parse(process.env.TEST_PROXY))) continue;
    const value = separator < 0 ? process.env[name] : argument.slice(separator + 1);
    if (value !== undefined) buildProxy[name] = value;
  }
  writeFileSync(process.env.TEST_BUILD_PROXY, JSON.stringify(buildProxy));
}
`;

test("deployment forwards the mesh proxy into the Docker build container", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "aqhours-deploy-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const bin = join(directory, "bin");
  const app = join(directory, "app");
  await mkdir(bin);
  await mkdir(join(app, ".git"), { recursive: true });
  await writeFile(join(app, "compose.yaml"), "services: {}\n");
  for (const command of ["git", "docker", "flock", "mesh-proxy", "curl", "python3", "reporter"]) {
    await writeFile(join(bin, command), commandStub, { mode: 0o755 });
  }

  const proxyLog = join(directory, "build-proxy.json");
  const result = spawnSync("bash", [deploymentScript], {
    encoding: "utf8",
    timeout: 15_000,
    env: {
      ...process.env,
      PATH: `${bin}${delimiter}${process.env.PATH}`,
      AQHOURS_APP_DIR: app,
      AQHOURS_LOCK_FILE: join(directory, "deploy.lock"),
      AQHOURS_DEPLOYMENT_REPORTER: join(bin, "reporter"),
      TEST_PROXY: JSON.stringify(proxy),
      TEST_BUILD_PROXY: proxyLog,
    },
  });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.deepEqual(JSON.parse(await readFile(proxyLog, "utf8")), proxy);
});
