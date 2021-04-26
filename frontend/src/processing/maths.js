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

export function cov(x) {
  // lazy hack to compute variance
  let xT;
  if ((xT = transpose(x)).length === 1)
    x = transpose([xT[0], xT[0]]);

  const covmat = [];
  const nrows = x.length;
  const ncols = x[0].length;
  const ncols2 = ncols - 1;

  let sumX, sumX2, sumY, sumY2, sumXY;

  for (let i = 0; i < ncols; i += 1) {
    covmat[i] = Array.from({ length: ncols }, () => 0);
  }

  for (let j = 0; j < ncols2; j += 1) {
    for (let j2 = j + 1; j2 < ncols; j2 += 1) {
      sumX = 0;
      sumY = 0;
      sumX2 = 0;
      sumY2 = 0;
      sumXY = 0;

      for (let i = 0; i < nrows; i += 1) {
        sumX += x[i][j];
        sumY += x[i][j2];
        sumX2 += (x[i][j] * x[i][j]);
        sumY2 += (x[i][j2] * x[i][j2]);
        sumXY += (x[i][j] * x[i][j2]);
      }
      covmat[j][j] = (sumX2 - (sumX * sumX) / nrows) / (nrows - 1);
      covmat[j2][j2] = (sumY2 - (sumY * sumY) / nrows) / (nrows - 1);
      covmat[j][j2] = (sumXY - (sumX * sumY) / nrows) / (nrows - 1);
      covmat[j2][j] = covmat[j][j2];
    }
  }

  if (xT.length === 1) {
    covmat[0].pop();
    covmat.pop();
  }

  return covmat;
}


function mean1d(x) {
  let sum = 0;
  for (let i = 0; i < x.length; i++) {
    sum += x[i];
  }
  return sum / x.length;
}


function colMeans(m) {
  const means = [];
  for (let i = 0; i < m.length; i++) {
    means[i] = mean1d(m[i]);
  }
  return means;
}


function rowMeans(m) {
  const mT = transpose(m);
  const means = [];
  for (let i = 0; i < mT.length; i++) {
    means[i] = mean1d(m[i]);
  }
  return means;
}

export function mean(a, axis) {
  if (!a.length)
    return a;
  if (!a[0].length)
    return mean1d(a);

  if (axis === 0)
    return rowMeans(a);
  else if (axis === 1)
    return colMeans(a);

  let sum = 0;
  const means = rowMeans(a);
  for (let i = 0; i < means.length; i += 1) {
    sum += means[i];
  }

  return sum / a.length;
}

export function hstack(...args) {
  const m = [];

  let rows, cols, arg;

  for (let n = 0, k = 0; n < arguments.length; n += 1) {
    arg = args[n];
    rows = arg.length;
    cols = arg[0].length;

    if (cols === undefined) {
      m[k] = [];
      for (let i = 0; i < rows; i += 1) {
        m[k][i] = arg[i];
      }
      k += 1;
    } else {
      for (let i = 0; i < rows; i += 1) {
        m[k] = [];
        for (let j = 0; j < cols; j += 1) {
          m[k][j] = arg[i][j];
        }
        k += 1;
      }
    }
  }

  return m;
}


export function transpose(m) {
  const res = [];
  const rows = m.length;
  const cols = m[0].length;

  for (let i = 0; i < cols; i += 1) {
    res[i] = [];
    for (let j = 0; j < rows; j += 1) {
      res[i][j] = m[j][i];
    }
  }

  return res;
}


export function identity(k, n = 1) {
  const m = [];

  for (let i = 0; i < k; i += 1) {
    m[i] = Array.from({ length: k }, () => 0);
    for (let j = 0; j < k; j += 1) {
      if (i === j) {
        m[i][j] = n;
      } else {
        m[i][j] = 0;
      }
    }
  }

  return m;
}


export function full(size, value) {
  const ans = [];

  for (let i = 0; i < size; i += 1) {
    ans[i] = value;
  }

  return ans;
}


export function mult(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || !a.length || !b.length) {
    throw new Error('arguments should be in 2-dimensional array format');
  }
  let x = a.length,
    z = a[0].length,
    y = b[0].length;
  if (b.length !== z) {
    throw new Error('number of A columns should be equal to number of B rows');
  }
  let prodRow = Array.apply(null, new Array(y)).map(Number.prototype.valueOf, 0);
  let prod = new Array(x);
  for (let p = 0; p < x; p++) {
    prod[p] = prodRow.slice();
  }
  for (let i = 0; i < x; i++) {
    for (let j = 0; j < y; j++) {
      for (let k = 0; k < z; k++) {
        prod[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return prod;
}


export function dot( x, y ) {
  let len = x.length,
    sum = 0,
    i;

  if ( len !== y.length ) {
    throw new Error( 'arrays must be of equal length' );
  }
  if ( !len ) {
    return null;
  }
  for ( i = 0; i < len; i++ ) {
    sum += x[ i ] * y[ i ];
  }
  return sum;
}
