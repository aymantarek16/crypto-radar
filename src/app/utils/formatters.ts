export function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
