import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

const USERNAME_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38}[a-zA-Z0-9])?$/;

@Injectable()
export class GithubUsernameValidationPipe implements PipeTransform<
  string,
  string
> {
  transform(value: string): string {
    if (!value || typeof value !== 'string') {
      throw new BadRequestException('username is required');
    }
    const trimmed = value.trim();
    if (trimmed.length > 39 || !USERNAME_PATTERN.test(trimmed)) {
      throw new BadRequestException(`Invalid GitHub username: "${value}"`);
    }
    return trimmed;
  }
}
