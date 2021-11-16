import React from 'react';
import cn from 'classnames';
import { theme } from 'Common/styles';
import { reactTranslator } from 'Common/translators/reactTranslator';

interface RemoveCustomFilterProps {
    title: string;
    description: string;
    onRemove: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSave: () => void;
}

export const RemoveCustomFilter = ({
    title,
    description,
    onRemove,
    onChange,
    onSave,
}: RemoveCustomFilterProps) => {
    return (
        <>
            <input
                className={theme.modal.modalInput}
                type="text"
                value={title}
                onChange={onChange}
            />
            {
                description
                && <div className={theme.modal.description}>{description}</div>
            }
            <div className={theme.modal.footer}>
                <button
                    type="button"
                    className={cn(theme.button.middle, theme.button.red, theme.modal.leftBtn)}
                    onClick={onRemove}
                >
                    {reactTranslator.getMessage('options_custom_filter_modal_remove_button')}
                </button>
                <button
                    className={cn(theme.button.middle, theme.button.green)}
                    disabled={title.trim().length === 0}
                    type="button"
                    onClick={onSave}
                >
                    {reactTranslator.getMessage('options_custom_filter_modal_confirm_save_button')}
                </button>
            </div>
        </>
    );
};
