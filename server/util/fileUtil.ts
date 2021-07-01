import fs from 'fs-extra';
import {homedir} from 'os';
import path from 'path';

import config from '../../config';
import SFTPConnection from './sftpUtil';

export const accessDeniedError = () => {
  const error = new Error('Permission denied') as NodeJS.ErrnoException;
  error.code = 'EACCES';
  return error;
};

export const fileNotFoundError = () => {
  const error = new Error('No such file or directory') as NodeJS.ErrnoException;
  error.code = 'ENOENT';
  return error;
};

export const isAllowedPath = (resolvedPath: string) => {
  if (config.allowedPaths == null) {
    return true;
  }

  let realPath: string | null = null;
  let parentPath: string = resolvedPath;
  while (realPath == null) {
    try {
      realPath = fs.realpathSync(parentPath);
    } catch (e) {
      if (e.code === 'ENOENT') {
        parentPath = path.resolve(parentPath, '..');
      } else {
        return false;
      }
    }
  }

  return config.allowedPaths.some((allowedPath) => {
    if (realPath?.startsWith(allowedPath)) {
      return true;
    }
    return false;
  });
};

export const sanitizePath = (input?: string): string => {
  if (typeof input !== 'string') {
    throw accessDeniedError();
  }

  // eslint-disable-next-line no-control-regex
  const controlRe = /[\x00-\x1f\x80-\x9f]/g;

  return path.resolve(input.replace(/^~/, homedir()).replace(controlRe, ''));
};

export const folderPathExists = (fullPath: string): boolean => {
  return fs.existsSync(path.dirname(fullPath));
};

export const ensurePathExists = (fullPath: string): void => {
  const folderPath = path.dirname(fullPath);

  if (folderPathExists(folderPath)) {
    fs.mkdirSync(folderPath, {recursive: true});
  }
};

export const moveFiles = (source: string, destination: string) => {
  if (!fs.existsSync(source)) return;

  let dirContent = fs.readdirSync(source).filter((item) => !(item === '.' || item === '..'));

  if (dirContent.length === 0) return;

  ensurePathExists(destination);

  dirContent.forEach((item: string) => {
    fs.moveSync(path.join(source, item), path.join(destination, item), {overwrite: true});
  });

  if (folderPathExists(source)) {
    dirContent = fs.readdirSync(source).filter((item) => !(item === '.' || item === '..'));

    if (dirContent.length === 0) {
      fs.rmdirSync(source, {recursive: true});
    }
  }
};

export const readdirUtil = async (
  resolvedPath: string,
  sftpClient?: SFTPConnection,
): Promise<{name: string; isDirectory: boolean; isFile: boolean; isSymbolicLink: boolean}[]> => {
  try {
    if (sftpClient) {
      return (await sftpClient.readdirSFTP(resolvedPath)).map((item) => {
        return {
          name: item.name,
          isDirectory: item.type === 'd',
          isFile: item.type === '-',
          isSymbolicLink: item.type === 'l',
        };
      });
    }

    return fs.readdirSync(resolvedPath, {withFileTypes: true}).map((item) => {
      return {
        name: item.name,
        isDirectory: item.isDirectory(),
        isFile: item.isFile(),
        isSymbolicLink: item.isSymbolicLink(),
      };
    });
  } catch (err) {
    throw err;
  }
};

export const statUtil = async (resolvedPath: string, sftpClient?: SFTPConnection) => {
  try {
    if (sftpClient) {
      const stat = await sftpClient.statSFTP(resolvedPath);

      return {
        mode: stat.mode,
        uid: stat.uid,
        gid: stat.gid,
        size: stat.size,
        atimeMs: stat.accessTime,
        mtimeMs: stat.modifyTime,
        isDirectory: stat.isDirectory,
        isFile: stat.isFile,
        isBlockDevice: stat.isBlockDevice,
        isCharacterDevice: stat.isCharacterDevice,
        isSymbolicLink: stat.isSymbolicLink,
        isFIFO: stat.isFIFO,
        isSocket: stat.isSocket,
      };
    }

    const fsStat = fs.statSync(resolvedPath);

    return {
      mode: fsStat.mode,
      uid: fsStat.uid,
      gid: fsStat.gid,
      size: fsStat.size,
      atimeMs: fsStat.atimeMs,
      mtimeMs: fsStat.mtimeMs,
      isDirectory: fsStat.isDirectory(),
      isFile: fsStat.isFile(),
      isBlockDevice: fsStat.isBlockDevice(),
      isCharacterDevice: fsStat.isCharacterDevice(),
      isSymbolicLink: fsStat.isSymbolicLink(),
      isFIFO: fsStat.isFIFO(),
      isSocket: fsStat.isSocket(),
    };
  } catch (err) {
    throw err;
  }
};
