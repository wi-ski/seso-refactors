export function templateFillerBuilder(strings, ...keys) {
  return (...values) => {
    const dict = values.at(-1) || {};
    const result = [strings[0]];
    keys.forEach((key, i) => {
      const value = Number.isInteger(key) ? values[key] : dict[key];
      result.push(value, strings[i + 1]);
    });
    return result.join("");
  };
}
