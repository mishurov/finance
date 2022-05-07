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

import { select } from 'd3-selection';
import { zoom } from 'd3-zoom';

import NotAvailable from '../../d3classes/common/NotAvailable'
import CashFlowGrid from '../../d3classes/Equity/CashFlowGrid';
import CashFlowArea from '../../d3classes/Equity/CashFlowArea';
import FinReportToolTips from '../../d3classes/Equity/FinReportToolTips';

import { formatCount } from '../common/utils';

import '../../css/FinReportPlot.css';


const propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  data: PropTypes.array,
  shapeGradient: PropTypes.string,
  toolTipBgColor: PropTypes.string,
};

const defaultProps = {
  width: 400,
  height: 300,
  data: [],
  shapeGradient: '#5c5bf5,#747efc',
  toolTipBgColor: 'black',
};


function CashFlowPlot(props) {
  const chartRef = useRef({});
  const svgRef = useRef();
  const touchRef = useRef();

  useEffect(() => {
    const svg = select(svgRef.current);
    const touch = select(touchRef.current);

    const area = new CashFlowArea(svg);
    const grid = new CashFlowGrid(svg, 'bottom', 'right');
    area.setClip(grid.clipId);

    const tooltips = new FinReportToolTips(svg);
    tooltips.labelFormat = formatCount;

    const na = new NotAvailable(svg, grid);

    function onZoom(e) {
      grid.onZoomX(e.transform);
      tooltips.hideAll();

      const datum = area.path.datum()
      if (!datum || !datum.length)
        return;
      grid.updateYWithData([datum]);
      area.redraw(grid.initX, grid.y, e.transform);
    }

    const zoomFunc = zoom()
      .on("zoom", onZoom);

    touch.call(zoomFunc);

    touch.on("touchstart mousemove", e => {
      const datum = area.path.datum();
      if (!datum || !datum.length)
        return;
      tooltips.onMouseMove(e, [datum], grid)
    });
    touch.on("mouseout", () => tooltips.hideAll());

    Object.assign(chartRef.current, {
      grid, zoomFunc, area, tooltips, na
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
    const margin = {t: 5, l: 12, b: 20, r: 48 };

    svg.attr('width', width)
       .attr('height', height);
       //.style('border', '1px solid #eee');

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

    ch.grid.setSize(width, height, margin);
    ch.area.redraw(ch.grid.initX, ch.grid.y);
    ch.tooltips.setBounds(width, height, margin);

  }, [props.width, props.height]);

  useEffect(() => {
    const ch = chartRef.current;
    const touch = select(touchRef.current);
    const colors = props.shapeGradient.split(',');
    const data = props.data;
    ch.na.hide()
    if (!data || data.length < 2) {
      ch.area.setDatum([]);
      ch.area.redraw(ch.grid.initX, ch.grid.y);
      if (data && !data.length < 2)
        ch.na.show();
      return;
    }
    const color = props.toolTipBgColor;

    const domainX = [data[0].date, data[data.length - 1].date];
    ch.grid.setDomainX(domainX);
    //ch.grid.updateYWithData([data]);
    ch.area.setColors(colors);
    ch.area.setDatum(data);
    ch.tooltips.setData([{color}]);

    if (data.length < 2)
      return;
    const first = ch.grid.x(domainX[0]),
      last = ch.grid.x(domainX[1]),
      second = ch.grid.x(data[1].date);
    const lyIndex = data.length >= 5 ? data.length - 5 : 0;
    const lastYearDate = new Date(data[lyIndex].date);
    lastYearDate.setMonth(lastYearDate.getMonth() - 1);
    const year = ch.grid.x(lastYearDate);

    const scaleExtent = (last - first) / (second - first);
    ch.zoomFunc.scaleExtent([1, scaleExtent]);

    const scaleTo = (last - first) / (last - year);
    ch.zoomFunc.scaleTo(touch, scaleTo);
    ch.grid.configureTicksX();
    ch.zoomFunc.translateTo(touch, last, 0);


  }, [props.data, props.toolTipBgColor, props.shapeGradient]);


  return (
    <div className='CashFlowPlot'>
      <svg ref={svgRef}/>
      <div className='touch' ref={touchRef} />
    </div>
  );
}


CashFlowPlot.propTypes = propTypes;
CashFlowPlot.defaultProps = defaultProps;

export default CashFlowPlot;
