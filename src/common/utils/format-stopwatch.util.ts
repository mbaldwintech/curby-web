export const formatStopwatch = (ms: number) => {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;

  const pad = (n: number, size: number = 2) => n.toString().padStart(size, '0');
  const padMs = (n: number) => n.toString().padStart(3, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${padMs(milliseconds)}`;
};
