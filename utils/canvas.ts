import { loadImage, createCanvas } from "@napi-rs/canvas";
import { getRandomColor, getRandomItem } from "./db";
import { getRandomPositiveTexts, getRandomSubtext } from "./mongodb";

const COLORS = {
  DARK_WHITE: "#ccbda3",
  WHITE: "#F4EDE1",
  BLACK: "#000",
  RED: "#CC443C",
};

const FONT_REGULAR = (fontSize) => `${fontSize}px ZenMaruRegular`;
const FONT_BOLD = (fontSize) => `${fontSize}px ZenMaruBold`;
const FONT_BLACK = (fontSize) => `${fontSize}px ZenMaruBlack`;
const FONT_LIGHT = (fontSize) => `${fontSize}px ZenMaruLight`;
const FONT_CHINESE = (fontSize) => `${fontSize}px HuangYou`;

type FONT_STYLE = "LIGHT" | "REGULAR" | "BOLD" | "BLACK" | "CHINESE";

const CANVAS_WIDTH = 162 * 2,
  CANVAS_HEIGHT = 420 * 2;

const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
const ctx = canvas.getContext("2d");

const drawVerticalText = (
  text: string,
  x: number,
  y: number,
  fontSize: number,
  fontWidth: FONT_STYLE = "REGULAR",
  fillSyle: string = COLORS.BLACK
) => {
  for (let i = 0; i < text.length; ++i) {
    drawText(
      text.charAt(i),
      x,
      y + ctx.measureText(text.charAt(i)).width * i + 2 * i,
      fontSize,
      fontWidth,
      fillSyle
    );
  }
};

const drawText = (
  text: string,
  x: number,
  y: number,
  fontSize: number,
  fontWidth: FONT_STYLE = "REGULAR",
  fillSyle: string = COLORS.BLACK,
  leftAlign: boolean = false
) => {
  switch (fontWidth) {
    case "REGULAR":
      ctx.font = FONT_REGULAR(fontSize);
      break;
    case "BOLD":
      ctx.font = FONT_BOLD(fontSize);
      break;
    case "BLACK":
      ctx.font = FONT_BLACK(fontSize);
      break;
    case "LIGHT":
      ctx.font = FONT_LIGHT(fontSize);
      break;
    case "CHINESE":
      ctx.font = FONT_CHINESE(fontSize);
      break;
  }
  ctx.fillStyle = fillSyle;

  let newX = leftAlign ? x : x - ctx.measureText(text).width / 2;
  ctx.fillText(text, newX, y + fontSize / 2);
};

const drawCircle = (
  x: number,
  y: number,
  r: number,
  lineWidth: number = 2,
  strokeStyle: string = COLORS.BLACK,
  fillStyle: string = COLORS.WHITE
) => {
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r, 0, 0, 360);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
};

const drawLine = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  lineWidth: number,
  strokeStyle: string = COLORS.BLACK
) => {
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.closePath();
  ctx.stroke();
};

export const createImage = async (unsei: string) => {
  const { width, height } = canvas;

  const background = await loadImage("./references/MikujiTemplate.png");
  ctx.drawImage(background, 0, 0, width, height);

  // Header
  const subtext = await getRandomSubtext();
  drawText(subtext, width / 2, 210, 16, "BLACK", COLORS.BLACK);
  drawText(unsei, width / 2, 245, 45, "BLACK", COLORS.RED);

  // Mid
  drawText("ラッキーアイテム", width / 2, 300, 13, "BOLD");
  drawText(await getRandomItem(), width / 2, 335, 25, "BLACK");
  drawText("ラッキーカラー", width / 2, 370, 13, "BOLD");
  drawText(await getRandomColor(), width / 2, 400, 25, "BLACK");

  // Content
  const { ganbou, gakumon, rennai, shobai, byoki } =
    await getRandomPositiveTexts();
  const offset = 126 - 92;
  drawVerticalText(byoki, 92, 495, 14, "BLACK");
  drawVerticalText(shobai, 92 + offset, 495, 14, "BLACK");
  drawVerticalText(gakumon, 92 + offset * 2, 495, 14, "BLACK");
  drawVerticalText(rennai, 92 + offset * 3, 495, 14, "BLACK");
  drawVerticalText(ganbou, 92 + offset * 4, 495, 14, "BLACK");

  return canvas.encode("png");
};
