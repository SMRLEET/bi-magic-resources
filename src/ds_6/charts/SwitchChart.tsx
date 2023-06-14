import { useState, useEffect, useRef, } from "react";
import React from "react";
import '../styles/Select.css';
import EchartView from "./EhartView";
import { debounce } from "../utils/ChartUtils";
import ServiceLayer from "../chartLayers/ServiceLayer";
import { UrlState, urlState } from "bi-internal/core";
import TableChart from "./TableChart";
import DataLayer from "../chartLayers/DataLayer";

export default function SwitchChartWithLayers(props) {
  const cfg = JSON.parse(JSON.stringify(props.cfg.getRaw()));
  return (
    <ServiceLayer
      cfg={cfg}
      dataSourceCfg={cfg.dataSource}
      DataLayer={DataLayer}
      Chart={SwitchChartSwitchChartWithLayers}
    />
  )
}


function SwitchChartSwitchChartWithLayers({ dataset,
  cfg,
  functionHandler }) {
  const [chartType, setChartType] = useState(0);
  const divRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    urlState.subscribeUpdatesAndNotify(setUrlParams);
    return () => {
      urlState.unsubscribe(setUrlParams);
    };
  }, [])

  const eventHandler = [{
    event: 'click', action: debounce((e) => {
      if (!cfg.onClickFilter) return;
      if (cfg?.hierarchy) {
        functionHandler.setHierarchyDim(cfg.hierarchy, e.data[Object.keys(e.data)[0]]);
      }
      else {
        functionHandler.setFilters({ [Object.keys(e.data)[0]]: ['=', e.data[Object.keys(e.data)[0]]] })
      }
    }, 1000)
  }]

  return (
    <div >
      <div className="mainDiv">
        <select style={{ fontSize: 15 }} className="custom-select" onChange={onChartTypeChange} >
          <option selected={chartType == 0} value={0}>Виджет</option>
          <option selected={chartType == 1} value={1}>Таблица</option>
        </select>
      </div>
      <div style={{ marginTop: '10px' }} ref={divRef}>
        <div >
          {(chartType == 0 && Object.keys(dataset).length > 0) &&
            <EchartView
              width={divRef.current?.offsetWidth}
              height={divRef.current?.offsetParent?.clientHeight}
              dimensions={dataset.dimensions}
              source={dataset.source}
              chartCfg={JSON.parse(JSON.stringify(cfg))}
              echartsEventHandler={eventHandler}
              hierarchyEventHanler={(e) => { functionHandler.dropHierarchy(cfg.hierarchy, e.target.id.replace('dropup-content-', '')); }}
            />}
        </div>
        {chartType == 1 &&
          <TableChart height={divRef.current?.offsetParent?.clientHeight - 50} data={dataset} style={cfg.style}
          />
        }
      </div>
    </div>
  );
  function onChartTypeChange(e) {
    UrlState.navigate({ chartType: e.target.value });
  }

  function setUrlParams(model) {
    if (model.chartType)
      setChartType(model.chartType);
    else
      UrlState.navigate({ chartType: 0 });
  }
}

