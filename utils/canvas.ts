import { createCanvas } from "@napi-rs/canvas";

export const createImage = (unsei: string) => {
  const canvasSize = 300;
  const canvas = createCanvas(canvasSize, canvasSize);
  const ctx = canvas.getContext("2d");

  const { width, height } = canvas;
  const fontSize = width / 3;

  ctx.lineWidth = width / 50;
  ctx.strokeStyle = "#fff";
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(width / 2, height / 2, width / 2 - 20, width / 2 - 20, 0, 0, 360);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";

  const headerFont = fontSize / 3.4;
  ctx.font = `${headerFont}px Kiwi Maru`;
  ctx.fillText(
    "今日の運勢",
    canvas.width / 2 - 5 * (headerFont / 2),
    canvas.height / 4 + headerFont / 2
  );

  ctx.font = `${fontSize}px KiwiMaru`;
  ctx.fillText(
    unsei,
    canvas.width / 2 - unsei.length * (fontSize / 2),
    canvas.height / 2 + fontSize / 2
  );

  return canvas.encode("png");
};
