import { useState, useEffect, useRef, } from "react";
import React from "react";
import { urlState } from "bi-internal/core";
import { MyService } from "./MyService";
import TableChart from "./TableChart";
import { UrlState } from "bi-internal/core";
import './Select.css';
import EchartView from "./EhartView";
export default function SwitchChart(props) {
  const koobFiltersService = window.__koobFiltersService || window.parent.__koobFiltersService;
  const cfg = JSON.parse(JSON.stringify(props.cfg.getRaw()));
  const error = useRef(false);
  const loading = useRef(true);
  const [filter, setFilter] = useState({});
  const [dataset, setDataset] = useState({});
  const dimensions = useRef<Object[]>(cfg.dataSource.dimensions);
  const [chartType, setChartType] = useState(0);
  const divRef = useRef<HTMLDivElement>(null);
  const myService = MyService.createInstance(cfg.dataSource.koob);

  useEffect(() => {
    koobFiltersService.subscribeUpdatesAndNotify(changeParams);
    myService.subscribeUpdatesAndNotify(changeParams);
    urlState.subscribeUpdatesAndNotify(setUrlParams);
    setFilter(koobFiltersService._model.filters);
    return () => {
      koobFiltersService.unsubscribe(changeParams);
      myService.unsubscribe(changeParams);
    };
  }, [])

  useEffect(() => {
    if (!(error.current )) {
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
            loading.current=false;
        }
        )
    }
  }, [JSON.stringify(filter)])
  if (error.current) return
  if (loading.current) return <article className="Dashlet loading" />;
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
              chartCfg={cfg}
              filters={filter}
              onChangeDim={(e) => {
                loading.current=true;
                dimensions.current = (e.dim);
                koobFiltersService.setFilters(cfg.dataSource.koob, { ...filter, ...e.filters })
              }}
              onClickFilter={(koob, filters) => { loading.current=true;koobFiltersService.setFilters(koob, filters); }}
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
  function changeParams(model) {
    loading.current=(model.loading);
    error.current=(model.erorr);
    setFilter(model.filters);
  }
  function setUrlParams(model) {
    if (model.chartType)
      setChartType(model.chartType);
    else
      UrlState.navigate({ chartType: 0 });
  }
}

