import { promises as fs } from 'fs';
import path from 'path';
import {snapshotPath, workspaceRestoredPath} from "../shared/paths.js";
import {ERROR_MESSAGE} from "../shared/error.js";

const restore = async () => {

  let snapshotStat;
  try {
    snapshotStat = await fs.stat(snapshotPath);
  } catch {
    throw new Error(ERROR_MESSAGE);
  }

  if (!snapshotStat.isFile()) {
    throw new Error(ERROR_MESSAGE);
  }

  try {
    const restoredStat = await fs.stat(workspaceRestoredPath);
    if (restoredStat) {
      throw new Error(ERROR_MESSAGE);
    }
  } catch (err) {
    if (err && err.code === 'ENOENT') {
    } else if (err instanceof Error && err.message === ERROR_MESSAGE) {
      throw err;
    } else {
      throw new Error(ERROR_MESSAGE);
    }
  }

  const snapshotRaw = await fs.readFile(snapshotPath, 'utf8');
  let snapshot;
  try {
    snapshot = JSON.parse(snapshotRaw);
  } catch {
    throw new Error(ERROR_MESSAGE);
  }

  const entries = Array.isArray(snapshot.entries) ? snapshot.entries : [];

  await fs.mkdir(workspaceRestoredPath, { recursive: true });

  for (const entry of entries) {
    if (!entry || typeof entry.path !== 'string' || typeof entry.type !== 'string') {
      continue;
    }

    const targetPath = path.join(workspaceRestoredPath, entry.path);

    if (entry.type === 'directory') {
      await fs.mkdir(targetPath, { recursive: true });
    } else if (entry.type === 'file') {
      const dirName = path.dirname(targetPath);
      await fs.mkdir(dirName, { recursive: true });

      const contentBase64 = entry.content ?? '';
      const buffer = Buffer.from(contentBase64, 'base64');
      await fs.writeFile(targetPath, buffer);
    }
  }
};

await restore();
