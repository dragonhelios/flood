import {FC} from 'react';
import {observer} from 'mobx-react';
import {useLingui} from '@lingui/react';

import Modal from '../Modal';
import SftpDownloads from './SftpDownloads';
import SftpUploads from './SftpUploads';
import SftpHeading from './SftpHeading';

const SftpTransfersModal: FC = observer(() => {
  const {i18n} = useLingui();

  const tabs = {
    'sftp-uploads': {
      content: SftpUploads,
      label: i18n._('sftp.transfers.uploads'),
      modalContentClasses: 'modal__content--nested-scroll',
    },
    'sftp-downloads': {
      content: SftpDownloads,
      label: i18n._('sftp.transfers.downloads'),
      modalContentClasses: 'modal__content--nested-scroll',
    },
  };

  return <Modal heading={<SftpHeading key="sftp-heading" />} size="large" tabs={tabs} orientation="horizontal" />;
});

export default SftpTransfersModal;
