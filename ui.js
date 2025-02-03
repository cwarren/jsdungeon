import { UIPaneMain } from "./uiPaneMainClass.js";
import { UIPaneMessages } from "./uiPaneMessagesClass.js";

let uiPaneMain;
let uiPaneMessages;

function setupUi(gameState) {
  uiPaneMain = new UIPaneMain(gameState);
  uiPaneMessages = new UIPaneMessages();  
}

export {
  uiPaneMain, uiPaneMessages, setupUi,
};
