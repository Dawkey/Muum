import { React, useEffect, useState } from 'react';
import './TopMenu.scss';
import Setting from '../components/Setting.jsx';
import logo from '../assets/images/logo2.png';
import title from '../assets/images/title.png';

export default function TopMenu(props) {

    const { settingSongPath, setSettingSongPath, settingTheme, setSettingTheme } = props;
    const [settingShowFlag, setSettingShowFlag] = useState(false);

    useEffect(() => {
        window.electronApi.onShowSetting(() => {
            setSettingShowFlag(true);
        });
    }, []);


    function minWindow() {
        window.electronApi.minWindow();
    }

    function maxWindow() {
        window.electronApi.maxWindow();
    }

    function closeWindow() {
        window.electronApi.closeWindow();
    }

    return (
        <div className='top-menu'>
            <div className='menu-left'>
                <img className='logo' alt='logo' src={logo} />
            </div>
            <div className='menu-middle'>
                <img className='title' alt='title' src={title} />
            </div>
            <div className='menu-right'>
                <i
                    className='icon-setting'
                    onClick={() => {
                        setSettingShowFlag(true);
                    }}
                />
                <i
                    className='icon-minimize'
                    onClick={minWindow}
                />
                <i
                    className='icon-maximize'
                    onClick={maxWindow}
                />
                <i
                    className='icon-close'
                    onClick={closeWindow}
                />
            </div>
            <Setting
                showFlag={settingShowFlag}
                onClose={() => { setSettingShowFlag(false) }}
                songPath={settingSongPath}
                setSongPath={setSettingSongPath}
                theme={settingTheme}
                setTheme={setSettingTheme}
            />
        </div>
    )
}