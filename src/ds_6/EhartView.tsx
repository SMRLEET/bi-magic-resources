import { useEffect, useRef, useMemo, useLayoutEffect, ReactNode, ReactElement, } from "react";
import React from "react";
import Echart from "./Echart";
import './Select.css';
export default React.memo(function EchartView({
  chartCfg ,
  dimensions,
  source,
  filters,
  width,
  height,
  onChangeDim,
  onClickFilter
}) {
  useEffect(() => {
    console.log('render EchartView')
  })
  const option = useRef(chartCfg.echartOptions);
  const hierarchyLevel = useRef(chartCfg.hierarchy ? chartCfg.hierarchy.indexOf(dimensions[0]) : 0);
  const firstInnit = useRef(true);
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
          if (hierarchyLevel.current > 0) {
            onChangeDim({ dim: chartCfg.hierarchy[hierarchyLevel.current], filters: { ...filters, ...selectedValue.current } });
          }
          else {
            const dropFilters = {};
            for (let filt of chartCfg.hierarchy) {
              dropFilters[filt] = ['!='];
            }
            onChangeDim({ dim: chartCfg.hierarchy[0], filters: { ...filters, ...dropFilters } })
          }
        }
        else {
          onClickFilter(chartCfg.dataSource.koob, { ...filters, ...selectedValue.current });
        }
      }, 1000));
  }, [])

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
}, (prevProps, nextProps) => {
  if (JSON.stringify({ dimensions: prevProps.dimensions, source: prevProps.source }) !=
    JSON.stringify({ dimensions: nextProps.dimensions, source: nextProps.source }))
    return false;
  if (prevProps.width !== nextProps.width && prevProps.height !== nextProps.height)
    return false
  return true;
})
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
