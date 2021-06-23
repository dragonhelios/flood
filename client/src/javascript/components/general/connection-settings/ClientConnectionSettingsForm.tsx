import {FC, ReactNode, useEffect, useState} from 'react';
import {Trans, useLingui} from '@lingui/react';
import {usePrevious} from 'react-use';

import {FormGroup, FormRow, Select, SelectItem} from '@client/ui';

import {SUPPORTED_CLIENTS} from '@shared/schema/constants/ClientConnectionSettings';

import {ModalFormSubSectionHeader} from '@client/components/modals/ModalFormSectionHeader';

import type {
  ClientConnectionSettings,
  DelugeConnectionSettings,
  QBittorrentConnectionSettings,
  RTorrentConnectionSettings,
  TransmissionConnectionSettings,
} from '@shared/schema/ClientConnectionSettings';

import DelugeConnectionSettingsForm from './DelugeConnectionSettingsForm';
import QBittorrentConnectionSettingsForm from './QBittorrentConnectionSettingsForm';
import RTorrentConnectionSettingsForm from './RTorrentConnectionSettingsForm';
import TransmissionConnectionSettingsForm from './TransmissionConnectionSettingsForm';

const DEFAULT_SELECTION: ClientConnectionSettings['client'] = 'rTorrent' as const;

interface ClientConnectionSettingsFormProps {
  onSettingsChange: (settings: ClientConnectionSettings | null) => void;
  // eslint-disable-next-line react/require-default-props
  initialSettings?: ClientConnectionSettings | null;
}

const ClientConnectionSettingsForm: FC<ClientConnectionSettingsFormProps> = ({
  onSettingsChange,
  initialSettings = null,
}: ClientConnectionSettingsFormProps) => {
  const {i18n} = useLingui();
  const [selectedClient, setSelectedClient] = useState<ClientConnectionSettings['client']>(DEFAULT_SELECTION);
	const prevSelectedClient = usePrevious(selectedClient);

  useEffect(() => {
    if (initialSettings) {
      setSelectedClient(initialSettings.client);
    }
  }, [initialSettings]);

  if (selectedClient !== prevSelectedClient) {
    onSettingsChange(null);
  }

  let settingsForm: ReactNode | null = null;

  switch (selectedClient) {
    case 'Deluge':
      settingsForm = (
        <DelugeConnectionSettingsForm
          onSettingsChange={onSettingsChange}
          initialSettings={initialSettings as DelugeConnectionSettings}
        />
      );
      break;
    case 'qBittorrent':
      settingsForm = (
        <QBittorrentConnectionSettingsForm
          onSettingsChange={onSettingsChange}
          initialSettings={initialSettings as QBittorrentConnectionSettings}
        />
      );
      break;
    case 'rTorrent':
      settingsForm = (
        <RTorrentConnectionSettingsForm
          onSettingsChange={onSettingsChange}
          initialSettings={initialSettings as RTorrentConnectionSettings}
        />
      );
      break;
    case 'Transmission':
      settingsForm = (
        <TransmissionConnectionSettingsForm
          onSettingsChange={onSettingsChange}
          initialSettings={initialSettings as TransmissionConnectionSettings}
        />
      );
      break;
    default:
      break;
  }

  return (
    <div>
      <FormRow>
        <FormGroup>
          <ModalFormSubSectionHeader>
            <Trans id="connection.settings.client" />
          </ModalFormSubSectionHeader>
          <FormRow>
            <Select
              id="client"
              label={i18n._('connection.settings.client.select')}
              onSelect={(newSelectedClient) => {
                setSelectedClient(newSelectedClient as ClientConnectionSettings['client']);
              }}
              defaultID={DEFAULT_SELECTION}
              selectID={initialSettings?.client ?? DEFAULT_SELECTION}>
              {SUPPORTED_CLIENTS.map((client) => (
                <SelectItem key={client} id={client}>
                  <Trans id={`connection.settings.${client.toLowerCase()}`} />
                </SelectItem>
              ))}
            </Select>
          </FormRow>
        </FormGroup>
      </FormRow>
      {settingsForm}
    </div>
  );
};

export default ClientConnectionSettingsForm;
