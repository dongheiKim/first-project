export async function initializeGoogleAPI(): Promise<void> {}
export async function initializeGIS(): Promise<void> {}
export async function authenticateGoogle(): Promise<void> {}
export async function uploadToDrive(_filename: string, _data: string): Promise<void> {}
export async function downloadFromDrive(_filename: string): Promise<string> { return ''; }
export function signOutGoogle(): void {}
export function isSignedIn(): boolean { return false; }
