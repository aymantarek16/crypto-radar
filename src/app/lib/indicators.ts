export function calculateEMA(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const emaArray: number[] = [];
  data.forEach((price, i) => {
    if (i === 0) {
      emaArray.push(price);
    } else {
      const ema = price * k + emaArray[i - 1] * (1 - k);
      emaArray.push(ema);
    }
  });
  return emaArray;
}

export function calculateRSI(data: number[], period: number): number[] {
  const gains: number[] = [];
  const losses: number[] = [];
  const rsi: number[] = [];

  for (let i = 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    if (change >= 0) gains.push(change);
    else losses.push(Math.abs(change));

    if (i >= period) {
      const avgGain = gains.reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.reduce((a, b) => a + b, 0) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - 100 / (1 + rs));

      gains.shift();
      losses.shift();
    }
  }
  return rsi;
}

export function calculatePivot(price: number) {
  return price; // simplified pivot placeholder
}
