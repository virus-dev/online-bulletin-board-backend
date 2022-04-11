const { MbToBytes } = require('./bytes');

const getCheckFileFunc = (types, maxSize) => (file) => (
  types.includes(file.mimetype) && file.size < maxSize
);

const checkFileForImgBB = getCheckFileFunc(['image/jpeg', 'image/png'], MbToBytes(32));

module.exports = {
  getCheckFileFunc,
  checkFileForImgBB,
}
