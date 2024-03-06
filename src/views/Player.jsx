import { React, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import './Player.scss';
import PlaySongList from '../components/PlaySongList';
import { numberToTime, shuffleArray } from '../utils/tool';

function Player(props) {
    const { playList, playIndex, playId, setPlaySongs, setCurrentSong } = props;

    const [playStatus, setPlayStatus] = useState(false);
    // 0-顺序播放 1-随机播放 2-单曲循环
    const [playMode, setPlayMode] = useState(1);

    const [audioSrc, setAudioSrc] = useState("");
    const [audioCurrentTime, setAudioCurrentTime] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);
    const [audioVolume, setAudioVolume] = useState(0.2);
    const [audioCover, setAudioCover] = useState("");

    // audioBarDragFlag、volumeBarDragFlag用来判定是否正在拖动进度条
    // audioBarDragProgress用来控制拖动音频进度条时的进度，因为不希望拖动时立刻改变音频进度，所以需要一个额外的变量来存储
    const [audioBarDragFlag, setAudioBarDragFlag] = useState(false);
    const [audioBarDragProgress, setAudioBarDragProgress] = useState(null);
    const [volumeBarDragFlag, setVolumeBarDragFlag] = useState(false);

    const [volumeBarShowFlag, setVolumeBarShowFlag] = useState(false);
    const [playSongListShowFlag, setPlaySongListShowFlag] = useState(false);


    // currentIndex: 当前播放歌曲在 indexs乱序索引数组中的位置（索引）
    // indexs: 随机播放使用的乱序索引数组
    const randomPlayIndexs = useRef({ currentIndex: 0, indexs: [] });    

    const $audio = useRef(null);
    const $audioProgressBar = useRef(null);
    const $volumeProgressBar = useRef(null);

    // 界面上音乐进度条的进度（受多个state影响）
    const playProgress = useMemo(() => {
        // 通过barDragProgress的null值判定，避免初始（上一个）值对界面进度条显示造成干扰，
        // 造成屏幕上进度条闪动
        if (audioBarDragFlag && audioBarDragProgress !== null) {
            return audioBarDragProgress;
        }
        if (audioDuration === 0) {
            return 0;
        }
        return audioCurrentTime / audioDuration;
    }, [audioCurrentTime, audioDuration, audioBarDragFlag, audioBarDragProgress]);


    useEffect(() => {
        if (playList.length === 0) return;

        console.log("play list change.");
        console.log(playList);
        const indexs = new Array(playList.length).fill(0)
            .map((value, index) => index);
        randomPlayIndexs.current.indexs = shuffleArray(indexs);
        randomPlayIndexs.current.currentIndex = randomPlayIndexs.current.indexs.indexOf(playIndex);

    }, [playList]);


    // 播放歌曲ID变化时，更换audio路径等相关逻辑
    useEffect(() => {
        if (playList.length === 0) return;
        const song = playList[playIndex];
        const { path } = song;
        setAudioSrc(path);
        randomPlayIndexs.current.currentIndex = randomPlayIndexs.current.indexs.indexOf(playIndex);

        window.electronApi.parseSongFile(path).then(data => {
            const { name, path, cover } = data;
            const coverUrl = URL.createObjectURL(new Blob([cover.data]));
            setAudioCover(coverUrl);
        });
        
    }, [playId]);

    // 播放模式切换到随机播放时，重新打乱索引数组
    useEffect(() => {
        if (playList.length === 0) return;
        if (playMode === 1) {
            const { indexs } = randomPlayIndexs.current;
            randomPlayIndexs.current.indexs = shuffleArray(indexs);
            randomPlayIndexs.current.currentIndex = randomPlayIndexs.current.indexs.indexOf(playIndex);
        }
    }, [playMode]);

    // 添加鼠标全局监听，用于进度条拖拽
    useEffect(() => {
        window.addEventListener('mousemove', dragProgress);
        window.addEventListener('mouseup', dropProgress);
        return () => {
            window.removeEventListener('mousemove', dragProgress);
            window.removeEventListener('mouseup', dropProgress);
        }
    }, [audioBarDragFlag, volumeBarDragFlag]);    

    useEffect(() => {
        $audio.current.volume = audioVolume;
    }, [audioVolume]);

    // 音频加载时
    function audioLoad() {
        setAudioCurrentTime(0);
        setAudioDuration($audio.current.duration);
        console.log($audio.current);
        if (playStatus) {
            $audio.current.play();
        }
    }

    // 音频更新时
    function audioUpdate() {
        if (audioBarDragFlag) {
            return;
        }
        setAudioCurrentTime($audio.current.currentTime);
    }

    // 音频结束时（如果为单曲循环模式，重新播放该歌曲）
    function audioEnd() {
        if (playMode === 2) {
            setAudioCurrentTime(0);
            $audio.current.currentTime = 0;
            $audio.current.play();
        } else {
            nextSong();
        }
    }

    // 音乐播放和暂停
    function toggleSong() {
        if (playStatus) {
            setPlayStatus(false);
            $audio.current.pause();
        } else {
            setPlayStatus(true);
            $audio.current.play();
        }
    }

    // 下一首
    function nextSong() {
        switchSong('next');
    }

    // 上一首
    function prevSong() {
        switchSong('prev');
    }


    // 根据事件计算【音频】进度条的进度
    function calculateAudioProgress(e) {
        const progressBarRect = $audioProgressBar.current.getBoundingClientRect();
        let length = e.clientX - progressBarRect.left;
        const total = progressBarRect.width;

        if (length < 0) {
            length = 0;
        }
        if (length > total) {
            length = total;
        }
        return length / total;
    }

    // 点击【音频】进度条
    function clickAudioProgress(e) {
        const progress = calculateAudioProgress(e);
        const currentTime = progress * audioDuration;
        $audio.current.currentTime = currentTime;
        setAudioCurrentTime(currentTime);
        setAudioBarDragFlag(true);
    }

    // 根据事件计算【音量】进度条的进度
    function calculateVolumeProgress(e) {
        const progressBarRect = $volumeProgressBar.current.getBoundingClientRect();
        const total = progressBarRect.height;
        let length = total - (e.clientY - progressBarRect.top);

        if (length < 0) {
            length = 0;
        }
        if (length > total) {
            length = total;
        }
        return length / total;
    }

    // 点击【音量】进度条
    function clickVolumeProgress(e) {
        const progress = calculateVolumeProgress(e);
        console.log(progress);
        setAudioVolume(progress);
        setVolumeBarDragFlag(true);
    }

    // 拖动（音频、音量）进度条时（按压且移动鼠标）
    function dragProgress(e) {
        if (audioBarDragFlag) {
            const progress = calculateAudioProgress(e);
            const currentTime = progress * audioDuration;
            setAudioCurrentTime(currentTime);
            setAudioBarDragProgress(progress);
        }
        if (volumeBarDragFlag) {
            const progress = calculateVolumeProgress(e);
            setAudioVolume(progress);
        }
    }

    // 拖动后松开（音频、音量）进度条时（松开鼠标）
    function dropProgress(e) {
        if (audioBarDragFlag) {
            const progress = calculateAudioProgress(e);
            const currentTime = progress * audioDuration;
            $audio.current.currentTime = currentTime;
            setAudioCurrentTime(currentTime);
            setAudioBarDragFlag(false);
            setAudioBarDragProgress(null);
        }
        if (volumeBarDragFlag) {
            const progress = calculateVolumeProgress(e);
            setAudioVolume(progress);
            setVolumeBarDragFlag(false);
        }
    }


    // 切换音乐播放模式
    function togglePlayMode() {
        let mode = playMode + 1;
        mode = mode > 2 ? 0 : mode;
        setPlayMode(mode);
    }


    // 切换播放列表显示
    function toggleShowPlaySongList() {
        setPlaySongListShowFlag(!playSongListShowFlag);
    }

    // 切换歌曲上一曲、下一曲
    // 当播放模式为随机播放时，使用乱序索引数组；否则顺序播放（单曲循环也是）
    function switchSong(order) {
        const orderNum = order === 'next' ? 1 : -1;
        const modeIndex = playMode === 1 ? randomPlayIndexs.current.currentIndex : playIndex;

        let index = modeIndex + orderNum;
        if (index > playList.length - 1) {
            index = 0;
        }
        if (index < 0) {
            index = playList.length - 1
        }

        if (playMode === 1) {
            randomPlayIndexs.current.currentIndex = index;
            jumpToSong(randomPlayIndexs.current.indexs[index])
        } else {
            jumpToSong(index);
        }
    }

    // 根据索引跳转到对应歌曲
    function jumpToSong(index) {
        setCurrentSong(playList[index], index);
        if (playStatus === false) {
            toggleSong();
        }
    }

    return (
        <>
            <div className='player' draggable='false'>
                <audio
                    ref={$audio}
                    src={audioSrc}
                    onLoadedMetadata={audioLoad}
                    onTimeUpdate={audioUpdate}
                    onEnded={audioEnd}
                >
                </audio>

                {/* <div className='player_disc'>
                    <div className='needle'></div>
                    <div className='disc'></div>
                </div> */}

                <div className='player_operator'>

                    <div className='operator_left'>
                        <div className='cover'>
                            <img src={audioCover} alt=''/>
                        </div>
                        <div></div>
                    </div>
                    
                    <div className='operator_middle'>
                        <div className='operator_play'>
                            <i
                                className='icon-prev'
                                onClick={prevSong}
                            />
                            <i
                                className={playStatus ? 'icon-pause' : 'icon-play'}
                                onClick={toggleSong}
                            />
                            <i
                                className='icon-next'
                                onClick={nextSong}
                            />
                        </div>                        
                        <div className='operator_bar'>
                            <div className='time'>
                                {numberToTime(audioCurrentTime)}
                            </div>
                            <div
                                ref={$audioProgressBar}
                                className='bar'
                                onMouseDown={clickAudioProgress}
                            >
                                <div
                                    className='progress_bar'
                                    style={{ width: playProgress * 100 + "%" }}
                                ></div>
                                <span
                                    className='dot'
                                    style={{ left: playProgress * 100 + "%" }}
                                ></span>
                            </div>
                            <div className='time'>
                                {numberToTime(audioDuration)}
                            </div>
                        </div>
                    </div>
                    <div className='operator_right'>
                        <i
                            className={`icon-playMode icon-playMode${playMode}`}
                            onClick={togglePlayMode}
                        />
                        <div
                            className='operator_volume'
                            onMouseEnter={() => {
                                setVolumeBarShowFlag(true);
                            }}
                            onMouseLeave={() => {
                                setVolumeBarShowFlag(false);
                            }}
                        >
                            <i className='icon-volume' />
                            <div
                                className='volume_bar_container'
                                style={volumeBarShowFlag || volumeBarDragFlag ? null : { display: 'none' }}
                            >
                                <div className='volume_bar'>
                                    <div
                                        ref={$volumeProgressBar}
                                        className='bar'
                                        onMouseDown={clickVolumeProgress}
                                    >
                                        <div
                                            className='progress_bar'
                                            style={{ height: audioVolume * 100 + "%" }}
                                        ></div>
                                        <span
                                            className='dot'
                                            style={{ bottom: audioVolume * 100 + "%" }}
                                        ></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <i
                            className='icon-list'
                            onClick={toggleShowPlaySongList}
                        />
                    </div>
                </div>
            </div>
            
            <PlaySongList
                showFlag={playSongListShowFlag}
                playList={playList}
                playIndex={playIndex}
                jumpToSong={jumpToSong}
                setPlaySongs={setPlaySongs}
            />
        </>
    )
}

Player.propTypes = {
    playList: PropTypes.array
}

Player.defaultProps = {
    playList: []
}


export default Player;