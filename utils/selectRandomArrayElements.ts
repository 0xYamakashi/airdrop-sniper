export function selectRandomArrayElements(
  sourceArray: any[],
  elementCount: number
) {
  const randomElements = [];
  const sourceArrayCopy = [...sourceArray];
  for (let i = 0; i < elementCount; i++) {
    const randomIndex = Math.floor(Math.random() * sourceArrayCopy.length);
    randomElements.push(sourceArrayCopy[randomIndex]);
    sourceArrayCopy.splice(randomIndex, 1);
  }

  return randomElements;
}
