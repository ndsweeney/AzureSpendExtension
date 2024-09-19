// Function to authenticate and obtain an access token
async function authenticate() {
  const clientId = "<APPIDHERE>"; // Replace with your Application (client) ID
  const redirectUri = chrome.identity.getRedirectURL();
  const scopes = [
    "https://management.azure.com/user_impersonation",
    "openid",
    "profile",
    "offline_access"
  ];

  const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&response_type=token` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scopes.join(' '))}` +
    `&response_mode=fragment`;

  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl,
        interactive: true
      },
      function (responseUrl) {
        if (chrome.runtime.lastError || !responseUrl) {
          reject(chrome.runtime.lastError);
        } else {
          // Extract access token from response URL
          const params = new URLSearchParams(responseUrl.split('#')[1]);
          const accessToken = params.get('access_token');
          if (accessToken) {
            resolve(accessToken);
          } else {
            reject('Access token not found in response');
          }
        }
      }
    );
  });
}