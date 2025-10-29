export const runOnNewThread = (callback: () => void): void => {
  setTimeout(() => {
    callback();
  }, 0);
};
