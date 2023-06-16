import { useState, useEffect, useRef, Component, useMemo, } from "react";
import React from "react";
import { getKoobDataByCfg } from "../utils/DataUtils";



const DataLayer = ({ model, dataSourceCfg, cfg, functionHandler, Chart }) => {

  const [dataset, setDataset] = useState({ source: [], dimensions: [] })
  useEffect(() => {
    if ((model.error || model.loading)) return;
    const measures = dataSourceCfg.measures;
    getKoobDataByCfg(
      {
        with: dataSourceCfg.koob,
        columns: [...model.hierarchyDim, ...measures],
        filter: model.filters,
        filterCfg: dataSourceCfg.filters
      })
      .then(data => {
        if (data[0])
          setDataset({ source: data, dimensions: Object.keys(data[0]) });
        else
          setDataset({ source: [], dimensions: [] });
      }
      )
  }, [JSON.stringify([model.filters, model.hierarchyDim])])
  return (
    <Chart
      dataset={dataset}
      cfg={cfg}
      functionHandler={functionHandler}
    />
  );
}
export default DataLayer;
