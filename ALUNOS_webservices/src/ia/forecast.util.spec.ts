import { linearRegression, projectNext } from './forecast.util';

describe('forecast.util', () => {
  it('calcula a regressão de uma série perfeitamente linear', () => {
    const reg = linearRegression([
      { x: 0, y: 10 },
      { x: 1, y: 20 },
      { x: 2, y: 30 }
    ]);
    expect(reg).not.toBeNull();
    expect(reg!.slope).toBeCloseTo(10);
    expect(reg!.intercept).toBeCloseTo(10);
  });

  it('devolve null com menos de 2 pontos', () => {
    expect(linearRegression([])).toBeNull();
    expect(linearRegression([{ x: 0, y: 5 }])).toBeNull();
  });

  it('devolve null quando todos os x são iguais (denominador zero)', () => {
    const reg = linearRegression([
      { x: 1, y: 5 },
      { x: 1, y: 10 }
    ]);
    expect(reg).toBeNull();
  });

  it('projeta o próximo valor arredondado', () => {
    const reg = linearRegression([
      { x: 0, y: 100 },
      { x: 1, y: 110 },
      { x: 2, y: 120 }
    ])!;
    expect(projectNext(reg, 3)).toBe(130);
  });

  it('nunca projeta valores negativos', () => {
    const reg = linearRegression([
      { x: 0, y: 20 },
      { x: 1, y: 5 }
    ])!;
    expect(projectNext(reg, 5)).toBe(0);
  });
});
