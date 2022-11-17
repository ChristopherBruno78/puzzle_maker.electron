const debounce = function (callback, wait, timer) {
  clearTimeout(timer);
  timer = setTimeout(callback, wait);
  return timer;
};

export { debounce };
