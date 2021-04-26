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

import NotAvailable from '../../d3classes/common/NotAvailable'
import RatioGrid from '../../d3classes/Equity/RatioGrid'
import RatioLegend from '../../d3classes/Equity/RatioLegend'
import FinReportToolTips from '../../d3classes/Equity/FinReportToolTips'
import LineSeries from '../../d3classes/Equity/LineSeries'

import '../../css/FinReportPlot.css';


const propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  //data: PropTypes.object,
};

const defaultProps = {
  width: 400,
  height: 300,
  //data: {},
};


function RatioPlot(props) {
  const chartRef = useRef({});
  const svgRef = useRef();
  const touchRef = useRef();

  useEffect(() => {
    const svg = select(svgRef.current);
    const touch = select(touchRef.current);

    const grid = new RatioGrid(svg, 'bottom', 'right');
    const series = new LineSeries(svg, grid.clipId);
    const tooltips = new FinReportToolTips(svg);
    const legend = new RatioLegend(svg);
    const na = new NotAvailable(svg, grid);

    function onZoom(e) {
      grid.onZoomX(e.transform);

      const data = series.group
        .selectAll('path')
        .data();

      if (!data || !data.length)
        return;

      grid.updateYWithData(data.map(d => d.data));
      series.redraw(grid.initX, grid.y, e.transform);
      tooltips.hideAll();
    }

    const zoomFunc = zoom()
      .on('zoom', onZoom);

    touch
      .call(zoomFunc);

    touch.on('mousemove',
      e => {
        const data = series.group
          .selectAll('path')
          .data()
          .map(d => d.data);
        tooltips.onMouseMove(e, data, grid)
      });

    touch.on('mouseout', () => tooltips.hideAll());

    Object.assign(chartRef.current, {
      grid, zoomFunc, legend, series, tooltips, na
    });

    return () => {
      svg.selectAll('*').remove();
    };

  }, []);

  useEffect(() => {
    const svg = select(svgRef.current);
    const touch = select(touchRef.current);
    const ch = chartRef.current;

    const width = props.width, height = props.height;
    const margin = {t: 5, l: 12, b: 42, r: 35 };
    const legendMargin = {l: 9, b: 10};

    svg.attr('width', width)
       .attr('height', height);
    //   .style('border', '1px solid #eee');

    ch.grid.setSize(width, height, margin);

    const extent = [[margin.l, margin.t], [width - margin.r, height - margin.b]];
    ch.zoomFunc
      .extent(extent)
      .translateExtent(extent)
      .scaleExtent([1, 20])

    touch
      .style('top', `${margin.t}px`)
      .style('bottom', `${margin.b}px`)
      .style('left', `${margin.l}px`)
      .style('right', `${margin.r}px`)

    ch.series.redraw(ch.grid.initX, ch.grid.y);

    ch.tooltips.setBounds(width, height, margin);

    ch.legend.setPos(legendMargin.l, height - legendMargin.b)

  }, [props.width, props.height]);

  useEffect(() => {
    const ch = chartRef.current;
    ch.na.hide()

    let data = null;
    if (props.data.length)
      data = props.data.filter(f => f.data && f.data.length > 1)

    if (!data || !data.length) {
      ch.series.setData([]);
      ch.legend.setData([]);
      if (data && !data.length)
        ch.na.show();
      return;
    }

    const touch = select(touchRef.current);

    data.reverse();
    const labelData = data.map(d => {return { name: d.name, color: d.color }});

    let minT = new Date();
    minT.setYear(2100);
    let maxT = new Date();
    maxT.setYear(1980);

    for (const f of data) {
      minT = Math.min(minT, f.data[0].date);
      maxT = Math.max(maxT, f.data[f.data.length - 1].date);
    }

    ch.grid.setDomainX([minT, maxT]);

    //ch.grid.updateYWithData([firm, average]);

    ch.series.setData(data);
    ch.tooltips.setData(labelData);

    ch.legend.setData(labelData.reverse());
    ch.series.redraw(ch.grid.initX, ch.grid.y);

    // initial zoom
    const firm = data[data.length > 1 ? 1 : 0].data;
    if (firm.length < 2)
      return;
    const first = ch.grid.x(firm[0].date),
      last = ch.grid.x(firm[firm.length - 1].date),
      second = ch.grid.x(firm[1].date);

    const lyIndex = firm.length >= 5 ? firm.length - 5 : 0;
    const lastYearDate = new Date(firm[lyIndex].date);
    lastYearDate.setMonth(lastYearDate.getMonth() - 1);
    const year = ch.grid.x(lastYearDate);

    // one quarter is maximum zoom
    const scaleExtent = (last - first) / (second - first);
    ch.zoomFunc.scaleExtent([1, scaleExtent]);
    // default zoom/pan - one year from the last datapoint
    const scaleTo = (last - first) / (last - year);
    ch.zoomFunc.scaleTo(touch, scaleTo);
    ch.grid.configureTicksX();
    ch.zoomFunc.translateTo(touch, last, 0);

  }, [props.data]);

  return (
    <div className='RatioPlot'>
      <svg ref={svgRef}/>
      <div className='touch' ref={touchRef} />
    </div>
  );
}


RatioPlot.propTypes = propTypes;
RatioPlot.defaultProps = defaultProps;

export default RatioPlot;
