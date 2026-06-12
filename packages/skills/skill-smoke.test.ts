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
          "--project",
          "whoop-am",
          "--seed",
          "demo",
        ],
        {
          cwd: workDir,
          env: {
            ...process.env,
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
      expect(realpathSync(stdout.x)).toBe(
        realpathSync(join(outDir, "share", "x.txt")),
      );
      expect(realpathSync(stdout.linkedin)).toBe(
        realpathSync(join(outDir, "share", "linkedin.txt")),
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
        join(outDir, "share", "x.txt"),
        join(outDir, "share", "linkedin.txt"),
      ].forEach((path) => expect(existsSync(path)).toBe(true));

      expect(
        readFileSync(join(outDir, "share", "x.txt"), "utf8").trim().length,
      ).toBeGreaterThan(0);
      expect(
        readFileSync(join(outDir, "share", "linkedin.txt"), "utf8").trim()
          .length,
      ).toBeGreaterThan(0);
    },
  );
});
