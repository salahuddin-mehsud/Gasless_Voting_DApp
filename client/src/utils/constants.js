export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0xe1D249147566A317E8865324964869AeA94226Ad";
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
export const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;

export const POLL_STATUS = {
  ACTIVE: 'active',
  ENDED: 'ended',
  ALL: 'all'
};

export const NETWORK_CONFIG = {
  sepolia: {
    chainId: '0xaa36a7',
    chainName: 'Sepolia',
    rpcUrls: ['https://sepolia.infura.io/v3/'],
    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    }
  }
};

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    PROFILE: '/api/auth/profile'
  },
  POLLS: {
    CREATE: '/api/polls',
    LIST: '/api/polls',
    GET: (id) => `/api/polls/${id}`,
    VOTE: (id) => `/api/polls/${id}/vote`,
    USER_POLLS: '/api/polls/user'
  },
  USERS: {
    STATS: '/api/users/stats',
    VOTES: '/api/users/votes'
  }
};