// src/services/alertEngine.js

const AlertRule = require('../models/AlertRule');
const Notification = require('../models/Notification');

/**
 * Alert Engine
 * Runs on interval / cron
 * Evaluates all active alert rules
 */
async function runAlertEngine({ getPrice, getIndicator }) {
  try {
    console.log('⚙️ Alert Engine running...');

    // 1️⃣ Load all active rules
    const rules = await AlertRule.find({ isActive: true });

    for (const rule of rules) {
      const {
        _id,
        user,
        symbol,
        timeframe,
        logic,
        triggerType,
        lastTriggeredAt,
      } = rule;

      // 2️⃣ Get price data
      const priceData = await getPrice(symbol, timeframe);
      if (
        !priceData ||
        priceData.close === undefined ||
        priceData.prevClose === undefined
      ) {
        continue;
      }

      // 3️⃣ Get indicator data
      const indicatorData = await getIndicator({
        symbol,
        timeframe,
        indicator: logic.indicator,
        params: logic.params || {},
      });

      if (indicatorData === null || indicatorData === undefined) {
        continue;
      }

      let isTriggered = false;
      let triggerValue = null;

      // 4️⃣ Evaluate condition
      switch (logic.condition) {
        case 'GT':
          isTriggered = indicatorData > priceData.close;
          triggerValue = indicatorData;
          break;

        case 'LT':
          isTriggered = indicatorData < priceData.close;
          triggerValue = indicatorData;
          break;

        case 'CROSS_ABOVE':
          if (
            indicatorData.prev !== undefined &&
            indicatorData.current !== undefined
          ) {
            isTriggered =
              indicatorData.prev < priceData.prevClose &&
              indicatorData.current > priceData.close;
            triggerValue = indicatorData.current;
          }
          break;

        case 'CROSS_BELOW':
          if (
            indicatorData.prev !== undefined &&
            indicatorData.current !== undefined
          ) {
            isTriggered =
              indicatorData.prev > priceData.prevClose &&
              indicatorData.current < priceData.close;
            triggerValue = indicatorData.current;
          }
          break;

        default:
          continue;
      }

      if (!isTriggered) continue;

      // 5️⃣ Anti-spam (1 minute)
      const now = Date.now();
      const lastTime = lastTriggeredAt
        ? new Date(lastTriggeredAt).getTime()
        : 0;

      if (now - lastTime < 60 * 1000) {
        continue;
      }

      // 6️⃣ CREATE AI NOTIFICATION
      const notification = await Notification.create({
        user, // receiver
        from: null, // system / AI
        type: triggerType === 'EXIT' ? 'ALERT_EXIT' : 'ALERT_ENTRY',
        alertRule: _id,
        symbol,
        timeframe,
        triggerValue,
      });

      // 7️⃣ 🔴 SOCKET EMIT (REAL-TIME)
      if (global.io) {
        global.io.to(user.toString()).emit('notification', {
          _id: notification._id,
          type: notification.type,
          symbol,
          timeframe,
          triggerValue,
          createdAt: notification.createdAt,
        });
      }

      // 8️⃣ LOG
      console.log(
        `🚨 ALERT [${triggerType}] | ${symbol} | ${logic.indicator} ${logic.condition}`
      );

      // 9️⃣ UPDATE LAST TRIGGER TIME
      rule.lastTriggeredAt = new Date();
      await rule.save();
    }
  } catch (err) {
    console.error('❌ Alert Engine Error:', err.message);
  }
}

module.exports = {
  runAlertEngine,
};
