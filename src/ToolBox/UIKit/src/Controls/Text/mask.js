import { hasFocus } from "../../utils/dom";
import { MakeRange } from "../../utils/Geometry";
import { IsAlphaNumeric, Keys } from "../../utils/keys";
import { _fireTextChangeEvents } from "./Text";

const Definitions = {
  9: "[0-9]",
  a: "[A-Za-z]",
  "*": "[A-Za-z0-9]",
};

function caret(text, begin, end) {
  const node = text.controlLayer.node;
  if (value(text).length === 0 || text.hidden || !hasFocus(node)) {
    return [0, 0];
  }
  if (begin > -1) {
    end = end > -1 ? end : begin;
    text.select(MakeRange(begin, end - begin));
  } else {
    begin = text.selectionStart;
    end = text.selectionEnd;
  }
  return [begin, end];
}

function parseMask(text) {
  const mask = text.props.mask;
  console.assert(mask != null && mask.length > 0, "Mask must be a mask regex.");
  text.priv.len = mask.length;
  text.priv.partialPosition = text.priv.len;
  text.priv.firstNonMaskPos = -1;
  text.priv.tests = [];
  text.priv.buffer = [];
  let i = 0,
    count = mask.length;
  for (; i < count; i++) {
    let c = mask.charAt(i);
    if (c === "?") {
      text.priv.len--;
      text.priv.partialPosition = i;
    } else if (Object.keys(Definitions).indexOf(c.toString()) > -1) {
      text.priv.tests.push(new RegExp(Definitions[c.toString()]));
      if (text.priv.firstNonMaskPos === -1) {
        text.priv.firstNonMaskPos = text.priv.tests.length - 1;
      }
    } else {
      text.priv.tests.push(null);
    }
    if (c !== "?") {
      let b =
        Object.keys(Definitions).indexOf(c.toString()) > -1
          ? getPlaceholder(text, i)
          : c.toString();
      text.priv.buffer.push(b);
    }
  }
  text.priv.defaultBuffer = bufferAsString(text);
  text.priv.focusText = value(text);
}

function seekNext(text, pos) {
  while (++pos < text.priv.len && !text.priv.tests[pos]);
  return pos;
}

function seekPrev(text, pos) {
  while (--pos >= 0 && !text.priv.tests[pos]);
  return pos;
}

function shiftL(text, begin, end) {
  let i, j;
  if (begin < 0) {
    return;
  }
  for (i = begin, j = seekNext(text, end); i < text.priv.len; i++) {
    if (text.priv.tests[i] != null) {
      if (j < text.priv.len && text.priv.tests[i].test(text.priv.buffer[j])) {
        text.priv.buffer[i] = text.priv.buffer[j];
        text.priv.buffer[j] = getPlaceholder(text, j);
      } else {
        break;
      }
      j = seekNext(text, j);
    }
  }
  writeBuffer(text);
  caret(text, Math.max(text.priv.firstNonMaskPos, begin), -1);
}

function shiftR(text, pos) {
  let i, j;
  let c;
  let t;
  const len = text.priv.len;
  for (i = pos, c = getPlaceholder(text, pos); i < len; i++) {
    if (text.priv.tests[i]) {
      j = seekNext(text, i);
      t = text.priv.buffer[i];
      text.priv.buffer[i] = c;
      if (j < len && text.priv.tests[j].test(t)) {
        c = t;
      } else {
        break;
      }
    }
  }
}

function getPlaceholder(text, pos) {
  const maskPlaceholder = text.props.maskPlaceholder;
  if (pos < maskPlaceholder.length) {
    return maskPlaceholder.charAt(pos).toString();
  }
  return maskPlaceholder.charAt(0).toString();
}

function clearBuffer(text, start, end) {
  let i;
  for (i = start; i < end && i < text.priv.len; i++) {
    if (i > -1) {
      if (text.priv.tests[i]) {
        text.priv.buffer[i] = getPlaceholder(text, i);
      }
    }
  }
}

function writeBuffer(text) {
  text.value = bufferAsString(text);
}

