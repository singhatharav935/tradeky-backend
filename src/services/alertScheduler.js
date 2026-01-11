// src/services/alertScheduler.js

const { runAlertEngine } = require('./alertEngine');
const { getPrice } = require('./demoMarketFeed');
const { getIndicator } = require('./indicatorEngine');

let schedulerRunning = false;
let intervalRef = null;

function startAlertScheduler() {
  if (schedulerRunning) {
    console.log('⚠️ Alert Scheduler already running');
    return;
  }

  schedulerRunning = true;
  console.log('⏰ Alert Scheduler started');

  intervalRef = setInterval(async () => {
    try {
      await runAlertEngine({
        getPrice,
        getIndicator,
      });
    } catch (err) {
      console.error('❌ Scheduler tick error:', err.message);
    }
  }, 5000); // ⏱ every 5 seconds (demo mode)
}

/* OPTIONAL — future safe shutdown */
function stopAlertScheduler() {
  if (intervalRef) {
    clearInterval(intervalRef);
    intervalRef = null;
    schedulerRunning = false;
    console.log('🛑 Alert Scheduler stopped');
  }
}

module.exports = {
  startAlertScheduler,
  stopAlertScheduler,
};
