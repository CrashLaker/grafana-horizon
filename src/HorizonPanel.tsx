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
  makeid,
  doSort,
} = plotlib.aux

//console.log('plotlib', plotlib)

interface Props extends PanelProps<HorizonOptions> {}

export const HorizonPanel: React.FC<Props> = ({ options, data, width, height }) => {
  const theme = useTheme();
  const styles = getStyles();

  const {
    enableDebug,
    anonymize,
  } = options

  if (enableDebug){
    console.log(options)
    console.log(data)
    window.horizon = {
      options,
      data,
    }
  }

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
      sort,
      sortOrder,
      dummyData,
    } = options

    let {
      bgColor,
    } = options

    bgColor = getGrafanaColor(bgColor)

    const div = d3.select(containerRef.current)

    const rows = data.series.reduce((g,d,i) => {
      if (d.name == 'wide' && d.fields.length > 2) { // dataframe
        return g+d.fields.length-1
      }else{
        return g+1
      }
    }, 0)
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

    let gseries = []
    data.series.map((d) => {
      if (d.name == 'wide' && d.fields.length > 2) { // dataframe
        const typeTimeSeries = d.fields.filter(dd => dd.type == 'time')[0].values.buffer
        d.fields.map(dd => {
          if (dd.type == 'number'){
            gseries.push({
              fields:[
                { name: 'Time', type: 'time', values: {buffer: typeTimeSeries}},
                {
                  name: 'Value', 
                  type: 'number', 
                  values: {buffer: dd.values.buffer},
                  config: dd.config,
                },
              ],
              name: dd.name,
              refId: 'A',
              length: d.length,
            })
          }
        })
      }else{
        gseries.push(d)
      }
    })

    const _rulerSpans = gseries.map((d,i) => {
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

    if (enableDebug){
      console.log(gseries)
      window.horizon = {
        ...window.horizon,
        gseries
      }
    }
    const canvasRows = doSort(sort, sortOrder, gseries).map((serie,i) => {

      if (!dummyData) {
        var meta = genMetaGrafana(serie, width, h_h);
        meta.x = globalX;

        if (anonymize) {
          var newName = '';

          if (meta.name.includes(':')) {
            newName = "" + makeid(5) + i + " :" + meta.name.split(':')[1];
          } else {
            newName = "" + makeid(5) + i;
          }

          meta.name = newName;
        }
      } else {
        var meta2 = genMetaGrafana(serie, width, h_h); //console.log('globalx domain [0]', globalX.domain()[0])

        var step = (globalX.domain()[1] - globalX.domain()[0]) / width; //console.log(step)

        var data_1 = genData(width, true, globalX.domain()[0], step);
        var meta = preRender(data_1, 4, h_w, h_h);
        meta.name = serie.name;
        meta.colorPos = meta2.colorPos;
        meta.colorNeg = meta2.colorNeg; //meta.colorPos = colors_blue
        //meta.colorNeg = colors_red
      }

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
          var bbox = e.target.getBoundingClientRect();
          var layerX = e.nativeEvent.layerX;
          var offset = 10;
          if (bbox.x + layerX + offset > bbox.x + bbox.width) return;
          var setRight = true;
          if (bbox.x + layerX + offset + 100 > bbox.x + bbox.width) setRight = false;
          d3.select(rulerRef.current)
            .style('left', layerX+offset+'px')
            .style('display', 'block')
            if (showValuesRuler) {
              var timeSeek = globalX.invert(layerX + offset);
  
              for (var i_1 in rulerMeta.pre) {
                var pre = rulerMeta.pre[i_1];
                var arrPos = bSearchLeftMost(pre.meta.data, pre.meta.data.length, timeSeek);
                var valueObj = pre.meta.data[arrPos];
                

                //console.log(globalX(valueObj.x), (layerX + offset))
                if (Math.abs(globalX(valueObj.x) - (layerX + offset)) > 10){
                  rulerRef.current.childNodes[i_1].textContent = ''
                  continue
                }
  
                if (valueObj) {
                  var valuePos = valueObj.y; //console.log(e.clientX, timeSeek, arrPos, valuePos, new Date(timeSeek))
  
                  if (valuePos || valuePos === 0) rulerRef.current.childNodes[i_1].textContent = valuePos.toFixed(2);
                  else rulerRef.current.childNodes[i_1].textContent = ''
                  if (!setRight) rulerRef.current.childNodes[i_1].style.left = '-80px';else rulerRef.current.childNodes[i_1].style.left = '10px';
                }
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
