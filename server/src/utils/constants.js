export const POLL_STATUS = {
  ACTIVE: 'active',
  ENDED: 'ended',
  ALL: 'all'
};

export const VOTE_LIMITS = {
  MAX_OPTIONS: 10,
  MIN_OPTIONS: 2,
  MAX_DURATION: 30 * 24 * 60, 
  MIN_DURATION: 1 
};

export const CACHE_KEYS = {
  POLLS: 'polls',
  USER_POLLS: 'user_polls',
  POLL_RESULTS: 'poll_results'
};