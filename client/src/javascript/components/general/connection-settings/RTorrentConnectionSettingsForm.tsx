import {FC, useEffect, useState} from 'react';
import {Trans, useLingui} from '@lingui/react';

import {Checkbox, FormError, FormGroup, FormRow, FormRowGroup, Radio, Textbox} from '@client/ui';

import type {
  ClientConnectionFields,
  ClientConnectionFieldTypes,
  ClientConnectionSettings,
  RTorrentConnectionSettings,
  RTorrentRPCConnectionSettings,
  RTorrentSocketConnectionSettings,
  RTorrentTCPConnectionSettings,
} from '@shared/schema/ClientConnectionSettings';
import RemoteConnectionSettingsForm from './RemoteConnectionSettingsForm';

export interface RTorrentConnectionSettingsProps {
  onSettingsChange: (settings: RTorrentConnectionSettings | null) => void;
  initialSettings?: RTorrentConnectionSettings;
}

const RTorrentConnectionSettingsForm: FC<RTorrentConnectionSettingsProps> = ({
  onSettingsChange,
  initialSettings,
}: RTorrentConnectionSettingsProps) => {
  const {i18n} = useLingui();
  const [type, setType] = useState<'tcp' | 'socket' | 'rpc'>('rpc');
  const [settings, setSettings] = useState<RTorrentConnectionSettings>({
    client: 'rTorrent',
    type: 'rpc',
    version: 1,
    url: '',
    username: '',
    password: '',
    isRemote: false,
    isDefaultDownload: false,
    sftpHost: '',
    sftpPort: 22,
    sftpUser: '',
    sftpPassword: '',
    localPath: '',
  });

  useEffect(() => {
    if (initialSettings) {
      setType(initialSettings?.type);
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  const handleFormChange = (field: ClientConnectionFields, value: ClientConnectionFieldTypes): void => {
    let newSettings: RTorrentConnectionSettings | null = null;

    if (type === 'rpc') {
      newSettings = {
        client: 'rTorrent',
        type: 'rpc',
        version: 1,
        url: (settings as RTorrentRPCConnectionSettings)?.url ?? '',
        username: (settings as RTorrentRPCConnectionSettings)?.username ?? '',
        password: (settings as RTorrentRPCConnectionSettings)?.password ?? '',
        isRemote: (settings as RTorrentRPCConnectionSettings)?.isRemote ?? false,
        isDefaultDownload: (settings as RTorrentRPCConnectionSettings)?.isDefaultDownload ?? false,
        sftpHost: (settings as RTorrentRPCConnectionSettings)?.sftpHost ?? '',
        sftpPort: (settings as RTorrentRPCConnectionSettings)?.sftpPort ?? 22,
        sftpUser: (settings as RTorrentRPCConnectionSettings)?.sftpUser ?? '',
        sftpPassword: (settings as RTorrentRPCConnectionSettings)?.sftpPassword ?? '',
        localPath: (settings as RTorrentRPCConnectionSettings)?.localPath ?? '',
        ...{[field]: value},
      } as RTorrentRPCConnectionSettings;
    }

    if (type === 'tcp') {
      newSettings = {
        client: 'rTorrent',
        type: 'tcp',
        version: 1,
        host: (settings as RTorrentTCPConnectionSettings)?.host ?? '',
        port: (settings as RTorrentTCPConnectionSettings)?.port ?? 5000,
        isRemote: (settings as RTorrentTCPConnectionSettings)?.isRemote ?? false,
        isDefaultDownload: (settings as RTorrentTCPConnectionSettings)?.isDefaultDownload ?? false,
        sftpHost: (settings as RTorrentTCPConnectionSettings)?.sftpHost ?? '',
        sftpPort: (settings as RTorrentTCPConnectionSettings)?.sftpPort ?? 22,
        sftpUser: (settings as RTorrentTCPConnectionSettings)?.sftpUser ?? '',
        sftpPassword: (settings as RTorrentTCPConnectionSettings)?.sftpPassword ?? '',
        localPath: (settings as RTorrentTCPConnectionSettings)?.localPath ?? '',
        ...{[field]: value},
      } as RTorrentTCPConnectionSettings;
    }

    if (type === 'socket') {
      newSettings = {
        client: 'rTorrent',
        type: 'socket',
        version: 1,
        socket: (settings as RTorrentSocketConnectionSettings)?.socket ?? '',
        isRemote: (settings as RTorrentSocketConnectionSettings)?.isRemote ?? false,
        isDefaultDownload: (settings as RTorrentSocketConnectionSettings)?.isDefaultDownload ?? false,
        sftpHost: (settings as RTorrentSocketConnectionSettings)?.sftpHost ?? '',
        sftpPort: (settings as RTorrentSocketConnectionSettings)?.sftpPort ?? 22,
        sftpUser: (settings as RTorrentSocketConnectionSettings)?.sftpUser ?? '',
        sftpPassword: (settings as RTorrentSocketConnectionSettings)?.sftpPassword ?? '',
        localPath: (settings as RTorrentSocketConnectionSettings)?.localPath ?? '',
        ...{[field]: value},
      } as RTorrentSocketConnectionSettings;
    }
    onSettingsChange(newSettings);
    setSettings(newSettings as RTorrentConnectionSettings);
  };

  const typeInputControlsTCP = (
    <FormRowGroup>
      <FormRow>
        <FormError>{i18n._('connection.settings.rtorrent.type.tcp.warning')}</FormError>
      </FormRow>
      <FormRow>
        <Textbox
          onChange={(e) => handleFormChange('host', e.target.value)}
          id="host"
          label={<Trans id="connection.settings.rtorrent.host" />}
          placeholder={i18n._('connection.settings.rtorrent.host.input.placeholder')}
          value={(settings as RTorrentTCPConnectionSettings)?.host ?? ''}
        />
        <Textbox
          onChange={(e) => handleFormChange('port', Number(e.target.value))}
          id="port"
          label={<Trans id="connection.settings.rtorrent.port" />}
          placeholder={i18n._('connection.settings.rtorrent.port.input.placeholder')}
          value={(settings as RTorrentTCPConnectionSettings)?.port ?? ''}
        />
      </FormRow>
    </FormRowGroup>
  );

  const typeInputControlsRPC = (
    <FormRowGroup>
      <FormRow>
        <Textbox
          onChange={(e) => handleFormChange('url', e.target.value)}
          id="url"
          label={<Trans id="connection.settings.rtorrent.url" />}
          placeholder={i18n._('connection.settings.rtorrent.url.input.placeholder')}
          value={(settings as RTorrentRPCConnectionSettings)?.url ?? ''}
        />
      </FormRow>
      <FormRow>
        <Textbox
          onChange={(e) => handleFormChange('username', e.target.value)}
          id="rtorrent-username"
          label={<Trans id="connection.settings.rtorrent.username" />}
          placeholder={i18n._('connection.settings.rtorrent.username.input.placeholder')}
          value={(settings as RTorrentRPCConnectionSettings)?.username ?? ''}
        />
        <Textbox
          onChange={(e) => handleFormChange('password', e.target.value)}
          id="rtorrent-password"
          label={<Trans id="connection.settings.rtorrent.password" />}
          placeholder={i18n._('connection.settings.rtorrent.password.input.placeholder')}
          value={(settings as RTorrentRPCConnectionSettings)?.password ?? ''}
          type="password"
        />
      </FormRow>
    </FormRowGroup>
  );

  const typeInputControlsSocket = (
    <FormRow>
      <Textbox
        onChange={(e) => handleFormChange('socket', e.target.value)}
        id="socket"
        label={<Trans id="connection.settings.rtorrent.socket" />}
        placeholder={i18n._('connection.settings.rtorrent.socket.input.placeholder')}
        value={(settings as RTorrentSocketConnectionSettings)?.socket ?? ''}
      />
    </FormRow>
  );
  const typeInputControls = () => {
    if (type === 'tcp') {
      return typeInputControlsTCP;
    }

    if (type === 'socket') {
      return typeInputControlsSocket;
    }

    return typeInputControlsRPC;
  };

  return (
    <FormRow>
      <FormGroup>
        <FormRow>
          <Checkbox
            checked={(settings as RTorrentConnectionSettings)?.isRemote ?? false}
            id="remoteConnection"
            onClick={() => handleFormChange('isRemote', !(settings as RTorrentConnectionSettings).isRemote)}
            matchTextboxHeight
            grow={false}>
            <Trans id="connection.settings.sftpsettings.remoteclient" />
          </Checkbox>
        </FormRow>
        <FormRow>
          <FormGroup label={i18n._('connection.settings.rtorrent.type')}>
            <FormRow>
              <Radio
                onClick={() => {
                  setType('rpc');
                }}
                groupID="type"
                id="rpc"
                grow={false}
                checked={type === 'rpc'}>
                <Trans id="connection.settings.rtorrent.type.rpc" />
              </Radio>
              <Radio
                onClick={() => {
                  setType('socket');
                }}
                groupID="type"
                id="socket"
                grow={false}
                checked={type === 'socket'}>
                <Trans id="connection.settings.rtorrent.type.socket" />
              </Radio>
              <Radio
                onClick={() => {
                  setType('tcp');
                }}
                groupID="type"
                id="tcp"
                grow={false}
                checked={type === 'tcp'}>
                <Trans id="connection.settings.rtorrent.type.tcp" />
              </Radio>
            </FormRow>
          </FormGroup>
        </FormRow>
        {typeInputControls()}
        {(settings as RTorrentConnectionSettings).isRemote && (
          <RemoteConnectionSettingsForm
            handleFormChange={(field, value) => handleFormChange(field, value)}
            settings={settings as ClientConnectionSettings}
          />
        )}
      </FormGroup>
    </FormRow>
  );
};

(RTorrentConnectionSettingsForm as FC<RTorrentConnectionSettingsProps>).defaultProps = {
  initialSettings: {
    client: 'rTorrent',
    type: 'rpc',
    version: 1,
    url: '',
    username: '',
    password: '',
    isRemote: false,
    isDefaultDownload: false,
    sftpHost: '',
    sftpPort: 22,
    sftpUser: '',
    sftpPassword: '',
    localPath: '',
  },
  onSettingsChange: undefined,
};
export default RTorrentConnectionSettingsForm;
