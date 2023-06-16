import React from "react";
import { FormSelect } from 'react-bootstrap';
import '../styles/Select.css';
import ServiceLayer from "../chartLayers/ServiceLayer";
import DataFilterLayer from "../chartLayers/DataFilterLayer";


export default function Filter(props) {
  const cfg = JSON.parse(JSON.stringify(props.cfg.getRaw()));
  return (
    <ServiceLayer
      cfg={cfg}
      dataSourceCfg={cfg.dataSource}
      DataLayer={DataFilterLayer}
      Chart={FilterWithLayers}
    />
  )

}


function FilterWithLayers({ dataset, functionHandler,filteredData, cfg }) {


  function isDisable(dim, value) {
    if (!filteredData.hasOwnProperty(dim)) return false;
    if (filteredData[dim].indexOf(value) === -1) return true;
    else return false;
  }
  function onFilterChange(e) {
    const dim = e.target.name;
    const options = e.target.selectedOptions;
    const values = Array.from(options).map((option: any) => option.value);
    functionHandler.setFilters({ [dim]: ['=', ...values] })
  }
  const keys = Object.keys(dataset);
  return (
    <div style={{ overflow: 'auto' }}>
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: "100%" }}>
          <ul>
            {keys.map(key => (
              <div>
                <div style={{ marginTop: '30px' }}>
                  <a style={{ marginLeft: '40px', marginTop: '30px' }}>{cfg.current?.style?.hasOwnProperty(dataset[key].id) || dataset[key].title}</a>
                </div>
                <div>
                  <FormSelect className="custom-select" style={{ height: ((100 / (keys.length)).toString() + '%'), width: '95%', marginTop: '10px', }} id={`select-${key}`} name={key}
                    onChange={onFilterChange}
                    multiple>
                    {dataset[key].values.map(option => <option id={`select-${key}-option-${option}`}
                    style={{color: isDisable(key,option)?'grey':'black'}}
                    selected={!isDisable(key,option)}
                    value={option}>{option}</option>)}
                  </FormSelect>
                </div>
              </div>
            ))}

          </ul>
        </div>

      </div>

    </div>
  );
}
