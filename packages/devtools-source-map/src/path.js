/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// @flow

function dirname(path: string) {
  const idx = path.lastIndexOf("/");
  return path.slice(0, idx);
}

function isURL(str: string) {
  try {
    new URL(str);
    return true;
  } catch (e) {
    return false;
  }
}

function isAbsolute(str: string) {
  return str[0] === "/";
}

module.exports = {
  dirname, isURL, isAbsolute
};
