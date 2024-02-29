import { React, useEffect, useRef, useState, } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { ControlledMenu, MenuItem } from '@szhsin/react-menu';
import ConfirmDialog from '../components/ConfirmDialog';
import './LocalFile.scss';
import { numberToTime } from '../utils/tool';
import { storeKeys } from '../utils/config';


function LocalFile(props) {
    const { setPlaySongs, setCurrentSong } = props;
    const [fileList, setFileList] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

    const [confirmDlgShowFlag, setConfirmDlgShowFlag] = useState(false);

    const isInit = useRef(false);
    const isCtrl = useRef(false);
    const isShift = useRef(false);
    const shiftAnchorIndex = useRef(0);

    useEffect(() => {
        window.electronApi.getLocalFileData().then(data => {
            isInit.current = true;
            setFileList(data);            
        });

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        window.electronApi.onFileChange(() => {
            initFileList();
        });

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        }
    }, []);

    useEffect(() => {
        if (!isInit.current) return;
        
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
        
        const currentSong = window.electronApi.getStore(storeKeys.currentSong);
        let currentSongData = playSongsData.length === 0 ? null : playSongsData[0];
        if (currentSong) {
            fileList.forEach(value => {
                if (value.path === currentSong.path && value.name === currentSong.name) {
                    currentSongData = value;
                }
            });            
        }
        setCurrentSong(currentSongData);
    
    }, [fileList]);

    function initFileList() {
        window.electronApi.getLocalFileData().then(data => {
            isInit.current = true;
            setFileList(data);
        });
        setSelectedFiles([]);
        shiftAnchorIndex.current = 0;
    }

    function handleKeyDown(e) {
        if (e.key === 'Control' || e.key === 'Meta') {
            isCtrl.current = true;
        }
        if (e.key === 'Shift') {
            isShift.current = true;
        }
    }

    function handleKeyUp(e) {
        if (e.key === 'Control' || e.key === 'Meta') {
            isCtrl.current = false;
        }
        if (e.key === 'Shift') {
            isShift.current = false;
        }
    }

    function clickFile(file, index, selectedFileIds) {
        // 同时按下Ctrl和Shift时，用Shift多选逻辑生成的数组和已选择的数组合并得到新的数组
        if (isCtrl.current && isShift.current) {
            let leftIndex = index;
            let rightIndex = shiftAnchorIndex.current;
            if (leftIndex > rightIndex) {
                [leftIndex, rightIndex] = [rightIndex, leftIndex];
            }
            const newSelectedFiles = fileList.filter((value, index) => {
                if (selectedFileIds.has(value.id)) return true;
                if (index >= leftIndex && index <= rightIndex) return true;
                return false;
            });
            setSelectedFiles(newSelectedFiles);
            shiftAnchorIndex.current = index;
            return;
        }

        // 按下Ctrl时，支持选择多个和取消选择
        if (isCtrl.current) {
            let newSelectedFiles;
            if (selectedFileIds.has(file.id)) {
                newSelectedFiles = selectedFiles.filter(value => {
                    return value.id !== file.id;
                });
            } else {
                newSelectedFiles = [...selectedFiles];
                newSelectedFiles.push(file);
            }
            setSelectedFiles(newSelectedFiles);
            shiftAnchorIndex.current = index;
            return;
        }

        // 按下Shift时，支持批量选择和取消选择（以Shift特定锚元素的索引为起始，和window资源管理器文件逻辑类似）
        if (isShift.current) {
            let leftIndex = index;
            let rightIndex = shiftAnchorIndex.current;
            if (leftIndex > rightIndex) {
                [leftIndex, rightIndex] = [rightIndex, leftIndex];
            }
            setSelectedFiles(fileList.slice(leftIndex, rightIndex + 1));
            return;
        }

        setSelectedFiles([file]);
        shiftAnchorIndex.current = index;
    }

    function contextMenuFile(e, file, index, selectedFileIds) {
        e.preventDefault();
        setMenuPosition({ x: e.clientX, y: e.clientY });
        setIsMenuOpen(true);

        if (selectedFileIds.has(file.id)) return;
        setSelectedFiles([file]);
        shiftAnchorIndex.current = index;
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
            setCurrentSong(selectedFiles[0]);
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
                    })}
                    key={file.id}
                    onClick={() => {
                        clickFile(file, index, selectedFileIds);
                    }}
                    onContextMenu={e => {
                        contextMenuFile(e, file, index, selectedFileIds);
                    }}
                >
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
        setCurrentSong(currentSong);
    }

    return (
        <div className='local_file'>
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
                        const filePath = selectedFiles[0].path;
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

            <ConfirmDialog
                showFlag={confirmDlgShowFlag}
                message="确认要删除选中的歌曲？"
                onClose={() => { setConfirmDlgShowFlag(false) }}
                onConfirm={deleteFiles}
            />
            
            <div className='file_operator'>
                <div className='play_all_button' onClick={playAllSongs}>
                    <i className='icon-play' />
                    播放全部
                </div>
                <div className='search_input'>
                    <input
                        className='input'
                        placeholder='输入音乐名称搜索'
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