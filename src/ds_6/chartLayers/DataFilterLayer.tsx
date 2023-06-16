import { useState, useEffect, } from "react";
import React from "react";
import { getFilterData, getKoobDataByCfg } from "../utils/DataUtils";



const DataFilterLayer = ({ model, dataSourceCfg, cfg, functionHandler, Chart }) => {
  const [dataset, setDataset] = useState({})
  const [filteredDataSet, setFilteredDataSet] = useState({})
  useEffect(() => {
    if ((model.error || model.loading)) return;
    getFilterData(dataSourceCfg.koob, dataSourceCfg.dimensions).then(data => {
      setDataset(data);
    })
  }, [])

  
  useEffect(() => {
    if (model.error || model.loading) return;
    getKoobDataByCfg({
      with: dataSourceCfg.koob,
      columns: [...dataSourceCfg.dimensions],
      filter: model.filters,
      filterCfg: model.filters,
      distinct: [
        ...dataSourceCfg.dimensions
      ]
    }).then(data => {
      if (!data[0]) {
        setFilteredDataSet(Object.keys(filteredDataSet).reduce((accumulator, key) => ({ ...accumulator, [key]: [] }), filteredDataSet))
        return
      }
      let result = Object.assign({}, data[0]);
      for (let key of Object.keys(data[0])) {
        let keyData = data.map(item => (item[key])).filter((value, index, self) =>
          index === self.findIndex((t) => (
            t === value
          )));
        result[key] = keyData;
      }
      setFilteredDataSet(result);
    })

  }, [JSON.stringify(model.filters)]);
  

  if (Object.keys(dataset).length === 0 && Object.keys(filteredDataSet).length === 0) return <article className="Dashlet loading" />;
  return (
    <Chart
      filters={model.filters}
      dataset={dataset}
      filteredData={filteredDataSet}
      cfg={cfg}
      functionHandler={functionHandler}
    />
  );
}
export default DataFilterLayer;
