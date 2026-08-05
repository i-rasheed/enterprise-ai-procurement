import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function GET() {
  const filePath = join(process.cwd(), "public", "SpendWise-User-Guide.pdf");
  const buffer = await readFile(filePath);

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="SpendWise-User-Guide.pdf"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
