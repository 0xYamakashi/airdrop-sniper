export function calculateGasMargin(value: bigint): bigint {
  return (value * BigInt(120)) / BigInt(100);
}
