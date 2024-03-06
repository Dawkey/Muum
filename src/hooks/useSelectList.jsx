import { useEffect, useRef, useState } from "react";

// 列表选择公用逻辑
function useSelectList(totalList, listKey) {

    const [selectedItems, setSelectedItems] = useState([]);
    
    const isCtrl = useRef(false);
    const isShift = useRef(false);
    const shiftAnchorIndex = useRef(0);

    useEffect(() => {

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.electronApi.onWindowBlur(listKey, () => {
            isCtrl.current = false;
            isShift.current = false;
        });

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

    function initSelect() {
        setSelectedItems([]);
        shiftAnchorIndex.current = 0;        
    }

    function clickItem(item, index, isLeft = true) {        
        const selectedItemIds = new Set(selectedItems.map(value => value.id));

        // 如果为右键，直接选定当前元素，返回
        if (!isLeft) {
            if (selectedItemIds.has(item.id)) return;
            setSelectedItems([item]);
            shiftAnchorIndex.current = index;
            return;
        }

        // 同时按下Ctrl和Shift时，用Shift多选逻辑生成的数组和已选择的数组合并得到新的数组
        if (isCtrl.current && isShift.current) {
            let leftIndex = index;
            let rightIndex = shiftAnchorIndex.current;
            if (leftIndex > rightIndex) {
                [leftIndex, rightIndex] = [rightIndex, leftIndex];
            }
            const newSelectedItems = totalList.filter((value, index) => {
                if (selectedItemIds.has(value.id)) return true;
                if (index >= leftIndex && index <= rightIndex) return true;
                return false;
            });
            setSelectedItems(newSelectedItems);
            shiftAnchorIndex.current = index;
            return;
        }

        // 按下Ctrl时，支持选择多个和取消选择
        if (isCtrl.current) {
            let newSelectedItems;
            if (selectedItemIds.has(item.id)) {
                newSelectedItems = selectedItems.filter(value => {
                    return value.id !== item.id;
                });
            } else {
                newSelectedItems = [...selectedItems];
                newSelectedItems.push(item);
            }
            setSelectedItems(newSelectedItems);
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
            setSelectedItems(totalList.slice(leftIndex, rightIndex + 1));
            return;
        }

        setSelectedItems([item]);
        shiftAnchorIndex.current = index;
    }

    return {
        selectedItems,
        initSelect,
        clickItem
    }
    
}

export default useSelectList;