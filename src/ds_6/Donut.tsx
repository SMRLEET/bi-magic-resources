import { useState, useEffect, useRef, } from "react";
import React from "react";
import { urlState } from "bi-internal/core";
import { MyService } from "./MyService";
import './Select.css';
import EchartView from "./EhartView";
export default function Donut(props) {
  const cfg = JSON.parse(JSON.stringify(props.cfg.getRaw()));
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({});
  const [dataset, setDataset] = useState(cfg.dataSource);
  const [dimensions, setDimensions] = useState<Object>(cfg.dataSource.dimensions);
  const divRef = useRef<HTMLDivElement>(null);
  const myService = MyService.createInstance(cfg.dataSource.koob);
  const koobFiltersService = window.__koobFiltersService || window.parent.__koobFiltersService;
  useEffect(() => {
    koobFiltersService.subscribeUpdatesAndNotify(changeParams);
    myService.subscribeUpdatesAndNotify(changeParams);
    return () => {
      koobFiltersService.unsubscribe(changeParams);
      myService.unsubscribe(changeParams);
    };
  }, [])

  useEffect(() => {
    if (!(error || loading)) {
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
          columns: [...dimensions, ...measures],
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
  }, [JSON.stringify({ filter }), loading, error]);
  if (error) return <article className="Dashlet error">{error}</article>;
  if (loading) return <article className="Dashlet loading" />;

  return (
    <div ref={divRef}>
      <EchartView
        width={divRef.current?.offsetWidth}
        height={divRef.current?.offsetParent?.clientHeight}
        dimensions={dataset.dimensions}
        source={dataset.source}
        chartCfg={cfg}
        filters={filter}
        onChangeDim={setDimensions}
      />
    </div>
  );

  function changeParams(model) {
    setLoading(model.loading);
    setError(model.erorr);
    setFilter(model.filters);
  }

}

