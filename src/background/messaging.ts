import {
    Message,
    MESSAGE_TYPES,
    OptionsData,
    PopupData,
} from 'Common/constants';
import { log } from 'Common/logger';
import { SETTINGS_NAMES } from 'Common/settings-constants';
import { tabUtils } from 'Common/tab-utils';
import { settings } from './settings';
import { app } from './app';
import { notifier } from './notifier';
import { protectionPause } from './protectionPause';

interface MessageHandler {
    (message: Message, sender: chrome.runtime.MessageSender): any;
}

/**
 * Message handler wrapper used in order to handle async/await calls,
 * because chrome api by default do not support them
 * @param messageHandler
 */
const messageHandlerWrapper = (messageHandler: MessageHandler) => (
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (...args: any[]) => void,
) => {
    messageHandler(message, sender)
        .catch((e: Error) => {
            log.error(e);
        })
        .then(sendResponse);
    return true;
};

/**
 * Message handler used to receive messages and send responses back on background service worker
 * from content-script, popup, option or another pages of extension
 * @param message
 */
export const messageHandler = async (
    message: Message,
    // eslint-disable-next-line consistent-return
) => {
    await app.init();

    const { type, data } = message;

    switch (type) {
        case MESSAGE_TYPES.GET_OPTIONS_DATA: {
            return { settings: settings.getSettings() } as OptionsData;
        }
        case MESSAGE_TYPES.OPEN_OPTIONS: {
            return tabUtils.openOptionsPage();
        }
        case MESSAGE_TYPES.GET_POPUP_DATA: {
            return { settings: settings.getSettings() } as PopupData;
        }
        case MESSAGE_TYPES.RELOAD_ACTIVE_TAB: {
            await tabUtils.reloadActiveTab();
            break;
        }
        case MESSAGE_TYPES.SET_SETTING: {
            const { key, value } = data;
            settings.setSetting(key, value);

            break;
        }
        case MESSAGE_TYPES.REPORT_SITE: {
            const { url } = await tabUtils.getActiveTab();

            if (url) {
                await tabUtils.openAbusePage(url);
            }

            return null;
        }
        case MESSAGE_TYPES.OPEN_ASSISTANT: {
            const { tab } = data;
            await tabUtils.openAssistant(tab.id);
            break;
        }
        case MESSAGE_TYPES.ADD_USER_RULE: {
            const { ruleText } = data;
            // TODO implement user rules add user rule method
            // eslint-disable-next-line no-console
            console.log(ruleText);
            break;
        }
        case MESSAGE_TYPES.GET_CSS: {
            const filteringEnabled = settings.getSetting(SETTINGS_NAMES.FILTERING_ENABLED);
            const protectionEnabled = settings.getSetting(SETTINGS_NAMES.PROTECTION_ENABLED);

            if (filteringEnabled && protectionEnabled) {
                // example rules
                return ['* { background-color: pink }'];
            }

            return null;
        }
        case MESSAGE_TYPES.SET_PROTECTION_PAUSE_TIMER: {
            const { protectionPauseExpires } = data;
            protectionPause.addTimer(protectionPauseExpires);
            break;
        }
        case MESSAGE_TYPES.REMOVE_PROTECTION_PAUSE_TIMER: {
            protectionPause.removeTimer();
            break;
        }
        default: {
            throw new Error(`No message handler for type: ${type}`);
        }
    }
};

/**
 * This handler used to subscribe for notifications from popup page
 * https://developer.chrome.com/extensions/messaging#connect
 * We can't use simple one-time connections, because they can intercept each other
 * Causing issues like AG-2074
 */
const longLivedMessageHandler = (port: chrome.runtime.Port) => {
    let listenerId: string;

    log.debug(`Connecting to the port "${port.name}"`);
    port.onMessage.addListener((message) => {
        const { type, data } = message;
        if (type === MESSAGE_TYPES.ADD_LONG_LIVED_CONNECTION) {
            const { events } = data;
            listenerId = notifier.addEventListener(events, (...args: any) => {
                try {
                    port.postMessage({ type: MESSAGE_TYPES.NOTIFY_LISTENERS, data: args });
                } catch (e) {
                    log.error(e.message);
                }
            });
        }
    });

    port.onDisconnect.addListener(() => {
        log.debug(`Removing listener: ${listenerId} for port ${port.name}`);
        notifier.removeListener(listenerId);
    });
};

export const messaging = {
    init: () => {
        const messageListener = messageHandlerWrapper(messageHandler);
        chrome.runtime.onMessage.addListener(messageListener);
        chrome.runtime.onConnect.addListener(longLivedMessageHandler);
    },
};
