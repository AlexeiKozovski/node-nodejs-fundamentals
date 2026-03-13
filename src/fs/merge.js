import { promises as fs } from 'fs';
import path from 'path';
import {mergedFilePath, partsPath} from "../shared/paths.js";
import {ERROR_MESSAGE} from "../shared/error.js";

const parseFilesArg = () => {
  const args = process.argv.slice(2);
  const idx = args.indexOf('--files');
  if (idx === -1) {
    return null;
  }

  const value = args[idx + 1];
  if (!value) {
    return null;
  }

  return value
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);
};

const merge = async () => {
    console.log('partsPath', partsPath)
  let stats;
  try {
    stats = await fs.stat(partsPath);
  } catch {
    throw new Error(ERROR_MESSAGE);
  }

  if (!stats.isDirectory()) {
    throw new Error(ERROR_MESSAGE);
  }

  const requestedFiles = parseFilesArg();
  let filesToMerge = [];

  if (requestedFiles && requestedFiles.length > 0) {
    for (const fileName of requestedFiles) {
      const fullPath = path.join(partsPath, fileName);
      try {
        const fileStat = await fs.stat(fullPath);
        if (!fileStat.isFile()) {
          throw new Error(ERROR_MESSAGE);
        }
      } catch {
        throw new Error(ERROR_MESSAGE);
      }
      filesToMerge.push(fullPath);
    }
  } else {
    const dirents = await fs.readdir(partsPath, { withFileTypes: true });
    const txtFiles = dirents
      .filter((dirent) => dirent.isFile() && path.extname(dirent.name) === '.txt')
      .map((dirent) => dirent.name)
      .sort((a, b) => a.localeCompare(b));

    if (txtFiles.length === 0) {
      throw new Error(ERROR_MESSAGE);
    }

    filesToMerge = txtFiles.map((name) => path.join(partsPath, name));
  }

  let mergedContent = '';
  for (const filePath of filesToMerge) {
    const content = await fs.readFile(filePath, 'utf8');
    mergedContent += content;
  }

  await fs.writeFile(mergedFilePath, mergedContent, 'utf8');
};

await merge();
