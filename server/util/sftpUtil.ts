import sftp, {FileInfo, FileStats} from 'ssh2-sftp-client';
import fs from 'fs-extra';
import path from 'path';

export interface TransferOptions {
  concurrency?: number;
  chunkSize?: number;
  step?: (totalTransferred: number, chunk: number, total: number) => void;
}

export interface sftpConnectionOptions {
  host: string;
  port: number;
  username: string;
  password: string;
  retries?: number;
  transferOptions?: TransferOptions;
}

export default class SFTPConnection {
  private sftp: sftp;
  private connected: boolean;
  private connSettings: sftpConnectionOptions | undefined;

  constructor() {
    this.connected = false;
    this.sftp = new sftp();
  }

  public connect = async (connSettings: sftpConnectionOptions) => {
    try {
      if (this.connected) {
        await this.sftp.end();
      }

      this.connSettings = connSettings;

      try {
        await this.sftp.connect(this.connSettings);
        this.connected = true;
        return this;
      } catch (err) {
        throw new Error(`SFTP: ${err.message}`);
      }
    } catch (err) {
      throw err;
    }
  };

  public downloadDir = async (source: string, destination: string) => {
    try {
      if (
        this.hasConnection((err) => {
          throw err;
        })
      ) {
        await this.sftp?.downloadDir(source, destination);

        return source;
      }
    } catch (err) {
      throw err;
    }
  };

  public downloadFile = async (source: string, destination: string) => {
    try {
      this.hasConnection((err) => {
        throw err;
      });

      if (!(await this.sftpExists(source, '-'))) throw new Error('SFTP download: Source file does not exist');

      await this.sftp?.fastGet(source, destination, this.connSettings?.transferOptions);

      return source;
    } catch (err) {
      throw err;
    }
  };

  public downloadMultipleFiles = async (sourceFiles: string[], destination: string) => {
    try {
      this.hasConnection((err) => {
        throw err;
      });

      const tempDir = path.join(destination, `flood_tempDL_${new Date().getTime()}`);

      this.ensureLocalPathExists(tempDir);

      for (const sourceFile of sourceFiles) {
        const destfile = path.join(tempDir, path.basename(sourceFile));
        await this.downloadFile(sourceFile, destfile);
      }

      await this.moveFilesLocal(tempDir, destination);

      if (this.folderPathExistsLocal(tempDir) && fs.readdirSync(tempDir).length === 0) {
        fs.rmdirSync(tempDir);
      }
    } catch (err) {
      throw err;
    }
  };

  public end = async () => {
    if (this.hasConnection()) {
      await this.sftp.end();
      this.connected = false;
    }
  };

  private ensureLocalPathExists = (folderPath: string): void => {
    if (!this.folderPathExistsLocal(folderPath)) {
      fs.mkdirSync(folderPath, {recursive: true});
    }
  };

  private ensureSFTPPathExists = async (folderPath: string) => {
    if (!(await this.folderPathExistsSFTP(folderPath))) {
      await this.sftp.mkdir(folderPath, true);
    }
  };

  private folderPathExistsLocal = (folderPath: string) => {
    return fs.existsSync(folderPath);
  };

  private folderPathExistsSFTP = async (folderPath: string) => {
    return await this.sftpExists(folderPath, 'd');
  };

  public hasConnection(reject?: (err: Error) => unknown): boolean {
    if (!this.connected) {
      const newError = new Error('SFTP Has Connection: No SFTP/SFTP connection available');
      if (reject) {
        reject(newError);
        return false;
      } else {
        throw newError;
      }
    }
    return true;
  }

  private moveFilesLocal = async (source: string, destination: string) => {
    try {
      if (!this.folderPathExistsLocal(source)) throw new Error('SFTP Move Local: Source path does not exist');

      const dirContent = fs.readdirSync(source).filter((item) => !(item === '.' || item === '..'));

      if (dirContent.length === 0) throw new Error('SFTP Move Local: Nothing to move');

      this.ensureLocalPathExists(destination);

      dirContent.forEach((item: string) => {
        fs.moveSync(path.join(source, item), path.join(destination, item), {overwrite: true});
      });
      return true;
    } catch (err) {
      throw err;
    }
  };

  public moveFilesSFTP = async (source: string, destination: string) => {
    try {
      this.hasConnection((err) => {
        throw err;
      });

      if (!(await this.sftpExists(source, 'd'))) throw new Error('SFTP Move Files: Source path does not exist');

      const dirContent = (await this.readdirSFTP(source)).filter((item) => !(item.name === '.' || item.name === '..'));

      if (dirContent.length === 0) throw new Error('SFTP Move Files: Nothing to move');

      await this.ensureSFTPPathExists(destination);

      dirContent.forEach(async (item: FileInfo) => {
        await this.sftp.rename(path.join(source, item.name), path.join(destination, item.name));
      });
    } catch (err) {
      throw err;
    }
  };

  public readdirSFTP = async (path: string): Promise<FileInfo[]> => {
    try {
      this.hasConnection((err) => {
        throw err;
      });

      return await this.sftp.list(path);
    } catch (err) {
      throw err;
    }
  };

  public sftpExists = async (filePath: string, type?: '-' | 'l' | 'd'): Promise<boolean> => {
    try {
      this.hasConnection((err) => {
        throw err;
      });

      const dirList = await this.sftp.list(path.dirname(filePath));
      const result = dirList.find((fileEntry) => {
        return fileEntry.name === path.basename(filePath) && type ? fileEntry.type === type : true;
      });

      return result ? true : false;
    } catch (err) {
      throw err;
    }
  };

  public statSFTP = async (path: string): Promise<FileStats> => {
    try {
      this.hasConnection((err) => {
        throw err;
      });

      return await this.sftp.stat(path);
    } catch (err) {
      throw err;
    }
  };

  public uploadDir = async (source: string, destination: string) => {
    try {
      this.hasConnection((err) => {
        throw err;
      });

      await this.ensureSFTPPathExists(destination);
      await this.sftp?.uploadDir(source, destination);

      return source;
    } catch (err) {
      throw err;
    }
  };

  public uploadFile = async (source: string, destination: string) => {
    try {
      this.hasConnection((err) => {
        throw err;
      });

      if (!fs.existsSync(source)) throw new Error('SFTP upload: Source file does not exist');

      await this.sftp?.fastPut(source, destination, this.connSettings?.transferOptions);

      return source;
    } catch (err) {
      throw err;
    }
  };

  public uploadMultipleFiles = async (sourceFiles: string[], destination: string) => {
    try {
      this.hasConnection((err) => {
        throw err;
      });

      const tempDir = path.join(destination, `flood_tempDL_${new Date().getTime()}`);

      await this.ensureSFTPPathExists(tempDir);

      for (const sourceFile of sourceFiles) {
        const destFile = path.join(tempDir, path.basename(sourceFile));
        await this.uploadFile(sourceFile, destFile);
      }

      await this.moveFilesSFTP(tempDir, destination);

      if ((await this.folderPathExistsSFTP(tempDir)) && (await this.sftp.list(tempDir)).length === 0) {
        await this.sftp.rmdir(tempDir);
      }
    } catch (err) {
      throw err;
    }
  };
}
