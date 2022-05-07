/****************************************************************************
**
** This file is part of the Mishurov Finance website
**
** Copyright (C) 2022 Alexander Mishurov
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

export function texts() {
  return {
    description: 'This is a collection of tools for rough quick financial assessments. It covers a fraction of the US traded shares and a selected number of Russian Eurobonds accessible for purchase at <a href="https://www.tinkoff.ru/eng/products/tinkoff-investments/">Tinkoff&nbsp;Investments</a>. It also has an ability to approximately estimate portfolio performance using the MPT model (mean-variance analysis).',
    links: [
      { href: '/equity/IBM', text: 'IBM Equity' },
      { href: '/fixed-income/XS1589106910', text: 'Gaz Finance Bond' },
      { href: '/portfolio-tools?t=INTC,APA,RCL', text: 'NTC,APA,RCL portfolio' },
    ]
  };
}
