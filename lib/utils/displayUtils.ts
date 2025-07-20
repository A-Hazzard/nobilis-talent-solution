/**
 * Utility functions for safely displaying data in the admin dashboard
 */

export function displayOrganization(organization?: string): string {
  if (!organization || organization.trim() === '' || organization === 'Not specified') {
    return '-';
  }
  return organization;
}

export function displayName(name?: string): string {
  if (!name || name.trim() === '') {
    return '-';
  }
  return name;
}

export function displayEmail(email?: string): string {
  if (!email || email.trim() === '') {
    return '-';
  }
  return email;
}

export function displayPhone(phone?: string): string {
  if (!phone || phone.trim() === '') {
    return '-';
  }
  return phone;
}

export function displayDate(date?: Date): string {
  if (!date) {
    return '-';
  }
  return new Date(date).toLocaleDateString();
} 