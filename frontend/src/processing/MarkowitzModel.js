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

import qp from 'quadprog';
import * as maths from './maths';


class MarkowitzModel  {
  cov = [];
  means = [];
  simSize = 2000;
  frontPtNum = 10;

  annualizeDays(m) {
    this.annualize(m, 252);
  }

  annualizeWeeks(m) {
    this.annualize(m, 52);
  }

  annualize(m, num) {
    for (let i = 0; i < m.length; i++) {
      if (m[i].length) {
        for (let j = 0; j < m[i].length; j++)
          m[i][j] *= num;
      } else {
          m[i] *= num;
      }
    }
  }

  toLogReturns(arr) {
    const newArr = [];
    for (let i = 1; i < arr.length; i++) {
      const ret = Math.log(arr[i].ac) - Math.log(arr[i - 1].ac);
      newArr.push(ret);
    }
    return newArr;
  }

  minimize(cov, means, target) {
    let Dmat, dvec, Amat, bvec;

    const k = means.length;

    // are shorts allowed
    const shorts = false;
    // weights contraints
    const lows = maths.full(k, 0);
    const highs = maths.full(k, -1);

    const a1 = maths.full(k, 1);
    const a2 = means;
    const a3 = maths.identity(k, 1);
    const a3neg = maths.identity(k, -1);
    const b3 = maths.full(k, 0);

    Dmat = maths.transpose(cov);
    dvec = maths.full(k, 0);

    Amat = shorts
        ? maths.hstack(a1, a2, a3, a3neg)
        : maths.hstack(a1, a2, a3, a3, a3neg);
    Amat = maths.transpose(Amat);

    bvec = shorts
        ? [1].concat(target, lows, highs)
        : [1].concat(target, b3, lows, highs);

    for (let i = 0; i < Dmat.length; i += 1) {
      Dmat[i] = [undefined].concat(Dmat[i]);
    }

    Dmat = [undefined].concat(Dmat);
    dvec = [undefined].concat(dvec);
    for (let i = 0; i < Amat.length; i += 1) {
      Amat[i] = [undefined].concat(Amat[i]);
    }
    Amat = [undefined].concat(Amat);
    bvec = [undefined].concat(bvec);

    const res = qp.solveQP(Dmat, dvec, Amat, bvec, 2);

    if (res.message)
      throw new Error(res.message);

    res.solution = res.solution.slice(1, res.solution.length);

    return res;
  }

  getVariance(weights, cov) {
    return maths.dot(weights, maths.mult([weights], cov)[0]);
  }

  getReturn(weights, means) {
    return means.reduce((a, v, i) => a + v * weights[i], 0);
  }

  updateBounds(logret, variance, ratio, bounds) {
    bounds.logret[0] = Math.min(bounds.logret[0], logret);
    bounds.logret[1] = Math.max(bounds.logret[1], logret);
    bounds.variance[0] = Math.min(bounds.variance[0], variance);
    bounds.variance[1] = Math.max(bounds.variance[1], variance);
    bounds.ratio[0] = Math.min(bounds.ratio[0], ratio);
    bounds.ratio[1] = Math.max(bounds.ratio[1], ratio);
  }

  computePortfolio(logret) {
    const weights = this.minimize(this.cov, this.means, logret).solution,
      variance = this.getVariance(weights, this.cov),
      ratio = logret / variance;
    return {weights: this.addTickers(weights), pt: { logret, variance, ratio }};
  }

  updateOptimal(pt, weights, optimal) {
    if (pt.ratio > optimal.pt.ratio) {
      optimal.weights = weights;
      optimal.pt = pt;
    }
  }

