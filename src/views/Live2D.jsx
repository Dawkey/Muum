import { React, forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import './Live2D.scss';
// import spine40 from '../utils/spine/spine-player4.0';
import spine41 from '../utils/spine/spine-player4.1';
import classNames from 'classnames';

function Live2D(props, ref) {
    const { theme } = props;

    const spineCanvas = useRef(null);

    useEffect(() => {
        if (spineCanvas.current) {
            spineCanvas.current.dispose();
        }

        let spine = spine41;

        const commonParam = {
            "animation": "idle",
            "backgroundColor": "#00000000",
            "defaultMix": 0,
            "alpha": true,
            "premultipliedAlpha": true,
            "preserveDrawingBuffer": true,
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
        }

        const nierParam = {
            "skelUrl": "./l2d/c810_01/c810_01_00.skel",
            "atlasUrl": "./l2d/c810_01/c810_01_00.atlas",
            "skin": "acc",
        }

        const cinderellaParam = {
            "skelUrl": "./l2d/c511_01/c511_01_00.skel",
            "atlasUrl": "./l2d/c511_01/c511_01_00.atlas",
            "skin": "default",
        }

        const themeParam = theme === 1 ? nierParam : cinderellaParam;

        spineCanvas.current = new spine.SpinePlayer('muum-live2d', { ...commonParam, ...themeParam });
    }, [theme]);

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
            <div
                className={classNames({
                    'nier': theme === 1,
                    'cinderella': theme === 2
                })}
                id='muum-live2d'>            
            </div>
            <div className='refer'></div>
        </>
    )
}

export default forwardRef(Live2D);