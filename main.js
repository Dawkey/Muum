const { app, BrowserWindow, ipcMain, shell, dialog, Tray, Menu } = require('electron');
const fs = require('fs');
const fsPromise = require('fs').promises;
const path = require('path');
const { parseFile, selectCover } = require('music-metadata');
const { v4: uuidv4 } = require('uuid');
const pLimit = require('p-limit');
const Store = require('electron-store');

Store.initRenderer();

const audioTypes = ["aac", "mp3", "ogg", "wma", "flac", "wav", "aiff", "aif"];
const audioTypeSet = new Set(audioTypes);

app.on('ready', () => {
    let mainWindow = new BrowserWindow({
        frame: false,
        icon: path.join(__dirname, 'src/assets/images/logo.png'),
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


    let tray = new Tray(path.join(__dirname, 'src/assets/images/logo.png'));
    const trayContextMenu = Menu.buildFromTemplate([
        {
            label: "显示", click: () => {
                mainWindow.show();
                mainWindow.focus();
            }
        },
        {
            label: "设置", click: () => {
                mainWindow.show();
                mainWindow.focus();
                mainWindow.webContents.send("onShowSetting");
            }
        },
        {
            label: "退出", click: () => {
                mainWindow.close();
            }
        },
    ]);
    tray.setContextMenu(trayContextMenu);
    tray.on("click", () => {
        mainWindow.show();
        mainWindow.focus();
    });


    let songPathWatcher = null;
    ipcMain.on("watchSongPath", (e, songPath) => {
        if (songPathWatcher !== null) {
            songPathWatcher.close();
        }

        songPathWatcher = fs.watch(songPath, debounce((eventType, filename) => {
            console.log(eventType);
            console.log(filename);
            mainWindow.webContents.send("onFileChange");
        }, 100));

        mainWindow.webContents.send("onFileChange");
    });

    ipcMain.handle("getLocalFileData", async (e, songPath) => {
        try {
            const files = await fsPromise.readdir(songPath);
            const fileList = [];
            for (const file of files) {
                const extension = path.extname(file).toLowerCase().slice(1);
                if(!audioTypeSet.has(extension)){
                    continue;
                }

                const filePath = path.join(songPath, file);
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
            const limit = pLimit(100);
            const deletePromises = filePaths.map(filePath => {
                return limit(() => fsPromise.unlink(filePath));
            });
            await Promise.all(deletePromises);
        }
        catch (e) {
            console.error("delete file fail:", e);
        }
    });

    ipcMain.on("copyFiles", async (e, filePaths, copyPath, type) => {
        try {
            const limit = pLimit(10);
            const copyType = type === "cover" ? 0 : fsPromise.constants.COPYFILE_EXCL;
            const copyPromises = filePaths.map(filePath => {
                const targetPath = path.join(copyPath, path.basename(filePath));
                return limit(() => fsPromise.copyFile(filePath, targetPath, copyType));
            });
            await Promise.all(copyPromises);
        }
        catch (e) {
            console.error("copy file fail:", e);
        }
    });

    ipcMain.on("minWindow", () => {
        mainWindow.minimize();
    });

    ipcMain.on("maxWindow", () => {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    });

    ipcMain.on("closeWindow", () => {
        mainWindow.close();
    });

    ipcMain.on("hideWindow", () => {
        mainWindow.hide();
    });

    ipcMain.handle("importSongs", async () => {
        try {
            const data = await dialog.showOpenDialog(mainWindow, {
                title: "选择要导入的歌曲",
                filters: [{
                    name: "音频文件",
                    extensions: audioTypes
                }],
                properties: ["openFile", "multiSelections"]
            });
            return data;
        } catch (e) {
            console.error("import file fail:", e);
        }
    });

    ipcMain.handle("selectDir", async () => {
        try {
            const data = await dialog.showOpenDialog(mainWindow, {
                title: "选择歌曲路径",
                properties: ["openDirectory"]
            });
            return data;
        } catch (e) {
            console.error("select dir fail:", e);
        }
    });

    ipcMain.handle("isFileExistInPath", async (e, filePaths, targetPath) => {
        try {
            const fileSet = new Set();
            filePaths.forEach(value => {
                fileSet.add(path.basename(value));
            });

            const targetPathFiles = await fsPromise.readdir(targetPath);
            for (let targetPathFile of targetPathFiles) {
                if (fileSet.has(targetPathFile)) {
                    return true;
                }
            }
            return false;

        } catch (e) {
            console.error("read dir fail:", e);
        }
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