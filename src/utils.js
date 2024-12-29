export function longToByteArray(/*long*/ long) {
  // we want to represent the input as a 8-bytes array
  var byteArray = [0, 0, 0, 0];

  for (var index = 0; index < byteArray.length; index++) {
    var byte = long & 0xff;
    byteArray[index] = byte;
    long = (long - byte) / 256;
  }

  return byteArray;
}

export function byteArrayToLong(/*byte[]*/ byteArray) {
  var value = 0;
  for (var i = byteArray.length - 1; i >= 0; i--) {
    value = value * 256 + byteArray[i];
  }

  return value;
}

export function arrayToInt(bitArray) {
  let value = 0;
  for (var i = 0; i < bitArray.length; i++) {
    value = value + bitArray[i] * Math.pow(2, i);
  }
  return value;
}
