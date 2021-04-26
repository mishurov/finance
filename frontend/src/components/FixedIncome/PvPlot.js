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

import { select } from 'd3-selection';

import NotAvailable from '../../d3classes/common/NotAvailable'
import Grid from '../../d3classes/common/Grid'
import AxisLabel from '../../d3classes/common/AxisLabel';
import CrossHairs from '../../d3classes/common/CrossHairs'
import PvLine from '../../d3classes/FixedIncome/PvLine'


function PvPlot(props) {
  const svgRef = useRef();
  const chartRef = useRef({});

  useEffect(() => {
    const svg = select(svgRef.current);

    const grid = new Grid(svg);
    const labelX = new AxisLabel(svg, grid.axisXgroup,
      grid.orientX, 'Yield', 2);
    const labelY = new AxisLabel(svg, grid.axisYgroup,
      grid.orientY, 'Present Value', 15);

    const hairs = new CrossHairs(svg, grid, true, true);
    hairs.hide();

    const pvLine = new PvLine(svg, grid);
    const na = new NotAvailable(svg, grid);

    Object.assign(chartRef.current, {
      grid, hairs, labelX, labelY, pvLine, na
    });

    return () => {
      svg.selectAll('*').remove();
    };

  }, []);

  useEffect(() => {
    const svg = select(svgRef.current);
    const ch = chartRef.current;
    const margin = {t: 8, l: 47, b: 35, r: 15 };
    const width = props.width, height = props.height;

    svg.attr('width', width)
       .attr('height', height);

    ch.grid.setSize(width, height, margin);
    ch.labelX.transform();
    ch.labelY.transform();
    ch.hairs.resize();
    ch.pvLine.redraw();

  }, [props.width, props.height]);

  useEffect(() => {
    const ch = chartRef.current;
    ch.na.hide()
    if (!props.data || !Object.keys(props.data).length) {
      ch.pvLine.setData([]);
      ch.pvLine.redraw();
      if (props.data && !Object.keys(props.data).length)
        ch.na.show();
      return;
    }
    const svg = select(svgRef.current);

    const d = props.data;

    function bondPv(ytm) {
      const rate = ytm / d.freq / 100,
        nper = d.T * d.freq;

      let pv;
      if ( rate === 0 ) {
        pv = d.par + (d.val * nper);
      } else {
        const  x = Math.pow(1 + rate, -nper),
          y = Math.pow(1 + rate, nper);
        pv = x * (d.par * rate - d.val + y * d.val) / rate;
      }
      return pv;
    }

    const points = [];
    for (let i = 0; i <= 10; i++) {
      points.push({x: i, y: bondPv(i)})
    }

    const [min, max] = [points[0], points[points.length - 1]];
    ch.grid.setDomainX([min.x, max.x]);
    ch.grid.setDomainY([max.y, min.y]);

    ch.pvLine.setData(points);
    ch.pvLine.redraw();

    const rangeX = ch.grid.x.range();
    const rangeY = ch.grid.y.range();

    svg.on('mousemove', e => {
      const svgBBox = svg.node().getBoundingClientRect();
      const x = e.clientX - svgBBox.x;
      const my = e.clientY - svgBBox.y;
      const ytm = ch.grid.x.invert(x);
      const pv = bondPv(ytm);

      if (my < rangeY[0] && my > rangeY[1] &&
          x > rangeX[0] && x < rangeX[1]) {
        const y = ch.grid.y(pv);
        ch.hairs.setPos(x, y);
        ch.pvLine.setPos(x, y);
      } else {
        ch.hairs.hide();
        ch.pvLine.hideCirc();
      }
    })

    svg.on('mouseout', e => {
      ch.hairs.hide();
      ch.pvLine.hideCirc();
    })

  }, [props.data]);

  return (
    <div className='PvPlot'>
      <svg ref={svgRef}/>
    </div>
  );
}



export default PvPlot;
