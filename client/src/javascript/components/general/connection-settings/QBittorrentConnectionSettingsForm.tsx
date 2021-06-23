import {FC, useEffect, useState} from 'react';
import {Trans, useLingui} from '@lingui/react';

import {Checkbox, FormGroup, FormRow, Textbox} from '@client/ui';

import type {
  ClientConnectionFields,
  ClientConnectionFieldTypes,
  ClientConnectionSettings,
  QBittorrentConnectionSettings,
} from '@shared/schema/ClientConnectionSettings';
import RemoteConnectionSettingsForm from './RemoteConnectionSettingsForm';

export interface QBittorrentConnectionSettingsProps {
  onSettingsChange: (settings: QBittorrentConnectionSettings | null) => void;
  initialSettings?: QBittorrentConnectionSettings | null;
}

const QBittorrentConnectionSettingsForm: FC<QBittorrentConnectionSettingsProps> = ({
  onSettingsChange,
  initialSettings = null,
}: QBittorrentConnectionSettingsProps) => {
  const {i18n} = useLingui();
  const [settings, setSettings] = useState<QBittorrentConnectionSettings>({
    client: 'qBittorrent',
    type: 'web',
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
    if (initialSettings) setSettings(initialSettings);
  }, [initialSettings]);

  const handleFormChange = (field: ClientConnectionFields, value: ClientConnectionFieldTypes): void => {
    const newSettings = {
      ...settings,
      ...{[field]: value},
    };

    if (newSettings.url == null || newSettings.url === '') {
      onSettingsChange(null);
    } else {
      onSettingsChange(newSettings);
    }

    setSettings(newSettings);
  };

  return (
    <FormRow>
      <FormGroup>
        <FormRow>
          <Checkbox
            checked={settings?.isRemote ?? false}
            id="remoteConnection"
            onClick={() => handleFormChange('isRemote', !settings.isRemote)}
            matchTextboxHeight
            grow={false}>
            <Trans id="connection.settings.sftpsettings.remoteclient" />
          </Checkbox>
        </FormRow>
        <FormRow>
          <Textbox
            onChange={(e) => handleFormChange('url', e.target.value)}
            id="url"
            label={<Trans id="connection.settings.qbittorrent.url" />}
            placeholder={i18n._('connection.settings.qbittorrent.url.input.placeholder')}
            value={initialSettings?.url ?? ''}
          />
        </FormRow>
        <FormRow>
          <Textbox
            onChange={(e) => handleFormChange('username', e.target.value)}
            id="qbt-username"
            label={<Trans id="connection.settings.qbittorrent.username" />}
            placeholder={i18n._('connection.settings.qbittorrent.username.input.placeholder')}
            autoComplete="off"
            value={initialSettings?.username ?? ''}
          />
          <Textbox
            onChange={(e) => handleFormChange('password', e.target.value)}
            id="qbt-password"
            label={<Trans id="connection.settings.qbittorrent.password" />}
            placeholder={i18n._('connection.settings.qbittorrent.password.input.placeholder')}
            autoComplete="off"
            type="password"
            value={initialSettings?.password ?? ''}
          />
        </FormRow>
        {settings.isRemote && (
          <RemoteConnectionSettingsForm
            handleFormChange={(field, value) => handleFormChange(field, value)}
            settings={settings as ClientConnectionSettings}
          />
        )}
      </FormGroup>
    </FormRow>
  );
};

(QBittorrentConnectionSettingsForm as FC<QBittorrentConnectionSettingsProps>).defaultProps = {
  initialSettings: null,
  onSettingsChange: undefined,
};

export default QBittorrentConnectionSettingsForm;
