import { React } from 'react';
import './TopMenu.scss';

export default function TopMenu() {

    function minWindow() {
        window.electronApi.minWindow();
    }

    function maxWindow() {
        window.electronApi.maxWindow();
    }
    
    function closeWindow() {
        window.electronApi.closeWindow();
    }    

    return (
        <div className='top-menu'>
            <i
                className='icon-minimize'
                onClick={minWindow}
            />
            <i
                className='icon-maximize'
                onClick={maxWindow}
            />
            <i
                className='icon-close'
                onClick={closeWindow}
            />
        </div>
    )
}