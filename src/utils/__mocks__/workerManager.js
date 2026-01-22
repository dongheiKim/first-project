// __mocks__/workerManager.js
module.exports = {
  compressDataAsync: jest.fn(async (entries) => entries.map(e => ({ i: e.id, d: e.date, c: e.content }))),
  decompressDataAsync: jest.fn(async (compressed) => compressed.map(e => ({ id: e.i, date: e.d, content: e.c }))),
};
