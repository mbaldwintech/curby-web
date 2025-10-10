export function getCoverScale(
  box: { width: number; height: number },
  image: { width: number; height: number }
): number {
  const { width: bw, height: bh } = box;
  const { width: iw, height: ih } = image;

  if (bw <= 0 || bh <= 0 || iw <= 0 || ih <= 0) {
    return 1;
  }

  const imageAspectRatio = iw / ih;
  const boxAspectRatio = bw / bh;

  let scale;

  if (imageAspectRatio < boxAspectRatio) {
    scale = bw / iw;
  } else {
    scale = bh / ih;
  }

  return scale;
}
