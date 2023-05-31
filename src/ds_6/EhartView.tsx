import { useEffect, useRef, useMemo, useLayoutEffect, } from "react";
import React from "react";
import Echart from "./Echart";
import './Select.css';
export default function EchartView({
  chartCfg,
  dimensions,
  source,
  filters,
  width,
  height,
  onChangeDim
}) {
  const option = useRef(chartCfg.echartOptions);
  const hierarchyLevel = useRef(chartCfg.hierarchy ? chartCfg.hierarchy.indexOf(dimensions[0]) : null);
  const firstInnit = useRef(true);
  const koobFiltersService = window.__koobFiltersService || window.parent.__koobFiltersService;
  const chartRef = useRef()
  const selectedValue = useRef({})
  useEffect(() => {
    if (option.current?.tooltip?.tooltip) {
      const tooltip = option.current.tooltip.formatter;
      if (String(tooltip).startsWith('function')) {
        option.current({ ...option, tooltip: { formatter: evalFormatter(tooltip.replace('function', '')) } });
      }
    }
    if (chartRef.current && chartCfg.onClickFilter)
      chartRef.current.getEchartInstance().on('click', debounce((e) => {
        if (!chartCfg.onClickFilter) return;
        selectedValue.current = { [Object.keys(e.data)[0]]: ['=', e.data[Object.keys(e.data)[0]]] };
        if (chartCfg?.hierarchy) {
          hierarchyLevel.current < chartCfg.hierarchy.length - 1 ? hierarchyLevel.current += 1 : hierarchyLevel.current = 0

        }
        else {
          koobFiltersService.setFilters(chartCfg.dataSource.koob, { ...filters, ...selectedValue.current });
        }
      }, 1000));
  }, [])
  useEffect(() => {
    if (!chartCfg.onClickFilter || !chartCfg.hierarchy) return;
    if (firstInnit.current) {
      firstInnit.current = false;
      return;
    }
    if (hierarchyLevel.current > 0) {
      onChangeDim(chartCfg.hierarchy[hierarchyLevel.current]);
      koobFiltersService.setFilters(chartCfg.dataSource.koob, { ...filters, ...selectedValue.current });
    }
    else {
      const dropFilters = {};
      for (let filt of chartCfg.hierarchy) {
        dropFilters[filt] = ['!='];
      }
      koobFiltersService.setFilters(chartCfg.dataSource.koob, { ...filters, ...dropFilters });
      onChangeDim(chartCfg.hierarchy[0])
    }
  }, [hierarchyLevel.current])
  const resetOptions = useMemo<Object>(() => {
    if (dimensions && source)
      return ({ ...option.current, dataset: { dimensions: dimensions, source: source } })
    else
      return ({ ...option.current, dataset: { dimensions: [], source: [] } })
  }, [dimensions, source]);
  return (
    <Echart
      width={width}
      height={height}
      echartOptions={{
        ...resetOptions
      }
      }
      ref={chartRef}
    />
  );
}
function evalFormatter(formatter) {
  try {
    return eval(formatter);
  } catch {
    return formatter;
  }
}
function debounce(func, timeout = 1000) {
  let timer;
  return (...args) => {
    if (!timer) {
      func.apply(this, args);
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
    }, timeout);
  };
}
