export function findObjByProp<
  T extends Record<string, unknown>,
  K extends keyof T,
>(arr: T[], propName: K, propVal: T[K]): T | undefined {
  return arr.find((item) => item && item[propName] == propVal);
}
