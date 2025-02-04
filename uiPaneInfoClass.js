const infoElement = document.getElementById("info");

class UIPaneInfo {
    constructor() {
    }

    clearInfo() {
        infoElement.innerHTML = "";
    }

    setInfo(info) {
        this.clearInfo();
        infoElement.innerHTML = info;
    }
}

export { UIPaneInfo };