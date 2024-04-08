import { React, useEffect, useState, } from 'react';
import PropTypes from 'prop-types';
import './PlaySongList.scss';
import { numberToTime } from '../utils/tool';
import { ControlledMenu, MenuItem } from '@szhsin/react-menu';
import useSelectList from '../hooks/useSelectList';
import classNames from 'classnames';

function PlaySongList(props) {
    const {
        showFlag,
        playList,
        playIndex,
        jumpToSong,
        setPlaySongs,
    } = props;

    const {
        selectedItems,
        initSelect,
        clickItem
    } = useSelectList(playList, 'playSongList');

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [menuItemIndex, setMenuItemIndex] = useState(0);

    useEffect(() => {
        initSelect();
     }, [playList]);

    function getSongListDom() {
        const selectedItemIds = new Set(selectedItems.map(value => value.id));
        return playList.map((song, index) => {
            return (
                <div
                    className={classNames({
                        song: true,
                        active: index === playIndex,
                        selected: selectedItemIds.has(song.id)
                    })}
                    key={song.id}
                    onClick={() => {
                        clickItem(song, index);
                    }}
                    onDoubleClick={() => {
                        jumpToSong(index);
                    }}
                    onContextMenu={e => {
                        e.preventDefault();
                        setMenuPosition({ x: e.clientX, y: e.clientY });
                        setIsMenuOpen(true);
                        setMenuItemIndex(index);

                        clickItem(song, index, false);
                    }}
                >
                    <div className='mark'>
                        <i  className='icon-play2'/>
                    </div>
                    <div className='name'>{song.name}</div>
                    <div className='artist'>{song.artists.join("/")}</div>
                    <div className='duration'>{numberToTime(song.duration)}</div>
                </div>
            )
        })
    }

    return (
        <div
            className='playSongList'
            style={showFlag ? null : { display: 'none' }}
        >
            <ControlledMenu
                anchorPoint={menuPosition}
                direction='right'
                state={isMenuOpen ? 'open' : 'closed'}
                onClose={() => { setIsMenuOpen(false) }}                
            >
                <MenuItem
                    onClick={() => {
                        jumpToSong(menuItemIndex);
                    }}
                >
                    播放
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        const selectedItemIds = new Set(selectedItems.map(value => value.id));
                        const playSongsData = playList.filter(value => {
                            return !selectedItemIds.has(value.id);
                        });
                        setPlaySongs(playSongsData);
                    }}
                >
                    从播放列表中移除
                </MenuItem>
            </ControlledMenu>

            <div className='play_list_top'>
                <div className='total'>共{playList.length}首</div>
                <div
                    className='clear_list'
                    onClick={() => {
                        setPlaySongs([]);
                    }}
                >
                    清空列表
                </div>
            </div>

            <div className='play_list_body'>
                {getSongListDom()}
            </div>            
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