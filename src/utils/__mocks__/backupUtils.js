// __mocks__/backupUtils.js
module.exports = {
  compressWithWorker: jest.fn(async (entries) => entries.map(e => ({ i: e.id, d: e.date, c: e.content }))),
  decompressWithWorker: jest.fn(async (compressed) => compressed.map(e => ({ id: e.i, date: e.d, content: e.c }))),
};
