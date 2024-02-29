const { contextBridge, ipcRenderer, } = require('electron');
const Store = require('electron-store');

const store = new Store({
    name: 'muum-config'
});

const electronApi = {

    getLocalFileData: () => {
        return ipcRenderer.invoke("getLocalFileData");
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

    setStore: (key, value) => {
        return store.set(key, value);
    },

    getStore: key => {
        return store.get(key);
    }

}

contextBridge.exposeInMainWorld("electronApi", electronApi);