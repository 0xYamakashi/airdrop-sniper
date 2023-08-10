export function adjustDecimals(
  value: bigint,
  fromDecimals: number,
  toDecimals: number
): bigint {
  if (fromDecimals === toDecimals) {
    return value;
  }

  const bigFromDecimals = BigInt(fromDecimals);
  const bigToDecimals = BigInt(toDecimals);

  if (bigFromDecimals < bigToDecimals) {
    const factor = BigInt(10) ** (bigToDecimals - bigFromDecimals);
    return value * factor;
  } else {
    const divisor = BigInt(10) ** (bigFromDecimals - bigToDecimals);
    return value / divisor;
  }
}
