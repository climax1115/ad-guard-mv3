import { TsWebExtension, Configuration } from '@adguard/tswebextension/mv3';

import { filters } from './filters';
import { userRules } from './userRules';

class TsWebExtensionWrapper {
    private tsWebExtension: TsWebExtension;

    constructor() {
        this.tsWebExtension = new TsWebExtension('/web-accessible-resources/redirects');
    }

    async start() {
        const config = await this.getConfiguration();
        await this.tsWebExtension.start(config);
    }

    async stop() {
        await this.tsWebExtension.stop();
    }

    async configure() {
        const config = await this.getConfiguration();
        await this.tsWebExtension.configure(config);
    }

    private getConfiguration = async (): Promise<Configuration> => {
        const rules = await filters.getEnabledRules();

        return {
            settings: {
                allowlistEnabled: false,
                allowlistInverted: false,
                collectStats: true,
                // TODO: check fields needed in the mv3
                stealth: {
                    blockChromeClientData: false,
                    hideReferrer: false,
                    hideSearchQueries: false,
                    sendDoNotTrack: false,
                    blockWebRTC: false,
                    selfDestructThirdPartyCookies: false,
                    selfDestructThirdPartyCookiesTime: 0,
                    selfDestructFirstPartyCookies: false,
                    selfDestructFirstPartyCookiesTime: 0,
                },
            },
            filters: rules
                .map((r) => ({
                    filterId: r.id,
                    content: r.rules,
                })),
            allowlist: [],
            // TODO: maybe getRules should return array instead of string
            userrules: (await userRules.getRules()).split('\n'),
            verbose: true,
        };
    };

    getMessageHandler() {
        return this.tsWebExtension.getMessageHandler();
    }

    get convertedSourceMap() {
        return this.tsWebExtension.convertedSourceMap;
    }
}

export const tsWebExtensionWrapper = new TsWebExtensionWrapper();