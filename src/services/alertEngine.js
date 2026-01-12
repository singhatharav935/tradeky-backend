// src/services/alertEngine.js

const AlertRule = require('../models/AlertRule');
const Notification = require('../models/Notification');

/**
 * Alert Engine (Layer 1 + Layer 2)
 * Layer 1: Rule-based trigger
 * Layer 2: Contextual intelligence (trend + volatility + confidence + smart cooldown)
 */
async function runAlertEngine({ getPrice, getIndicator }) {
  try {
    console.log('⚙️ Alert Engine running...');

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

      /* ================= PRICE ================= */
      const priceData = await getPrice(symbol, timeframe);
      if (
        !priceData ||
        priceData.close === undefined ||
        priceData.prevClose === undefined
      ) {
        continue;
      }

      /* ================= INDICATOR ================= */
      const indicatorData = await getIndicator({
        symbol,
        timeframe,
        indicator: logic.indicator,
        params: logic.params || {},
      });

      if (!indicatorData) continue;

      let isTriggered = false;
      let triggerValue = null;

      /* ================= LAYER 1: RULE EVAL ================= */
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
          if (indicatorData.prev != null && indicatorData.current != null) {
            isTriggered =
              indicatorData.prev < priceData.prevClose &&
              indicatorData.current > priceData.close;
            triggerValue = indicatorData.current;
          }
          break;

        case 'CROSS_BELOW':
          if (indicatorData.prev != null && indicatorData.current != null) {
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

      /* ================= LAYER 2.1: VOLATILITY FILTER ================= */
      const priceChangePct =
        Math.abs(priceData.close - priceData.prevClose) /
        priceData.prevClose;

      if (priceChangePct < 0.0005) continue;

      /* ================= LAYER 2.2: TREND BIAS ================= */
      let trendBias = 'NEUTRAL';

      if (
        indicatorData.fast != null &&
        indicatorData.slow != null
      ) {
        if (indicatorData.fast > indicatorData.slow) {
          trendBias = 'BULLISH';
        } else if (indicatorData.fast < indicatorData.slow) {
          trendBias = 'BEARISH';
        }
      }

      if (triggerType === 'ENTRY' && trendBias === 'BEARISH') continue;
      if (triggerType === 'EXIT' && trendBias === 'BULLISH') continue;

      /* ================= LAYER 2.3: CONFIDENCE SCORE ================= */
      let confidence = 0;

      if (trendBias === 'BULLISH' && triggerType === 'ENTRY') confidence += 40;
      if (trendBias === 'BEARISH' && triggerType === 'EXIT') confidence += 40;
      if (trendBias === 'NEUTRAL') confidence += 20;

      if (
        indicatorData.fast != null &&
        indicatorData.slow != null
      ) {
        const diff = Math.abs(indicatorData.fast - indicatorData.slow);
        const normalized = diff / priceData.close;

        if (normalized > 0.002) confidence += 40;
        else if (normalized > 0.001) confidence += 25;
        else confidence += 10;
      }

      if (priceChangePct > 0.001 && priceChangePct < 0.01) {
        confidence += 20;
      } else if (priceChangePct >= 0.01) {
        confidence += 10;
      }

      if (confidence > 100) confidence = 100;

      /* ================= LAYER 2.4: SMART COOLDOWN ================= */
      let cooldownMs = 60 * 1000; // default 1 min

      if (confidence >= 80) cooldownMs = 30 * 1000;
      else if (confidence >= 60) cooldownMs = 60 * 1000;
      else if (confidence >= 40) cooldownMs = 2 * 60 * 1000;
      else cooldownMs = 5 * 60 * 1000;

      const now = Date.now();
      const lastTime = lastTriggeredAt
        ? new Date(lastTriggeredAt).getTime()
        : 0;

      if (now - lastTime < cooldownMs) continue;

      /* ================= CREATE NOTIFICATION ================= */
      const notification = await Notification.create({
        user,
        from: null,
        type: triggerType === 'EXIT' ? 'ALERT_EXIT' : 'ALERT_ENTRY',
        alertRule: _id,
        symbol,
        timeframe,
        triggerValue,
        meta: {
          trendBias,
          volatility: priceChangePct,
          confidence,
          cooldownMs,
        },
      });

      /* ================= SOCKET ================= */
      if (global.io) {
        global.io.to(user.toString()).emit('notification', {
          _id: notification._id,
          type: notification.type,
          symbol,
          timeframe,
          triggerValue,
          trendBias,
          confidence,
          createdAt: notification.createdAt,
        });
      }

      console.log(
        `🚨 ALERT [${triggerType}] | ${symbol} | CONF ${confidence}% | CD ${cooldownMs / 1000}s`
      );

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
