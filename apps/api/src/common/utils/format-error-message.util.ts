const INTERNAL_LINE =
  /(\/Users\/|\/home\/|\.tsx?:\d|\.jsx?:\d|node_modules|constructor\s*\(|=>\s*\{|this\.prisma|Invalid `.*` invocation)/i;

const SCHEMA_DETAIL_LINE =
  /(`[A-Za-z0-9_.]+`|does not exist in the current database|P\d{4}|prisma\.|column .* does not exist|relation .* does not exist)/i;

const PLAIN_ERROR_LINE =
  /^(Unique constraint|Foreign key constraint|Record to update|Record to delete|An operation failed|Cannot |Must |Expected |Email |Password |Organisation |Invalid credentials|Account is)/i;

const SCHEMA_ERROR_MESSAGE =
  'The server database is not fully set up. Please try again later or contact support.';

function stripCodeArtifacts(text: string): string {
  return text.replace(/`/g, '').replace(/\s+/g, ' ').trim();
}

function toClientSafeLine(line: string): string | null {
  if (INTERNAL_LINE.test(line) || SCHEMA_DETAIL_LINE.test(line)) {
    return null;
  }
  if (line.startsWith('→') || /^\d+\s/.test(line)) {
    return null;
  }
  if (PLAIN_ERROR_LINE.test(line)) {
    return stripCodeArtifacts(line);
  }
  if (line.length >= 10 && line.length <= 160) {
    return stripCodeArtifacts(line);
  }
  return null;
}

export function formatErrorMessage(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) {
    return 'Internal server error';
  }

  if (SCHEMA_DETAIL_LINE.test(trimmed)) {
    return SCHEMA_ERROR_MESSAGE;
  }

  const lines = trimmed
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of [...lines].reverse()) {
    const clientLine = toClientSafeLine(line);
    if (clientLine) {
      return clientLine;
    }
  }

  if (
    !trimmed.includes('\n') &&
    !INTERNAL_LINE.test(trimmed) &&
    trimmed.length <= 160
  ) {
    return stripCodeArtifacts(trimmed);
  }

  return 'Internal server error';
}

export function shouldFormatForClient(message: string, status: number): boolean {
  return (
    status >= 500 ||
    INTERNAL_LINE.test(message) ||
    SCHEMA_DETAIL_LINE.test(message) ||
    message.includes('\n')
  );
}
