/**
 * Formats a date into a human-readable string
 * @param date Date to format
 * @returns Formatted string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  // Check if invalid date
  if (isNaN(d.getTime())) {
    return 'Unknown date';
  }

  // Calculate time difference in milliseconds
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  // Format relative time
  if (diffSec < 60) {
    return 'Just now';
  } else if (diffMin < 60) {
    return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} ${diffDay === 1 ? 'day' : 'days'} ago`;
  } else if (diffDay < 30) {
    const weeks = Math.floor(diffDay / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffMonth < 12) {
    return `${diffMonth} ${diffMonth === 1 ? 'month' : 'months'} ago`;
  } else {
    return `${diffYear} ${diffYear === 1 ? 'year' : 'years'} ago`;
  }
}

/**
 * Formats a date into a standard format
 * @param date Date to format
 * @returns Formatted string (e.g. "Jan 1, 2023")
 */
export function formatStandardDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Check if invalid date
  if (isNaN(d.getTime())) {
    return 'Unknown date';
  }
  
  // Use toLocaleDateString for standard format
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a date including time
 * @param date Date to format
 * @returns Formatted string (e.g. "Jan 1, 2023, 3:45 PM")
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Check if invalid date
  if (isNaN(d.getTime())) {
    return 'Unknown date';
  }
  
  // Use toLocaleString for date with time
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
