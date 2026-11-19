// Ticks inside a Web Worker so the countdown isn't throttled along with the
// main thread. Remaining time is always derived from an absolute end
// timestamp, so if the browser suspends this worker (e.g. the phone screen
// turns off), the very next tick after resuming reports the correct time.
let intervalId = null;

self.onmessage = (e) => {
  const { command, endsAt } = e.data;
  switch (command) {
    case 'start':
      startTimer(endsAt);
      break;
    case 'stop':
      stopTimer();
      break;
  }
};

function tick(endsAt) {
  postMessage({ command: 'update', rawRemaining: endsAt - Date.now() });
}

function startTimer(endsAt) {
  stopTimer();
  tick(endsAt);
  intervalId = setInterval(() => tick(endsAt), 250);
}

function stopTimer() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
