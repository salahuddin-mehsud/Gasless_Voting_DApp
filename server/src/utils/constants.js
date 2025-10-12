export const POLL_STATUS = {
  ACTIVE: 'active',
  ENDED: 'ended',
  ALL: 'all'
};

export const VOTE_LIMITS = {
  MAX_OPTIONS: 10,
  MIN_OPTIONS: 2,
  MAX_DURATION: 30 * 24 * 60, // 30 days in minutes
  MIN_DURATION: 1 // 1 minute
};

export const CACHE_KEYS = {
  POLLS: 'polls',
  USER_POLLS: 'user_polls',
  POLL_RESULTS: 'poll_results'
};