import { BaseService } from "bi-internal/core";
import React from "react";
import Echart from './Echart';
import { MyService } from "./MyService";

function f(number, maximumSignificantDigits) {
  return new Intl.NumberFormat('ru-RU', { maximumSignificantDigits }).format(number);
}

function getPercentageKey(key) {
  return key + '_percentage';
}

function fixedEchartOptions(echartOptions) {
  const formatter = echartOptions.tooltip?.formatter;
  return {
    ...echartOptions,
    tooltip: {
      ...echartOptions.tooltip,
      ...(formatter ? { formatter: evalFormatter(echartOptions.tooltip.formatter) } : {})
    }
  };
}

function evalFormatter(formatter) {
  try {
    return eval(formatter);
  } catch {
    return formatter;
  }
}

function getAlias(measure) {
  const parts = measure.split(":");
  return parts[parts.length - 1];
}

function hydrate(data, cfg) {
  const measure = getAlias(cfg.dataSource.measures[0]);
  data.sort((a, b) => b[measure] - a[measure]);
  const percentageKey = getPercentageKey(measure);
  data[0][percentageKey] = 100;
  for (var idx = 0; idx < data.length - 1; idx++) {
    const a = data[idx];
    const b = data[idx + 1];
    b[percentageKey] = b[measure] / a[measure] * 100;
  }
}

export default class Funnel extends React.Component<any> {
  private _myService: MyService;
  private __koobFiltersService: BaseService<any>;
  public state: {
    data: any;
    model: any;
  };

  public constructor(props) {
    super(props);
    this.state = {
      data: [],
      model: {},
    };
  };

  public componentDidMount(): void {
    const { cfg } = this.props;
    const koob = cfg.getRaw().dataSource.koob;
    this.__koobFiltersService = window.__koobFiltersService || window.parent.__koobFiltersService;
    this._myService = MyService.createInstance(koob);
    this._myService.subscribeUpdatesAndNotify(this._onSvcUpdated);
    this.__koobFiltersService.subscribeUpdatesAndNotify(this._onSvcUpdated);
  };

  private _onSvcUpdated = (model) => {
    const cfg = this.props.cfg.getRaw();
    const { dataSource } = cfg;
    const { dimensions, measures } = dataSource;
    const koob = dataSource.koob;

    this.setState({
      ...this.state,
      error: model.error,
      loading: model.loading,
    });

    if (model.loading || model.error) return;
    const filters = Object.keys(cfg.dataSource.filters)
      .filter(column => cfg.dataSource.filters[column])
      .reduce((acc, column) => {
      if (model.filters[column]) acc[column] = model.filters[column];
      return acc;
    }, {});
    this._myService.getKoobDataByCfg({
      with: koob,
      columns: [...dimensions, ...measures],
      filters,
    }).then(data => {
      this.setState({ ...this.state, data, model });
      console.log('dataFf');
      console.log(data);
      console.log('dataFf');
    });
  };

  public render() {
    const cfg = this.props.cfg.getRaw();
    const { data } = this.state;
    const { style } = cfg.dataSource;
    const echartOptions = fixedEchartOptions(cfg.echartOptions);
    const dimension = getAlias(cfg.dataSource.dimensions[0]);
    const measure = getAlias(cfg.dataSource.measures[0]);
    if (data.length) hydrate(data, cfg);
    echartOptions.dataset = {
      dimensions: [dimension, measure],
      source: data,
    };
    if (echartOptions.tooltip) {
      echartOptions.tooltip.formatter = evalFormatter(echartOptions.tooltip.formatter);
    };
    if (!!!echartOptions.max && data?.[0]?.[measure]) {
      echartOptions.max = data.reduce((currMax: any, row: any) => Math.max(currMax, row[measure]), data[0][measure]);
    };
    if (echartOptions.series?.length) {
      const series = echartOptions.series[0];
      let defaultColors = echartOptions.color || {};
      function getDefaultColor(row) {
        const { dataIndex } = row;
        if (dataIndex < defaultColors.length) {
          return defaultColors[dataIndex];
        };
        if (dataIndex === defaultColors.length) {
          return defaultColors[0];
        };
        return dataIndex % defaultColors.length - 1;
      };
      const colorMap = Object.keys(style[dimension])
      .reduce((acc: any, value: any) =>
      { acc[value] = style[dimension][value].color; return acc; }, {});
      series.itemStyle = {
        ...(series.itemStyle || {}),
        color: (row: any) => {
          const value = row.name;
          const color = colorMap[value] || getDefaultColor(row);
          return color;
        }
      }
    };
    console.log('echartOptions');
    console.log(echartOptions);
    console.log(JSON.stringify( echartOptions));
    console.log('echartOptions');
    return (
      <Echart
        width={cfg.width}
        height={cfg.height}
        echartOptions={echartOptions}
      />
    );
  }
}
