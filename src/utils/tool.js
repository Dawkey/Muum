export function numberToTime(number = 0) {
    let minute = Math.floor(number / 60);
    let second = Math.floor(number % 60);
    minute = minute < 10 ? `0${minute}` : minute;
    second = second < 10 ? `0${second}` : second;
    return `${minute}:${second}`;
}

export function shuffleArray(arr) {
    const copyArr = [...arr];
    for (let i = copyArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copyArr[i], copyArr[j]] = [copyArr[j], copyArr[i]];
    }
    return copyArr;
}