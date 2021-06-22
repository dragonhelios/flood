import type {NetConnectOpts} from 'net';

import type {
  RTorrentConnectionSettings,
  RTorrentRPCConnectionSettings, RTorrentSocketConnectionSettings,
  RTorrentTCPConnectionSettings,
} from '@shared/schema/ClientConnectionSettings';

import {methodCallJSON, methodCallXML} from './util/scgiUtil';
import {sanitizePath} from '../../util/fileUtil';

import type {MultiMethodCalls} from './util/rTorrentMethodCallUtil';
import {sendXmlRPCMethodCall} from './util/XMLRPCUtil';

type MethodCallParameters = Array<string | Buffer | MultiMethodCalls>;

class ClientRequestManager {
  connectionSettings: RTorrentConnectionSettings;
  isJSONCapable = false;
  isRequestPending = false;
  lastResponseTimestamp = 0;
  pendingRequests: Array<{
    methodName: string;
    parameters: MethodCallParameters;
    resolve: (value?: Record<string, string>) => void;
    reject: (error?: NodeJS.ErrnoException) => void;
  }> = [];

  constructor(connectionSettings: RTorrentConnectionSettings) {
    if (connectionSettings.type === 'socket') {
      this.connectionSettings = {
        ...connectionSettings,
        socket: sanitizePath(connectionSettings.socket),
      };
    } else {
      this.connectionSettings = connectionSettings;
    }
  }

  handleRequestEnd() {
    this.isRequestPending = false;

    // We avoid initiating any deferred requests until at least 250ms have
    // since the previous response.
    const currentTimestamp = Date.now();
    const timeSinceLastResponse = currentTimestamp - this.lastResponseTimestamp;

    if (timeSinceLastResponse <= 250) {
      const delay = 250 - timeSinceLastResponse;
      setTimeout(this.sendDeferredMethodCall, delay);
      this.lastResponseTimestamp = currentTimestamp + delay;
    } else {
      this.sendDeferredMethodCall();
      this.lastResponseTimestamp = currentTimestamp;
    }
  }

  sendDeferredMethodCall = () => {
    const nextRequest = this.pendingRequests.shift();
    if (nextRequest == null) {
      return;
    }

    this.isRequestPending = true;
    this.sendMethodCall(nextRequest.methodName, nextRequest.parameters).then(nextRequest.resolve, nextRequest.reject);
  };

  sendMethodCall = (methodName: string, parameters: MethodCallParameters) => {
    const connectionType = this.connectionSettings.type;

    if (connectionType === 'rpc') {
      return this.sendMethodCallRPC(methodName, parameters);
    }

    const connectionOptions: NetConnectOpts =
      connectionType === 'socket'
        ? {
            path: (this.connectionSettings as RTorrentSocketConnectionSettings).socket,
          }
        : {
            host: (this.connectionSettings as RTorrentTCPConnectionSettings).host,
            port: (this.connectionSettings as RTorrentTCPConnectionSettings).port,
          };

    const methodCall = this.isJSONCapable
      ? methodCallJSON(connectionOptions, methodName, parameters)
      : methodCallXML(connectionOptions, methodName, parameters);

    return methodCall.then(
      (response) => {
        this.handleRequestEnd();
        return response;
      },
      (error) => {
        this.handleRequestEnd();
        throw error;
      },
    );
  };

  sendMethodCallRPC = (methodName: string, parameters: MethodCallParameters) => {
    const connectionOptionsRPC: {url: string; username: string; password: string} = {
      url: (this.connectionSettings as RTorrentRPCConnectionSettings).url,
      username: (this.connectionSettings as RTorrentRPCConnectionSettings).username,
      password: (this.connectionSettings as RTorrentRPCConnectionSettings).password,
    };

    const methodCall = sendXmlRPCMethodCall(connectionOptionsRPC, methodName, parameters);

    return methodCall.then(
      (response) => {
        this.handleRequestEnd();
        return response;
      },
      (error) => {
        this.handleRequestEnd();
        throw error;
      },
    );
  };

  methodCall = (methodName: string, parameters: MethodCallParameters) => {
    // We only allow one request at a time.
    if (this.isRequestPending) {
      return new Promise(
        (resolve: (value?: Record<string, string>) => void, reject: (error?: NodeJS.ErrnoException) => void) => {
          this.pendingRequests.push({
            methodName,
            parameters,
            resolve,
            reject,
          });
        },
      );
    }
    this.isRequestPending = true;
    return this.sendMethodCall(methodName, parameters);
  };
}

export default ClientRequestManager;
