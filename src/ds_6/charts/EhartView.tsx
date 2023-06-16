import { useEffect, useRef, useMemo, useLayoutEffect, ReactNode, ReactElement, } from "react";
import React from "react";
import Echart from "../Echart";
import '../styles/DropupMenu.css';
import { evalFormatter } from "../utils/ChartUtils";

export default React.memo(EchartView, (prevProps, nextProps) => {
  if (JSON.stringify({ dimensions: prevProps.dimensions, source: prevProps.source }) !=
    JSON.stringify({ dimensions: nextProps.dimensions, source: nextProps.source }))
    return false;
  if (prevProps.width !== nextProps.width && prevProps.height !== nextProps.height)
    return false
  return true;
})

function EchartView({
  chartCfg,
  dimensions,
  source,
  width,
  height,
  echartsEventHandler,
  hierarchyEventHanler
}) {
  const option = useMemo(() => {
    let res = chartCfg
    if (res.echartOptions?.tooltip) {
      const tooltip = res.echartOptions.tooltip.formatter;
      if (String(tooltip).startsWith('function')) {
        res.echartOptions = ({ ...res.echartOptions, tooltip: { formatter: evalFormatter(tooltip.replace('function', '')) } });
      }
    }
    return res;
  }, []);
  const hierarchy = useMemo(() => {
    if (!chartCfg.hierarchy) return;
    return (
      <div style={{ justifyContent: 'center', width: '100%', display: 'flex', alignItems: 'end' }}>
        <div className="dropup">
          <button className="dropbtn">{chartCfg?.dimLabel?.hasOwnProperty(dimensions[0]) ? chartCfg.dimLabel[dimensions[0]] : dimensions[0]}</button>
          <div className="dropup-content">
            {
              chartCfg.hierarchy.slice(0, chartCfg.hierarchy.indexOf(dimensions[0])).map(a => <a id={"dropup-content-" + a} onClick={hierarchyEventHanler}>
                {chartCfg?.dimLabel?.hasOwnProperty(a) ? chartCfg.dimLabel[a] : a}
              </a>)
            }
          </div>
        </div>
      </div>
    )
  }, [dimensions[0]])
  return (
    <div >
      <div>
        <Echart
          width={width}
          height={chartCfg.hierarchy ? height - height * 0.12 : height}
          echartOptions={
            (dimensions && source)
              ? ({ ...option.echartOptions, dataset: { dimensions: dimensions, source: source } })
              : ({ ...option.echartOptions, dataset: { dimensions: [], source: [] } })
          }
          eventHandler={echartsEventHandler}
        />
      </div>
      {hierarchy}
    </div>
  );
}

