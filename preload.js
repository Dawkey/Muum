const { contextBridge, ipcRenderer, } = require('electron');
const Store = require('electron-store');

const store = new Store({
    name: 'muum-config'
});

const blurCallBacks = new Map();

const electronApi = {

    setStore: (key, value) => {
        return store.set(key, value);
    },

    getStore: key => {
        return store.get(key);
    },

    watchSongPath: songPath => {
        ipcRenderer.send('watchSongPath', songPath);
    },

    getLocalFileData: songPath => {
        return ipcRenderer.invoke("getLocalFileData", songPath);
    },

    parseSongFile: filePath => {
        return ipcRenderer.invoke("parseSongFile", filePath);
    },

    showFileInExplorer: filePath => {
        ipcRenderer.send("showFileInExplorer", filePath);
    },

    deleteFiles: filePaths => {
        ipcRenderer.send("deleteFiles", filePaths);
    },

    // type表示复制类型："cover" - 覆盖原文件 | "uncover" - 不覆盖原文件
    copyFiles: (filePaths, copyPath, type) => {
        ipcRenderer.send("copyFiles", filePaths, copyPath, type);
    },

    onFileChange: fn => {
        ipcRenderer.removeAllListeners('onFileChange');
        ipcRenderer.on('onFileChange', () => {
            fn();
        });
    },

    onWindowBlur: (key, fn) => {
        blurCallBacks.set(key, fn);
        ipcRenderer.removeAllListeners('onWindowBlur');
        ipcRenderer.on('onWindowBlur', () => {
            blurCallBacks.forEach(callBack => {
                callBack();
            })
        });
    },

    onShowSetting: fn => {
        ipcRenderer.removeAllListeners('onShowSetting');
        ipcRenderer.on('onShowSetting', () => {
            fn();
        });
    },

    minWindow: () => {
        ipcRenderer.send('minWindow');
    },

    maxWindow: () => {
        ipcRenderer.send('maxWindow');
    },

    closeWindow: () => {
        ipcRenderer.send('closeWindow');
    },

    hideWindow: () => {
        ipcRenderer.send('hideWindow');
    },

    importSongs: () => {
        return ipcRenderer.invoke("importSongs");
    },

    selectDir: () => {
        return ipcRenderer.invoke("selectDir");
    },

    isFileExistInPath: (filePaths, targetPath) => {
        return ipcRenderer.invoke("isFileExistInPath", filePaths, targetPath);
    }
}

contextBridge.exposeInMainWorld("electronApi", electronApi);