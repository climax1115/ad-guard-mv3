import { translate } from '../../../common/helpers';
import { Icon } from '../ui/Icon';

import './index.pcss';

export const Header = () => {
    const handleBlockingModeIconClick = () => {
        /* FIXME - enable blocking mode */
        window.close();
    };

    const handleSettingsClick = (e) => {
        e.preventDefault();
        /* FIXME - openSettingsTab */
        window.close();
    };

    return (
        <div className="popup-header">
            <div className="popup-header__logo">
                <Icon
                    id="#logo"
                    className="icon--logo"
                />
            </div>
            <div className="popup-header__buttons">
                <button
                    className="button"
                    type="button"
                    onClick={handleBlockingModeIconClick}
                    title={translate('context_enable_protection')}
                >
                    <Icon
                        id="#start"
                        className="icon--button"
                    />
                </button>
                <button
                    className="button"
                    type="button"
                    onClick={handleSettingsClick}
                    title={translate('options_settings')}
                >
                    <Icon
                        id="#settings"
                        className="icon--button"
                    />
                </button>
            </div>
        </div>
    );
};
