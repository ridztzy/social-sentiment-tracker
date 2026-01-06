import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs/promises";

type ScrapeArgs = {
  filename: string;
  searchKeyword: string;
  limit: number;
  token: string;
  tab?: "LATEST" | "TOP";
  onLog?: (msg: string) => void;
};

export async function runTweetHarvest(args: ScrapeArgs) {
  if (!args.token || args.token.length < 10) {
    throw new Error("Twitter auth token tidak valid");
  }

  const outDir = path.join(process.cwd(), "tweets-data");
  await fs.mkdir(outDir, { recursive: true });

  const cmdPath = process.platform === "win32" 
    ? path.join(process.cwd(), "node_modules", ".bin", "tweet-harvest.cmd")
    : path.join(process.cwd(), "node_modules", ".bin", "tweet-harvest");
  
  const cmd = process.platform === "win32" ? `"${cmdPath}"` : cmdPath;
  
  const cliArgs = [
    "-o",
    `"${args.filename}"`,
    "-s",
    `"${args.searchKeyword}"`,
    "--tab",
    args.tab ?? "LATEST",
    "-l",
    String(args.limit),
    "--token",
    args.token,
  ];

  const log = args.onLog ?? (() => {});
  
  log(`[START] tweet-harvest`);
  log(`[QUERY] ${args.searchKeyword}`);
  log(`[LIMIT] ${args.limit} tweets`);

  await new Promise<void>((resolve, reject) => {
    const p = spawn(cmd, cliArgs, {
      cwd: process.cwd(),
      stdio: "pipe",
      shell: true,
    });

    let stderr = "";

    p.stdout.on("data", (d) => {
      const lines = d.toString().split("\n").filter((l: string) => l.trim());
      lines.forEach((line: string) => log(`[OUT] ${line}`));
    });

    p.stderr.on("data", (d) => {
      const text = d.toString();
      stderr += text;
      const lines = text.split("\n").filter((l: string) => l.trim());
      lines.forEach((line: string) => log(`[LOG] ${line}`));
    });

    p.on("error", (err) => {
      log(`[ERROR] ${err.message}`);
      reject(err);
    });

    p.on("close", (code) => {
      if (code === 0) {
        log(`[DONE] Scraping completed successfully`);
        resolve();
      } else {
        log(`[FAIL] Exit code: ${code}`);
        reject(new Error(stderr || "tweet-harvest gagal"));
      }
    });
  });

  log(`[FILE] ${args.filename}`);

  return {
    file: path.join(outDir, args.filename),
  };
}
