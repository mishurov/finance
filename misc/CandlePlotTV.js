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

import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { format } from 'd3-format';

import { select } from 'd3-selection';
import { utcFormat } from 'd3-time-format';
import { axisRight } from 'd3-axis';
import { scaleLinear } from 'd3-scale';

import { createChart, CrosshairMode } from 'lightweight-charts';

import { sma } from '../../processing/indi';

const propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  data: PropTypes.object,
};

const defaultProps = {
  width: 400,
  height: 300,
  data: {},
};

function tvToDate(t) {
  return new Date(t.year, t.month - 1, t.day);
}


class Overlay {
  labelHPadding = { h: 5, v: 1 };
  labelVPadding = { h: 7, v: 3 };
  formatX = utcFormat("%d %b '%y");
  formatY = format('.2f');

  constructor(svg) {
    this.y = scaleLinear().domain([-10, 110]);
    this.axisR = axisRight()
      .scale(this.y).ticks(3).tickSizeOuter(0);
    this.axisRG = svg.append('g')
      .classed('axisR', true)
    this.axisRG.call(this.axisR);

    this.divider = svg.append('line')
      .classed('indiDivider', true)
      .attr('stroke', 'black');
    this.groupH = svg.append('g')
      .classed('tvHairH', true)
    this.groupV = svg.append('g')
      .classed('tvHairV', true)

    for (const g of [this.groupH, this.groupV]) {
      g.append('line')
        .attr('stroke', 'black');
      const label = g.append('g')
        .classed('label', true)
      label.append('rect')
        .attr('fill', 'red')
      label.append('text')
        .attr('fill', 'black')
        .text('5.67M')
    }

    this.textV = this.groupV.select('g > text')
      .attr('dominant-baseline', 'hanging');
    this.rectV = this.groupV.select('g > rect');
    this.textH = this.groupH.select('g > text')
      .attr('dominant-baseline', 'middle');
    this.rectH = this.groupH.select('g > rect');

  }

  setWidth(width) {
    this.groupH.select('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('display', 'none')
    this.groupH.select('g.label')
      .attr('transform', `translate(${width + this.labelHPadding.h},0)`)
    this.axisRG
      .attr('transform', `translate(${width},0)`)
    this.divider
      .attr('x1', 0)
      .attr('x2', width)
  }

  setHeight(candlesH, indiH) {
    const fullH = candlesH + indiH
    this.groupV.select('line')
      .attr('y1', 0)
      .attr('y2', fullH)
    this.groupV.select('g.label')
      .attr('transform',
        `translate(0,${fullH + this.labelVPadding.v})`)
    this.y.range([fullH, candlesH]);
    this.axisRG.call(this.axisR);
    this.divider
      .attr('transform', `translate(0,${candlesH})`)
  }

  updateAxis() {
    this.axisRG.call(this.axisR);
  }

  resize(width, candlesH, indiH) {
    this.setWidth(width);
    this.setHeight(candlesH, indiH);
  }

  resizeLabels() {
    const bboxV = this.textV.node().getBBox(),
      bboxH = this.textH.node().getBBox();
    const xV = -bboxV.width / 2;
    this.textV
      .attr('x', xV);
    this.rectV
      .attr('x', xV - this.labelVPadding.h)
      .attr('width', bboxV.width + this.labelVPadding.h * 2)
      .attr('y', bboxV.y - this.labelVPadding.v)
      .attr('height', bboxV.height + this.labelVPadding.v * 2)
    this.rectH
      .attr('x', -this.labelHPadding.h)
      .attr('width', bboxH.width + this.labelHPadding.h * 2)
      .attr('y', bboxH.y - this.labelHPadding.v)
      .attr('height', bboxH.height + this.labelHPadding.v * 2)
  }

  setHairPos(x, y) {
    this.groupV
      .attr('transform', `translate(${x},0)`)
    this.groupH
      .attr('transform', `translate(0,${y})`)
  }

  setHairText(time, val) {
    if (time)
      this.textV.text(this.formatX(time));
    if (val)
      this.textH.text(this.formatY(val));

    this.resizeLabels();
  }

  hideHairs() {
    this.hideGeo('H');
    this.hideGeo('V');
  }

  showHairV() {
    this.showGeo('V');
  }

  showHairs() {
    this.showGeo('H');
    this.showGeo('V');
  }

  showGeo(axis) {
      this['group' + axis].node().removeAttribute('display');
  }

  hideGeo(axis) {
      this['group' + axis].attr('display', 'none');
  }
}


class Labels {
  left = 5;
  top = 15;
  lineH = 15;
  padX = 10;
  format = format('.2f');

