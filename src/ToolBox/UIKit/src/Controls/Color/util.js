import { isUndefinedOrNull } from "../../../../Foundation";

export function isColor(color) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
  return result && result[1] && result[2] && result[3];
}

export function getRGB(color) {
  try {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    return result
      ? {
          red: parseInt(result[1], 16),
          green: parseInt(result[2], 16),
          blue: parseInt(result[3], 16),
        }
      : null;
  } catch (e) {
    console.error(e);
  }
}

export function getHexValue(number) {
  if (isUndefinedOrNull(number)) return "";
  let hex = Math.round(number).toString(16);
  if (hex.length === 1) {
    hex = "0" + hex;
  }
  return hex.toUpperCase();
}

export function fromRGB(r, g, b) {
  return "#" + getHexValue(r) + getHexValue(g) + getHexValue(b);
}

export function getHSL(color) {
  const { red, green, blue } = getRGB(color);
  const r = red / 255.0;
  const g = green / 255.0;
  const b = blue / 255.0;

  //	Minimum and Maximum RGB values are used in the HSL calculations
  const min = Math.min(r, Math.min(g, b));
  const max = Math.max(r, Math.max(g, b));

  //  Calculate the Hue
  let h = 0;
  if (max === min) h = 0;
  else if (max === r) h = (60 * (g - b)) / (max - min);
  else if (max === g) h = (60 * (b - r)) / (max - min) + 120;
  else if (max === b) h = (60 * (r - g)) / (max - min) + 240;

  //  Calculate the Luminance
  const l = (max + min) / 2;

  //  Calculate the Saturation
  let s = 0;

  if (max === min) s = 0;
  else if (l <= 0.5) s = (max - min) / (max + min);
  else s = (max - min) / (2 - max - min);

  return {
    hue: h,
    saturation: s * 100,
    lightness: l * 100,
  };
}

function _hueToRGB(p, q, h) {
  if (h < 0) h += 1;
  if (h > 1) h -= 1;

  if (6 * h < 1) {
    return p + (q - p) * 6 * h;
  }

  if (2 * h < 1) {
    return q;
  }

  if (3 * h < 2) {
    return p + (q - p) * 6 * (2.0 / 3.0 - h);
  }

  return p;
}

export function fromHSL(h, s, l) {
  if (s < 0.0 || s > 100.0) {
    throw new Error("Color parameter outside of expected range - Saturation");
  }

  if (l < 0.0 || l > 100.0) {
    throw new Error("Color parameter outside of expected range - Luminance");
  }

  //  Formula needs all values between 0 - 1.
  h = h % 360.0;
  h /= 360.0;
  s /= 100.0;
  l /= 100.0;

  let q = 0;

  if (l < 0.5) q = l * (1 + s);
  else q = l + s - s * l;

  let p = 2 * l - q;

  const r = Math.max(0, _hueToRGB(p, q, h + 1.0 / 3.0));
  const g = Math.max(0, _hueToRGB(p, q, h));
  const b = Math.max(0, _hueToRGB(p, q, h - 1.0 / 3.0));

  return fromRGB(
    Math.round(Math.min(r * 255.0, 255.0)),
    Math.round(Math.min(g * 255.0, 255.0)),
    Math.round(Math.min(b * 255.0, 255.0))
  );
}

export function getHSB(color) {
  const { red, green, blue } = getRGB(color);
  const max = Math.max(Math.max(red, green), blue);
  const min = Math.min(Math.min(red, green), blue);
  const delta = max - min;
  const brightness = max / 255.0;
  let saturation = 0;
  if (max > 0) {
    saturation = delta / max;
  }
  let hue;
  if (saturation === 0) {
    hue = 0.0;
  } else {
    const rr = (max - red) / delta;
    const gr = (max - green) / delta;
    const br = (max - blue) / delta;
    if (red === max) {
      hue = br - gr;
    } else if (green === max) {
      hue = 2 + rr - br;
    } else {
      hue = 4 + gr - rr;
    }
    hue = hue / 6.0;
    if (hue < 0) {
      hue++;
    }
  }
  return {
    hue: hue,
    saturation: saturation * 100,
    brightness: brightness * 100,
  };
}

export function getRelativeLuminance(color) {
  const { red, green, blue } = getRGB(color);
  const r = red / 255.0;
  const g = green / 255.0;
  const b = blue / 255.0;

  let rs = Math.pow((r + 0.055) / 1.055, 2.4);
  if (r <= 0.03938) {
    rs = r / 12.92;
  }

  let gs = Math.pow((g + 0.055) / 1.055, 2.4);
  if (g <= 0.03938) {
    gs = g / 12.92;
  }

  let bs = Math.pow((b + 0.055) / 1.055, 2.4);
  if (b <= 0.03938) {
    bs = r / 12.92;
  }

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function colorByAdjustingBrightness(color, percent) {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = Math.round((R * percent) / 100);
  G = Math.round((G * percent) / 100);
  B = Math.round((B * percent) / 100);

  R = Math.min(R, 255);
  G = Math.min(G, 255);
  B = Math.min(B, 255);

  const rs = R.toString(16);
  const RR = rs.length === 1 ? "0" + rs : rs;
  const gs = G.toString(16);
  const GG = gs.length === 1 ? "0" + gs : gs;
  const bs = B.toString(16);
  const BB = bs.length === 1 ? "0" + bs : bs;

  return "#" + RR + GG + BB;
}

export function calculateContrast(color1, color2) {
  return (
    (getRelativeLuminance(color1) + 0.05) /
    (getRelativeLuminance(color2) + 0.05)
  );
}
