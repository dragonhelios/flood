import {FC} from 'react';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';

import DiskUsage from './DiskUsage';
import FeedsButton from './FeedsButton';
import LogoutButton from './LogoutButton';
import NotificationsButton from './NotificationsButton';
import SearchBox from './SearchBox';
import SettingsButton from './SettingsButton';
import SftpTransfersButton from './SftpTransfersButton';
import SidebarActions from './SidebarActions';
import SpeedLimitDropdown from './SpeedLimitDropdown';
import StatusFilters from './StatusFilters';
import TagFilters from './TagFilters';
import ThemeSwitchButton from './ThemeSwitchButton';
import TrackerFilters from './TrackerFilters';
import TransferData from './TransferData';

const Sidebar: FC = () => (
  <OverlayScrollbarsComponent
    options={{
      scrollbars: {
        autoHide: 'scroll',
        clickScrolling: false,
        dragScrolling: false,
      },
      className: 'application__sidebar os-theme-thin',
    }}>
    <SidebarActions>
      <SpeedLimitDropdown />
      <SettingsButton />
      <FeedsButton />
      <NotificationsButton />
      <SftpTransfersButton />
      <LogoutButton />
    </SidebarActions>
    <TransferData />
    <SearchBox />
    <StatusFilters />
    <TagFilters />
    <TrackerFilters />
    <DiskUsage />
    <div style={{flexGrow: 1}} />
    <SidebarActions>
      <ThemeSwitchButton />
    </SidebarActions>
  </OverlayScrollbarsComponent>
);

export default Sidebar;
