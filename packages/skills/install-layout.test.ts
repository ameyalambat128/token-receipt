import { afterAll, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readlinkSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const repoRoot = join(import.meta.dir, "..", "..");
const installScript = join(repoRoot, "packages", "skills", "install.sh");
const skillDir = join(repoRoot, "skills", "token-receipt");
const tempRoot = mkdtempSync(join(tmpdir(), "token-receipt-install-test-"));

afterAll(() => {
  rmSync(tempRoot, { recursive: true, force: true });
});

describe("repo-local skill install", () => {
  test("creates the canonical agents link plus agent-facing symlinks", () => {
    const home = join(tempRoot, "home");
    const kiroHome = join(tempRoot, "kiro-home");
    const canonicalSkillPath = join(home, ".agents", "skills", "token-receipt");
    const codexSkillPath = join(home, ".codex", "skills", "token-receipt");
    const claudeSkillPath = join(home, ".claude", "skills", "token-receipt");
    const defaultKiroSkillPath = join(home, ".kiro", "skills", "token-receipt");
    const customKiroSkillPath = join(kiroHome, "skills", "token-receipt");

    mkdirSync(join(home, ".agents", "skills", "token-receipt"), {
      recursive: true,
    });
    writeFileSync(
      join(home, ".agents", "skills", "token-receipt", "stale.txt"),
      "replace me",
    );

    const runInstaller = () =>
      spawnSync("bash", [installScript], {
        cwd: repoRoot,
        env: {
          ...process.env,
          HOME: home,
          KIRO_HOME: kiroHome,
        },
        encoding: "utf8",
      });

    const firstRun = runInstaller();
    expect(firstRun.status).toBe(0);
    expect(firstRun.stderr).toBe("");

    expect(existsSync(canonicalSkillPath)).toBe(true);
    expect(lstatSync(canonicalSkillPath).isSymbolicLink()).toBe(true);
    expect(realpathSync(canonicalSkillPath)).toBe(realpathSync(skillDir));

    [
      codexSkillPath,
      claudeSkillPath,
      defaultKiroSkillPath,
      customKiroSkillPath,
    ].forEach((path) => {
      expect(existsSync(path)).toBe(true);
      expect(lstatSync(path).isSymbolicLink()).toBe(true);
      expect(readlinkSync(path)).toBe(canonicalSkillPath);
      expect(realpathSync(path)).toBe(realpathSync(skillDir));
    });

    expect(firstRun.stdout).toContain(`Canonical: ${canonicalSkillPath}`);
    expect(firstRun.stdout).toContain(`Codex: ${codexSkillPath}`);
    expect(firstRun.stdout).toContain(`Claude Code: ${claudeSkillPath}`);
    expect(firstRun.stdout).toContain(`Kiro: ${defaultKiroSkillPath}`);
    expect(firstRun.stdout).toContain(
      `Kiro (KIRO_HOME): ${customKiroSkillPath}`,
    );

    const secondRun = runInstaller();
    expect(secondRun.status).toBe(0);
    expect(secondRun.stderr).toBe("");
    expect(realpathSync(canonicalSkillPath)).toBe(realpathSync(skillDir));
    expect(readlinkSync(defaultKiroSkillPath)).toBe(canonicalSkillPath);
  });
});
