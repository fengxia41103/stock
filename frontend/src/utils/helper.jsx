export const randomId = (prefix = "FX") => {
  return prefix + (Math.random() * 1e32).toString(12);
};

export const randomColorGenerator = () => {
  return "#" + (Math.random().toString(16) + "0000000").slice(2, 8);
};

export const days_in_between = (start, end) => {
  const date1 = new Date(start);
  const date2 = new Date(end);

  // To calculate the time difference of two dates
  var difference_in_time = date2.getTime() - date1.getTime();

  // To calculate the no. of days between two dates
  return difference_in_time / (1000 * 3600 * 24);
};
