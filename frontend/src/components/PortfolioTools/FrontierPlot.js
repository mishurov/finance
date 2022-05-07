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

import Grid from '../../d3classes/common/Grid'
import AxisLabel from '../../d3classes/common/AxisLabel';
import ColorLegend from '../../d3classes/PortfolioTools/ColorLegend';
import SimPoints from '../../d3classes/PortfolioTools/SimPoints';
import AssetItems from '../../d3classes/PortfolioTools/AssetItems';
import Frontier from '../../d3classes/PortfolioTools/Frontier';

import '../../css/FrontierPlot.css';


const propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  portfolio: PropTypes.object,
  data: PropTypes.object,
};

const defaultProps = {
  width: 400,
  height: 300,
  portfolio: {},
  data: {},
};


function FrontierPlot(props) {

  const chartRef = useRef({});
  const svgRef = useRef();

  const { setColors, setPortColor } = props;

  useEffect(() => {
    const svg = select(svgRef.current);

    const grid = new Grid(svg);

    const labelX = new AxisLabel(svg, grid.axisXgroup,
      grid.orientX, 'Variance (σ)', 2);
    const labelY = new AxisLabel(svg, grid.axisYgroup,
      grid.orientY, 'Log Return (μ)', 10);
    const legend = new ColorLegend(svg, 'μ/σ Ratio');

    const points = new SimPoints(svg, grid, legend);
    const assets = new AssetItems(svg, grid);
    const front = new Frontier(svg, grid, legend, assets);

    Object.assign(chartRef.current, {
      grid, labelX, labelY, legend, points, assets, front
    });

    return () => {
      svg.selectAll('*').remove();
    };
  }, []);

  useEffect(() => {
    const ch = chartRef.current;
    ch.front.dragEndCallback = props.onDragEnd;
  }, [props.onDragEnd]);

  useEffect(() => {
    const svg = select(svgRef.current);
    const ch = chartRef.current;

    const width = props.width, height = props.height;
    const margin = {t: 10, l: 45, b: 40, r: 75 };

    svg.attr('width', width)
       .attr('height', height);

    ch.grid.setSize(width, height, margin);
    ch.labelX.transform();
    ch.labelY.transform();
    ch.legend.transform(
      width - margin.r + 33, margin.t,
      20, height - margin.b - margin.t - 40);

    ch.points.reposition();
    ch.assets.reposition();
    ch.front.reposition();

  }, [props.width, props.height]);

  useEffect(() => {
    const ch = chartRef.current;
    const data = props.data;
    if (!data.bounds)
      return;

    const paddingRatio = 15;
    const varMax = data.bounds.variance[1],
      varMin = data.bounds.variance[0],
      retMax = data.bounds.logret[1],
      retMin = data.bounds.logret[0];
    const paddingX = (varMax - varMin) / paddingRatio,
      domainX = [varMin - paddingX, varMax + paddingX],
      paddingY = (retMax - retMin) / paddingRatio,
      domainY = [retMin - paddingY, retMax + paddingY];

    ch.grid.setDomainX(domainX);
    ch.grid.setDomainY(domainY);
    ch.legend.setDomain(data.bounds.ratio);

    ch.points.setData(data.simPts);
    ch.assets.setData(data.assetsPts);
    ch.front.setData(data);

    const colors = {};
    colors.assets = [];
    for (let i = 0; i < data.assetsPts.length; i++) {
      colors.assets[i] = ch.legend.getColor(data.assetsPts[i].ratio);
    }

    if (data.optimal.pt.ratio > -Infinity)
      colors.optimal = ch.legend.getColor(data.optimal.pt.ratio);

    setColors(colors);
    setPortColor('');

  }, [props.data, setColors, setPortColor]);

  useEffect(() => {
    if (!props.portfolio.weights)
      return;
    const ch = chartRef.current;
    ch.front.setSelected(props.portfolio.pt);
    setPortColor(ch.legend.getColor(props.portfolio.pt.ratio));
  }, [props.portfolio, setPortColor]);

  return (
    <div className='FrontierPlot'>
      <svg ref={svgRef} />
    </div>
  );
}


FrontierPlot.propTypes = propTypes;
FrontierPlot.defaultProps = defaultProps;

export default FrontierPlot;
