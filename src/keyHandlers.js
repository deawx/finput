//======================//
//     KEY HANDLERS     //
//======================//
// All functions dealing with keypresses (listened to on the keydown event)
// are here, with specific implementations for most types of key

import {CODES, ACTION_TYPES} from './constants';
import helpers from './helpers';

module.exports = {

  /**
   * NUMBER HANDLER
   * @param {keyInfo} Information about the keypress/action
   */
  onNumber: function(keyInfo) {
    const allowedNumber =
      !(keyInfo.currentValue[0] === String.fromCharCode(CODES.MINUS.char)
      && keyInfo.caretStart === 0
      && keyInfo.caretEnd === 0);

    if (allowedNumber) {
      keyInfo.newValue = helpers.editString(keyInfo.currentValue, keyInfo.char, keyInfo.caretStart, keyInfo.caretEnd);
      keyInfo.caretStart += 1;
    }
    keyInfo.event.preventDefault();
  },

  /**
   * MINUS HANDLER
   * @param {keyInfo} Information about the keypress/action
   */
  onMinus: function(keyInfo) {
    const minusAllowed = keyInfo.caretStart === 0 &&
      (keyInfo.currentValue[0] !== String.fromCharCode(CODES.MINUS.char) || keyInfo.caretEnd > 0);

     if (minusAllowed) {
       keyInfo.newValue = helpers.editString(
         keyInfo.currentValue,
         String.fromCharCode(CODES.MINUS.char),
         keyInfo.caretStart,
         keyInfo.caretEnd
       );
       keyInfo.caretStart += 1;
     }
     keyInfo.event.preventDefault();
  },

  /**
   * DECIMAL HANDLER
   * @param {keyInfo} Information about the keypress/action
   * @param {languageData} Language specific info for the selected language
   */
  onDecimal: function(keyInfo, languageData) {
    const decimalIndex = keyInfo.currentValue.indexOf(String.fromCharCode(languageData.decimal.char));

    // If there is not already a decimal or the original would be replaced
    // Add the decimal
    const decimalAllowed =
      decimalIndex === -1 ||
        (decimalIndex >= keyInfo.caretStart &&
         decimalIndex < keyInfo.caretEnd);

    if (decimalAllowed)
    {
      keyInfo.newValue = helpers.editString(
        keyInfo.currentValue,
        String.fromCharCode(languageData.decimal.char),
        keyInfo.caretStart,
        keyInfo.caretEnd
      );
      keyInfo.caretStart += 1;
    }

    keyInfo.event.preventDefault();
  },

  /**
   * SHORTCUT HANDLER
   * @param {keyInfo} Information about the keypress/action
   * @param {languageData} Language specific info for the selected language
   */
  onShortcut: function(keyInfo, languageData) {
    const power = languageData.shortcuts[keyInfo.char.toLowerCase()];

    if (power) {
      const numeralVal = numeral(keyInfo.currentValue);
      keyInfo.newValue = (numeralVal.value() ? numeralVal : numeral(1))
        .multiply(Math.pow(10, power)).format();

      // TODO - BEHAVIOUR: should caret to jump to end? as whole value is
      // muliplied by the multipler - (doesn't just chuck zeros in the middle)
      keyInfo.caretStart = keyInfo.newValue.length;
    }
    keyInfo.event.preventDefault();
  },

  /**
   * BACKSPACE HANDLER
   * @param {keyInfo} Information about the keypress/action
   */
  onBackspace: function(keyInfo) {
    let firstHalf, lastHalf;

    if (keyInfo.caretStart === keyInfo.caretEnd) {
      if (keyInfo.event.ctrlKey) {
        // If CTRL key is held down - delete everything BEFORE caret
        firstHalf = '';
        lastHalf = keyInfo.currentValue.slice(keyInfo.caretStart, keyInfo.currentValue.length);
        keyInfo.caretStart = 0;
      } else {
        firstHalf = keyInfo.currentValue.slice(0, keyInfo.caretStart - 1);
        lastHalf = keyInfo.currentValue.slice(keyInfo.caretStart, keyInfo.currentValue.length);
        keyInfo.caretStart += -1;
      }
    } else {
      // Same code as onDelete handler for deleting a selection range
      firstHalf = keyInfo.currentValue.slice(0, keyInfo.caretStart);
      lastHalf = keyInfo.currentValue.slice(keyInfo.caretEnd, keyInfo.currentValue.length);
    }

    keyInfo.newValue = firstHalf + lastHalf;
    keyInfo.event.preventDefault();
  },

  /**
   * DELETE HANDLER
   * @param {keyInfo} Information about the keypress/action
   * @param {languageData} Language specific info for the selected language
   */
  onDelete: function(keyInfo, languageData) {
    let firstHalf, lastHalf;

    if (keyInfo.caretStart === keyInfo.caretEnd) {
      const nextCharCode = keyInfo.currentValue.charCodeAt(keyInfo.caretStart);

      if (keyInfo.event.ctrlKey) {
        // If CTRL key is held down - delete everything AFTER caret
        firstHalf = keyInfo.currentValue.slice(0, keyInfo.caretStart);
        lastHalf = '';
      } else if (nextCharCode === languageData.delimiter.char) {
        // If char to delete is delimiter - skip over it
        keyInfo.caretStart += 1;
        firstHalf = keyInfo.currentValue;
        lastHalf = '';
      } else {
        firstHalf = keyInfo.currentValue.slice(0, keyInfo.caretStart);
        lastHalf = keyInfo.currentValue.slice(keyInfo.caretStart + 1, keyInfo.currentValue.length);
      }
    } else {
      // Same code as onBackspace handler for deleting a selection range
      firstHalf = keyInfo.currentValue.slice(0, keyInfo.caretStart);
      lastHalf = keyInfo.currentValue.slice(keyInfo.caretEnd, keyInfo.currentValue.length);
    }

    keyInfo.newValue = firstHalf + lastHalf;
    keyInfo.event.preventDefault();
  },

  /**
   * VERTICAL ARROW HANDLER
   * @param {keyInfo} Information about the keypress/action
   * @param {step} How much to increase/decrease value by
   */
  onVerticalArrow: function(keyInfo, step) {
    // If step is 0 (or falsey) then assume arrow key value changing is disabled
    if (step && !isNaN(step)) {
      switch (keyInfo.code) {
        case CODES.UP_ARROW.key:
          keyInfo.newValue = numeral(keyInfo.currentValue).add(step).format();
          break;
        case CODES.DOWN_ARROW.key:
          keyInfo.newValue = numeral(keyInfo.currentValue).subtract(step).format();
          break;
        default:
          // Do nothing
      }
      keyInfo.event.preventDefault();
    }
  },

  /**
   * UNDO HANDLER
   * @param {finput} the Finput object
   * @param {event} The keydown event which triggered the undo
   */
  onUndo: function(finput, event) {
    finput.element.value = finput.history.undo();
    finput.element.setSelectionRange(finput.element.value.length, finput.element.value.length);
    event.preventDefault();
  },
  /**
   * REDO HANDLER
   * @param {finput} the Finput object
   * @param {event} The keydown event which triggered the redo
   */
  onRedo: function(finput, event) {
    finput.element.value = finput.history.redo();
    finput.element.setSelectionRange(finput.element.value.length, finput.element.value.length);
    event.preventDefault();
  }
}