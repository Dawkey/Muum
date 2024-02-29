import { React, } from 'react';
import PropTypes from 'prop-types';
import './ConfirmDialog.scss';

function ConfirmDialog(props) {
    const { showFlag, message, onClose, onConfirm } = props;

    return (
        <div className='confirm-dialog'
            style={showFlag ? null : {display: 'none'}}
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
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        确认
                    </div>
                    <div className='cancel-button'
                        onClick={onClose}
                    >
                        取消
                    </div>
                </div>
            </div>            
        </div>
    )
}

ConfirmDialog.propTypes = {    
    showFlag: PropTypes.bool,
    message: PropTypes.string,
    onClose: PropTypes.func,
    onConfirm: PropTypes.func,
}

ConfirmDialog.defaultProps = {    
    showFlag: false,
    message: '',
    onClose: () => { },
    onConfirm: () => { }    
}

export default ConfirmDialog;