import {
    Message,
    MESSAGE_TYPES,
    MessageType,
    REPORT_SITE_BASE_URL,
} from 'Common/constants';
import { log } from 'Common/logger';
import { prefs } from 'Common/prefs';
import { getUrlWithQueryString } from 'Common/helpers';
import { SETTINGS_NAMES } from 'Common/settings-constants';
import { scripting } from '../background/scripting';
import { settings } from '../background/settings';

class TabUtils {
    constructor() {
        chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
            if (changeInfo.status === 'complete' || changeInfo.status === 'loading') {
                const protectionPauseExpires = settings.getSetting(
                    SETTINGS_NAMES.PROTECTION_PAUSE_EXPIRES,
                );

                if (protectionPauseExpires !== 0 && protectionPauseExpires <= Date.now()) {
                    settings.setSetting(SETTINGS_NAMES.PROTECTION_PAUSE_EXPIRES, 0);
                }
            }
        });
    }

    getActiveTab = (): Promise<chrome.tabs.Tab> => {
        return new Promise((resolve, reject) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const error = chrome.runtime.lastError;
                if (error) {
                    reject(error);
                }

                const [tab] = tabs;
                resolve(tab);
            });
        });
    };

    sendMessageToTab = (tabId: number, type: MessageType, data?: any) => {
        const message: Message = { type };
        if (data) {
            message.data = data;
        }
        return new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tabId, message, (response) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError.message);
                    return;
                }
                resolve(response);
            });
        });
    };

    private openPage = async (url: string): Promise<void> => {
        if (!url) {
            throw new Error(`Open page requires url, received, ${url}`);
        }
        await chrome.tabs.create({ url });
    };

    openAbusePage = (url: string) => {
        const supportedBrowsers = ['Chrome', 'Firefox', 'Opera', 'Safari', 'IE', 'Edge', 'Yandex'];

        const browserUrlParams = (
            supportedBrowsers.includes(prefs.browser)
                ? { browser: prefs.browser }
                : { browser: 'Other', browserDetails: prefs.browser }
        ) as { browser: string } | { browser: string, browserDetails: string };

        const { version } = chrome.runtime.getManifest();

        // TODO: get enabled filters ids
        const filtersIds: string[] = [];

        const urlParams = {
            product_type: 'Ext',
            product_version: version,
            ...browserUrlParams,
            url,
            filters: filtersIds.join('.'),
        };

        const abuseUrl = getUrlWithQueryString(REPORT_SITE_BASE_URL, urlParams);

        return this.openPage(abuseUrl);
    };

    /**
     * Sends message to assistant by tab id in order to activate it.
     * If no answer received tries to inject assistant script and send message again.
     * @param tabId
     */
    openAssistantWithInject = async (tabId: number) => {
        try {
            await this.sendMessageToTab(tabId, MESSAGE_TYPES.START_ASSISTANT);
        } catch (e) {
            // if assistant wasn't injected yet sendMessageToTab will throw an error
            await scripting.executeScript(tabId, { file: 'assistant.js' });
            await this.sendMessageToTab(tabId, MESSAGE_TYPES.START_ASSISTANT);
        }
    };

    /**
     * Launches assistant context by tab id
     * @param tabId
     */
    openAssistant = async (tabId: number) => {
        try {
            await this.openAssistantWithInject(tabId);
        } catch (e) {
            log.error(e);
        }
    };

    openOptionsPage = () => {
        return chrome.runtime.openOptionsPage();
    };

    reloadTab = (tabId: number) => {
        return new Promise<void>((resolve, reject) => {
            chrome.tabs.reload(tabId, {}, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError.message);
                }
                resolve();
            });
        });
    };

    reloadActiveTab = async () => {
        const tab = await this.getActiveTab();

        if (tab?.id) {
            await this.reloadTab(tab.id);
        }
    };
}

export const tabUtils = new TabUtils();
