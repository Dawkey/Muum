import { React, useEffect, useState } from 'react';
import './Setting.scss';
import { storeKeys } from '../utils/config';
import classNames from 'classnames';

export default function Setting(props) {
    const { showFlag, onClose, songPath, setSongPath, theme, setTheme } = props;    
    const [closeMode, setCloseMode] = useState(1);
    const [themeSelectShowFlag, setThemeSelectShowFlag] = useState(false);

    const themeEnums = new Map([
        [1, '尼尔'],
        [2, '灰姑娘']
    ]);

    useEffect(() => {
        const storeSongPath = window.electronApi.getStore(storeKeys.songPath);
        const storeCloseMode = window.electronApi.getStore(storeKeys.closeMode);
        const storeTheme = window.electronApi.getStore(storeKeys.theme);
        setSongPath(storeSongPath);
        setCloseMode(storeCloseMode);
        setTheme(storeTheme);
    }, []);    

    useEffect(() => {
        if (songPath === "") return;
        window.electronApi.setStore(storeKeys.songPath, songPath);
        window.electronApi.watchSongPath(songPath);
    }, [songPath]);

    function selectDir() {
        window.electronApi.selectDir().then(data => {
            const { canceled, filePaths } = data;
            if (canceled === true) {
                return;
            }
            setSongPath(filePaths[0]);
        });
    }

    function changeCloseMode(e) {
        const inputCloseMode = parseInt(e.target.value);
        setCloseMode(inputCloseMode);
        window.electronApi.setStore(storeKeys.closeMode, inputCloseMode);
        window.electronApi.setCloseModeFlag(inputCloseMode);
    }

    function changeTheme(value) {
        setTheme(value);
        window.electronApi.setStore(storeKeys.theme, value);
    }

    return (
        <div className='setting'
            style={showFlag ? null : {display: 'none'}}
        >
            <div
                className='setting-container'
                onClick={() => {
                    setThemeSelectShowFlag(false);
                }}
            >
                <div className='setting-top'>
                    <i
                        className='icon-close'
                        onClick={onClose}
                    />
                </div>
                <div className='setting-body'>
                    <div>
                        <div className='label'>歌曲路径：</div>
                        <div className='path-input'>
                            <div className='path'>
                                {songPath}
                            </div>
                            <i
                                className='icon-path'
                                onClick={selectDir}
                            />
                        </div>
                    </div>
                    <div>
                        <div className='label'>主题：</div>
                        <div
                            className={classNames({
                                'setting-theme': true,
                                'active': themeSelectShowFlag
                            })}
                            onClick={(e) => {
                                e.stopPropagation();
                                setThemeSelectShowFlag(!themeSelectShowFlag);
                            }}
                        >
                            <div className='theme-value'>{themeEnums.get(theme)}</div>
                            <div className='theme-arrow'></div>
                            <div className='theme-select'>
                                <div
                                    onClick={() => {
                                        changeTheme(1);
                                    }}
                                >
                                    {themeEnums.get(1)}
                                </div>
                                <div
                                    onClick={() => {
                                        changeTheme(2);
                                    }}                                    
                                >
                                    {themeEnums.get(2)}
                                </div>
                            </div>                            
                        </div>
                    </div>                    
                    <div>
                        <div className='label'>关闭主面板：</div>
                        <div className='setting-close'>
                            <input
                                type="radio"
                                id="setting-close-min"
                                name="setting-close"
                                value={1}
                                checked={closeMode === 1}
                                onChange={changeCloseMode}
                            />
                            <label htmlFor="setting-close-min">最小化</label>
                        </div>
                        <div className='setting-close'>
                            <input
                                type="radio"
                                id="setting-close-quit"
                                name="setting-close"
                                value={2}
                                checked={closeMode === 2}
                                onChange={changeCloseMode}
                            />
                            <label htmlFor="setting-close-quit">退出</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}