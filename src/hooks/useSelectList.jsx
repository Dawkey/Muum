import { useEffect, useRef, useState } from "react";


function useSelectList(fileList) {

    const [selectedFiles, setSelectedFiles] = useState([]);
    
    const isCtrl = useRef(false);
    const isShift = useRef(false);
    const shiftAnchorIndex = useRef(0);

    useEffect(() => {

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        }
    }, []);    

    function handleKeyDown(e) {
        if (e.key === 'Control' || e.key === 'Meta') {
            isCtrl.current = true;
        }
        if (e.key === 'Shift') {
            isShift.current = true;
        }
    }

    function handleKeyUp(e) {
        if (e.key === 'Control' || e.key === 'Meta') {
            isCtrl.current = false;
        }
        if (e.key === 'Shift') {
            isShift.current = false;
        }
    }

    function clickFile(file, index) {
        const selectedFileIds = new Set(selectedFiles.map(value => value.id));
        // 同时按下Ctrl和Shift时，用Shift多选逻辑生成的数组和已选择的数组合并得到新的数组
        if (isCtrl.current && isShift.current) {
            let leftIndex = index;
            let rightIndex = shiftAnchorIndex.current;
            if (leftIndex > rightIndex) {
                [leftIndex, rightIndex] = [rightIndex, leftIndex];
            }
            const newSelectedFiles = fileList.filter((value, index) => {
                if (selectedFileIds.has(value.id)) return true;
                if (index >= leftIndex && index <= rightIndex) return true;
                return false;
            });
            setSelectedFiles(newSelectedFiles);
            shiftAnchorIndex.current = index;
            return;
        }

        // 按下Ctrl时，支持选择多个和取消选择
        if (isCtrl.current) {
            let newSelectedFiles;
            if (selectedFileIds.has(file.id)) {
                newSelectedFiles = selectedFiles.filter(value => {
                    return value.id !== file.id;
                });
            } else {
                newSelectedFiles = [...selectedFiles];
                newSelectedFiles.push(file);
            }
            setSelectedFiles(newSelectedFiles);
            shiftAnchorIndex.current = index;
            return;
        }

        // 按下Shift时，支持批量选择和取消选择（以Shift特定锚元素的索引为起始，和window资源管理器文件逻辑类似）
        if (isShift.current) {
            let leftIndex = index;
            let rightIndex = shiftAnchorIndex.current;
            if (leftIndex > rightIndex) {
                [leftIndex, rightIndex] = [rightIndex, leftIndex];
            }
            setSelectedFiles(fileList.slice(leftIndex, rightIndex + 1));
            return;
        }

        setSelectedFiles([file]);
        shiftAnchorIndex.current = index;
    }

    
}