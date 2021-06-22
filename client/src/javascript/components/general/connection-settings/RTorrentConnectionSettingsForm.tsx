import {FC, useEffect, useState} from 'react';
import {Trans, useLingui} from '@lingui/react';

import {FormError, FormGroup, FormRow, FormRowGroup, Radio, Textbox} from '@client/ui';

import type {
  RTorrentConnectionSettings,
  RTorrentRPCConnectionSettings, RTorrentSocketConnectionSettings,
  RTorrentTCPConnectionSettings,
} from '@shared/schema/ClientConnectionSettings';

export interface RTorrentConnectionSettingsProps {
  onSettingsChange: (settings: RTorrentConnectionSettings | null) => void;
  initialSettings?: RTorrentConnectionSettings | null;
}

const RTorrentConnectionSettingsForm: FC<RTorrentConnectionSettingsProps> = ({
                                                                               onSettingsChange,
                                                                               initialSettings = null,
                                                                             }: RTorrentConnectionSettingsProps) => {
  const {i18n} = useLingui();
  const [type, setType] = useState<'tcp' | 'socket' | 'rpc'>('rpc');
  const [settings, setSettings] = useState<RTorrentConnectionSettings | null>(null);

  useEffect(() => {
    if (initialSettings) {
      setType(initialSettings?.type);
      setSettings(initialSettings);
      // eslint-disable-next-line no-console
      console.log(`settings: ${initialSettings}`);
    }
  }, [initialSettings]);

  const handleFormChange = (field: 'host' | 'port' | 'socket' | 'url' | 'username' | 'password', value: string | number): void => {
    let newSettings: RTorrentConnectionSettings | null = null;

    if (field === 'url' || field === 'username' || field === 'password') {
      newSettings = {
        client: 'rTorrent',
        type: 'rpc',
        version: 1,
        url: (settings as RTorrentRPCConnectionSettings)?.url ?? '',
        username: (settings as RTorrentRPCConnectionSettings)?.username ?? '',
        password: (settings as RTorrentRPCConnectionSettings)?.password ?? '',
        ...{[field]: value},
      };
    }
    if (field === 'host' || field === 'port') {
      newSettings = {
        client: 'rTorrent',
        type: 'tcp',
        version: 1,
        host: (settings as RTorrentTCPConnectionSettings)?.host ?? '',
        port: (settings as RTorrentTCPConnectionSettings)?.port ?? 5000,
        ...{[field]: value},
      };
    }

    if (field === 'socket') {
      newSettings = {
        client: 'rTorrent',
        type: 'socket',
        version: 1,
        socket: value as string,
      };
    }

    onSettingsChange(newSettings);
    setSettings(newSettings);
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
          label={<Trans id="connection.settings.rtorrent.host"/>}
          placeholder={i18n._('connection.settings.rtorrent.host.input.placeholder')}
          value={(settings as RTorrentTCPConnectionSettings)?.host}
        />
        <Textbox
          onChange={(e) => handleFormChange('port', Number(e.target.value))}
          id="port"
          label={<Trans id="connection.settings.rtorrent.port"/>}
          placeholder={i18n._('connection.settings.rtorrent.port.input.placeholder')}
          value={(settings as RTorrentTCPConnectionSettings)?.port}
        />
      </FormRow>
    </FormRowGroup>
  )

  const typeInputControlsRPC = (
    <FormRowGroup>
      <FormRow>
        <Textbox
          onChange={(e) => handleFormChange('url', e.target.value)}
          id="url"
          label={<Trans id="connection.settings.rtorrent.url"/>}
          placeholder={i18n._('connection.settings.rtorrent.url.input.placeholder')}
          value={(settings as RTorrentRPCConnectionSettings)?.url}
        />
      </FormRow>
      <FormRow>
        <Textbox
          onChange={(e) => handleFormChange('username', e.target.value)}
          id="rtorrent-username"
          label={<Trans id="connection.settings.rtorrent.username"/>}
          placeholder={i18n._('connection.settings.rtorrent.username.input.placeholder')}
          value={(settings as RTorrentRPCConnectionSettings)?.username}
        />
        <Textbox
          onChange={(e) => handleFormChange('password', e.target.value)}
          id="rtorrent-password"
          label={<Trans id="connection.settings.rtorrent.password"/>}
          placeholder={i18n._('connection.settings.rtorrent.password.input.placeholder')}
          value={(settings as RTorrentRPCConnectionSettings)?.password}
          type="password"
        />
      </FormRow>
    </FormRowGroup>
  )

  const typeInputControlsSocket = (
    <FormRow>
      <Textbox
        onChange={(e) => handleFormChange('socket', e.target.value)}
        id="socket"
        label={<Trans id="connection.settings.rtorrent.socket"/>}
        placeholder={i18n._('connection.settings.rtorrent.socket.input.placeholder')}
        value={(settings as RTorrentSocketConnectionSettings)?.socket}
      />
    </FormRow>
  )
    const typeInputControls = () => {
    if (type === 'tcp') {
      return typeInputControlsTCP
    }

    if (type === 'socket') {
      return typeInputControlsSocket
    }

    return (typeInputControlsRPC)
  }

  return (
    <FormRow>
      <FormGroup>
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
                <Trans id="connection.settings.rtorrent.type.rpc"/>
              </Radio>
              <Radio
                onClick={() => {
                  setType('socket');
                }}
                groupID="type"
                id="socket"
                grow={false}
                checked={type === 'socket'}>
                <Trans id="connection.settings.rtorrent.type.socket"/>
              </Radio>
              <Radio
                onClick={() => {
                  setType('tcp');
                }}
                groupID="type"
                id="tcp"
                grow={false}
                checked={type === 'tcp'}>
                <Trans id="connection.settings.rtorrent.type.tcp"/>
              </Radio>
            </FormRow>
          </FormGroup>
        </FormRow>
        {typeInputControls()}
      </FormGroup>
    </FormRow>
  );
};

(RTorrentConnectionSettingsForm as FC<RTorrentConnectionSettingsProps>).defaultProps = {
  initialSettings:null,
  onSettingsChange: undefined
};
export default RTorrentConnectionSettingsForm;
