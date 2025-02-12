import { React, useEffect, useRef, useState, } from 'react';
import PropTypes from 'prop-types';
import Marquee from 'react-fast-marquee';

function MarqueeText(props) {

    const { className, text, parentDom, resetKey } = props;
    
    const [play, setPlay] = useState(false);

    const $text = useRef(null);

    useEffect(() => {
        setPlay(false);
     }, [resetKey]);

    return (
        <Marquee
            key={play}
            play={play}
            loop={0}
            speed={30}
            onCycleComplete={() => {
                setPlay(false);
            }}
        >
            <div
                className={className}
                ref={$text}
                onMouseEnter={() => {
                    if ($text.current.clientWidth > parentDom.current.clientWidth) {
                        setPlay(true);
                    }                                        
                }}
            >
                {text}
            </div>
            <div style={{width: "1.5rem"}}/>
        </Marquee>
    )    

}

MarqueeText.propTypes = {
    className: PropTypes.string,
    text: PropTypes.string,
    parentDom: PropTypes.object,
    resetKey: PropTypes.string
}

export default MarqueeText;