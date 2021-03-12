export const randomId = (prefix = "FX") => {
  return prefix + (Math.random() * 1e32).toString(12);
};

export const randomColorGenerator = () => {
  return "#" + (Math.random().toString(16) + "0000000").slice(2, 8);
};
