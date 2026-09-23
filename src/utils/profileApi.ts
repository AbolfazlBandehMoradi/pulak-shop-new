import { apiRequest } from './api';

export interface UpdateProfileNameRequest {
  firstName: string;
  lastName: string;
}

export interface UpdatedProfileName {
  firstName?: string | null;
  lastName?: string | null;
  [key: string]: unknown;
}

export function updateProfileName(
  request: UpdateProfileNameRequest,
): Promise<UpdatedProfileName | undefined> {
  return apiRequest<UpdatedProfileName | undefined>('/api/ui/profile', {
    method: 'PUT',
    body: JSON.stringify(request),
  });
}
