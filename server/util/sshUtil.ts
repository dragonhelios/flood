import sftpClient from 'ssh2-sftp-client';
import path from 'path';
import {ensurePathExists} from '../util/fileUtil';
import {remoteDownloadSettings} from '@shared/constants/remoteDownloadOptions';
import {ClientConnectionSettings} from '@shared/schema/ClientConnectionSettings';

export class sshUtil {
  static sftpConnect = async (connectionSettings: ClientConnectionSettings) => {
    const sftp = new sftpClient();
    const connectoptions: sftpClient.ConnectOptions = {
      host: connectionSettings.sftpHost,
      port: connectionSettings.sftpPort,
      username: connectionSettings.sftpUser,
      password: connectionSettings.sftpPassword,
    };
    try {
      await sftp.connect(connectoptions);
      return sftp;
    } catch (error) {
      throw new Error(error);
    }
  };

  static downloadFile = async (
    connectionSettings: ClientConnectionSettings,
    file: string,
    srcDirectory: string,
    destDirectory: string,
  ): Promise<boolean> => {
    const src = path.posix.join(srcDirectory, file);
    const dest = path.join(destDirectory, path.normalize(file));

    ensurePathExists(dest);

    let sftp: sftpClient | null = null;

    try {
      sftp = await sshUtil.sftpConnect(connectionSettings);
      await sftp.fastGet(src, dest, remoteDownloadSettings);
      await sftp.end();
      return true;
    } catch (err) {
      await sftp?.end();
      return false;
    }
  };

  static downloadMultiple = async (
    connectionSettings: ClientConnectionSettings,
    files: string[],
    srcDirectory: string,
    destDirectory: string,
  ): Promise<boolean> => {
    let result = true;
    const downloaded: string[] = [];

    for (const file of files) {
      try {
        await sshUtil.downloadFile(connectionSettings, file, srcDirectory, destDirectory);
        downloaded.push(file);
      } catch (err) {
        console.log(err);
      }
    }

    if (downloaded.length !== files.length) {
      result = false;
    }

    return result;
  };

  static readdirSSH = async (connectionSettings: ClientConnectionSettings, path: string) => {
    let sftp: sftpClient | null = null;
		try {
    sftp = await sshUtil.sftpConnect(connectionSettings);
    const dirContent = await sftp.list(path);
    sftp.end();
    return dirContent;
		} catch (error) {
			throw new Error(error)
		}
  };

  static statSSH = async (connectionSettings: ClientConnectionSettings, path: string) => {
    let sftp: sftpClient | null = null;
    sftp = await sshUtil.sftpConnect(connectionSettings);
    const stat = await sftp.stat(path);
    sftp.end();
    return stat;
  };
}
