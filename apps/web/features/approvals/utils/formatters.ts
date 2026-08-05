export function formatAuditAction(action: string): string {
  return action
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}
