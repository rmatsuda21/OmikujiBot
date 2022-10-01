const unseiList = ["大吉", "吉", "中吉", "小吉", "末吉", "凶", "大凶"];

export const drawMikuji = (user_id: string) => {
  const unsei = unseiList[Math.floor(Math.random() * unseiList.length)];
  return unsei;
};
