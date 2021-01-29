import * as d3 from 'd3'
import { getColorByName } from '@grafana/data'

export const genData = (values=1500, withVariance=true, offset=0) => {
  var series = [];
  var d = new Date()
  for (var i = 0, variance = 0; i < values; i++) {
      variance += (Math.random() - 0.5) / 10;
      if (!withVariance)
        variance = 0
      series.push({
        //x: i,
        //x: new Date(d.getTime()+3600000*i),
        x: offset+3600000*i,
        y: (Math.cos(i/10) + variance) *200
      })
  }
  return series
}

export const getGrafanaColor = (bgColor) => {
    let bgColorFn = getColorByName(bgColor)
    return (bgColorFn) ? bgColorFn.variants.dark : bgColor 
}

export const genMetaGrafana = (serie, width, height) => {
  //console.log('genmetagrafana', serie)
  const {name, refId, fields} = serie

  const fieldTime = fields.filter(d => d.type == 'time')[0]
  const fieldNumber = fields.filter(d => d.type == 'number')[0]
  const config = fieldNumber.config
  const data = fieldNumber.values.buffer.map((d,i) => {
    return {
      //x: new Date(fieldTime.values.buffer[i]),
      x: fieldTime.values.buffer[i],
      y: d,
    }
  })
  //console.log('data', data)

  //const extent = d3.extent(data)
  const extent = [config.min, config.max]
  const largest = d3.max([Math.abs(extent[0]), Math.abs(extent[1])])

  let bandPos = [0]
  let bandNeg = []
  let colorPos = []
  let colorNeg = []

  const thresholdMode = config.thresholds.mode // absolute, percentage

  for (let step of config.thresholds.steps){
    let {value, color} = step
    if (value < 0){
      if (thresholdMode == 'percentage')
        value = extent[0]*value/100
      bandNeg.push(value)
      colorNeg.push(getGrafanaColor(color))
    }else{
      if (thresholdMode == 'percentage')
        value = extent[1]*value/100
      bandPos.push(value)
      colorPos.push(getGrafanaColor(color))
    }
  }
  bandNeg.push(0)
  bandPos[bandPos.length-1] = +Infinity
  bandNeg.reverse()
  colorNeg.reverse()

  //console.log(bandNeg, colorNeg)
  //console.log(bandPos, colorPos)

  const bandPosY = d3.scaleLinear()
            .range([height, 0])
            .domain([0, extent[1]])
  const bandNegY = d3.scaleLinear()
            .range([height, 0])
            .domain([0, extent[0]])
  
  const yPos = d3.scaleLinear()
            .range([height, 0])
            .domain([0, extent[1]])
  const yNeg = d3.scaleLinear()
            .range([height, 0])
            .domain([0, extent[0]])
  const yPos2 = d3.scaleLinear()
            .range([height/2, 0])
            .domain([0, extent[1]])
  const yNeg2 = d3.scaleLinear()
            .range([height/2, 0])
            .domain([0, extent[0]])
  
  const x = d3.scaleLinear()
            .range([0, width])
            .domain(d3.extent(data, d => d.x))
  
  return {
    //grafana
    name,
    refId,
    //styles
    colorPos,
    colorNeg,
    //meta
    data,
    extent,
    largest,
    yPos,
    yNeg,
    x,
    // horizon
    bandPos,
    bandNeg,
    bandPosY,
    bandNegY,
    //barplot
    yPos2,
    yNeg2,
  }

}

export const preRender = (data, slices, width, height) => {
 
  const extent = d3.extent(data, d => d.y)
  const largest = d3.max([Math.abs(extent[0]), Math.abs(extent[1])])
  
  const bandPos = genBands(data.filter(d => d.y > 0).map(d => d.y), slices)
  const bandNeg = genBands(data.filter(d => d.y < 0).map(d => d.y), slices)
  
  //const bandPosY = [...Array(bandPos.length-1)].map((d,i) => {
  //  return d3.scaleLinear().range([height, 0]).domain([bandPos[i], extent[1]])
  //})
  //  
  //const bandNegY = [...Array(bandNeg.length-1)].map((d,i) => {
  //  return d3.scaleLinear().range([height, 0]).domain([bandNeg[i], extent[0]])
  //})
  const bandPosY = d3.scaleLinear()
            .range([height, 0])
            .domain([0, extent[1]])
  const bandNegY = d3.scaleLinear()
            .range([height, 0])
            .domain([0, extent[0]])
  
  const yPos = d3.scaleLinear()
            .range([height, 0])
            .domain([0, extent[1]])
  const yNeg = d3.scaleLinear()
            .range([height, 0])
            .domain([0, extent[0]])
  const yPos2 = d3.scaleLinear()
            .range([height/2, 0])
            .domain([0, extent[1]])
  const yNeg2 = d3.scaleLinear()
            .range([height/2, 0])
            .domain([0, extent[0]])
  
  const x = d3.scaleLinear()
            .range([0, width])
            .domain(d3.extent(data, d => d.x))
  
  return {
    data,
    extent,
    largest,
    yPos,
    yNeg,
    x,
    // horizon
    bandPos,
    bandNeg,
    bandPosY,
    bandNegY,
    //barplot
    yPos2,
    yNeg2,
  }
}

const genBands = (data, slices) => {
  const extent = d3.extent(data)
  const largest = (extent[0] < 0 && extent[1] < 0)
                  ? extent[0] : extent[1]
  const part = Math.floor(largest/slices)
  let rs = [
    0, 
    ...[...Array(slices-1)].map((d,i) => part*(i+1)), 
    largest
  ]
  return [...rs]
}

//export const colors_red = ['#fff1f0', '#ffccc7', '#ffa39e', '#ff7875', '#ff4d4f', '#f5222d', '#cf1322', '#a8071a', '#820014', '#5c0011']
//export const colors_blue = ['#e6f7ff', '#bae7ff', '#91d5ff', '#69c0ff', '#40a9ff', '#1890ff', '#096dd9', '#0050b3', '#003a8c', '#002766']

export const colors_blue = ["#abd9e9", "#74add1", "#4575b4", "#313695"]
export const colors_red = ["#fee090", "#fdae61", "#f46d43", "#d73027"] 

// https://en.wikipedia.org/wiki/Binary_search_algorithm
export const bSearchLeftMost = (arr, n, target) => {
  let L = 0
  let R = n
  while (L < R){
    let m = Math.floor((L+R)/2)
    if (arr[m].x < target)
      L = m+1
    else
      R = m
  }
  return L
}