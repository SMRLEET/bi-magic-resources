import { useRef, useMemo, useEffect, useState } from "react";
import React from "react";
import '../styles/Select.css';
import EchartView from "./EhartView";
import { debounce } from "../utils/ChartUtils";
import DataLayer from "../chartLayers/DataLayer"
import ServiceLayer from "../chartLayers/ServiceLayer";

export default function EchartGraph(props) {
  const cfg = JSON.parse(JSON.stringify(props.cfg.getRaw()));
  const serviceLayer = useMemo(() => {
    return (
      <ServiceLayer
        cfg={cfg}
        dataSourceCfg={cfg.dataSource}
        DataLayer={DataLayer}
        Chart={EchartDonut}
      />)
  }, [])
  console.log('render EchartGraph')
  return (
    serviceLayer
  )
}


function EchartDonut({ dataset,
  cfg,
  functionHandler }) {
  console.log('render EchartDonut')
  const divRef = useRef<HTMLDivElement>(null);
  //if (model.loading) console.log(model)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const eventHandler = [{
    event: 'click', action: debounce((e) => {
      if (!cfg.onClickFilter) return;
      if (cfg?.hierarchy) {
        console.log(functionHandler)
        console.log(e);
        functionHandler.setHierarchyDim(cfg.hierarchy, e.data[Object.keys(e.data)[0]]);
      }
      else {
        functionHandler.setFilters({ [Object.keys(e.data)[0]]: ['=', e.data[Object.keys(e.data)[0]]] })
      }
    }, 1000)
  }]
  const onResize = React.useCallback(() => {
    if (divRef.current) 
    setSize({ width:divRef.current?.offsetWidth, height: divRef.current?.offsetParent?.clientHeight });
  }, []);
  useEffect(() => {
    if (!divRef.current) return;
    divRef.current.addEventListener('resize', onResize)
  }, [])
  return (
    <div ref={divRef}>
      {Object.keys(dataset).length > 0 ?
        <EchartView
          width={size.width > 0 ? size.width : divRef.current?.offsetWidth}
          height={size.height > 0 ? size.height :divRef.current?.offsetParent?.clientHeight}
          dimensions={dataset.dimensions}
          source={dataset.source}
          chartCfg={JSON.parse(JSON.stringify(cfg))}
          echartsEventHandler={eventHandler}
          hierarchyEventHanler={(e) => { functionHandler.dropHierarchy(cfg.hierarchy, e.target.id.replace('dropup-content-', '')); }}
        /> : <article className="Dashlet loading" />}
    </div>
  );

}

