import { React, useEffect, useRef, useState, } from 'react';
import PropTypes from 'prop-types';
import { ControlledMenu, MenuItem } from '@szhsin/react-menu';
import './LocalFile.scss';
import { numberToTime } from '../utils/tool';


function LocalFile(props) {
    const { setPlayList, setPlaySongId } = props;
    const [fileList, setFileList] = useState([]);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });    
    
    let selectedFileIds = useRef([]);

    useEffect(() => {
        window.electronApi.getLocalFileData().then(data => {
            setFileList(data);
        });
    }, []);

    function getParentNodeDom(child, className) {
        let node = child;
        while (node !== null) {
            if (node.classList.contains(className)) {
                return node;
            }
            node = child.parentNode;
        }
        return null;
    }

    function getFileListDom() {
        return fileList.map((file, index) => {
            index++;
            const fileIndex = index < 10 ? `0${index}` : index;
            const fileArtists = file.artists.join("/");
            const fileDuration = numberToTime(file.duration);
            return (
                <div className='file' key={file.id} data-id={file.id}>
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
        setPlayList([...fileList]);
        setPlaySongId(fileList[0].id);
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
                        const fileId = selectedFileIds.current[0];
                        setPlayList([...fileList]);
                        setPlaySongId(fileId);
                    }}
                >播放</MenuItem>
                <MenuItem>删除</MenuItem>
                <MenuItem>添加到播放列表</MenuItem>
                <MenuItem>打开文件所在目录</MenuItem>                
            </ControlledMenu>

            <div className='file_operator'>
                <div className='play_all_button' onClick={playAllSongs}>
                    <i className='icon-play'/>
                    播放全部
                </div>
                <div className='search_input'>
                    <input
                        className='input'
                        placeholder='输入音乐名称搜索'
                    />
                    <i className='icon-search'/>
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
                    onContextMenu={e => {
                        e.preventDefault();
                        setMenuPosition({ x: e.clientX, y: e.clientY });
                        setIsMenuOpen(true);
                        const fileDom = getParentNodeDom(e.target, 'file');
                        selectedFileIds.current = [fileDom.dataset.id];
                    }}
                >
                    {getFileListDom()}
                </div>
            </div>
        </div>
    )
}

LocalFile.propTypes = {
    setPlayList: PropTypes.func,
    setPlaySongId: PropTypes.func
}

LocalFile.defaultProps = {
    setPlayList: () => { },
    setPlaySongId: () => { }
}

export default LocalFile;