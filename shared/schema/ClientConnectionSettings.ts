import {literal, number, string, strictObject, union, boolean} from 'zod';
import type {infer as zodInfer} from 'zod';

const baseClientSettingsSchema = strictObject({
  client: literal(''),
  type: literal(''),
  version: literal(1),
  isRemote: boolean(),
  isDefaultDownload: boolean(),
  sftpHost: string(),
  sftpPort: number(),
  sftpUser: string(),
  sftpPassword: string(),
  localPath: string(),
});

const delugeConnectionSettingsSchema = baseClientSettingsSchema.extend({
  client: literal('Deluge'),
  type: literal('rpc'),
  host: string(),
  port: number(),
  username: string(),
  password: string(),
});

export type DelugeConnectionSettings = zodInfer<typeof delugeConnectionSettingsSchema>;

const qBittorrentConnectionSettingsSchema = baseClientSettingsSchema.extend({
  client: literal('qBittorrent'),
  type: literal('web'),
  url: string().url(),
  username: string(),
  password: string(),
});

export type QBittorrentConnectionSettings = zodInfer<typeof qBittorrentConnectionSettingsSchema>;

const rTorrentTCPConnectionSettingsSchema = baseClientSettingsSchema.extend({
  client: literal('rTorrent'),
  type: literal('tcp'),
  host: string(),
  port: number(),
});

export type RTorrentTCPConnectionSettings = zodInfer<typeof rTorrentTCPConnectionSettingsSchema>;

const rTorrentSocketConnectionSettingsSchema = baseClientSettingsSchema.extend({
  client: literal('rTorrent'),
  type: literal('socket'),
  socket: string(),
});

export type RTorrentSocketConnectionSettings = zodInfer<typeof rTorrentSocketConnectionSettingsSchema>;

const rTorrentRPCConnectionSettingsSchema = baseClientSettingsSchema.extend({
  client: literal('rTorrent'),
  type: literal('rpc'),
  url: string().url(),
  username: string(),
  password: string(),
});

export type RTorrentRPCConnectionSettings = zodInfer<typeof rTorrentRPCConnectionSettingsSchema>;

const rTorrentConnectionSettingsSchema = union([
  rTorrentTCPConnectionSettingsSchema,
  rTorrentSocketConnectionSettingsSchema,
  rTorrentRPCConnectionSettingsSchema,
]);

export type RTorrentConnectionSettings = zodInfer<typeof rTorrentConnectionSettingsSchema>;

const transmissionConnectionSettingsSchema = baseClientSettingsSchema.extend({
  client: literal('Transmission'),
  type: literal('rpc'),
  url: string().url(),
  username: string(),
  password: string(),
});

export type TransmissionConnectionSettings = zodInfer<typeof transmissionConnectionSettingsSchema>;

export const clientConnectionSettingsSchema = union([
  delugeConnectionSettingsSchema,
  qBittorrentConnectionSettingsSchema,
  rTorrentConnectionSettingsSchema,
  transmissionConnectionSettingsSchema,
]);

export type ClientConnectionSettings = zodInfer<typeof clientConnectionSettingsSchema>;

export type ClientConnectionFields =
  | 'host'
  | 'port'
  | 'username'
  | 'password'
  | 'isRemote'
  | 'url'
  | 'socket'
  | 'isDefaultDownload'
  | 'sftpHost'
  | 'sftpPort'
  | 'sftpUser'
  | 'sftpPassword'
  | 'localPath';
export type ClientConnectionFieldTypes = string | number | boolean;
