import {FC, useEffect, useState} from 'react';
import {Trans, useLingui} from '@lingui/react';

import {FormGroup, FormRow, FormRowGroup, Textbox} from '@client/ui';

import type {DelugeConnectionSettings} from '@shared/schema/ClientConnectionSettings';

export interface DelugeConnectionSettingsProps {
  onSettingsChange: (settings: DelugeConnectionSettings | null) => void;
  initialSettings?: DelugeConnectionSettings | null;
}

const DelugeConnectionSettingsForm: FC<DelugeConnectionSettingsProps> = ({onSettingsChange, initialSettings = null}: DelugeConnectionSettingsProps) => {
  const {i18n} = useLingui();
  const [settings, setSettings] = useState<DelugeConnectionSettings>( {
    client: 'Deluge',
    type: 'rpc',
    version: 1,
    host: '127.0.0.1',
    port: 58846,
    username: '',
    password: '',
  });

  useEffect(() => {
    if (initialSettings) setSettings(initialSettings);
  }, [initialSettings]);

  const handleFormChange = (field: 'host' | 'port' | 'username' | 'password', value: string | number): void => {
    const newSettings = {
      ...settings,
      [field]: value,
    };

    if (!newSettings.host || Number.isNaN(newSettings.port)) {
      onSettingsChange(null);
    } else {
      onSettingsChange(newSettings);
    }

    setSettings(newSettings);
  };

  return (
    <FormRow>
      <FormGroup>
        <FormRowGroup>
          <FormRow>
            <Textbox
              onChange={(e) => handleFormChange('host', e.target.value)}
              id="host"
              label={<Trans id="connection.settings.deluge.host"/>}
              placeholder={i18n._('connection.settings.deluge.host.input.placeholder')}
              value={initialSettings?.host}
            />
            <Textbox
              onChange={(e) => handleFormChange('port', Number(e.target.value))}
              id="port"
              label={<Trans id="connection.settings.deluge.port"/>}
              placeholder={i18n._('connection.settings.deluge.port.input.placeholder')}
              value={initialSettings?.port}
            />
          </FormRow>
        </FormRowGroup>
        <FormRowGroup>
          <FormRow>
            <Textbox
              onChange={(e) => handleFormChange('username', e.target.value)}
              id="deluge-username"
              label={<Trans id="connection.settings.deluge.username"/>}
              placeholder={i18n._('connection.settings.deluge.username.input.placeholder')}
              autoComplete="off"
              value={initialSettings?.username}
            />
            <Textbox
              onChange={(e) => handleFormChange('password', e.target.value)}
              id="deluge-password"
              label={<Trans id="connection.settings.deluge.password"/>}
              placeholder={i18n._('connection.settings.deluge.password.input.placeholder')}
              autoComplete="off"
              type="password"
              value={initialSettings?.password}
            />
          </FormRow>
        </FormRowGroup>
      </FormGroup>
    </FormRow>
  );
};

(DelugeConnectionSettingsForm as FC<DelugeConnectionSettingsProps>).defaultProps = {
  initialSettings:null,
  onSettingsChange: undefined
};
export default DelugeConnectionSettingsForm;
