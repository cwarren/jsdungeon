import { constrainValue } from "./util.js";

class TextBlock {
    constructor(baseText) {
      this.baseText = baseText;
      this.textRows = this.baseText.split("\n");
      this.rowCursor = 0;
    }

    getDisplayText() {
        return this.getDisplayTextRows().join("\n");
    }
    
    getDisplayTextRows() {
        return this.textRows.slice(this.rowCursor);
    }

    scrollUp(scrollRows = 1) {
        this.rowCursor = constrainValue(this.rowCursor - scrollRows, 0, this.textRows.length);
    }

    scrollDown(scrollRows = 1) {
        this.rowCursor = constrainValue(this.rowCursor + scrollRows, 0, this.textRows.length);
    }

    scrollTo(row) {
        this.rowCursor = constrainValue(row, 0, this.textRows.length);
    }
}
  
export { TextBlock };