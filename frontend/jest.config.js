/****************************************************************************
**
** This file is part of the Mishurov Finance website
**
** Copyright (C) 2021 Alexander Mishurov
**
** GNU General Public License Usage
** This file may be used under the terms of the GNU
** General Public License version 3. The licenses are as published by
** the Free Software Foundation and appearing in the file LICENSE.GPL3
** included in the packaging of this file. Please review the following
** information to ensure the GNU General Public License requirements will
** be met: https://www.gnu.org/licenses/gpl-3.0.html.
**
****************************************************************************/

module.exports = async () => {
  return {
    rootDir: './',
    silent: false,
    verbose: true,
    testRunner: 'jest-circus/runner',
    moduleDirectories: ['src', 'node_modules'],
    transform: {},
    bail: 1,
  }
};
