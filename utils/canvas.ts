import { createCanvas } from "@napi-rs/canvas";

const COLORS = {
  WHITE: "#F4EDE1",
  BLACK: "#000",
};

const FONT_REGULAR = (fontSize) => `${fontSize}px ZenMaruRegular`;
const FONT_BOLD = (fontSize) => `${fontSize}px ZenMaruBold`;
const FONT_BLACK = (fontSize) => `${fontSize}px ZenMaruBlack`;

type FONT_STYLE = "REGULAR" | "BOLD" | "BLACK";

const CANVAS_WIDTH = 800,
  CANVAS_HEIGHT = 1800;

const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
const ctx = canvas.getContext("2d");

const drawText = (
  text: string,
  x: number,
  y: number,
  fontSize: number,
  fontWidth: FONT_STYLE = "REGULAR",
  fillSyle: string = COLORS.BLACK
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
  }
  ctx.fillStyle = fillSyle;

  ctx.fillText(text, x - text.length * (fontSize / 2), y + fontSize / 2);
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

export const createImage = (unsei: string) => {
  const { width, height } = canvas;

  // Set background
  ctx.fillStyle = COLORS.WHITE;
  ctx.fillRect(0, 0, width, height);
  drawCircle(width / 2, height / 2, 100, 2);
  drawText("テスト", width / 2, height - 50, 30, "BLACK");
  drawLine(0, height / 2, width, height / 2, 2);

  return canvas.encode("png");
};
