export interface ColorLab {
  l: number,
  a: number,
  b: number
}

export interface ColorRGB {
  r: number,
  g: number,
  b: number
}

const delta = 6 / 29;
const threeDeltaSquared = 3 * delta ** 2;
const f = (t: number) => (t > delta ** 3 ? t ** (1 / 3) : t / threeDeltaSquared + (4 / 29));
const gamma = 2.4;
const toLinear = (srgb: number) => (
  srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** gamma);
const toGamma = (linear: number) => (
  linear < 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / gamma) - 0.055);
// constants for D65
const xn = 95.0489;
const yn = 100;
const zn = 108.884;

export function srgbToLab({ r, g, b }: ColorRGB): ColorLab {
  const rl = toLinear(r) * 100;
  const gl = toLinear(g) * 100;
  const bl = toLinear(b) * 100;
  // via https://en.wikipedia.org/wiki/SRGB
  const x = 0.4124 * rl + 0.3576 * gl + 0.1805 * bl;
  const y = 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
  const z = 0.0193 * rl + 0.1192 * gl + 0.9505 * bl;
  // https://en.wikipedia.org/wiki/CIELAB_color_space#From_CIEXYZ_to_CIELAB
  const fy = f(y / yn);
  return {
    l: 116 * fy - 16,
    a: 500 * (f(x / xn) - fy),
    b: 200 * (fy - f(z / zn)),
  };
}

const fInverse = (t: number) => (t > delta ? t ** 3 : threeDeltaSquared * (t - 4 / 29));

export function labToSrgb({ l, a, b }: ColorLab): ColorRGB {
  const lPlus16Over116 = (l + 16) / 116;
  const x = xn * fInverse(lPlus16Over116 + a / 500);
  const y = yn * fInverse(lPlus16Over116);
  const z = zn * fInverse(lPlus16Over116 - b / 200);
  const rl = 3.2406 * x + -1.5372 * y + -0.4986 * z;
  const gl = -0.9689 * x + 1.8758 * y + 0.0415 * z;
  const bl = 0.0557 * x + -0.2040 * y + 1.0570 * z;
  return {
    r: toGamma(rl / 100),
    g: toGamma(gl / 100),
    b: toGamma(bl / 100),
  };
}
