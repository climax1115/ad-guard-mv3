import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import cn from 'classnames';
import { translator } from 'Common/translators/translator';
import { Icon } from 'Common/components/ui/Icon';
import { Tooltip } from 'Common/components/ui/Tooltip';
import { reactTranslator } from 'Common/translators/reactTranslator';
import { SETTINGS_NAMES } from 'Common/settings-constants';
import { PROTECTION_PAUSE_TIMEOUT } from 'Common/constants';
import { ICON_ID } from 'Common/components/ui/Icons';
import { sender } from '../../messaging/sender';
import { rootStore } from '../../stores';

import styles from './Header.module.pcss';

export const Header = observer(() => {
    const { settingsStore } = useContext(rootStore);
    const {
        protectionEnabled,
        protectionPaused,
        updateCurrentTime,
        setProtectionPausedTimer,
        setSetting,
    } = settingsStore;

    const handleBlockAdsClick = async () => {
        await sender.openAssistant();
        window.close();
    };

    const handleSettingsClick = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        await sender.openOptions();
        window.close();
    };

    const onPauseProtectionClick = async () => {
        await setSetting(SETTINGS_NAMES.PROTECTION_ENABLED, false);
    };

    const onPauseProtectionTimeoutClick = async () => {
        // TODO add one setter for PROTECTION_ENABLED and PROTECTION_PAUSE_EXPIRES,
        //  updateCurrentTime
        await setSetting(SETTINGS_NAMES.PROTECTION_ENABLED, false);
        updateCurrentTime();
        await setSetting(
            SETTINGS_NAMES.PROTECTION_PAUSE_EXPIRES,
            // TODO: reload page when timer is out and popup is closed
            settingsStore.currentTime + PROTECTION_PAUSE_TIMEOUT,
        );
        setProtectionPausedTimer();
    };

    const protectionDisabled = !protectionEnabled || protectionPaused;

    const className = cn(styles.popupHeader, {
        [styles.popupHeaderDisabled]: protectionDisabled,
    });

    // TODO: align icons
    return (
        <div className={className}>
            <div className={styles.popupHeaderLogo}>
                <Icon id={ICON_ID.LOGO} />
            </div>
            <div className={styles.popupHeaderButtons}>
                <button
                    className={styles.popupHeaderButton}
                    type="button"
                    onClick={handleBlockAdsClick}
                    title={translator.getMessage('options_block_ads_on_website')}
                    disabled={protectionDisabled}
                >
                    <Icon id={ICON_ID.START} />
                </button>
                <button
                    className={styles.popupHeaderButton}
                    type="button"
                    onClick={handleSettingsClick}
                    title={translator.getMessage('options_open_settings')}
                    disabled={protectionDisabled}
                >
                    <Icon id={ICON_ID.SETTINGS} />
                </button>
                <Tooltip
                    iconId={ICON_ID.CRUMBS}
                    className={styles.popupHeaderButton}
                    disabled={protectionDisabled}
                >
                    <div>
                        <button
                            type="button"
                            className={styles.item}
                            onClick={onPauseProtectionClick}
                        >
                            {reactTranslator.getMessage('popup_settings_pause_protection')}
                        </button>
                        <button
                            type="button"
                            className={styles.item}
                            onClick={onPauseProtectionTimeoutClick}
                        >
                            {reactTranslator.getMessage('popup_settings_pause_protection_temporarily', { count: PROTECTION_PAUSE_TIMEOUT / 1000 })}
                        </button>
                        <button
                            type="button"
                            className={styles.item}
                            disabled
                        >
                            {reactTranslator.getMessage('popup_settings_disable_site_temporarily', { count: PROTECTION_PAUSE_TIMEOUT / 1000 })}
                        </button>
                    </div>
                </Tooltip>
            </div>
        </div>
    );
});
