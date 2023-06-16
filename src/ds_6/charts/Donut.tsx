import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import React from "react";
import '../styles/Select.css';
import EchartView from "./EhartView";
import { debounce } from "../utils/ChartUtils";
import DataLayer from "../chartLayers/DataLayer"
import ServiceLayer from "../chartLayers/ServiceLayer";
import { Prev } from "react-bootstrap/esm/PageItem";

export default function EchartGraph(props) {
  const cfg = JSON.parse(JSON.stringify(props.cfg.getRaw()));
  return (
    <ServiceLayer
      cfg={cfg}
      dataSourceCfg={cfg.dataSource}
      DataLayer={DataLayer}
      Chart={EchartDonut}
    />)
}

function EchartDonut({ dataset,
  cfg,
  functionHandler }) {
  const divRef = useRef<HTMLDivElement>(null);
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
    <div ref={divRef}>
      {Object.keys(dataset).length > 0 ?
        <EchartView
          width={divRef.current?.offsetWidth}
          height={divRef.current?.offsetParent?.clientHeight}
          dimensions={dataset.dimensions}
          source={dataset.source}
          chartCfg={JSON.parse(JSON.stringify(cfg))}
          echartsEventHandler={eventHandler}
          hierarchyEventHanler={(e) => { functionHandler.dropHierarchy(cfg.hierarchy, e.target.id.replace('dropup-content-', '')); }}
        /> : <article className="Dashlet loading" />}
    </div>
  );

}

