jest.mock("./backupService", () => ({
  ackBackupFile: jest.fn(), backupAction: jest.fn(), fetchProtectedStream: jest.fn(), fetchStorageStream: jest.fn(), getNextBackupFile: jest.fn(), retryAfterMilliseconds: jest.fn(() => 0),
}));

import { streamToFile } from "./backupController";
import { ensureDirectoryPermission, supportsDirectoryPicker, verifyWritableDirectory } from "./backupDirectoryStore";

const responseFrom = (...chunks: Uint8Array[]) => {
  let index = 0;
  return { body: { getReader: () => ({
    read: async () => index < chunks.length ? { done: false, value: chunks[index++] } : { done: true },
    cancel: jest.fn().mockResolvedValue(undefined),
  }) } } as unknown as Response;
};

describe("local backup streaming invariants", () => {
  it("streams chunks without calling Blob and closes only after all writes", async () => {
    const events: string[] = [];
    const writable = {
      write: jest.fn(async (chunk) => events.push(`write:${chunk.byteLength}`)),
      close: jest.fn(async () => events.push("close")),
      abort: jest.fn(),
    };
    const handle = { createWritable: jest.fn(async () => writable) } as unknown as FileSystemFileHandle;
    const blobSpy = jest.spyOn(Response.prototype, "blob");

    const bytes = await streamToFile(responseFrom(new Uint8Array(2), new Uint8Array(3)), handle, new AbortController().signal);

    expect(bytes).toBe(5);
    expect(events).toEqual(["write:2", "write:3", "close"]);
    expect(blobSpy).not.toHaveBeenCalled();
    blobSpy.mockRestore();
  });

  it("aborts a partial writable when the drive disappears during write", async () => {
    const failure = new DOMException("drive removed", "NotFoundError");
    const writable = {
      write: jest.fn().mockRejectedValue(failure),
      close: jest.fn(),
      abort: jest.fn().mockResolvedValue(undefined),
    };
    const handle = { createWritable: jest.fn(async () => writable) } as unknown as FileSystemFileHandle;
    await expect(streamToFile(responseFrom(new Uint8Array(1)), handle, new AbortController().signal)).rejects.toBe(failure);
    expect(writable.abort).toHaveBeenCalled();
    expect(writable.close).not.toHaveBeenCalled();
  });
});

describe("directory permission", () => {
  it("feature-detects the directory picker", () => {
    expect(supportsDirectoryPicker({ showDirectoryPicker: undefined })).toBe(false);
    expect(supportsDirectoryPicker({ showDirectoryPicker: jest.fn() })).toBe(true);
  });
  it("reports denied permission", async () => {
    const handle = {
      queryPermission: jest.fn().mockResolvedValue("denied"),
      requestPermission: jest.fn().mockResolvedValue("denied"),
    } as unknown as FileSystemDirectoryHandle;
    await expect(ensureDirectoryPermission(handle, true)).resolves.toBe(false);
  });

  it("creates, closes and deletes the writable probe", async () => {
    const close = jest.fn();
    const removeEntry = jest.fn();
    const handle = {
      getFileHandle: jest.fn().mockResolvedValue({ createWritable: jest.fn().mockResolvedValue({ write: jest.fn(), close }) }),
      removeEntry,
    } as unknown as FileSystemDirectoryHandle;
    await verifyWritableDirectory(handle);
    expect(close.mock.invocationCallOrder[0]).toBeLessThan(removeEntry.mock.invocationCallOrder[0]);
  });
});
