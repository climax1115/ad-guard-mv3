import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import cn from 'classnames';

import { reactTranslator } from 'Common/translators/reactTranslator';
import { theme } from 'Common/styles';
import { rootStore } from '../../stores';

import styles from './wizard.module.pcss';

export const Wizard = observer(() => {
    const { wizardStore } = useContext(rootStore);
    const {
        step,
        stepInfo,
        isLastStep,
        skipWizard,
        setNextStep,
        buttonTextKey,
    } = wizardStore;

    const { icon } = stepInfo;

    const img = icon.toLowerCase().replace('_', '');

    const containerClassName = cn(styles.container, styles[img]);

    // TODO add learn more link handler
    return (
        <section className={containerClassName}>
            <div className={styles.header}>
                <button type="button" className={styles.link}>
                    {reactTranslator.getMessage('popup_learn_more_link')}
                </button>
                <button
                    type="button"
                    className={styles.link}
                    onClick={skipWizard}
                >
                    {reactTranslator.getMessage('popup_skip_wizard')}
                </button>
            </div>
            <div className={styles.inner}>
                <div className={cn(styles.info, styles.main)}>
                    {`${step}.`}
                    &nbsp;
                    {reactTranslator.getMessage(stepInfo.nameKey)}
                </div>
                <div className={cn(styles.info, styles.description)}>
                    {reactTranslator.getMessage(stepInfo.descriptionKey)}
                </div>
                <button
                    type="button"
                    className={cn(theme.common.buttonGreen, styles.button)}
                    onClick={isLastStep ? skipWizard : setNextStep}
                >
                    {reactTranslator.getMessage(buttonTextKey)}
                </button>
            </div>
        </section>
    );
});
