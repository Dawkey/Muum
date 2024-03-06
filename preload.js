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

    getLocalFileData: () => {
        return ipcRenderer.invoke("getLocalFileData");
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
    }
}

contextBridge.exposeInMainWorld("electronApi", electronApi);