const Pixel = (pixel) => {
  let { r, g, b } = pixel;
  let color = { r, g, b, net: (r + g + b) / 3 };
  const add = ({ r, g, b }) => {
    color.r += r;
    color.g += g;
    color.b += b;
  };

  const average = (divisor) => {
    color.r /= divisor;
    color.g /= divisor;
    color.b /= divisor;
    color.net = (color.r + color.g + color.b) / 3;
  };
  toString = () => {
    return `{r: ${color.r.toFixed(2)}, g: ${color.g.toFixed(
      2
    )}, b: ${color.b.toFixed(2)}, avg: ${color.net.toFixed(2)}}`;
  };
  return { add, average, color, toString };
};

module.exports = { Pixel };
