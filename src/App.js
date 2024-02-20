import { useState } from 'react';
import '@szhsin/react-menu/dist/index.css';
import './assets/icons/style.css';
import './App.scss';

// import Home from './views/Home';
import LocalFile from './views/LocalFile';
import Player from './views/Player';

function App() {
    const [playList, setPlayList] = useState([]);
    const [playSongId, setPlaySongId] = useState(null);

    return (
        <div className="App">
            {/* <Home/> */}
            <LocalFile
                setPlayList={setPlayList}
                setPlaySongId={setPlaySongId}
            />

            <Player
                playList={playList}
                playSongId={playSongId}
            />
        </div>
    );
}

export default App;
