import { React, forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import './Live2D.scss';
// import spine40 from '../utils/spine/spine-player4.0';
import spine41 from '../utils/spine/spine-player4.1';

function Live2D(props, ref) {
    const spineCanvas = useRef(null);

    useEffect(() => {
        if (spineCanvas.current) {
            return;
        }

        let spine = spine41;
        spineCanvas.current = new spine.SpinePlayer('muum-live2d', {
            "skelUrl": "/l2d/c810_01/c810_01_00.skel",
            "atlasUrl": "/l2d/c810_01/c810_01_00.atlas",
            "animation": "idle",
            "skin": "acc",
            "backgroundColor": "#00000000",
            "alpha": true,
            "premultipliedAlpha": true,
            "preserveDrawingBuffer": true,
            //对于2B的live2D很关键
            "defaultMix": 0,
            "showControls": false,
            "showLoading": false,
            "viewport": {
                x: 0,
                y: 0,
                padLeft: 0,
                padRight: 0,
                padTop: 0,
                padBottom: 0,
                transitionTime: 0,
            }
        });
    }, []);

    useImperativeHandle(ref, () => {
        return {
            changeAnimation
        }
    }, []);

    function changeAnimation() {
        const animation = spineCanvas.current.animationState.tracks[0].animation.name;
        if (animation === "action") return;
        spineCanvas.current.setAnimation("action", false);
        spineCanvas.current.addAnimation("idle", true);
    }


    return (
        <>
            <div className='live2d' id='muum-live2d'></div>
            <div className='refer'></div>
        </>
    )
}

export default forwardRef(Live2D);