import { promises as fs } from 'fs';
import path from 'path';
import {workspacePath} from "../shared/paths.js";
import {ERROR_MESSAGE} from "../shared/error.js";

const parseExtension = () => {
  const args = process.argv.slice(2);
  const extIndex = args.indexOf('--ext');

  if (extIndex !== -1 && args[extIndex + 1]) {
    const rawExt = args[extIndex + 1];
    return rawExt.startsWith('.') ? rawExt : `.${rawExt}`;
  }

  return '.txt';
};

const findByExt = async () => {

  let stats;
  try {
    stats = await fs.stat(workspacePath);
  } catch {
    throw new Error(ERROR_MESSAGE);
  }

  if (!stats.isDirectory()) {
    throw new Error(ERROR_MESSAGE);
  }

  const targetExt = parseExtension();
  const foundFiles = [];

  const walk = async (currentPath, relativeBase = '') => {
    const dirents = await fs.readdir(currentPath, { withFileTypes: true });

    for (const dirent of dirents) {
      const relPath = path.join(relativeBase, dirent.name).replace(/\\/g, '/');
      const fullPath = path.join(currentPath, dirent.name);

      if (dirent.isDirectory()) {
        await walk(fullPath, relPath);
      } else if (dirent.isFile()) {
        if (path.extname(dirent.name) === targetExt) {
          foundFiles.push(relPath);
        }
      }
    }
  };

  await walk(workspacePath);

  foundFiles.sort((a, b) => a.localeCompare(b));
  for (const file of foundFiles) {
    console.log(file);
  }
};

await findByExt();
