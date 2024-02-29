import { React, useState, } from 'react';
import PropTypes from 'prop-types';
import './PlaySongList.scss';
import { numberToTime } from '../utils/tool';
import { ControlledMenu, MenuItem } from '@szhsin/react-menu';

function PlaySongList(props) {
    const {
        showFlag,
        playList,
        playIndex,
        jumpToSong,        
    } = props;

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });    

    function getSongListDom() {
        return playList.map((song, index) => {
            return (
                <div
                    className={`song ${index === playIndex ? 'active' : ''}`}
                    key={song.id}
                    onDoubleClick={() => {
                        jumpToSong(index);
                    }}
                    onContextMenu={e => {
                        e.preventDefault();
                        setMenuPosition({ x: e.clientX, y: e.clientY });
                        setIsMenuOpen(true);
                    }}
                >
                    <div className='mark'></div>
                    <div className='name'>{song.name}</div>
                    <div className='artist'>{song.artists.join("/")}</div>
                    <div className='duration'>{numberToTime(song.duration)}</div>
                </div>
            )
        })
    }

    return (
        <div
            className='player_playSongList'
            style={showFlag ? null : { display: 'none' }}
        >
            <ControlledMenu
                anchorPoint={menuPosition}
                direction='right'
                state={isMenuOpen ? 'open' : 'closed'}
                onClose={() => { setIsMenuOpen(false) }}                
            >
                <MenuItem>播放</MenuItem>
                <MenuItem>从播放列表中移除</MenuItem>
            </ControlledMenu>
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