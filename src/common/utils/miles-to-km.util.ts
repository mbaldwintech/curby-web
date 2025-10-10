export const milesToKm = (miles: number): number => {
  if (isNaN(miles)) return 0;
  return miles / 0.621371;
};
