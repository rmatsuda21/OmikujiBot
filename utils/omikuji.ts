const { colors } = require("../data/luckyColor.json");
const { items } = require("../data/luckyItem.json");
const unseiList = ["大吉", "吉", "中吉", "小吉", "末吉", "凶", "大凶"];

export const drawMikuji = () => {
  const unsei = unseiList[Math.floor(Math.random() * unseiList.length)];
  return unsei;
};

export const getLuckyColor = () => {
  const color = colors[Math.floor(Math.random() * colors.length)];
  return color;
};

export const getLuckyItem = () => {
  const color = items[Math.floor(Math.random() * items.length)];
  return color;
};
