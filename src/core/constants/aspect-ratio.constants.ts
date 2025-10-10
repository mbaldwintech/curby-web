const width = 9;
const height = 16;

export const AspectRatio = {
  label: `${width}:${height}`,
  width,
  height,
  ratio: width / height,
  getHeightForWidth: (w: number) => (w * height) / width
};
