import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import cn from 'classnames';

import { Icon } from 'Common/components/ui/Icon';
import { rootStore } from '../../stores';
import { SETTINGS_NAMES } from '../../../background/settings/settings-constants';

import './switcher.pcss';

export const Switcher = observer(() => {
    const { settingsStore } = useContext(rootStore);
    const { filteringEnabled, setSetting } = settingsStore;

    const onClick = async () => {
        await setSetting(SETTINGS_NAMES.FILTERING_ENABLED, !filteringEnabled);
    };

    const icon = cn({
        checkmark: filteringEnabled,
        circle: !filteringEnabled,
    });

    const className = cn('switcher', {
        'switcher--disabled': !filteringEnabled,
    });

    return (
        <button
            type="button"
            className={className}
            onClick={onClick}
        >
            <div className="switcher__center" />
            <div className="switcher__btn">
                <Icon id={icon} className="switcher__icon" />
            </div>
        </button>
    );
});
