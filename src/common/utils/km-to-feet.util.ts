export const kmToFeet = (km: number): number => {
  if (isNaN(km)) return 0;
  return km * 3280.84;
};
