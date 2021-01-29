type SeriesSize = 'sm' | 'md' | 'lg';
type CircleColor = 'red' | 'green' | 'blue';
type visTypes = 'regular' | 'horizon' | 'discrete'

export interface horizonOptions {
//  margin: number;
//  useVis: visTypes;
//  bands: number[];
//  colorPos: string[];
//  colorNeg: string[];
}

export interface HorizonOptions {
  text: string;
  showSeriesCount: boolean;
  seriesCountSize: SeriesSize;
  myCustomData: string;
  horizonOptions: horizonOptions;
  barWidth: number[];
  bezelOffset: number[];
  useVis: visTypes;
  seriesHeight: number[];
}
