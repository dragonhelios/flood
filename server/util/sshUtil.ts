import sftpClient, {ConnectOptions, FileInfo, FileStats} from 'ssh2-sftp-client';
import path from 'path';
import {existsSync, mkdirSync} from 'fs';
import {remoteDownloadSettings} from '@shared/constants/remoteDownloadOptions';

export interface sftpConnectionSettings {
  sftpHost: string;
  sftpPort: number;
  sftpUser: string;
  sftpPassword: string;
}

export class sshUtil {
  static sftpConnect = async ({...connectionSettings}: sftpConnectionSettings) => {
    const sftp = new sftpClient();

    const connectoptions: ConnectOptions = {
      host: connectionSettings.sftpHost,
      port: connectionSettings.sftpPort,
      username: connectionSettings.sftpUser,
      password: connectionSettings.sftpPassword,
    };

    try {
      await sftp.connect(connectoptions);
      return sftp;
    } catch (error) {
      sftp.end();
      throw error;
    }
  };

  static downloadFile = async (
    {...connectionSettings}: sftpConnectionSettings,
    file: string,
    srcDirectory: string,
    destDirectory: string,
  ): Promise<void> => {
    const src = path.posix.join(srcDirectory, file);
    const dest = path.join(destDirectory, path.normalize(file));
    const destFolderPath = path.dirname(dest);

    if (existsSync(destFolderPath)) {
      mkdirSync(destFolderPath, {recursive: true});
    }

    try {
      const sftp = await sshUtil.sftpConnect(connectionSettings);
      try {
        await sftp.fastGet(src, dest, remoteDownloadSettings);
        sftp.end();
      } catch (err) {
        sftp.end();
        throw err;
      }
    } catch (err) {
      throw err;
    }
  };

  static downloadMultiple = (
    connectionSettings: sftpConnectionSettings,
    files: string[],
    srcDirectory: string,
    destDirectory: string,
    cb?: () => unknown,
  ) => {
    for (const file of files) {
      sshUtil.downloadFile(connectionSettings, file, srcDirectory, destDirectory).then(
        () => {
          if (cb) cb;
        },
        (err) => {
          throw err;
        },
      );
    }
  };

  static readdirSSH = async ({...connectionSettings}: sftpConnectionSettings, path: string): Promise<FileInfo[]> => {
    try {
      const sftp = await sshUtil.sftpConnect(connectionSettings);
      try {
        const dirEnt: FileInfo[] = await sftp.list(path);
        await sftp.end();
        return dirEnt;
      } catch (err) {
        await sftp.end();
        throw err;
      }
    } catch (err) {
      throw err;
    }
  };

  static statSSH = async ({...connectionSettings}: sftpConnectionSettings, path: string): Promise<FileStats> => {
    try {
      const sftp = await sshUtil.sftpConnect(connectionSettings);
      try {
        const stats = await sftp.stat(path);
        await sftp.end();
        return stats;
      } catch (err) {
        await sftp.end();
        throw err;
      }
    } catch (err) {
      throw err;
    }
  };
}
