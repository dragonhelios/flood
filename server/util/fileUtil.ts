import {ClientConnectionSettings} from '@shared/schema/ClientConnectionSettings';
import fs from 'fs-extra';
import {homedir} from 'os';
import path from 'path';

import config from '../../config';
import {sshUtil} from './sshUtil';

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
  const folderPath = path.dirname(fullPath);

  return fs.existsSync(folderPath);
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

export const readdir = async (resolvedPath: string, connectionSettings?: ClientConnectionSettings) => {
  const dirContent: Array<{
    name: string;
    isDirectory: boolean;
    isFile: boolean;
    isSymbolicLink: boolean;
  }> = [];

  if (connectionSettings?.isRemote) {
    await sshUtil.readdirSSH(connectionSettings, resolvedPath).then((data) =>
      data.forEach((item) => {
        dirContent.push({
          name: item.name,
          isDirectory: item.type === 'd',
          isFile: item.type === '-',
          isSymbolicLink: item.type === 'l',
        });
      }),
    );

    return dirContent;
  }

  fs.readdirSync(resolvedPath, {withFileTypes: true}).map((item) =>
    dirContent.push({
      name: item.name,
      isDirectory: item.isDirectory(),
      isFile: item.isFile(),
      isSymbolicLink: item.isSymbolicLink(),
    }),
  );

  return dirContent;
};

export const statsSync = (resolvedPath: string, connectionSettings?: ClientConnectionSettings) => {
  let stat: {
    mode: number;
    uid: number; // user ID
    gid: number; // group ID
    size: number; // file size
    atimeMs: number; // Last access time. milliseconds
    mtimeMs: number; // last modify time. milliseconds
    isDirectory: boolean; // true if object is a directory
    isFile: boolean; // true if object is a file
    isBlockDevice: boolean; // true if object is a block device
    isCharacterDevice: boolean; // true if object is a character device
    isSymbolicLink: boolean; // true if object is a symbolic link
    isFIFO: boolean; // true if object is a FIFO
    isSocket: boolean; // true if object is a socket
  } | null = null;

  if (connectionSettings?.isRemote) {
    sshUtil.statSSH(connectionSettings, resolvedPath).then((data) => {
      stat = {
        mode: data.mode,
        uid: data.uid,
        gid: data.gid,
        size: data.size,
        atimeMs: data.accessTime,
        mtimeMs: data.modifyTime,
        isDirectory: data.isDirectory,
        isFile: data.isFile,
        isBlockDevice: data.isBlockDevice,
        isCharacterDevice: data.isCharacterDevice,
        isSymbolicLink: data.isSymbolicLink,
        isFIFO: data.isFIFO,
        isSocket: data.isSocket,
      };
    });

    return stat;
  }

  const fsStat = fs.statSync(resolvedPath);

  stat = {
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

  return stat;
};
