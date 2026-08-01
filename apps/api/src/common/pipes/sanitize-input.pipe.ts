import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '').trim();
}

@Injectable()
export class SanitizeInputPipe implements PipeTransform {
  transform(value: unknown): unknown {
    return this.sanitizeValue(value);
  }

  private sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      return stripHtml(value);
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.sanitizeValue(item));
    }

    if (value !== null && typeof value === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = this.sanitizeValue(val);
      }
      return sanitized;
    }

    return value;
  }
}

export function assertPasswordPolicy(password: string): void {
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (password.length < 8) {
    throw new BadRequestException(
      'Password must be at least 8 characters long.',
    );
  }

  if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
    throw new BadRequestException(
      'Password must include uppercase, lowercase, number, and special character.',
    );
  }
}
