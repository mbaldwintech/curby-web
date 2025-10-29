export const milesToFeet = (miles: number): number => {
  if (isNaN(miles)) return 0;
  return miles * 5280;
};
