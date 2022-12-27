import { loadImage, createCanvas } from "@napi-rs/canvas";
import {
  getRandomTexts,
  getRandomSubtext,
  getRandomColor,
  getRandomItem,
} from "./mongodb";

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
  let newX = x;
  let offset = 0;
  let charCount = 0;
  for (let i = 0; i < text.length; ++i) {
    charCount += 1;
    const currChar = text.charAt(i);
    if (currChar === "\n" || charCount > 16) {
      charCount = 0;
      newX -= fontSize + 5;
      offset = 0;
      continue;
    }

    if (currChar === "「") {
      drawText(
        currChar,
        newX - fontSize / 1.2,
        y + ctx.measureText(currChar).width * offset + 2 * offset,
        fontSize,
        "BLACK",
        fillSyle
      );
      offset += 0.4;
      continue;
    }

    if (currChar === "」") {
      drawText(
        currChar,
        newX + fontSize / 1.2,
        y +
          ctx.measureText(currChar).width * offset +
          2 * offset -
          fontSize * 0.6,
        fontSize,
        "BLACK",
        fillSyle
      );
      offset += 0.4;
      continue;
    }

    if (currChar === "、") {
      drawText(
        currChar,
        newX,
        y +
          ctx.measureText(currChar).width * offset +
          2 * offset -
          fontSize * 0.6,
        fontSize,
        "BLACK",
        fillSyle
      );
      offset += 0.4;
      continue;
    }

    drawText(
      currChar,
      newX,
      y + ctx.measureText(currChar).width * offset + 2 * offset,
      fontSize,
      fontWidth,
      fillSyle
    );
    offset += 1;
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
  let newY = y + fontSize / 2;

  const xOffset = 6;
  const yOffset = -5;
  if (text === "（" || text === "）") {
    ctx.translate(newX + xOffset, newY + yOffset);
    if (text === "（") ctx.rotate(Math.PI / 2);
    if (text === "）") ctx.rotate(Math.PI / 2);
    ctx.translate(-(newX + xOffset), -(newY + yOffset));
  }

  ctx.fillText(text, newX, newY);

  if (text === "（" || text === "）") {
    ctx.translate(newX + xOffset, newY + yOffset);
    if (text === "（") ctx.rotate(-Math.PI / 2);
    if (text === "）") ctx.rotate(-Math.PI / 2);
    ctx.translate(-(newX + xOffset), -(newY + yOffset));
  }
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
  try {
    const { width, height } = canvas;

    const background = await loadImage("./references/MikujiTemplate.png");
    ctx.drawImage(background, 0, 0, width, height);

    // Header
    const subtext = await getRandomSubtext();
    drawText(subtext, width / 2, 210, 12, "BLACK", COLORS.BLACK);
    drawText(unsei, width / 2, 245, 45, "BLACK", COLORS.RED);

    // Mid
    drawText("ラッキーアイテム", width / 2, 300, 13, "BOLD");
    drawText(await getRandomItem(), width / 2, 335, 25, "BLACK");
    drawText("ラッキーカラー", width / 2, 370, 13, "BOLD");
    drawText(await getRandomColor(), width / 2, 400, 25, "BLACK");

    // Content
    const { ganbou, kinun, rennai, shobai, byoki } = await getRandomTexts();
    const offset = 44,
      initX = 72;
    drawVerticalText(byoki, initX, 495, 14, "BOLD");
    drawVerticalText(shobai, initX + offset, 495, 14, "BOLD");
    drawVerticalText(kinun, initX + offset * 2, 495, 14, "BOLD");
    drawVerticalText(rennai, initX + offset * 3, 495, 14, "BOLD");
    drawVerticalText(ganbou, initX + offset * 4, 495, 14, "BOLD");

    return canvas.encode("png");
  } catch (e) {
    return canvas.encode("png");
  }
};
