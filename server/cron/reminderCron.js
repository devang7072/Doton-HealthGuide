const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const { sendNotification } = require('../utils/pushHelper');

/**
 * initReminderCron — starts the cron job that runs every minute
 */
const initReminderCron = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    console.log('⏰ Running reminder check...');

    const now = new Date();
    // Look for reminders due in the last minute (to avoid missing one if the cron starts slightly late)
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

    try {
      // Find active reminders that match the current date/time window
      const dueReminders = await Reminder.find({
        active: true,
        time: { $gte: oneMinuteAgo, $lte: now }
      }).populate('userId');

      if (dueReminders.length === 0) return;

      console.log(`🔔 Found ${dueReminders.length} due reminders.`);

      for (const reminder of dueReminders) {
        const user = reminder.userId;
        
        if (user && user.pushSubscription) {
          const payload = {
            title: `💊 Time for your ${reminder.name}!`,
            body: `Don't forget to take your ${reminder.type.toLowerCase()}. ${reminder.note || ''}`,
            icon: '/assets/icons/icon-192x192.png',
            tag: 'medicine-reminder',
            data: { url: '/#medicine' }
          };

          const result = await sendNotification(user.pushSubscription, payload);
          
          // If subscription is expired, clean it up
          if (result && result.error === 'expired') {
            user.pushSubscription = null;
            await user.save();
          }

          // Mark reminder as inactive (for one-time reminders)
          reminder.active = false;
          await reminder.save();
        }
      }
    } catch (err) {
      console.error('❌ Error in reminder cron:', err.message);
    }
  });
};

module.exports = { initReminderCron };
