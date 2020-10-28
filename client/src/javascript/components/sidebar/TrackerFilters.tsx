import {FormattedMessage} from 'react-intl';
import {observer} from 'mobx-react';
import * as React from 'react';

import SidebarFilter from './SidebarFilter';
import TorrentFilterStore from '../../stores/TorrentFilterStore';
import UIActions from '../../actions/UIActions';

const TrackerFilters: React.FC = () => {
  const trackers = Object.keys(TorrentFilterStore.taxonomy.trackerCounts);

  if (trackers.length === 1 && trackers[0] === '') {
    return null;
  }

  const filterItems = trackers.slice().sort((a, b) => {
    if (a === '') {
      return -1;
    }
    if (b === '') {
      return 1;
    }

    return a.localeCompare(b);
  });

  const filterElements = filterItems.map((filter) => (
    <SidebarFilter
      handleClick={UIActions.setTorrentTrackerFilter}
      count={TorrentFilterStore.taxonomy.trackerCounts[filter] || 0}
      key={filter}
      isActive={filter === TorrentFilterStore.filters.trackerFilter}
      name={filter}
      slug={filter}
    />
  ));

  return (
    <ul className="sidebar-filter sidebar__item">
      <li className="sidebar-filter__item sidebar-filter__item--heading">
        <FormattedMessage id="filter.tracker.title" />
      </li>
      {filterElements}
    </ul>
  );
};

export default observer(TrackerFilters);
