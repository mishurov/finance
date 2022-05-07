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
import { format } from 'd3-format';

import CrossHairs from '../../d3classes/common/CrossHairs';
import AxisLabel from '../../d3classes/common/AxisLabel';
import OptionsGrid from '../../d3classes/Equity/OptionsGrid';
import OptionsBars from '../../d3classes/Equity/OptionsBars';

const propTypes = {
  padding: PropTypes.number,
  color: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  data: PropTypes.array,
};

const defaultProps = {
  padding: 0.1,
  color: 'steelblue',
  width: 400,
  height: 300,
  data: [],
};


function max(d, attr) {
  return d.reduce((a, v) => Math.max(a, v[attr]), -Infinity);
}


function OptionsHistoPlot(props) {

  const chartRef = useRef({});
  const svgRef = useRef();

  useEffect(() => {
    const svg = select(svgRef.current);

    const grid = new OptionsGrid(svg, 'bottom', 'left');
    const labelX = new AxisLabel(svg, grid.axisXgroup,
      grid.orientX, 'Strike', 15);
    const labelY = new AxisLabel(svg, grid.axisYgroup,
      grid.orientY, 'Volume', 13);

    const bars = new OptionsBars(svg, grid);

    const hairs = new CrossHairs(svg, grid, true, true, 'cursor');
    hairs.discreteX = true;
    hairs.listenSelection(svg);
    hairs.formatY = format('.0f');
    hairs.resize();
    hairs.hide();


    Object.assign(chartRef.current, {
      grid, labelX, labelY, hairs, bars
    });
    return () => {
      svg.selectAll('*').remove();
    };
  }, []);

  useEffect(() => {
    const svg = select(svgRef.current);
    const ch = chartRef.current;
    const width = props.width, height = props.height;
    const margin = {t: 5, l: 40, b: 35, r: 5 };

    svg.attr('width', width)
       .attr('height', height);

    ch.grid.setSize(width, height, margin);
    ch.hairs.resize();
    ch.labelX.transform();
    ch.labelY.transform();

    ch.bars.redraw();

  }, [props.width, props.height]);

  useEffect(() => {
    const data = props.data;
    const ch = chartRef.current;

    data.sort((a, b) => (a.strike > b.strike) ? 1 : -1);
    ch.grid.setDomainX(data);
    ch.grid.setDomainY([0, max(data, 'volume') * (1 + props.padding)]);

    ch.bars.setData(data, props.color);
    ch.bars.redraw();

  }, [props.data, props.padding, props.color]);

  return (
    <div className='OptionsHistoPlot'>
      <svg ref={svgRef}/>
    </div>
  );
}


OptionsHistoPlot.propTypes = propTypes;
OptionsHistoPlot.defaultProps = defaultProps;

export default OptionsHistoPlot;
