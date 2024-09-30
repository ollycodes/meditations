let intervalId = null;

self.onmessage = (e) => {
  const { command, remainingTime } = e.data;
  switch (command) {
    case ("start"):
      startTimer(remainingTime);
      break;
    case ("stop"):
      stopTimer()
      break;
  }
}

function startTimer(remainingTime) {
  if (intervalId) return;

  let startTime = performance.now();

  intervalId = setInterval(() => {
    const elapsedTime = performance.now() - startTime;
    postMessage({
      command: 'update',
      rawRemaining: remainingTime - elapsedTime,
    });
  }, 100)
}

function stopTimer() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null;
  };
}
