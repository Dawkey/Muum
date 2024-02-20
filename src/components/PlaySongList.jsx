import { React, } from 'react';
import PropTypes from 'prop-types';
import './PlaySongList.scss';

function PlaySongList(props) {
    const {
        showFlag,
        playList,
        playIndex,
        jumpToSong,        
    } = props;

    function getSongListDom() {
        return playList.map((song, index) => {
            return (
                <div
                    className={`song ${index === playIndex ? 'active' : ''}`}
                    key={song.id}
                    onDoubleClick={() => {
                        jumpToSong(index);
                    }}
                >
                    <div className='mark'></div>
                    <div className='name'>{song.name}</div>
                    <div className='artist'>{song.artists.join("/")}</div>
                    <div className='duration'>{song.duration}</div>
                </div>
            )
        })
    }

    return (
        <div
            className='player_playSongList'
            style={showFlag ? null : { display: 'none' }}
        >
            {getSongListDom()}
        </div>
    )
}

PlaySongList.propTypes = {
    showFlag: PropTypes.bool,
    playList: PropTypes.array,
    playIndex: PropTypes.number,
    jumpToSong: PropTypes.func
}

PlaySongList.defaultProps = {
    showFlag: false,
    playList: [],
    playIndex: 0,
    jumpToSong: () => { }
}

export default PlaySongList;