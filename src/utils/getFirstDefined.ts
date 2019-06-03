export default function getFirstDefined<T>(...items: T[]): T | undefined {
  return items.find(item => !!item);
}
