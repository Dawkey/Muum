const { contextBridge, ipcRenderer, } = require('electron');
const Store = require('electron-store');
const path = require('path');

let store;
ipcRenderer.invoke("isDev").then(flag => {
    const cwd = flag ? path.join(__dirname, './config') : path.join(__dirname, '../../config');
    store = new Store({
        name: 'muum-config',
        cwd
    });
})

const blurCallBacks = new Map();

const electronApi = {

    setStore: (key, value) => {
        return store.set(key, value);
    },

    getStore: key => {
        return store.get(key);
    },

    isPathExist: songPath => {
        return ipcRenderer.invoke("isPathExist", songPath);
    },

    creatInitDir: () => {
        return ipcRenderer.invoke("creatInitDir");
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

    onPathMiss: fn =>{
        ipcRenderer.removeAllListeners('onPathMiss');
        ipcRenderer.on('onPathMiss', () => {
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

    setCloseModeFlag: closeMode => {
        ipcRenderer.send('setCloseModeFlag', closeMode === 2);
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