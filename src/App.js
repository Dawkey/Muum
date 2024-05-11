import { useEffect, useRef, useState } from 'react';
import '@szhsin/react-menu/dist/index.css';
import './assets/icons/style.css';
import './themes/index.scss';
import './App.scss';

import TopMenu from './views/TopMenu';
import Setting from './components/Setting';
import LocalFile from './views/LocalFile';
import Player from './views/Player';
import Live2D from './views/Live2D';
import { storeKeys } from './utils/config';

function App() {
    const [playList, setPlayList] = useState([]);
    const [playIndex, setPlayIndex] = useState(0);
    const [playStatus, setPlayStatus] = useState(false);
    const [playId, setPlayId] = useState('');

    const initFlag = useRef(false);
    const live2dRef = useRef(null);

    initStoreData();

    useEffect(()=>{
        let songPath = window.electronApi.getStore(storeKeys.songPath);
        window.electronApi.watchSongPath(songPath);
    }, []);

    function initStoreData() {
        if(initFlag.current){
            return;
        }
        initFlag.current = true;

        let songPath = window.electronApi.getStore(storeKeys.songPath);
        let currentSong = window.electronApi.getStore(storeKeys.currentSong);
        let playSongs = window.electronApi.getStore(storeKeys.playSongs);
        let playMode = window.electronApi.getStore(storeKeys.playMode);
        let volume = window.electronApi.getStore(storeKeys.volume);
        let closeMode = window.electronApi.getStore(storeKeys.closeMode);

        songPath = songPath ? songPath : "";
        currentSong = currentSong ? currentSong : null;
        playSongs = playSongs ? playSongs: [];
        playMode = playMode ? playMode : 1;
        volume = volume ? volume : 0.2;
        closeMode = closeMode ? closeMode : 1;

        window.electronApi.setStore(storeKeys.songPath, songPath);
        window.electronApi.setStore(storeKeys.currentSong, currentSong);
        window.electronApi.setStore(storeKeys.playSongs, playSongs);
        window.electronApi.setStore(storeKeys.playMode, playMode);
        window.electronApi.setStore(storeKeys.volume, volume);
        window.electronApi.setStore(storeKeys.closeMode, closeMode);
    }    

    function setPlaySongs(data) {
        const playSongs = data.map(value => {
            return {
                path: value.path,
                name: value.name
            }
        })
        window.electronApi.setStore(storeKeys.playSongs, playSongs);
        setPlayList(data);

        if(playSongs.length === 0) {
            setCurrentSong(null);
            return;
        }

        const currentSong = window.electronApi.getStore(storeKeys.currentSong);
        let currentSongData = null;
        let currentSongIndex = null;
        if (currentSong) {
            data.forEach((value, index) => {
                if (value.path === currentSong.path && value.name === currentSong.name) {
                    currentSongData = value;
                    currentSongIndex = index;
                }
            });
        }
        if(currentSongData === null){
            if(data[playIndex]){
                currentSongData = data[playIndex];
                currentSongIndex = playIndex;
            }else{
                currentSongData = data[data.length - 1];
                currentSongIndex = data.length - 1;
            }
        }        
        setCurrentSong(currentSongData, currentSongIndex);
    }

    function setCurrentSong(data, index) {
        if(data === null){
            window.electronApi.setStore(storeKeys.currentSong, null);
            setPlayIndex(-1);
            setPlayId(null);
            return;
        }
        const currentSong = {
            path: data.path,
            name: data.name
        }
        window.electronApi.setStore(storeKeys.currentSong, currentSong);

        setPlayIndex(index);
        setPlayId(data.id);
    }

    function activeLive2d(){
        live2dRef.current.changeAnimation();
    }

    return (
        <div className="app white">
            <TopMenu/>

            <div className='app-body'>                
                <LocalFile
                    playId={playId}
                    setPlaySongs={setPlaySongs}
                    setCurrentSong={setCurrentSong}
                    setPlayStatus={setPlayStatus}
                    activeLive2d={activeLive2d}
                />

                <Player
                    playList={playList}
                    playIndex={playIndex}
                    playStatus={playStatus}
                    playId={playId}
                    setPlaySongs={setPlaySongs}
                    setCurrentSong={setCurrentSong}
                    setPlayStatus={setPlayStatus}
                    activeLive2d={activeLive2d}
                />
            </div>

            <Live2D ref={live2dRef}/>
        </div>
    );
}

export default App;
