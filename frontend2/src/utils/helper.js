import { map } from "lodash";
import moment from "moment";

export const randomId = (prefix = "FX") => {
  return prefix + (Math.random() * 1e32).toString(12);
};

export const randomColorGenerator = () => {
  const randomColor = `${Math.random().toString(16)}0000000`;

  return `#${randomColor.slice(2, 8)}`;
};

export const days_in_between = (start, end) => {
  const date1 = new Date(start);
  const date2 = new Date(end);

  // To calculate the time difference of two dates
  const difference_in_time = date2.getTime() - date1.getTime();

  // To calculate the no. of days between two dates
  return difference_in_time / (1000 * 3600 * 24);
};

const get_contrast = (background) => {
  // func to compute font color to contrast w/ background color
  return parseInt(background, 16) > 0xffffff / 2 ? "black" : "white";
};

export const get_highlights = (interests) => {
  // highlight background color choices
  let highlights = map(interests, (i) => {
    // https://dev.to/akhil_001/generating-random-color-with-single-line-of-js-code-fhj
    const bk_color = Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0");

    // try to get a contrast color
    const font_color = get_contrast(bk_color);

    // here are my colors
    return [
      i,
      {
        background: `#${bk_color}`,
        font: font_color,
      },
    ];
  });

  // turn list of list into a dict!
  highlights = Object.fromEntries(highlights);

  return highlights;
};

const DATE_FORMAT = "YYYY-MM-DD";

export const get_today_string = () => {
  return moment().format(DATE_FORMAT);
};

export const get_last_week_string = () => {
  return moment().add(-1, "w").format(DATE_FORMAT);
};

export const get_last_month_string = () => {
  return moment().add(-1, "M").format(DATE_FORMAT);
};
