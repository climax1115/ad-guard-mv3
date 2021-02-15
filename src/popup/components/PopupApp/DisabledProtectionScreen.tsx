import React, { useContext } from 'react';
import cn from 'classnames';
import { Icon } from 'Common/components/ui/Icon';
import { ICON_ID } from 'Common/components/ui/Icons';
import { theme } from 'Common/styles';
import { reactTranslator } from 'Common/translators/reactTranslator';
import { observer } from 'mobx-react';
import { rootStore } from '../../stores';
import styles from './PopupApp.module.pcss';

export const DisabledProtectionScreen = observer(() => {
    const { settingsStore } = useContext(rootStore);
    const { protectionPaused, protectionPausedTimer, resetProtectionPausedTimeout } = settingsStore;

    const onEnableProtectionClick = async () => {
        await resetProtectionPausedTimeout();
    };

    return (
        <>
            <div>
                <Icon
                    id={ICON_ID.DISABLED_LOGO}
                    className={styles.logo}
                />
            </div>
            <section className={styles.section}>
                <h1 className={cn(theme.common.pageInfoMain, styles.pageInfoMain)}>{reactTranslator.getMessage('popup_protection_is_paused')}</h1>
                {protectionPaused && (
                    <h6 className={theme.common.pageInfoAdditional}>
                        {reactTranslator.getMessage('popup_protection_will_be_resumed_after', { count: protectionPausedTimer })}
                    </h6>
                )}
            </section>
            <button type="button" className={`${styles.buttonGreen} action-button`} onClick={onEnableProtectionClick}>
                {reactTranslator.getMessage('popup_protection_resume_now')}
            </button>
        </>
    );
});
