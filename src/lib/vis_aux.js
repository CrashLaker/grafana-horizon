import {
  regularVis,
  discreteVis,
  horizonVis,
  barplotVis,
  dotplotVis,
} from './vis'

import * as d3 from 'd3'

export const wrapperDraw = (pre) => {
  for (let i = 0; i < pre.meta.data.length; i++){
    applyVis(pre.useVis, i, pre) 
  }
}

export const applyVis = (useVis, idx, pre) => {
  const {ctx} = pre
  
  ctx.beginPath();
 
  switch(useVis){
    case 'regular':
      regularVis(idx, pre)
      break
    case 'horizon':
      horizonVis(idx, pre)
      break
    case 'discrete':
      discreteVis(idx, pre)
      break
    case 'barplot':
      barplotVis(idx, pre)
      break
    case 'dotplot':
      dotplotVis(idx, pre)
      break
  }
  
  ctx.closePath();
}

export const genxAxis = (svg, x) => {
  const x_axis = d3.axisTop()
                .scale(x)
                .ticks(8)
                .tickSizeOuter(0)
  svg.append('g')
      .attr('transform', 'translate(0, 20)')
      .call(x_axis)
      .call(g => g.select('.domain').remove())
}

//from https://bl.ocks.org/emeeks/8a3a12b0327f12560b1a
export const cheapSketchy = (path) => {

  var length = path.getTotalLength();
  var drawCode = "";
  var i = 0;
  var step = 2;

  while (i < length / 2) {
    var start = path.getPointAtLength(i);
    var end = path.getPointAtLength(length - i);

    drawCode += " M" + (start.x + (Math.random() * step - step/2)) + " " + (start.y + (Math.random() * step - step/2)) + "L" + (end.x + (Math.random() * step - step/2)) + " " + (end.y + (Math.random() * step - step/2));

    i += step + (Math.random() * step);
  }

  return drawCode;
}

export const makeSketchy = (ctx, startX, startY, width, height) => {
  let pathString = "m" + startX + " " + startY 
                  + " l" + width + " " + "0"
                  + " l" + "0" + " " + height
                  + " l" + (-width) + " " + "0"
                  + " Z";
  
  let path = d3.select(document.createElementNS('http://www.w3.org/2000/svg', 'path'))
  
  path.attr('d', pathString)
  
  let fillCode = cheapSketchy(path.node())
  
  path.remove()
  
  ctx.stroke(new Path2D(fillCode))
}

//https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
export const componentToHex = (c) => {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

export const rgbToHex = (r, g, b) => {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export const hexToRgb = (hex) => {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ] : null;
}

