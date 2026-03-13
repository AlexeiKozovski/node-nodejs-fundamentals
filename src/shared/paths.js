import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const srcPath = path.dirname(__dirname);
export const projectRootPath = path.dirname(srcPath);
export const workspacePath = path.join(projectRootPath, 'workspace');
export const workspaceRestoredPath = path.join(projectRootPath, 'workspace_restored');
export const snapshotPath = path.join(workspacePath, 'snapshot.json');
export const partsPath = path.join(workspacePath, 'parts');
export const mergedFilePath = path.join(workspacePath, 'merged.txt');
export const checksumsFilePath = path.join(workspacePath, 'checksums.json');

