import { cpSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const source = resolve("prisma");
const target = resolve("dist/prisma");

if (!existsSync(source)) {
  console.error(`Prisma directory not found at ${source}`);
  process.exit(1);
}

cpSync(source, target, { recursive: true });
console.log(`Copied ${source} -> ${target}`);
