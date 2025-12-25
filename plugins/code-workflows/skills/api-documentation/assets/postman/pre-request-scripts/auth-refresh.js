// Pre-request script: Auto-refresh expired tokens
// Add this to collection-level pre-request scripts

const tokenExpiry = pm.environment.get('TOKEN_EXPIRY');
const accessToken = pm.environment.get('ACCESS_TOKEN');
const refreshToken = pm.environment.get('REFRESH_TOKEN');
const baseUrl = pm.environment.get('BASE_URL');

// Check if token exists and is expired
if (accessToken && tokenExpiry) {
    const now = Date.now();
    const expiry = parseInt(tokenExpiry, 10);

    // Refresh if token expires in less than 5 minutes
    if (now > expiry - 300000) {
        console.log('Token expired or expiring soon, refreshing...');

        if (!refreshToken) {
            console.error('No refresh token available');
            return;
        }

        const refreshRequest = {
            url: `${baseUrl}/auth/refresh`,
            method: 'POST',
            header: {
                'Content-Type': 'application/json'
            },
            body: {
                mode: 'raw',
                raw: JSON.stringify({
                    refresh_token: refreshToken,
                    grant_type: 'refresh_token'
                })
            }
        };

        pm.sendRequest(refreshRequest, (error, response) => {
            if (error) {
                console.error('Token refresh failed:', error);
                return;
            }

            if (response.code === 200) {
                const data = response.json();

                // Update environment variables
                pm.environment.set('ACCESS_TOKEN', data.access_token);
                pm.environment.set('API_KEY', data.access_token);

                if (data.refresh_token) {
                    pm.environment.set('REFRESH_TOKEN', data.refresh_token);
                }

                // Calculate new expiry time
                const newExpiry = Date.now() + (data.expires_in * 1000);
                pm.environment.set('TOKEN_EXPIRY', newExpiry.toString());

                console.log('Token refreshed successfully');
            } else {
                console.error('Token refresh failed with status:', response.code);
                // Clear tokens on failure
                pm.environment.unset('ACCESS_TOKEN');
                pm.environment.unset('TOKEN_EXPIRY');
            }
        });
    }
}
