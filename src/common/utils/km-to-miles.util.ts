export const kmToMiles = (km: number): number => {
  if (isNaN(km)) return 0;
  return km * 0.621371;
};
