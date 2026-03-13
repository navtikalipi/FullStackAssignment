export const environment = {
  production: true,
  apiUrl: (window as any).__env?.API_URL,
  aboutApiUrl: (window as any).__env?.ABOUT_API_URL,
  walletApiUrl: (window as any).__env?.WALLET_API_URL,
  chatApiUrl: (window as any).__env?.CHAT_API_URL,
};
