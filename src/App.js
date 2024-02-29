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
    const [playSongId, setPlaySongId] = useState(null);

    function setPlaySongs(data) {
        console.log("change play songs");
        console.log(data);
        setPlayList(data);
        const playSongs = data.map(value => {
            return {
                path: value.path,
                name: value.name
            }
        })
        window.electronApi.setStore(storeKeys.playSongs, playSongs);
    }

    function setCurrentSong(data) {
        if(data === null){
            window.electronApi.setStore(storeKeys.currentSong, null);
            return;
        }
        // console.log(data);
        setPlaySongId(data.id);
        const currentSong = {
            path: data.path,
            name: data.name
        }
        window.electronApi.setStore(storeKeys.currentSong, currentSong);
    }

    return (
        <div className="App">
            {/* <Home/> */}
            <LocalFile
                setPlaySongs={setPlaySongs}
                setCurrentSong={setCurrentSong}
            />

            <Player
                playList={playList}
                playSongId={playSongId}
            />
        </div>
    );
}

export default App;
