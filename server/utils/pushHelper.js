const webpush = require('web-push');

// Configuration
const publicKey  = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

if (publicKey && privateKey) {
  webpush.setVapidDetails(
    'mailto:support@doton.app',
    publicKey,
    privateKey
  );
}

/**
 * sendNotification — sends a push to a specific user subscription
 */
const sendNotification = async (subscription, payload) => {
  if (!subscription) return;

  try {
    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    await webpush.sendNotification(subscription, payloadString);
    console.log('Push notification sent successfully');
  } catch (err) {
    console.error('Error sending push notification:', err.message);
    if (err.statusCode === 410 || err.statusCode === 404) {
      // Subscription has expired or is no longer valid
      return { error: 'expired' };
    }
  }
};

module.exports = { sendNotification };
