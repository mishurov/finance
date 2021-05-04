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

import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { select } from 'd3-selection';
import { zoom } from 'd3-zoom';
import { utcFormat } from 'd3-time-format';

import NotAvailable from '../../d3classes/common/NotAvailable'
import CrossHairs from '../../d3classes/common/CrossHairs';
import CandleGrid from '../../d3classes/Equity/CandleGrid';
import Candles from '../../d3classes/Equity/Candles';
import MovingAverages from '../../d3classes/Equity/MovingAverages';
import Stochastic from '../../d3classes/Equity/Stochastic';

import Renderer from '../../d3classes/Equity/Renderer';

import '../../css/FinReportPlot.css';


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

function CandlePlot(props) {
  const canvasRef = useRef({});
  const svgRef = useRef();
  const svgBgRef = useRef();
  const touchRef = useRef();
  const chartRef = useRef({});

  useEffect(() => {
    const svg = select(svgRef.current);
    const svgBg = select(svgBgRef.current);
    const canvas = select(canvasRef.current);
    const touch = select(touchRef.current);

    const stoch = new Stochastic(svgBg);
    const grid = new CandleGrid(svg, 'bottom', 'right');

    stoch.init(svg, grid);

    const candles = new Candles(svg, grid);
    const mas = new MovingAverages(svg, grid)

    const hairs = new CrossHairs(svg, grid, true, true, 'cursor');
    hairs.discreteX = true;
    hairs.formatX = utcFormat("%d %b '%y");
    hairs.listenSelection(touch);
    hairs.resize();
    hairs.hide();

    const renderer = new Renderer(canvas);
    const na = new NotAvailable(svg, grid);

    function onZoom(e) {
      grid.onZoomX(e.transform);

      if (!candles.data || !candles.data.length)
        return;

      const maxV = grid.updateYWithData(candles.data)

      const sourceEv = e.sourceEvent;
      if (sourceEv && sourceEv.type === 'mousemove') {
        const svgBBox = svg.node().getBoundingClientRect();
        const mx = sourceEv.clientX - svgBBox.x,
              my = sourceEv.clientY - svgBBox.y;
        hairs.setPos(mx, my);
      }

      const drawFuncs = [], updateFuncs = [];
      for (const dr of [candles, stoch, mas]) {
        const [d, u] = dr.redraw(maxV);
        drawFuncs.push(d);
        updateFuncs.push(u);
      }
      renderer.render(drawFuncs, updateFuncs);
    }

    const zoomFunc = zoom()
      .on('zoom', onZoom);

    touch
      .call(zoomFunc);

    touch.on('mousemove', e => {
      if (!candles.data || !candles.data.length)
        return;
      const svgBBox = svg.node().getBoundingClientRect();
      const mx = e.clientX - svgBBox.x;
      const idx = Math.round(grid.x.numInvert(mx));

      mas.setIndex(idx);
      stoch.setIndex(idx);
    });

    touch.on('mouseout', e => {
      if (!candles.data || !candles.data.length)
        return;
      mas.setIndex(candles.data.length - 1);
      stoch.setIndex(candles.data.length - 1);
    });

    touch.on('touchstart', e => {
      hairs.hide();
    })

    Object.assign(chartRef.current, {
      renderer, grid, hairs, zoomFunc, candles, mas, stoch, na
    });

    return () => {
      svg.selectAll('*').remove();
    };
  }, []);

  useEffect(() => {
    const canvas = select(canvasRef.current);
    const touch = select(touchRef.current);
    const ch = chartRef.current;

    const width = props.width, height = props.height;
    const margin = {t: 5, l: 15, b: 142, r: 55 };

    const dpi = window.devicePixelRatio;
    canvas.attr('width', width * dpi)
       .attr('height', height * dpi)
       .attr('style', `width:${width}px;height:${height}px`)

    ch.stoch.setSizeV(height - margin.b, 100);
    ch.grid.setSize(width, height, margin);
    ch.hairs.resize();
    ch.stoch.updateSizeH();

    touch
      .style('top', `${margin.t}px`)
      .style('bottom', `${margin.b - ch.grid.indiOffset()}px`)
      .style('left', `${margin.l}px`)
      .style('right', `${margin.r}px`)

  }, [props.width, props.height]);

  useEffect(() => {
    const ch = chartRef.current;
    ch.na.hide()

    const start = 20;
    const minCandles = 5

    if (!props.data || !props.data.series
        || props.data.series.length < start + 1 + minCandles) {
      ch.renderer.draw([])
      ch.candles.setData([])
      ch.mas.setData([], [], [])
      ch.stoch.setData(null)
      if (props.data && (!props.data.series
          || props.data.series.length < start + 1 + minCandles))
        ch.na.show();
      return;
    }

    const series = props.data.series;
    const touch = select(touchRef.current);

    ch.grid.setDomainX(series.map(c => c.d).slice(start));

    const maxV = ch.grid.updateYWithData(series.slice(start));

    ch.candles.setData(series, start, maxV);
    ch.mas.setData([9, 20], ['#3469fa', 'steelblue'], series, start);


    ch.stoch.setData(14, 3, 3, series, start);

    ch.zoomFunc.scaleExtent([1, 7]);

    const scaleTo = 1.5;
    ch.zoomFunc.scaleTo(touch, scaleTo);
    ch.grid.configureTicksX();
    ch.zoomFunc.translateTo(touch, 275, 0);
  }, [props.data]);

  return (
    <div className='CandlePlotD3' style={
      {width: props.width, height:props.height}}>
      <svg ref={svgBgRef}/>
      <canvas ref={canvasRef}/>
      <svg ref={svgRef}/>
      <div className='touch' ref={touchRef} />
    </div>
  );
}


CandlePlot.propTypes = propTypes;
CandlePlot.defaultProps = defaultProps;

export default CandlePlot;
