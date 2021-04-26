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
import Grid from '../../d3classes/common/Grid';
import AxisLabel from '../../d3classes/common/AxisLabel';
import CrossHairs from '../../d3classes/common/CrossHairs';
import ConvexityLinesTT from '../../d3classes/FixedIncome/ConvexityLinesTT';


function ConvexityPlot(props) {
  const svgRef = useRef();
  const chartRef = useRef({});

  useEffect(() => {
    const svg = select(svgRef.current);

    const grid = new Grid(svg);
    const labelX = new AxisLabel(svg, grid.axisXgroup,
      grid.orientX, 'YTM', 2);
    const labelY = new AxisLabel(svg, grid.axisYgroup,
      grid.orientY, 'Price', 28);

    const hairs = new CrossHairs(svg, grid, true, true);
    hairs.hide();

    const hairYTM = new CrossHairs(svg, grid, true, false);
    hairYTM.setColor('red');
    hairYTM.hide();

    const convLines = new ConvexityLinesTT(svg, grid);
    const na = new NotAvailable(svg, grid);

    Object.assign(chartRef.current, {
      grid, hairs, labelX, labelY, hairYTM, convLines, na
    });

    return () => {
      svg.selectAll('*').remove();
    };

  }, []);

  useEffect(() => {
    const svg = select(svgRef.current);
    const ch = chartRef.current;
    const margin = {t: 8, l: 60, b: 35, r: 15 };
    const width = props.width, height = props.height;

    svg.attr('width', width)
       .attr('height', height);

    ch.grid.setSize(width, height, margin);
    ch.labelX.transform();
    ch.labelY.transform();
    ch.hairs.resize();
    ch.hairYTM.resize();
    ch.convLines.redraw();

  }, [props.width, props.height]);

  useEffect(() => {
    const ch = chartRef.current;
    ch.na.hide()
    if (!props.data || !Object.keys(props.data).length) {
      ch.convLines.setData([]);
      ch.convLines.redraw();
      if (props.data && !Object.keys(props.data).length)
        ch.na.show();
      return;
    }
    const d = props.data;
    const ytm0 = d.ytm * 100;

    function dPrice(ytm) {
      let dYtm = (ytm - ytm0) / 100,
        dDur = (d.price * d.modified * dYtm),
        dConv = (d.price * d.convexity * Math.pow(dYtm, 2) / 2) - dDur;
      return [d.price - dDur, d.price + dConv];
    }

    const durs = [], convs = [];
    const halfRange = 3,
      step = 0.2;
    for (let r = -halfRange; r <= +halfRange; r += step) {
      const ytm = ytm0 + r;
      const [dur, conv] = dPrice(ytm);
      durs.push({x: ytm, y: dur});
      convs.push({x: ytm, y: conv});
    }

    const [minX, maxX] = [durs[0].x, durs[durs.length - 1].x];
    const [minY, maxY] = [durs[durs.length - 1].y, durs[0].y];
    ch.grid.setDomainX([minX, maxX]);
    ch.grid.setDomainY([minY, maxY]);

    const classes = ['modified', 'convexity'];
    const points = [durs, convs];
    const data = [];
    for (let i = 0; i < classes.length; i++)
      data.push({ className: classes[i], points: points[i]})

    const hairX = ch.grid.x(ytm0),
      hairY = ch.grid.y(dPrice(ytm0)[0])

    ch.hairs.setPos(hairX, hairY);

    ch.convLines.setData(data);
    ch.convLines.redraw();

    const svg = select(svgRef.current);

    const rangeX = ch.grid.x.range();
    const rangeY = ch.grid.y.range();

    svg.on('mousemove.ch', e => {
      const svgBBox = svg.node().getBoundingClientRect();
      const x = e.clientX - svgBBox.x;
      const y = e.clientY - svgBBox.y;
      const ytm = ch.grid.x.invert(x);
      const [mod, conv] = dPrice(ytm);
      const modY = ch.grid.y(mod);
      const convY = ch.grid.y(conv);

      if (y < rangeY[0] && y > rangeY[1] &&
          x > rangeX[0] && x < rangeX[1]) {
        ch.convLines.setText(mod, conv);
        ch.convLines.setPos(x, modY, convY);
        ch.hairYTM.setPos(x, modY);
      } else {
        ch.hairYTM.hide();
        ch.convLines.hide();
      }

    });

    svg.on('mouseout.ch', e => {
      ch.hairYTM.hide();
      ch.convLines.hide();
    })

  }, [props.data]);

  return (
    <div className='ConvexityPlot'>
      <svg ref={svgRef}/>
    </div>
  );
}



export default ConvexityPlot;
