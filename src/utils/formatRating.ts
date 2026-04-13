function formatRating(num: number) {
  return Number.isInteger(num) ? num.toString() : num.toFixed(1);
}
export default formatRating;
