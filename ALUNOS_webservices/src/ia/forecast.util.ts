export interface RegressionPoint {
  x: number;
  y: number;
}

export interface RegressionResult {
  slope: number;
  intercept: number;
}

/** Regressão linear por mínimos quadrados. Requer >= 2 pontos. */
export function linearRegression(points: RegressionPoint[]): RegressionResult | null {
  const n = points.length;
  if (n < 2) return null;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
  }

  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

/** Valor projetado para a abscissa `x` (nunca negativo, arredondado). */
export function projectNext(reg: RegressionResult, x: number): number {
  const value = reg.slope * x + reg.intercept;
  return Math.max(0, Math.round(value));
}
