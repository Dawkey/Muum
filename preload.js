const { contextBridge, ipcRenderer, } = require('electron');

const electronApi = {

    getLocalFileData: () => {
        return ipcRenderer.invoke("getLocalFileData");
    },

    // showContextMenu: menus => {
    //     ipcRenderer.send("showContextMenu", menus);
    // },

    // addContextMenuEvent: events => {
    //     events.forEach(item => {
    //         const { event, emitter } = item;
    //         ipcRenderer.removeAllListeners(event);
    //         ipcRenderer.on(event, emitter);
    //     });
    // }
}

contextBridge.exposeInMainWorld("electronApi", electronApi);