import { React, useEffect, useState } from 'react';
import './Setting.scss';
import { storeKeys } from '../utils/config';

export default function Setting(props) {
    const { showFlag, onClose } = props;
    
    const [songPath, setSongPath] = useState("");
    const [closeMode, setCloseMode] = useState(1);

    useEffect(() => {
        const storeSongPath = window.electronApi.getStore(storeKeys.songPath);
        const storeCloseMode = window.electronApi.getStore(storeKeys.closeMode);
        setSongPath(storeSongPath);
        setCloseMode(storeCloseMode);
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
    }

    return (
        <div className='setting'
            style={showFlag ? null : {display: 'none'}}
        >
            <div className='setting-container'>
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