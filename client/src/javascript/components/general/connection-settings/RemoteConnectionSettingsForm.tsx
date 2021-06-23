import {FC} from 'react';
import {Trans, useLingui} from '@lingui/react';

import {FormGroup, FormRow, Textbox, Checkbox} from '@client/ui';
import {RemoteConnectionFields, RemoteConnectionFieldTypes} from '@shared/schema/SftpConnectionSettings';
import {ModalFormSubSectionHeader} from '@client/components/modals/ModalFormSectionHeader';
import {ClientConnectionSettings} from '@shared/schema/ClientConnectionSettings';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface RemoteConnectionSettingsFormProps {
  handleFormChange: (field: RemoteConnectionFields, value: RemoteConnectionFieldTypes) => void;
  settings: ClientConnectionSettings;
}

const RemoteConnectionSettingsForm: FC<RemoteConnectionSettingsFormProps> = ({
  settings,
  handleFormChange,
}: RemoteConnectionSettingsFormProps) => {
  const {i18n} = useLingui();

  const toggleDefaultDownload = (checked: boolean) => {
    handleFormChange('isDefaultDownload', checked);
  };

  return (
    <>
      <FormRow>
        <FormGroup>
          <ModalFormSubSectionHeader>
            <Trans id="connection.settings.sftpsettings" />
          </ModalFormSubSectionHeader>
          <FormRow>
            <Textbox
              onChange={(e) => handleFormChange('sftpHost', e.target.value)}
              id="sftp-host"
              label={<Trans id="connection.settings.sftpsettings.host" />}
              placeholder={i18n._('connection.settings.sftpsettings.host.input.placeholder')}
              value={settings?.sftpHost}
            />
            <Textbox
              onChange={(e) => handleFormChange('sftpPort', Number(e.target.value))}
              id="sftp-port"
              label={<Trans id="connection.settings.sftpsettings.port" />}
              placeholder={i18n._('connection.settings.sftpsettings.port.input.placeholder')}
              value={settings?.sftpPort}
            />
          </FormRow>
          <FormRow>
            <Textbox
              id="sftp-username"
              label={<Trans id="connection.settings.sftpsettings.username" />}
              onChange={(e) => handleFormChange('sftpUser', e.target.value)}
              placeholder={i18n._('auth.username')}
              autoComplete="off"
              value={settings?.sftpUser}
            />
            <Textbox
              id="sftp-password"
              label={<Trans id="connection.settings.sftpsettings.password" />}
              onChange={(e) => handleFormChange('sftpPassword', e.target.value)}
              placeholder={i18n._('auth.password')}
              autoComplete="off"
              type="password"
              value={settings?.sftpPassword}
            />
          </FormRow>
          <FormRow>
            <Textbox
              id="sftp-localpath"
              onChange={(e) => handleFormChange('localPath', e.target.value)}
              label={<Trans id="connection.settings.sftpsettings.localpath" />}
              placeholder={i18n._('connection.settings.sftpsettings.localpath.input.placeholder')}
              autoComplete="off"
              value={settings?.localPath}
            />
          </FormRow>
          <FormRow>
            <Checkbox
              checked={settings.isDefaultDownload}
              id="isDefaultDownload"
              onClick={() => toggleDefaultDownload(!settings.isDefaultDownload)}>
              <Trans id="connection.settings.sftpsettings.defaultdownload" />
            </Checkbox>
          </FormRow>
        </FormGroup>
      </FormRow>
    </>
  );
};

export default RemoteConnectionSettingsForm;
