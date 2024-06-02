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
    const { playId, setPlaySongs, setCurrentSong, setPlayStatus, activeLive2d } = props;
    const [fileList, setFileList] = useState([]);
    const [showFileList, setShowFileList] = useState([]);
    const [searchValue, setSearchValue] = useState("");

    const {
        selectedItems: selectedFiles,
        initSelect,
        clickItem: clickFile
    } = useSelectList(showFileList, 'localFileList');

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

    const [deleteConfDlgShowFlag, setDeleteConfDlgShowFlag] = useState(false);
    const [importConfDlgShowFlag, setImportConfDlgShowFlag] = useState(false);

    const isInit = useRef(false);
    const fuze = useRef(null);
    const copyFilePaths = useRef([]);
    const menuItemIndex = useRef(0);

    const $localFile = useRef(null);

    useEffect(() => {
        let songPath = window.electronApi.getStore(storeKeys.songPath);
        window.electronApi.getLocalFileData(songPath).then(data => {
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
        searchFiles(searchValue);

        let playSongs = window.electronApi.getStore(storeKeys.playSongs);
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
        let songPath = window.electronApi.getStore(storeKeys.songPath);
        window.electronApi.getLocalFileData(songPath).then(data => {
            isInit.current = true;
            setFileList(data);
        });
        initSelect();
    }


    function contextMenuFile(e, file, index) {
        e.preventDefault();
        setMenuPosition({ x: e.clientX, y: e.clientY });
        setIsMenuOpen(true);
        menuItemIndex.current = index;

        clickFile(file, index, false);
    }

    function addToPlayList(isPlay) {
        console.log(selectedFiles);
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
            const currentSongData = showFileList[menuItemIndex.current];
            let currentSongIndex = 0;
            playSongsData.forEach((value, index) => {
                if (value.id === currentSongData.id) {
                    currentSongIndex = index;
                }
            });
            setCurrentSong(currentSongData, currentSongIndex);
            setPlayStatus(true);
            activeLive2d();
        }
    }

    function deleteFiles() {
        const filePaths = selectedFiles.map(value => value.path);
        window.electronApi.deleteFiles(filePaths);
    }

    function getFileListDom() {
        const selectedFileIds = new Set(selectedFiles.map(value => value.id));

        return showFileList.map((file, index) => {
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
                    onDoubleClick={() => {
                        menuItemIndex.current = index;
                        addToPlayList(true);
                    }}
                    onContextMenu={e => {
                        contextMenuFile(e, file, index);
                    }}
                >
                    <div className='index'>
                        <div className='mark'>
                            <i className='icon-play2' />
                        </div>
                        <div className='number'>
                            {fileIndex}
                        </div>                        
                    </div>
                    <div className='name' title={file.name}>{file.showInfo.name}</div>
                    <div className='artists' title={fileArtists}>{file.showInfo.artists}</div>
                    <div className='album' title={file.album}>{file.showInfo.album}</div>
                    <div className='duration'>{fileDuration}</div>
                </div>
            )
        })
    }

    function playAllSongs() {
        setPlaySongs([...fileList]);
        const currentSong = fileList.length === 0 ? null : fileList[0];
        setCurrentSong(currentSong, 0);
        setPlayStatus(true);
        activeLive2d();
    }

    function searchFiles(value) {
        initSelect();
        setSearchValue(value);
        if (value === "") {
            const list = fileList.map(item => {
                item.showInfo = {
                    name: item.name,
                    artists: item.artists.join('/'),
                    album: item.album
                }
                return item;
            })
            setShowFileList(list);
            return;
        }
        const searchList = fuze.current.search(value);

        const handleList = searchList.map(listItem => {
            const { item, matches } = listItem;
            item.showInfo = {
                name: item.name,
                artists: item.artists.join('/'),
                album: item.album
            }
            const { key, value, indices } = matches[0];
            const [start, end] = indices[0];
            const highLightValue = [
                value.slice(0, start),
                <span className='high-light' key='high-light'>{value.slice(start, end + 1)}</span>,
                value.slice(end + 1)
            ];
            if (key === 'artists') {
                const { refIndex } = matches[0];
                const artists = [...item.artists];
                artists[refIndex] = highLightValue;
                artists.forEach((value, index) => {
                    if (index === artists.length - 1) return;
                    if (index === refIndex) {
                        value.push("/");
                    } else {
                        artists[index] = value + "/";
                    }
                });
                item.showInfo.artists = artists;
            } else {
                item.showInfo[key] = highLightValue;
            }
            return item;
        });
        setShowFileList(handleList);
    }

    function importSongs() {
        window.electronApi.importSongs().then(data => {
            const { canceled, filePaths } = data;
            if (canceled === true) {
                return;
            }            
            const storeSongPath = window.electronApi.getStore(storeKeys.songPath);
            copyFilePaths.current = filePaths;
            window.electronApi.isFileExistInPath(filePaths, storeSongPath).then(isExist => {
                if (isExist) {
                    setImportConfDlgShowFlag(true);
                } else {
                    copySongs();
                }
            });
        });
    }

    function copySongs(type="cover") {
        const storeSongPath = window.electronApi.getStore(storeKeys.songPath);
        window.electronApi.copyFiles(copyFilePaths.current, storeSongPath, type);
    }

    return (
        <>
            <div className='local_file' ref={$localFile}>
                <div className='file_operator'>
                    <div className='operator_left'>
                        <div className='play_all_button' onClick={playAllSongs}>
                            <i className='icon-play2' />
                            播放全部
                        </div>
                        <i
                            className='icon-add'
                            onClick={importSongs}
                            title='导入歌曲'
                        />
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
                showFlag={deleteConfDlgShowFlag}
                message="确认要删除选中的歌曲？"
                onClose={() => { setDeleteConfDlgShowFlag(false) }}
                onConfirm={deleteFiles}
            />

            <ConfirmDialog
                showFlag={importConfDlgShowFlag}
                message="歌曲目录下已存在与导入歌曲相同文件名的歌曲，是否要覆盖？"
                confirmText="是"
                cancelText="否"
                onClose={() => { setImportConfDlgShowFlag(false) }}
                onConfirm={() => { copySongs("cover") }}
                onCancel={() => { copySongs("uncover") }}
            />

            <ControlledMenu
                boundingBoxRef={$localFile}                
                anchorPoint={menuPosition}                
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
                        const filePath = showFileList[menuItemIndex.current].path;
                        window.electronApi.showFileInExplorer(filePath);
                    }}
                >
                    打开文件所在目录
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        setDeleteConfDlgShowFlag(true);
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