  constructor(svg) {
    this.maLabels = svg.append('g')
      .classed('maLabels', true);
  }

  setPos(x, y) {
    this.maLabels.attr('transform', `translate(${x},${y})`);
  }

  setData(params) {
    let prevY = 0;
    const that = this;
    this.maLabels.selectAll('g')
      .data(params)
      .join('g')
        .attr('class', d => `sma${d}`)
        .each(function(d) {
          const g = select(this);
          const lbl = g.append('text')
            .classed('lbl', true)
            .attr('fill', 'black')
            .attr('y', prevY)
            .attr('x', 0)
            .text(`SMA ${d}`);
          const x = lbl.node().getComputedTextLength() + that.padX;
          g.append('text')
            .classed('val', true)
            .attr('fill', 'black')
            .attr('y', prevY)
            .attr('x', x)
            .text('---');
          prevY += that.lineH;
        });
  }
}


const axisColor = '#777';
const upColor = 'green';
const downColor = 'red';

const layout = {
  fontSize: 10,
  fontFamily: "'PT Sans', sans-serif",
};

const crosshairConfig = {
  mode: CrosshairMode.Normal,
  vertLine: {
    visible: false,
    labelVisible: false,
  },
}

const candlesChartConfig = {
  width: 400,
  height: 300,
  crosshair: {...crosshairConfig},
  priceScale: {
    borderColor: axisColor,
    position: 'right',
  },
  timeScale: {
    visible: false
  },
  layout: {...layout},
};

const indiChartConfig = {
  width: 400,
  height: 100,
  crosshair: {...crosshairConfig},
  timeScale: {
    borderColor: axisColor,
  },
  priceScale: {
    position: 'none',
  },
  layout: {...layout},
};

const candlesConfig = {
  upColor,
  downColor,
  borderUpColor: upColor,
  borderDownColor: downColor,
  wickUpColor: upColor,
  wickDownColor: downColor,
};


const volumesConfig = {
  priceScaleId: '',
  color: 'gray',
  priceFormat: {
    type: 'volume',
  },
  scaleMargins: {
    top: 0.7,
    bottom: 0,
  },
};

const smaConfig = {
  priceScaleId: 'right',
  color: 'gray',
  lineWidth: 1,
};


function CandlePlotTV(props) {
  const candlesRef = useRef({});
  const indiRef = useRef({});
  const svgRef = useRef({});
  const chartRef = useRef({});


  useEffect(() => {
    const candlesDiv = candlesRef.current;
    const indiDiv = indiRef.current;
    const svg = select(svgRef.current);
    const ch = chartRef.current;

    ch.candlesChart = createChart(candlesDiv, candlesChartConfig);
    ch.indiChart = createChart(indiDiv, indiChartConfig);
    ch.candles = ch.candlesChart.addCandlestickSeries(candlesConfig);
    ch.volumes = ch.candlesChart.addHistogramSeries(volumesConfig);

    ch.overlay = new Overlay(svg);
    ch.labels = new Labels(svg);
    ch.smas = [];

    let prevW = ch.candlesChart.priceScale().width();
    function rangeChange() {
      const newW = ch.candlesChart.priceScale().width();
      if (newW !== prevW) {
        const width = candlesDiv.clientWidth - newW;
        const height = indiDiv.clientHeight;
        ch.indiChart.resize(width, height);
        ch.overlay.setWidth(width);
        prevW = newW;
      }
      if (ch.smas.length) {
        const rangeY = ch.overlay.y.range(),
          minR = rangeY[0] - candlesDiv.clientHeight,
          maxR = rangeY[rangeY.length - 1] - candlesDiv.clientHeight,
          minD = ch.smas[0].coordinateToPrice(minR),
          maxD = ch.smas[0].coordinateToPrice(maxR);
          ch.overlay.y.domain([minD, maxD]);
          ch.overlay.updateAxis();
      }
    }

    ch.candlesChart.timeScale()
      .subscribeVisibleLogicalRangeChange(range => {
      rangeChange();
      ch.indiChart.timeScale().setVisibleLogicalRange(range)
    })

    ch.indiChart.timeScale()
      .subscribeVisibleLogicalRangeChange(range => {
      rangeChange();
      ch.candlesChart.timeScale().setVisibleLogicalRange(range)
    })

    function hairMove(param, chartName) {
      if (!param.point) {
        ch.overlay.hideHairs()
        return;
      }

      if (chartName === 'candle')
        ch.overlay.showHairV()
      else
        ch.overlay.showHairs()

      let {x, y} = param.point;
      let t = null
      if (param.time) {
        x = ch.indiChart.timeScale().timeToCoordinate(param.time);
        t = tvToDate(param.time);
      }

      let v = null;
      if (chartName === 'indi') {
        if (ch.smas.length)
          v = ch.smas[0].coordinateToPrice(y);
        y += candlesDiv.clientHeight;
      }
      ch.overlay.setHairPos(x, y);
      ch.overlay.setHairText(t, v);
    }

    ch.candlesChart.subscribeCrosshairMove(p => hairMove(p, 'candle'));
    ch.indiChart.subscribeCrosshairMove(p => hairMove(p, 'indi'));

    return () => {
      candlesDiv.innerHTML = '';
      indiDiv.innerHTML = '';
      svg.selectAll('*').remove();
    };
  }, []);

  useEffect(() => {
    const ch = chartRef.current;
    const indiH = 100;
    const candlesH = props.height - indiH;

    ch.candlesChart.resize(props.width, candlesH);
    ch.indiChart.resize(props.width, indiH);
    ch.labels.setPos(5, candlesH + 15)

    const indiDiv = select(indiRef.current);
    const candleCanvas = indiDiv.select('div > table canvas').node();
    ch.overlay.resize(
      candleCanvas.clientWidth,
      candlesH,
      candleCanvas.clientHeight)

  }, [props.width, props.height]);

  useEffect(() => {
    if (!props.data || !props.data.series || !props.data.series.length)
      return;

    const ch = chartRef.current,
      series = props.data.series;
    const volumes = series.map(d => {return {
      time: d.d, value: d.v, color: d.o < d.c ? 'green' : 'red',
    }});
    const prices = series.map(d => {return {
      time: d.d, open: d.o, high: d.h, low: d.l, close: d.c
    }});

    for (const sma of ch.smas) {
      ch.indiChart.removeSeries(sma);
    }
    ch.smas = [];

    const start = 20;

    ch.candles.setData(prices.slice(start))
    ch.volumes.setData(volumes.slice(start))

    const smas = [9, 20];
    const colors = ['blue', 'steelblue']
    for (let i = 0; i < smas.length; i++) {
      const averages = ch.indiChart.addLineSeries(
        {...smaConfig, color: colors[i]});
      const values = sma(smas[i], series).map((d, j) => {return {
        time: series[j].d, value: d, }});
      averages.setData(values.slice(start))
      ch.smas.push(averages);
    }
    ch.labels.setData(smas);

  }, [props.data]);

  return (
    <div className='CandlePlotTV'>
      <div ref={candlesRef} className='plot' />
      <div ref={indiRef} />
      <svg ref={svgRef} />
    </div>
  );
}


CandlePlotTV.propTypes = propTypes;
CandlePlotTV.defaultProps = defaultProps;

export default CandlePlotTV;
