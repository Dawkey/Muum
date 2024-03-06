import { useState } from 'react';
import '@szhsin/react-menu/dist/index.css';
import './assets/icons/style.css';
import './App.scss';

// import Home from './views/Home';
import LocalFile from './views/LocalFile';
import Player from './views/Player';
import { storeKeys } from './utils/config';

function App() {
    const [playList, setPlayList] = useState([]);
    const [playIndex, setPlayIndex] = useState(0);
    const [playId, setPlayId] = useState('');


    function setPlaySongs(data) {
        console.log("change play songs");
        console.log(data);        
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

    return (
        <div className="App">
            {/* <Home/> */}
            <LocalFile
                playId={playId}
                setPlaySongs={setPlaySongs}
                setCurrentSong={setCurrentSong}
            />

            <Player
                playList={playList}
                playIndex={playIndex}
                playId={playId}
                setPlaySongs={setPlaySongs}
                setCurrentSong={setCurrentSong}                
            />
        </div>
    );
}

export default App;
