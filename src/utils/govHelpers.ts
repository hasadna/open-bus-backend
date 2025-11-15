import { HttpException, HttpStatus } from '@nestjs/common';

export function handleGovResponse<T>(data: T) {
  return { data, success: true };
}

export function handleGovError(error: any, message: string) {
  if (error.response) {
    throw new HttpException(
      {
        error: 'Government API error',
        message: `Status: ${error.response.status} - ${error.response.statusText}`,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
  throw new HttpException({ error: 'Internal server error', message }, HttpStatus.INTERNAL_SERVER_ERROR);
}

export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
