import * as d3 from 'd3'
import { getColorDefinitionByName } from '@grafana/data'

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
    let bgColorFn = getColorDefinitionByName(bgColor)
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

//https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
export const makeid = (length) => {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;

  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

// https://stackoverflow.com/questions/48719873/how-to-get-median-and-quartiles-percentiles-of-an-array-in-javascript-or-php
// sort array ascending

var asc = function asc(arr) {
  return arr.sort(function (a, b) {
    return a - b;
  });
};

var sum = function sum(arr) {
  return arr.reduce(function (a, b) {
    return a + b;
  }, 0);
};

var mean = function mean(arr) {
  return sum(arr) / arr.length;
}; // sample standard deviation


var std = function std(arr) {
  var mu = mean(arr);
  var diffArr = arr.map(function (a) {
    return Math.pow(a - mu, 2);
  });
  return Math.sqrt(sum(diffArr) / (arr.length - 1));
};

var quantile = function quantile(arr, q) {
  var sorted = asc(arr);
  var pos = (sorted.length - 1) * q;
  var base = Math.floor(pos);
  var rest = pos - base;

  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
};

const avg = (arr) => {
  return sum(arr) / arr.length;
};

const min = (arr) => {
  return Math.min.apply(Math, _toConsumableArray(arr));
};

var max = (arr) => {
  return Math.max.apply(Math, _toConsumableArray(arr));
};

var last = (arr) => {
  return arr[arr.length - 1];
};

var p90 = (arr) => {
  return quantile(arr, .90);
};

const renderSort = (fn, sortOrder, series) => {
  var preRender = series.map(function (d, idx) {
    var values = d.fields.filter(function (d) {
      return d.type == 'number';
    })[0].values.buffer;
    var agg = fn(values);
    return {
      idx: idx,
      agg: agg
    };
  });
  var ret = preRender.sort(function (a, b) {
    return b.agg - a.agg; // DESC
  }).map(function (d) {
    return series[d.idx];
  });
  if (sortOrder) // if true == ASC
    ret.reverse();
  return ret;
};

export const doSort = (whichSort, sortOrder, series) => {
  switch (whichSort) {
    case 'avg':
      return renderSort(avg, sortOrder, series);

    case 'min':
      return renderSort(min, sortOrder, series);

    case 'max':
      return renderSort(max, sortOrder, series);

    case 'last':
      return renderSort(last, sortOrder, series);

    case 'percentile90':
      return renderSort(p90, sortOrder, series);

    case 'none':
      return series;

    default:
      return series;
  }
};