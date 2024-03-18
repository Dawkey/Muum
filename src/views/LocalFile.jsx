import { React, useEffect, useRef, useState, } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { ControlledMenu, MenuItem } from '@szhsin/react-menu';
import Fuse from 'fuse.js';
import ConfirmDialog from '../components/ConfirmDialog';
import './LocalFile.scss';
import { numberToTime } from '../utils/tool';
import { storeKeys } from '../utils/config';
import useSelectList from '../hooks/useSelectList';


function LocalFile(props) {
    const { playId, setPlaySongs, setCurrentSong } = props;
    const [fileList, setFileList] = useState([]);
    const [showFileList, setShowFileList] = useState([]);
    const [searchValue, setSearchValue] = useState("");

    const {
        selectedItems: selectedFiles,
        initSelect,
        clickItem: clickFile
    } = useSelectList(fileList, 'localFileList');

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [menuItemIndex, setMenuItemIndex] = useState(0);

    const [confirmDlgShowFlag, setConfirmDlgShowFlag] = useState(false);

    const isInit = useRef(false);
    const fuze = useRef(null);

    useEffect(() => {
        window.electronApi.getLocalFileData().then(data => {
            isInit.current = true;
            setFileList(data);
        });

        window.electronApi.onFileChange(() => {
            initFileList();
        });

    }, []);

    useEffect(() => {
        if (!isInit.current) return;

        const fuzeOptions = {
            keys: ["name", "artists", "album"],
            includeMatches: true,
            threshold: 0.1
        }
        fuze.current = new Fuse(fileList, fuzeOptions);

        const playSongs = window.electronApi.getStore(storeKeys.playSongs);
        const playSongsMap = new Map(
            playSongs.map(value => {
                return [value.path, value.name];
            })
        );
        const playSongsData = fileList.filter(value => {
            return (
                playSongsMap.has(value.path) &&
                playSongsMap.get(value.path) === value.name
            );
        });
        setPlaySongs(playSongsData);

    }, [fileList]);

    function initFileList() {
        window.electronApi.getLocalFileData().then(data => {
            isInit.current = true;
            setFileList(data);
        });
        initSelect();
    }


    function contextMenuFile(e, file, index) {
        e.preventDefault();
        setMenuPosition({ x: e.clientX, y: e.clientY });
        setIsMenuOpen(true);
        setMenuItemIndex(index);

        clickFile(file, index, false);
    }

    function addToPlayList(isPlay) {
        const selectedFileIds = new Set(selectedFiles.map(value => value.id));
        let isAdd = false;

        const playSongs = window.electronApi.getStore(storeKeys.playSongs);
        const playSongsMap = new Map(
            playSongs.map(value => {
                return [value.path, value.name];
            })
        );
        const playSongsData = fileList.filter(value => {
            if (playSongsMap.has(value.path) && playSongsMap.get(value.path) === value.name) {
                return true;
            }
            if (selectedFileIds.has(value.id)) {
                isAdd = true;
                return true;
            }
            return false;
        });

        if (isAdd) {
            setPlaySongs(playSongsData);
        }
        if (isPlay) {
            const currentSongData = fileList[menuItemIndex];
            let currentSongIndex = 0;
            playSongsData.forEach((value, index) => {
                if (value.id === currentSongData.id) {
                    currentSongIndex = index;
                }
            });
            setCurrentSong(currentSongData, currentSongIndex);
        }
    }

    function deleteFiles() {
        const filePaths = selectedFiles.map(value => value.path);
        window.electronApi.deleteFiles(filePaths);
    }

    function getFileListDom() {
        const selectedFileIds = new Set(selectedFiles.map(value => value.id));

        return fileList.map((file, index) => {
            const fileIndex = index + 1 < 10 ? `0${index + 1}` : index + 1;
            const fileArtists = file.artists.join("/");
            const fileDuration = numberToTime(file.duration);
            return (
                <div
                    className={classNames({
                        file: true,
                        selected: selectedFileIds.has(file.id),
                        active: file.id === playId
                    })}
                    key={file.id}
                    onClick={() => {
                        clickFile(file, index);
                    }}
                    onContextMenu={e => {
                        contextMenuFile(e, file, index);
                    }}
                >
                    <div className='mark'>
                        <i  className='icon-play2'/>
                    </div>
                    <div className='index'>{fileIndex}</div>
                    <div className='name' title={file.name}>{file.name}</div>
                    <div className='artists' title={fileArtists}>{fileArtists}</div>
                    <div className='album' title={file.album}>{file.album}</div>
                    <div className='duration'>{fileDuration}</div>
                </div>
            )
        })
    }

    function playAllSongs() {
        setPlaySongs([...fileList]);
        const currentSong = fileList.length === 0 ? null : fileList[0];
        setCurrentSong(currentSong, 0);
    }

    function searchFiles(value) {        
        setSearchValue(value);
        if (value === "") {
            setShowFileList([...fileList]);
            return;
        }        
        const searchList = fuze.current.search(value);
        const handleList = searchList.map(listItem => {
            const { item, matches } = listItem;
            return item;
        });
        setShowFileList(handleList);
    }

    return (
        <>
            <div className='local_file'>
                <div className='file_operator'>
                    <div className='play_all_button' onClick={playAllSongs}>
                        <i className='icon-play2' />
                        播放全部
                    </div>
                    <div className='search_input'>
                        <input
                            className='input'
                            placeholder='搜索本地音乐'
                            onChange={e => {
                                const value = e.target.value;
                                searchFiles(value);
                            }}
                            value={searchValue}
                        />
                        <i className='icon-search' />
                    </div>
                </div>
                <div className='file_list'>
                    <div className='file title'>
                        <div className='index'></div>
                        <div className='name'>音乐名称</div>
                        <div className='artists'>创作者</div>
                        <div className='album'>专辑</div>
                        <div className='duration'>时长</div>
                    </div>
                    <div
                        className='local_file_songs'
                    >
                        {getFileListDom()}
                    </div>
                </div>
            </div>
            
            <ConfirmDialog
                showFlag={confirmDlgShowFlag}
                message="确认要删除选中的歌曲？"
                onClose={() => { setConfirmDlgShowFlag(false) }}
                onConfirm={deleteFiles}
            />

            <ControlledMenu
                anchorPoint={menuPosition}
                direction='right'
                state={isMenuOpen ? 'open' : 'closed'}
                onClose={() => { setIsMenuOpen(false) }}
            >
                <MenuItem
                    onClick={() => {
                        addToPlayList(true);
                    }}
                >
                    播放
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        addToPlayList(false);
                    }}
                >
                    添加到播放列表
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        const filePath = fileList[menuItemIndex].path;
                        window.electronApi.showFileInExplorer(filePath);
                    }}
                >
                    打开文件所在目录
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        setConfirmDlgShowFlag(true);
                    }}
                >
                    删除本地文件
                </MenuItem>
            </ControlledMenu>
        </>
    )
}

LocalFile.propTypes = {
    setPlaySongs: PropTypes.func,
    setCurrentSong: PropTypes.func
}

LocalFile.defaultProps = {
    setPlaySongs: () => { },
    setCurrentSong: () => { }
}

export default LocalFile;