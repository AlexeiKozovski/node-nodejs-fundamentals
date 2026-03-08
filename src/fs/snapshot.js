import { promises as fs } from 'fs';
import path from 'path';
import {snapshotPath, workspacePath} from "../shared/paths.js";
import {ERROR_MESSAGE} from "../shared/error.js";

const snapshot = async () => {

  let stats;
  try {
    stats = await fs.stat(workspacePath);
  } catch {
    throw new Error(ERROR_MESSAGE);
  }

  if (!stats.isDirectory()) {
    throw new Error(ERROR_MESSAGE);
  }

  const entries = [];

  const walk = async (currentPath, relativeBase = '') => {
    const dirents = await fs.readdir(currentPath, { withFileTypes: true });

    for (const dirent of dirents) {
      const relPath = path.join(relativeBase, dirent.name).replace(/\\/g, '/');
      const fullPath = path.join(currentPath, dirent.name);

      if (dirent.isDirectory()) {
        entries.push({
          path: relPath,
          type: 'directory',
        });
        await walk(fullPath, relPath);
      } else if (dirent.isFile()) {
        const fileStats = await fs.stat(fullPath);
        const data = await fs.readFile(fullPath);

        entries.push({
          path: relPath,
          type: 'file',
          size: fileStats.size,
          content: data.toString('base64'),
        });
      }
    }
  };

  await walk(workspacePath);

  const snapshotData = {
    rootPath: workspacePath,
    entries,
  };

  await fs.writeFile(
      snapshotPath,
    JSON.stringify(snapshotData, null, 2),
    'utf8',
  );
};

await snapshot();
