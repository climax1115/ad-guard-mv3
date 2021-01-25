import React from 'react';

import { Icon } from 'Common/components/ui/Icon';
import { Nav } from '../Nav';

import './sidebar.pcss';

export const Sidebar = () => {
    return (
        <>
            <div className="sidebar__menu" role="menu">
                <button className="sidebar__open-button" type="button">
                    <Icon id="menu" className="icon--menu" />
                </button>
            </div>
            <div className="sidebar">
                <Icon id="logo" className="icon--logo sidebar__logo" />
                <Nav />
            </div>
        </>
    );
};
