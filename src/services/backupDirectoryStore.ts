const DB_NAME = "isoogh-local-backups";
const STORE_NAME = "directory-handles";

export function supportsDirectoryPicker(scope: Pick<Window, "showDirectoryPicker"> = window) {
  return typeof scope.showDirectoryPicker === "function";
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveBackupDirectory(jobId: string | number, handle: FileSystemDirectoryHandle) {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(handle, String(jobId));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

export async function getBackupDirectory(jobId: string | number) {
  const db = await openDatabase();
  const value = await new Promise<FileSystemDirectoryHandle | undefined>((resolve, reject) => {
    const request = db.transaction(STORE_NAME).objectStore(STORE_NAME).get(String(jobId));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return value;
}

export async function ensureDirectoryPermission(handle: FileSystemDirectoryHandle, request = false) {
  const options = { mode: "readwrite" as const };
  if ((await handle.queryPermission(options)) === "granted") return true;
  return request && (await handle.requestPermission(options)) === "granted";
}

export async function verifyWritableDirectory(handle: FileSystemDirectoryHandle) {
  const name = `.isoogh-write-test-${Date.now()}`;
  const file = await handle.getFileHandle(name, { create: true });
  const writable = await file.createWritable();
  await writable.write("ok");
  await writable.close();
  await handle.removeEntry(name);
}
