import { createCanvas } from "@napi-rs/canvas";
import { getRandomColor, getRandomItem } from "./db";

const COLORS = {
  WHITE: "#F4EDE1",
  BLACK: "#000",
  RED: "#F71515",
};

const FONT_REGULAR = (fontSize) => `${fontSize}px ZenMaruRegular`;
const FONT_BOLD = (fontSize) => `${fontSize}px ZenMaruBold`;
const FONT_BLACK = (fontSize) => `${fontSize}px ZenMaruBlack`;
const FONT_LIGHT = (fontSize) => `${fontSize}px ZenMaruLight`;
const FONT_CHINESE = (fontSize) => `${fontSize}px HuangYou`;

type FONT_STYLE = "LIGHT" | "REGULAR" | "BOLD" | "BLACK" | "CHINESE";

const CANVAS_WIDTH = 800,
  CANVAS_HEIGHT = 1800;

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
      y + ctx.measureText(text.charAt(i)).width * i,
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

  // Set background
  ctx.fillStyle = COLORS.WHITE;
  ctx.fillRect(0, 0, width, height);

  // Set layout
  const HEADER_HEIGHT = 200;
  const STORY_HEIGHT = HEADER_HEIGHT + 400;
  const CONTENT_HEIGHT = STORY_HEIGHT + 750;
  const LUCKY_ITEM_HEIGHT = CONTENT_HEIGHT;
  const LUCKY_COLOR_HEIGHT = LUCKY_ITEM_HEIGHT + 225;

  const BORDER_WIDTH = 4;
  const CENTER_TITLE_WIDTH = 200;

  drawLine(0, HEADER_HEIGHT, width, HEADER_HEIGHT, BORDER_WIDTH);
  drawLine(0, STORY_HEIGHT, width, STORY_HEIGHT, BORDER_WIDTH);
  drawLine(
    width / 2 - CENTER_TITLE_WIDTH / 2,
    STORY_HEIGHT,
    width / 2 - CENTER_TITLE_WIDTH / 2,
    CONTENT_HEIGHT,
    BORDER_WIDTH
  );
  drawLine(
    width / 2 + CENTER_TITLE_WIDTH / 2,
    STORY_HEIGHT,
    width / 2 + CENTER_TITLE_WIDTH / 2,
    CONTENT_HEIGHT,
    BORDER_WIDTH
  );
  drawLine(0, LUCKY_ITEM_HEIGHT, width, LUCKY_ITEM_HEIGHT, BORDER_WIDTH);
  drawLine(0, LUCKY_COLOR_HEIGHT, width, LUCKY_COLOR_HEIGHT, BORDER_WIDTH);

  // Header
  drawText(
    `${unsei}だと思ってるの？`,
    width / 2,
    HEADER_HEIGHT / 2,
    70,
    "BLACK"
  );

  // Story
  drawText(
    "【小話】",
    width / 2,
    (CONTENT_HEIGHT - STORY_HEIGHT) / 2,
    70,
    "LIGHT"
  );

  // Title
  const ICON_RADIUS = CENTER_TITLE_WIDTH / 2 - 30;
  drawCircle(
    width / 2,
    STORY_HEIGHT + ICON_RADIUS + 40,
    ICON_RADIUS,
    6,
    COLORS.WHITE,
    COLORS.RED
  );
  drawText(
    "神",
    width / 2,
    STORY_HEIGHT + ICON_RADIUS + 30,
    100,
    "CHINESE",
    COLORS.WHITE
  );
  drawVerticalText(
    "本音みくじ",
    width / 2,
    STORY_HEIGHT + ICON_RADIUS + 210,
    80,
    "BOLD"
  );

  // Left content
  const sideContentFontSize = 40;
  drawVerticalText(
    "商売",
    width - sideContentFontSize,
    STORY_HEIGHT + sideContentFontSize,
    sideContentFontSize,
    "BOLD"
  );
  drawVerticalText(
    "恋愛",
    width - sideContentFontSize * 2 - 60,
    STORY_HEIGHT + sideContentFontSize,
    sideContentFontSize,
    "BOLD"
  );
  drawVerticalText(
    "願望",
    width - sideContentFontSize * 3 - 120,
    STORY_HEIGHT + sideContentFontSize,
    sideContentFontSize,
    "BOLD"
  );

  drawVerticalText(
    "おもしろい一文",
    width - sideContentFontSize,
    STORY_HEIGHT + sideContentFontSize + sideContentFontSize * 3,
    sideContentFontSize,
    "LIGHT"
  );
  drawVerticalText(
    "おもしろい一文",
    width - sideContentFontSize * 2 - 60,
    STORY_HEIGHT + sideContentFontSize + sideContentFontSize * 3,
    sideContentFontSize,
    "LIGHT"
  );
  drawVerticalText(
    "おもしろい一文",
    width - sideContentFontSize * 3 - 120,
    STORY_HEIGHT + sideContentFontSize + sideContentFontSize * 3,
    sideContentFontSize,
    "LIGHT"
  );

  // Right content
  drawVerticalText(
    "病気",
    0 + sideContentFontSize,
    STORY_HEIGHT + sideContentFontSize,
    sideContentFontSize,
    "BOLD"
  );
  drawVerticalText(
    "失物",
    0 + sideContentFontSize * 2 + 60,
    STORY_HEIGHT + sideContentFontSize,
    sideContentFontSize,
    "BOLD"
  );
  drawVerticalText(
    "争事",
    0 + sideContentFontSize * 3 + 120,
    STORY_HEIGHT + sideContentFontSize,
    sideContentFontSize,
    "BOLD"
  );

  drawVerticalText(
    "おもしろい一文",
    0 + sideContentFontSize,
    STORY_HEIGHT + sideContentFontSize + sideContentFontSize * 3,
    sideContentFontSize,
    "LIGHT"
  );
  drawVerticalText(
    "おもしろい一文",
    0 + sideContentFontSize * 2 + 60,
    STORY_HEIGHT + sideContentFontSize + sideContentFontSize * 3,
    sideContentFontSize,
    "LIGHT"
  );
  drawVerticalText(
    "おもしろい一文",
    0 + sideContentFontSize * 3 + 120,
    STORY_HEIGHT + sideContentFontSize + sideContentFontSize * 3,
    sideContentFontSize,
    "LIGHT"
  );

  // Lucky Item
  drawText(
    "ラッキーアイテム",
    10,
    CONTENT_HEIGHT + 30,
    40,
    "REGULAR",
    COLORS.BLACK,
    true
  );
  drawText(
    await getRandomItem(),
    width / 2,
    (LUCKY_COLOR_HEIGHT - CONTENT_HEIGHT) / 2 + CONTENT_HEIGHT,
    90,
    "BLACK"
  );

  // Lucky Color
  drawText(
    "ラッキーカレー",
    10,
    LUCKY_COLOR_HEIGHT + 30,
    40,
    "REGULAR",
    COLORS.BLACK,
    true
  );
  drawText(
    await getRandomColor(),
    width / 2,
    LUCKY_COLOR_HEIGHT + 120,
    90,
    "BLACK"
  );

  return canvas.encode("png");
};
