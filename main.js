const { app, BrowserWindow, ipcMain, Menu, MenuItem } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const util = require('util');
const { parseFile } = require('music-metadata');
const { v4: uuidv4 } = require('uuid');

let mainWindow;
app.on('ready', () => {
    mainWindow = new BrowserWindow({
        window: 1024,
        height: 680,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            webSecurity: false,
        },
    });
    mainWindow.menuBarVisible = false;
    mainWindow.loadURL('http://localhost:3000/');

    // ipcMain.on("showContextMenu", (e, menus) => {
    //     const mainMenu = menus.map(item => {
    //         return {
    //             label: item.label,
    //             click: ()=>{e.sender.send(item.event)}
    //         }
    //     })
    //     const contextMenu = Menu.buildFromTemplate(mainMenu);
    //     contextMenu.popup(mainWindow);
    // });

    ipcMain.handle("getLocalFileData", async () => {
        const musicPath = "D:\\Projects\\Muum\\music";
        try {
            const files = await fs.readdir(musicPath);
            const fileList = [];
            for (const file of files) {
                const filePath = path.join(musicPath, file);
                try {
                    const metadata = await parseFile(filePath, { skipCovers: true });
                    const { title, artists, album } = metadata.common;
                    const { duration } = metadata.format;
                    const fileItem = {
                        id: uuidv4(),
                        name: title,
                        path: filePath,
                        artists,
                        album,
                        duration,
                    }
                    fileList.push(fileItem);
                }
                catch (e) {
                    console.error("parse file fail:", e);
                }
            }
            return fileList;

        } catch (e) {
            console.error("read dir fail:", e);
        }
    });

});