function checkVal(text, allow) {
  let test = value(text) || "";
  let lastMatch = -1,
    i,
    pos;
  let c;
  const len = text.priv.len;
  for (i = 0, pos = 0; i < len; i++) {
    if (text.priv.tests[i]) {
      text.priv.buffer[i] = getPlaceholder(text, i);
      while (pos++ < test.length) {
        c = "" + test.charAt(pos - 1);
        if (text.priv.tests[i].test(c)) {
          text.priv.buffer[i] = c;
          lastMatch = i;
          break;
        }
      }
      if (pos > test.length) {
        clearBuffer(text, i + 1, len);
        break;
      }
    } else {
      if (text.priv.buffer[i] === test.charAt(pos)) {
        pos++;
      }
      if (i < text.priv.partialPosition) {
        lastMatch = i;
      }
    }
  }
  if (allow) {
    writeBuffer(text);
  } else if (lastMatch + 1 < text.priv.partialPosition) {
    if (bufferAsString(text) === text.priv.defaultBuffer) {
      text.value = "";
      clearBuffer(text, 0, len);
    } else {
      writeBuffer(text);
    }
  } else {
    writeBuffer(text);
    text.value = value(text).substring(0, lastMatch + 1);
  }
  return text.priv.partialPosition > 0 ? i : text.priv.firstNonMaskPos;
}

function bufferAsString(text) {
  return text.priv.buffer.join("");
}

function value(text) {
  return text.props.value;
}

function initMask(text) {
  text.priv.firstNonMaskPos = -1;
  parseMask(text);
  const valStr = value(text);
  if (valStr && valStr.trim().length > 0) {
    checkVal(text, true);
  }
}

function maskOnBlur(text) {
  checkVal(text, false);
}

function maskOnFocus(text) {
  const mask = text.props.mask;
  if (mask) {
    text.priv.focusText = value(text);
    const pos = checkVal(text, false);
    writeBuffer(text);
    setTimeout(() => {
      if (pos === mask.replace("?", "").length) {
        caret(text, 0, pos);
      } else {
        caret(text, pos, -1);
      }
    }, 0);
  }
}

function maskOnKeyDown(text, evt) {
  evt.preventDefault();
  if (text.readOnly) return;
  let begin, end;
  let pos;
  const keyCode = evt.code;
  switch (keyCode) {
    case Keys.Backspace:
    case Keys.Delete:
      pos = caret(text, -1, -1);
      begin = pos[0];
      end = pos[1];

      if (end - begin === 0) {
        begin =
          keyCode !== Keys.Delete
            ? seekPrev(text, begin)
            : (end = seekNext(text, begin - 1));
        end = keyCode === Keys.Delete ? seekNext(text, end) : end;
      }
      clearBuffer(text, begin, end);
      shiftL(text, begin, end - 1);
      break;
    case Keys.Enter:
      text.node.blur();
      break;
    case Keys.Escape:
      text.value = text.priv.focusText;
      caret(text, 0, checkVal(text, false));
      break;
  }
}

function maskOnKeyUp(text, evt) {
  let p,
    next = -1;
  let c;
  let pos = caret(text, -1, -1);
  let begin = pos[0];
  let end = pos[1];
  const keyCode = evt.key;
  if (evt.ctrlKey || evt.altKey || evt.metaKey || !IsAlphaNumeric(keyCode)) {
    // ignore
  } else {
    if (end - begin !== 0) {
      clearBuffer(text, begin, end);
      shiftL(text, begin, end - 1);
    }
    p = seekNext(text, begin - 1);

    if (p < text.priv.len) {
      c = evt.key;
      if (text.priv.tests[p].test(c)) {
        shiftR(text, p);
        text.priv.buffer[p] = c;
        writeBuffer(text);
        next = seekNext(text, p);
      }
      caret(text, next, -1);
    }
    evt.preventDefault();
    _fireTextChangeEvents(text);
  }
}

export { initMask, maskOnBlur, maskOnKeyUp, maskOnFocus, maskOnKeyDown };
