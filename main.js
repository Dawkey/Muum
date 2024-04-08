const { app, BrowserWindow, ipcMain, shell } = require('electron');
const fs = require('fs');
const fsPromise = require('fs').promises;
const path = require('path');
const { parseFile, selectCover } = require('music-metadata');
const { v4: uuidv4 } = require('uuid');
const pLimit = require('p-limit');
const Store = require('electron-store');

Store.initRenderer();

app.on('ready', () => {
    let mainWindow = new BrowserWindow({
        frame: false,
        width: 960,
        height: 640,
        minWidth: 960,
        minHeight: 640,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            webSecurity: false,
        },
    });
    mainWindow.menuBarVisible = false;
    mainWindow.loadURL('http://localhost:3000/');

    mainWindow.on("blur", () => {
        mainWindow.webContents.send("onWindowBlur");
    });

    fs.watch("D:\\Projects\\Muum\\music", debounce((eventType, filename) => {
        console.log(eventType);
        console.log(filename);
        mainWindow.webContents.send("onFileChange");
    }, 100));

    ipcMain.handle("getLocalFileData", async () => {
        const musicPath = "D:\\Projects\\Muum\\music";
        try {
            const files = await fsPromise.readdir(musicPath);
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

    ipcMain.handle("parseSongFile", async (e, filePath) => {
        try {
            const metadata = await parseFile(filePath);
            const { title, picture } = metadata.common;
            const cover = selectCover(picture);
            const fileItem = {
                name: title,
                path: filePath,
                cover
            }
            return fileItem;

        } catch (e) {
            console.error("parse song fail:", e);
        }
    });

    ipcMain.on("showFileInExplorer", (e, filePath) => {
        shell.showItemInFolder(filePath);
    });

    ipcMain.on("deleteFiles", async (e, filePaths) => {
        try {
            console.log(filePaths);
            const limit = pLimit(100);
            const deletePromises = filePaths.map(filePath => {
                return limit(() => fsPromise.unlink(filePath));
            });
            await Promise.all(deletePromises);
        }
        catch (e) {
            console.error("delete dir fail:", e);
        }
    });

    ipcMain.on("minWindow", () => {
        mainWindow.minimize();
    });

    ipcMain.on("maxWindow", ()=>{
        if(mainWindow.isMaximized()){
            mainWindow.unmaximize();
        }else{
            mainWindow.maximize();
        }
    });

    ipcMain.on("closeWindow", ()=>{
        mainWindow.close();
    });

});

function debounce(func, delay) {
    let timer = null;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    }
}