const listElement = document.getElementById("listdisplay");

class UIPaneList {
    constructor() {
        this.listName = '';
        this.list = [];
    }

    clearList() {
        this.listName = '';
        this.list = [];
        listElement.innerHTML = "";
    }

    setList(listName, list) {
        this.clearList();
        this.listName = listName;
        this.list = list;
        this.drawList();
    }

    getList() {
        return this.list;
    }

    drawList() {
        let listHtml = `${this.listName}\n<ul>\n`;
        this.list.forEach(itm => {
            listHtml += `<li>${itm.displayText}</li>\n`;
        });
        listHtml += "</ul>";
        listElement.innerHTML = listHtml;
    }
}

export { UIPaneList, listElement };