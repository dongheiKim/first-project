// __mocks__/googleDrive.js
module.exports = {
  initializeGoogleAPI: jest.fn(),
  initializeGIS: jest.fn(),
  authenticateGoogle: jest.fn(),
  uploadToDrive: jest.fn(),
  downloadFromDrive: jest.fn(async () => '[]'),
  signOutGoogle: jest.fn(),
  isSignedIn: jest.fn(() => false),
};
