import { useState, useEffect, useRef, useMemo, } from "react";
import React from "react";
import { MyService } from "../services/MyService";


const ServiceLayer = ({ cfg, dataSourceCfg, DataLayer, Chart }) => {
  const myService = MyService.createInstance(cfg.dataSource.koob, cfg.hierarchy);
  const [model, setModel] = useState({
    loading: false,
    error: undefined,
    filters: {},
    hierarchyDim: cfg.hierarchy ? cfg.hierarchy[0] : cfg.dataSource.dimensions
  })

  useEffect(() => {
    myService.subscribeUpdatesAndNotify(changeParams);
    return () => {
      myService.unsubscribe(changeParams);
    };
  }, [])
  return (
    <DataLayer
      model={model}
      dataSourceCfg={dataSourceCfg}
      cfg={cfg}
      functionHandler={{
        setHierarchyDim: (hierarchy, selectedValue) => myService.setHierarchyDim(hierarchy, selectedValue),
        setFilters: (filters) => myService.setFilters(filters),
        dropHierarchy: (hierarchy, dropDim) => myService.dropHierarchy(hierarchy, dropDim)
      }}
      Chart={Chart} />
  );
  function changeParams(inModel) {
    if (cfg.hierarchy)
      setModel({
        loading: inModel.loading,
        error: inModel.error,
        filters: inModel.filters,
        hierarchyDim: inModel.hierarchyDim[String(cfg.hierarchy).replaceAll(',', '')]
      });
    else
      setModel((prev) => ({
        ...prev,
        loading: inModel.loading,
        error: inModel.error,
        filters: inModel.filters
      }));
  }

}

export default ServiceLayer
