// src/services/alertScheduler.js

const { runAlertEngine } = require('./alertEngine');
const { getPrice } = require('./demoMarketFeed');
const { getIndicator } = require('./indicatorEngine');
const Notification = require('../models/Notification');

/*
  ===============================
  Layer 3: Outcome Evaluation
  ===============================
  Evaluates AI alerts after trigger
  Decides: WIN / LOSS / IGNORED
*/

async function runOutcomeEvaluator() {
  try {
    // ⏳ find pending alert notifications
    const pendingAlerts = await Notification.find({
      type: { $in: ['ALERT_ENTRY', 'ALERT_EXIT'] },
      outcome: 'PENDING',
      triggerValue: { $ne: null },
    }).limit(20); // safety cap

    for (const alert of pendingAlerts) {
      const {
        _id,
        symbol,
        timeframe,
        triggerValue,
        type,
        createdAt,
      } = alert;

      // ⏱ wait minimum evaluation time (2 minutes)
      const ageMs = Date.now() - new Date(createdAt).getTime();
      if (ageMs < 2 * 60 * 1000) continue;

      // 📈 get latest price
      const priceData = await getPrice(symbol, timeframe);
      if (!priceData || priceData.close == null) continue;

      const currentPrice = priceData.close;

      let outcome = 'IGNORED';

      // 🎯 decision logic (demo thresholds)
      const diffPct =
        Math.abs(currentPrice - triggerValue) / triggerValue;

      // ignore tiny noise
      if (diffPct < 0.001) {
        continue;
      }

      if (type === 'ALERT_ENTRY') {
        outcome =
          currentPrice > triggerValue ? 'WIN' : 'LOSS';
      }

      if (type === 'ALERT_EXIT') {
        outcome =
          currentPrice < triggerValue ? 'WIN' : 'LOSS';
      }

      // 🧠 update notification
      alert.outcome = outcome;
      alert.evaluatedAt = new Date();
      alert.meta = {
        ...(alert.meta || {}),
        evaluationPrice: currentPrice,
      };

      await alert.save();

      console.log(
        `📊 OUTCOME | ${symbol} | ${type} | ${outcome}`
      );
    }
  } catch (err) {
    console.error(
      '❌ Outcome evaluator error:',
      err.message
    );
  }
}

let schedulerRunning = false;
let alertIntervalRef = null;
let evaluationIntervalRef = null;

function startAlertScheduler() {
  if (schedulerRunning) {
    console.log('⚠️ Alert Scheduler already running');
    return;
  }

  schedulerRunning = true;
  console.log('⏰ Alert Scheduler started');

  // 🔁 Layer 2: Alert Engine
  alertIntervalRef = setInterval(async () => {
    try {
      await runAlertEngine({
        getPrice,
        getIndicator,
      });
    } catch (err) {
      console.error(
        '❌ Alert engine tick error:',
        err.message
      );
    }
  }, 5000);

  // 🧠 Layer 3: Outcome Evaluation
  evaluationIntervalRef = setInterval(async () => {
    try {
      await runOutcomeEvaluator();
    } catch (err) {
      console.error(
        '❌ Outcome evaluator tick error:',
        err.message
      );
    }
  }, 60 * 1000);
}

/* OPTIONAL — safe shutdown */
function stopAlertScheduler() {
  if (alertIntervalRef) {
    clearInterval(alertIntervalRef);
    alertIntervalRef = null;
  }

  if (evaluationIntervalRef) {
    clearInterval(evaluationIntervalRef);
    evaluationIntervalRef = null;
  }

  schedulerRunning = false;
  console.log('🛑 Alert Scheduler stopped');
}

module.exports = {
  startAlertScheduler,
  stopAlertScheduler,
};
