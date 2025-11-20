const shouldLog = import.meta.env.DEV;

export const logError = (...args) => {
  if (shouldLog) {
    console.error(...args);
  }
};

export const logInfo = (...args) => {
  if (shouldLog) {
    console.info(...args);
  }
};
