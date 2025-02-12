import { React, } from 'react';
import PropTypes from 'prop-types';
import './MessageDialog.scss';

function MessageDialog(props) {
    const { showFlag, onClose, message, confirmText } = props;

    return (
        <div className='message-dialog'
            style={showFlag ? null : { display: 'none' }}
        >
            <div className='dlg-container'>
                <div className='dlg-title'>
                    <i className='icon-close'
                        onClick={onClose}
                    />
                </div>
                <div className='dlg-message'>
                    {message}
                </div>
                <div className='dlg-buttons'>
                    <div className='confirm-button'
                        onClick={onClose}
                    >
                        {confirmText}
                    </div>
                </div>
            </div>
        </div>
    )
}

MessageDialog.propTypes = {
    showFlag: PropTypes.bool,
    message: PropTypes.string,
    confirmText: PropTypes.string,
    onClose: PropTypes.func,
}

MessageDialog.defaultProps = {
    showFlag: false,
    message: '',
    confirmText: '确认',
    onClose: () => { },
}

export default MessageDialog;