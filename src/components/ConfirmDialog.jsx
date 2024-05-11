import { React, } from 'react';
import PropTypes from 'prop-types';
import './ConfirmDialog.scss';

function ConfirmDialog(props) {
    const { showFlag, message, confirmText, cancelText,  onClose, onConfirm ,onCancel } = props;

    return (
        <div className='confirm-dialog'
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
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        {confirmText}
                    </div>
                    <div className='cancel-button'
                        onClick={() => {
                            onCancel();
                            onClose();
                        }}
                    >
                        {cancelText}
                    </div>
                </div>
            </div>
        </div>
    )
}

ConfirmDialog.propTypes = {
    showFlag: PropTypes.bool,
    message: PropTypes.string,
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
    onClose: PropTypes.func,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
}

ConfirmDialog.defaultProps = {
    showFlag: false,
    message: '',
    confirmText: '确认',
    cancelText: '取消',
    onClose: () => { },
    onConfirm: () => { },
    onCancel: () => { }
}

export default ConfirmDialog;