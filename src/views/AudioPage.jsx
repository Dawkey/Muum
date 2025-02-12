import { React, useEffect, useRef } from 'react';
import './AudioPage.scss';
import { audio } from '../utils/audio/audio';

export default function AudioPage() {
    return (
        <div className='audio-page'>
            <div
                className="play-btn"
                onClick={() => {
                    audio.play();
                }}
            >Play</div>
        </div>
    )
}