  simulate(optimal, bounds, simPts) {
    const simSize = this.tickers.length > 2 ?
      this.simSize : Math.round(this.simSize / 2);

    for (let i = 0; i < simSize; i++) {
      const weights = [];
      let sum = 0;
      for (let j = 0; j < this.tickers.length; j++) {
        weights[j] = Math.random();
        sum += weights[j];
      }
      for (let j = 0; j < this.tickers.length; j++)
        weights[j] /= sum;

      const logret = this.getReturn(weights, this.means);
      const variance = this.getVariance(weights, this.cov)
      const ratio = logret / variance;
      const pt = {logret, variance, ratio}

      this.updateOptimal(pt, weights, optimal);
      this.updateBounds(logret, variance, ratio, bounds)
      simPts.push(pt);
    }
  }

  computeAssets(tickers, optimal, bounds, assetsPts) {
    for (let i = 0; i < this.tickers.length; i++) {
      const weights = new Array(this.tickers.length);
      const logret = this.means[i],
        variance = this.cov[i][i],
        ratio = logret / variance;
      weights.fill(0)
      weights[i] = 1;
      const pt = {logret, variance, ratio};
      this.updateOptimal(pt, weights, optimal);
      this.updateBounds(logret, variance, ratio, bounds)
      assetsPts[i] = { ticker: tickers[i], ...pt };
    }
  }

  computeFrontier(num, optimal, bounds, frontPts) {
    const weights = this.minimize(this.cov, this.means).solution;

    const min = this.getReturn(weights, this.means),
      max = bounds.logret[1],
      step = (max - min) / num;
    const getStep = (r) => {
      const next = r + step;
      return r < max && next > max ? max : next;
    };
    for (let r = min; r <= max; r = getStep(r)) {
      let portf = null;
      try {
        portf = this.computePortfolio(r);
      } catch (e) {
        continue;
      }
      const { weights, pt } = portf;
      if (pt.ratio > optimal.pt.ratio) {
        optimal.weights = weights;
        optimal.pt = pt;
      }
      frontPts.push(pt);
    }
  }

  initFromData(prices) {
    const logreturns = [];
    this.tickers = [];

    for (const p of prices) {
      this.tickers.push(p.ticker);
      logreturns.push(this.toLogReturns(p.series));
    }

    this.cov = maths.cov(maths.transpose(logreturns));
    this.means = maths.mean(logreturns, 1);

    this.annualizeDays(this.cov);
    this.annualizeDays(this.means);
  }

  addTickers(weights) {
    const weightsWithTickers = []
    for (let i = 0; i < weights.length; i++) {
      const value = weights[i];
      if (value.ticker) {
        weightsWithTickers[i] = value;
      } else {
        weightsWithTickers[i] = {ticker: this.tickers[i], value: value};
      }
    }
    return weightsWithTickers;
  }

  compute(prices) {

    const bounds = {
      logret: [Infinity, -Infinity],
      variance: [Infinity, -Infinity],
      ratio: [Infinity, -Infinity],
    }

    let optimal = {
      weights: null,
      pt: {
        ratio: -Infinity,
      },
    };

    const assetsPts = [];
    const simPts = [];
    const frontPts = [];

    if (prices.length) {
      this.initFromData(prices);

      this.computeAssets(this.tickers, optimal, bounds, assetsPts);
    }

    if (prices.length > 1) {
      this.simulate(optimal, bounds, simPts);
      this.computeFrontier(this.frontPtNum, optimal, bounds, frontPts);
    } else if (prices.length === 1) {
      bounds.logret = [optimal.pt.logret - 0.5, optimal.pt.logret + 0.5];
      bounds.variance = [optimal.pt.variance - 0.5, optimal.pt.variance + 0.5];
      bounds.ratio = [optimal.pt.ratio - 0.5, optimal.pt.ratio + 0.5];
    } else {
      bounds.logret = [0, 1];
      bounds.variance = [0, 1];
      bounds.ratio = [0, 1];
    }

    if (optimal.weights)
      optimal.weights = this.addTickers(optimal.weights);

    return {
      simPts,
      frontPts,
      assetsPts,
      optimal,
      bounds
    };
  }

}


export default MarkowitzModel;
