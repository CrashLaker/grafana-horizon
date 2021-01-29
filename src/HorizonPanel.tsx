import React, { useRef, useState, useEffect } from 'react';
import { PanelProps } from '@grafana/data';
import { HorizonOptions } from 'types';
import { css, cx } from 'emotion';
import { stylesFactory, useTheme } from '@grafana/ui';
import moment from 'moment'

import * as d3 from 'd3'

import plotlib from './lib'

const {wrapperDraw, genxAxis} = plotlib.vis_aux
const {
  genData, 
  colors_blue, 
  colors_red, 
  preRender, 
  genMetaGrafana,
  getGrafanaColor,
  bSearchLeftMost,
} = plotlib.aux

//console.log('plotlib', plotlib)

interface Props extends PanelProps<HorizonOptions> {}

export const HorizonPanel: React.FC<Props> = ({ options, data, width, height }) => {
  const theme = useTheme();
  const styles = getStyles();

  //console.log(options)
  //console.log(data)

  const containerRef = useRef()
  const rulerRef = useRef()
  const headerAxisRef = useRef()
  const canvasBodyRef = useRef()
  const [allCanvas, setAllCanvas] = useState([])
  const [rulerSpans, setRulerSpans] = useState([])

  useEffect(() => {

    const {
      timeRange
    } = data

    const {
      mirror, 
      sketchy, 
      useVis, 
      bezelOffset, 
      barWidth,
      seriesHeight,
      seriesMargin,
      showLabels,
      showValuesRuler,
    } = options

    let {
      bgColor,
    } = options

    bgColor = getGrafanaColor(bgColor)

    const div = d3.select(containerRef.current)


    const rows = data.series.length
    const [h_w, h_h] = [width, seriesHeight[0]]
    //const bezelOffset = 0
    //const barWidth = 3
    const margin = { top: seriesMargin[0], left: 0}

    const fullHeight = h_h*rows + (rows-1)*margin.top
    
    //const customVis = 'horizon'
    
    //const xvals = genData().filter((d,i) => i%3 == 0).map(d => d.x)
    //const globalX = d3.scaleTime().domain(d3.extent(xvals)).range([0, h_w])

    const globalX = d3.scaleLinear().domain([
      moment(timeRange.from).toDate().getTime(),
      moment(timeRange.to).toDate().getTime(),
    ]).range([0, h_w])

    const globalXAxis = d3.scaleTime().domain([
      moment(timeRange.from).toDate(),
      moment(timeRange.to).toDate(),
    ]).range([0, h_w])

    d3.select(headerAxisRef.current).selectAll('*').remove()
    d3.select(headerAxisRef.current)
      .attr('style', 'position: absolute;left:0px;top:0px;')
      .attr('width', h_w+'px')
      .attr('height', '30px')
      .attr('viewBox', [0, 0, h_w, 30])
      .call((obj) => genxAxis(obj, globalXAxis))
    
    d3.select(rulerRef.current)
      .style('border-left', '1px solid white')
      .style('position', 'absolute')
      .style('left', '10px')
      .style('top', '27px')
      .style('display', 'none')
      .style('width', '2px')
      .style('height', ((fullHeight > height) ? height : fullHeight)+10+'px')
      .style('z-index', '3')
  
    d3.select(canvasBodyRef.current)
      .style('width', h_w+'px')
      .style('height', fullHeight+'px')
      .style('position', 'absolute')
      .style('overflow', 'hidden')
      .style('background-color', bgColor || 'black')
      .style('top', '33px')

    const rulerMeta = {
      globalX,
      pre: {},
      rulerValRef: {},
    }

    const _rulerSpans = data.series.map((d,i) => {
      //rulerMeta.rulerValRef[i] = thisRef
      return <span 
        style={{
          position: 'absolute',
          top: (i*margin.top) + (i*h_h) + (h_h/2) - (h_h*0.3/2) + 'px',
          left: '10px',
          textShadow: '0px 0px 6px black',
          visibility: (showValuesRuler) ? 'visible' : 'hidden',
        }}
      >
      </span>
    })

    const canvasRows = data.series.map((serie,i) => {

      const meta = genMetaGrafana(serie, width, h_h)
      meta.x = globalX

      //const data = genData(width, true, globalX.domain()[0])
      //const meta = preRender(data, 4, h_w, h_h)
      //meta.name = serie.name
      let spanLabel = <span></span>
      if (showLabels){
        //ctx.fillStyle = 'white'
        ////ctx.strokeStyle = 'grey'
        //ctx.font = `${h_h*.5}px Roboto`
        //ctx.textBaseline = 'middle'
        //ctx.fillText(pre.meta.name, 5, h_h/2)
        ////ctx.strokeText(pre.meta.name, 5, h_h/2)
        spanLabel = <span style={{
          position: 'absolute',
          left: '5px',
          top: (h_h/2)-(h_h*.6/2)+'px',
          textShadow: '0px 0px 6px black'
        }}>
          {meta.name}
        </span>
      }

      return <div
        style={{
          position: 'absolute',
          top: (i*margin.top) + (i*h_h) + 'px',
          left: '0px',
          width: h_w+'px',
          height: h_h+'px'
        }}
        key={`${Math.random()}+${i}`} // yeah need to fix
      >
        {spanLabel}
      <canvas 
        width={h_w+'px'}
        height={h_h+'px'}
        ref={node => {
          if (!node) return
          let ctx = node.getContext('2d')
          //ctx.translate(0,margin.top)
          let pre = {
            useVis,
            meta,
            canvas: node,
            ctx,
            style: {
              width: h_w,
              height: h_h,
              mirror,
              sketchy,
              bezelOffset: bezelOffset[0],
              barWidth: barWidth[0],
              //colorPos: colors_blue.slice(0,10),
              //colorNeg: colors_red.slice(0,10),
              colorPos:  meta.colorPos,
              colorNeg:  meta.colorNeg,
            },
          }
          rulerMeta.pre[i] = pre
          wrapperDraw(pre)
        }}
        onMouseMove={(e) => {
          e.persist()
          let offset = 10
          if (e.clientX + offset > width)
            offset = width-e.clientX
          offset = -10
          d3.select(rulerRef.current)
            .style('left', e.clientX+offset+'px')
            .style('display', 'block')
          if (showValuesRuler){
            let timeSeek = globalX.invert(e.clientX)
            for (let i in rulerMeta.pre){
              let pre = rulerMeta.pre[i]
              let arrPos = bSearchLeftMost(pre.meta.data, pre.meta.data.length, timeSeek)
              let valuePos = pre.meta.data[arrPos].y
              //console.log(e.clientX, timeSeek, arrPos, valuePos, new Date(timeSeek))
              rulerRef.current.childNodes[i].textContent = valuePos.toFixed(2)
            }
          }
        }}
        onMouseLeave={() => {
          //console.log('mouseout')
          d3.select(rulerRef.current)
            .style('display', 'none')
        }}
        ></canvas>
        </div>
    })

    setAllCanvas(canvasRows)
    setRulerSpans(_rulerSpans)
    
  }, [options, data, width, height])

  //const radii = data.series
  //  .map(series => series.fields.find(field => field.type === 'number'))
  //  .map(field => field?.values.buffer);
  return (
    <div
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;  
        `
      )}  
    >

      <div ref={containerRef} style={{position: 'relative'}}>
        <svg ref={headerAxisRef}></svg>
        <div ref={rulerRef}>{rulerSpans}</div>
        <div ref={canvasBodyRef}>{allCanvas}</div>
      </div>

    </div>
  );
};

const getStyles = stylesFactory(() => {
  return {
    wrapper: css`
      position: relative;
    `,
    svg: css`
      position: absolute;
      top: 0;
      left: 0;
    `,
    textBox: css`
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 10px;
    `,
  };
});
