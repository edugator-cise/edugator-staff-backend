export default function assertString(input) {
  const isString = typeof input === 'string' || input instanceof String;

  if (!isString) {
    let invalidType = typeof input;
    if (invalidType === 'object') invalidType = input.constructor.name;
    throw new TypeError(`Expected a string but received a ${invalidType}`);
  }
}
export const isMongoId = (str: string) => {
  assertString(str);
  return /^(0x|0h)?[0-9A-F]+$/i.test(str) && str.length === 24;
}