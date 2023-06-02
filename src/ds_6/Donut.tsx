import { useState, useEffect, useRef, } from "react";
import React from "react";
import { MyService } from "./MyService";
import './Select.css';
import EchartView from "./EhartView";
export default function Donut(props) {
  const koobFiltersService = window.__koobFiltersService || window.parent.__koobFiltersService;
  const cfg = JSON.parse(JSON.stringify(props.cfg.getRaw()));
  const error = useRef(false);
  const loading = useRef(false);
  const [filter, setFilter] = useState(koobFiltersService._model.filters);
  const [dataset, setDataset] = useState({});
  const dimensions = useRef<Object>(cfg.dataSource.dimensions);
  const divRef = useRef<HTMLDivElement>(null);
  const myService = MyService.createInstance(cfg.dataSource.koob);

  useEffect(() => {
    koobFiltersService.subscribeUpdatesAndNotify(changeParams);
    myService.subscribeUpdatesAndNotify(changeParams);
    return () => {
      koobFiltersService.unsubscribe(changeParams);
      myService.unsubscribe(changeParams);
    };
  }, [])
  useEffect(() => {
    if (!(error.current || loading.current)) {
      const measures = cfg.dataSource.measures;
      const filters = cfg.dataSource.filters;
      for (let key of Object.keys(filters)) {
        if (filters.hasOwnProperty(key))
          filters[key] = filter?.[key];
        else
          filters[key] = true;
      }
      myService.getKoobDataByCfg(
        {
          with: cfg.dataSource.koob,
          columns: [...dimensions.current, ...measures],
          filters,
        })
        .then(data => {
          if (data[0])
            setDataset({ source: data, dimensions: Object.keys(data['0']) });
          else
            setDataset({ source: [], dimensions: [] });
        }
        )
    }
  }, [JSON.stringify(filter)])

  useEffect(() => {
    console.log('render Donut')
  })
  return (
    <div ref={divRef}>
      {Object.keys(dataset).length > 0 ?
        <EchartView
          width={divRef.current?.offsetWidth}
          height={divRef.current?.offsetParent?.clientHeight}
          dimensions={dataset.dimensions}
          source={dataset.source}
          chartCfg={cfg}
          filters={filter}
          onChangeDim={(e) => {
            dimensions.current = (e.dim);
            koobFiltersService.setFilters(cfg.dataSource.koob, { ...filter, ...e.filters })
          }}
          onClickFilter={(koob, filters) => { koobFiltersService.setFilters(koob, filters); }}
        /> : <article className="Dashlet loading" />}
    </div>
  );

  function changeParams(model) {
    loading.current = (model.loading);
    error.current = (model.erorr);
    setFilter(model.filters);
  }

}

