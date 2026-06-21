import { afterAll, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const repoRoot = join(import.meta.dir, "..", "..");
const tempRoot = mkdtempSync(join(tmpdir(), "token-receipt-skill-test-"));

afterAll(() => {
  rmSync(tempRoot, { recursive: true, force: true });
});

describe("token receipt skill", () => {
  test(
    "generate.sh defaults to the host agent provider when none is passed",
    { timeout: 15000 },
    () => {
      const runtimeDir = join(repoRoot, "packages", "runtime");
      const generateScript = join(
        repoRoot,
        "skills",
        "token-receipt",
        "scripts",
        "generate.sh",
      );
      const workDir = join(tempRoot, "host-workspace");
      const shimPath = join(tempRoot, "token-receipt-runtime-host");
      const outDir = join(workDir, "token-receipt-output");

      mkdirSync(join(workDir, ".git"), { recursive: true });

      writeFileSync(
        shimPath,
        [
          "#!/bin/bash",
          "set -euo pipefail",
          `exec "${process.execPath}" --cwd "${runtimeDir}" ./src/cli.ts "$@"`,
          "",
        ].join("\n"),
      );
      chmodSync(shimPath, 0o755);

      const result = spawnSync(
        "bash",
        [generateScript, "--since", "7d", "--seed", "demo"],
        {
          cwd: workDir,
          env: {
            ...process.env,
            CODEX_SHELL: "1",
            CODEX_THREAD_ID: "test-thread",
            TOKEN_RECEIPT_DISABLE_OPEN: "1",
            TOKEN_RECEIPT_RUNTIME_PATH: shimPath,
          },
          encoding: "utf8",
        },
      );

      expect(result.status).toBe(0);
      expect(result.stderr).toBe("");

      const stdout = JSON.parse(result.stdout);
      expect(realpathSync(stdout.outDir)).toBe(realpathSync(outDir));

      const analysis = JSON.parse(
        readFileSync(join(outDir, "analysis.json"), "utf8"),
      );

      expect(analysis.options.provider).toBe("codex");
      expect(analysis.providerNames).toEqual(["codex"]);
    },
  );

  test(
    "generate.sh writes the expected artifacts with demo data",
    { timeout: 15000 },
    () => {
      const runtimeDir = join(repoRoot, "packages", "runtime");
      const generateScript = join(
        repoRoot,
        "skills",
        "token-receipt",
        "scripts",
        "generate.sh",
      );
      const workDir = join(tempRoot, "workspace");
      const shimPath = join(tempRoot, "token-receipt-runtime");
      const outDir = join(workDir, "token-receipt-output");

      mkdirSync(join(workDir, ".git"), { recursive: true });

      writeFileSync(
        shimPath,
        [
          "#!/bin/bash",
          "set -euo pipefail",
          `exec "${process.execPath}" --cwd "${runtimeDir}" ./src/cli.ts "$@"`,
          "",
        ].join("\n"),
      );
      chmodSync(shimPath, 0o755);

      const result = spawnSync(
        "bash",
        [
          generateScript,
          "--provider",
          "codex",
          "--since",
          "7d",
          "--project",
          "whoop-am",
          "--seed",
          "demo",
        ],
        {
          cwd: workDir,
          env: {
            ...process.env,
            TOKEN_RECEIPT_DISABLE_OPEN: "1",
            TOKEN_RECEIPT_RUNTIME_PATH: shimPath,
          },
          encoding: "utf8",
        },
      );

      expect(result.status).toBe(0);
      expect(result.stderr).toBe("");

      const stdout = JSON.parse(result.stdout);
      expect(realpathSync(stdout.outDir)).toBe(realpathSync(outDir));
      expect(realpathSync(stdout.receipt)).toBe(
        realpathSync(join(outDir, "receipt.png")),
      );
      expect(realpathSync(stdout.share)).toBe(
        realpathSync(join(outDir, "share.txt")),
      );

      const analysis = JSON.parse(
        readFileSync(join(outDir, "analysis.json"), "utf8"),
      );
      const receipt = JSON.parse(
        readFileSync(join(outDir, "receipt.json"), "utf8"),
      );

      expect(analysis.options.provider).toBe("codex");
      expect(analysis.options.since).toBe("7d");
      expect(analysis.options.project).toBe("whoop-am");
      expect(analysis.options.seed).toBe("demo");
      expect(realpathSync(analysis.options.outDir)).toBe(realpathSync(outDir));
      expect(analysis.totals.apiEquivalentCostUsd).toBe(17.42);
      expect(receipt.totalUsd).toBe(analysis.receipt.totalUsd);
      expect(receipt.totalUsd).toBeGreaterThan(
        analysis.totals.apiEquivalentCostUsd,
      );

      [
        join(outDir, "analysis.json"),
        join(outDir, "receipt.json"),
        join(outDir, "receipt.png"),
        join(outDir, "share.txt"),
      ].forEach((path) => expect(existsSync(path)).toBe(true));

      expect(
        readFileSync(join(outDir, "share.txt"), "utf8").trim().length,
      ).toBeGreaterThan(0);
    },
  );

  test(
    "generate.sh uses app-managed storage for global runs",
    { timeout: 15000 },
    () => {
      const runtimeDir = join(repoRoot, "packages", "runtime");
      const generateScript = join(
        repoRoot,
        "skills",
        "token-receipt",
        "scripts",
        "generate.sh",
      );
      const homeDir = join(tempRoot, "global-home");
      const workDir = join(homeDir, ".claude", "skills", "token-receipt");
      const shimPath = join(tempRoot, "token-receipt-runtime-global");
      const appSupportDir = join(tempRoot, "global-app-support");
      const outDir = join(appSupportDir, "runs", "2026-06-21T14-32-10Z");

      mkdirSync(workDir, { recursive: true });

      writeFileSync(
        shimPath,
        [
          "#!/bin/bash",
          "set -euo pipefail",
          `exec "${process.execPath}" --cwd "${runtimeDir}" ./src/cli.ts "$@"`,
          "",
        ].join("\n"),
      );
      chmodSync(shimPath, 0o755);

      const result = spawnSync(
        "bash",
        [
          generateScript,
          "--provider",
          "codex",
          "--since",
          "7d",
          "--seed",
          "demo",
        ],
        {
          cwd: workDir,
          env: {
            ...process.env,
            HOME: homeDir,
            TOKEN_RECEIPT_APP_SUPPORT_DIR: appSupportDir,
            TOKEN_RECEIPT_DISABLE_OPEN: "1",
            TOKEN_RECEIPT_RUN_ID: "2026-06-21T14-32-10Z",
            TOKEN_RECEIPT_RUNTIME_PATH: shimPath,
          },
          encoding: "utf8",
        },
      );

      expect(result.status).toBe(0);
      expect(result.stderr).toBe("");

      const stdout = JSON.parse(result.stdout);
      expect(realpathSync(stdout.outDir)).toBe(realpathSync(outDir));
      expect(existsSync(join(outDir, "receipt.png"))).toBe(true);
    },
  );

  test(
    "generate.sh respects explicit out paths for global runs",
    { timeout: 15000 },
    () => {
      const runtimeDir = join(repoRoot, "packages", "runtime");
      const generateScript = join(
        repoRoot,
        "skills",
        "token-receipt",
        "scripts",
        "generate.sh",
      );
      const homeDir = join(tempRoot, "global-home-explicit");
      const workDir = join(homeDir, ".claude", "skills", "token-receipt");
      const shimPath = join(tempRoot, "token-receipt-runtime-global-explicit");
      const outDir = join(workDir, "exports", "receipt");

      mkdirSync(workDir, { recursive: true });

      writeFileSync(
        shimPath,
        [
          "#!/bin/bash",
          "set -euo pipefail",
          `exec "${process.execPath}" --cwd "${runtimeDir}" ./src/cli.ts "$@"`,
          "",
        ].join("\n"),
      );
      chmodSync(shimPath, 0o755);

      const result = spawnSync(
        "bash",
        [
          generateScript,
          "--provider",
          "codex",
          "--since",
          "7d",
          "--seed",
          "demo",
          "--out",
          "./exports/receipt",
        ],
        {
          cwd: workDir,
          env: {
            ...process.env,
            HOME: homeDir,
            TOKEN_RECEIPT_DISABLE_OPEN: "1",
            TOKEN_RECEIPT_RUNTIME_PATH: shimPath,
          },
          encoding: "utf8",
        },
      );

      expect(result.status).toBe(0);
      expect(result.stderr).toBe("");

      const stdout = JSON.parse(result.stdout);
      expect(realpathSync(stdout.outDir)).toBe(realpathSync(outDir));
      expect(existsSync(join(outDir, "receipt.png"))).toBe(true);
    },
  );
});
