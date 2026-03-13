import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import {checksumsFilePath, workspacePath} from '../shared/paths.js';
import {ERROR_MESSAGE} from '../shared/error.js';

const verify = async () => {
  try {
    await fsPromises.access(checksumsFilePath, fs.constants.F_OK);
  } catch {
    throw new Error(ERROR_MESSAGE);
  }

  let checksumsContent;
  try {
    checksumsContent = await fsPromises.readFile(checksumsFilePath, 'utf-8');
  } catch {
    throw new Error(ERROR_MESSAGE);
  }

  let checksums;
  try {
    checksums = JSON.parse(checksumsContent);
  } catch {
    throw new Error(ERROR_MESSAGE);
  }

  const entries = Object.entries(checksums);

  await Promise.all(
    entries.map(async ([fileName, expectedHash]) => {
      const filePath = path.join(workspacePath, fileName);
      const hash = crypto.createHash('sha256');
      let actualHash = '';

      try {
        await new Promise((resolve, reject) => {
          const readStream = fs.createReadStream(filePath);

          readStream.on('data', (chunk) => {
            hash.update(chunk);
          });

          readStream.on('error', (err) => {
            reject(err);
          });

          readStream.on('end', () => {
            resolve();
          });
        });

        actualHash = hash.digest('hex');
      } catch {
        actualHash = '';
      }

      const status = actualHash === expectedHash ? 'OK' : 'FAIL';
      console.log(`${fileName} — ${status}`);
    }),
  );
};

await verify();
