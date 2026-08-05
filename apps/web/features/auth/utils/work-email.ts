const BLOCKED_PERSONAL_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "pm.me",
  "mail.com",
  "gmx.com",
  "gmx.net",
  "yandex.com",
  "yandex.ru",
  "zoho.com",
  "fastmail.com",
  "tutanota.com",
  "hey.com",
]);

export function getEmailDomain(email: string): string | null {
  const normalized = email.trim().toLowerCase();
  const atIndex = normalized.lastIndexOf("@");

  if (atIndex <= 0 || atIndex === normalized.length - 1) {
    return null;
  }

  return normalized.slice(atIndex + 1);
}

export function isPersonalEmail(email: string): boolean {
  const domain = getEmailDomain(email);
  return domain ? BLOCKED_PERSONAL_EMAIL_DOMAINS.has(domain) : false;
}
