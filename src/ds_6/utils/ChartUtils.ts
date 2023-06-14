export { debounce, evalFormatter };

function evalFormatter(formatter) {
  try {
    return eval(formatter);
  } catch {
    return formatter;
  }
}

function debounce(func, timeout = 1000) {
  let timer;
  return (...args) => {
    if (!timer) {
      func.apply(this, args);
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
    }, timeout);
  };
}
