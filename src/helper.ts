export function findObjByProp<T extends Record<string, any>, K extends keyof T>(
  arr: T[],
  propName: K,
  propVal: T[K],
) {
  return arr.find((item) => item && item[propName] == propVal);
}
