import React, { useMemo } from "react";
import { useState, useEffect} from "react";
import { default as ReactSelect, components } from "react-select";
import ServiceLayer from "../chartLayers/ServiceLayer";
import DataFilterLayer from "../chartLayers/DataFilterLayer";




export default function FilterCheckBox(props) {
  const cfg = JSON.parse(JSON.stringify(props.cfg.getRaw()));
  return (
    <ServiceLayer
      cfg={cfg}
      dataSourceCfg={cfg.dataSource}
      DataLayer={DataFilterLayer}
      Chart={FilterCheckBoxtWithLayers}
    />
  )
}



function FilterCheckBoxtWithLayers({ dataset,
  cfg, filteredData,
  functionHandler, filters }) {
  const [optionSelected, setOptionSelected] = useState({});
  const data = useMemo(() => {
    let result = Object.assign({}, dataset);
    for (let key of Object.keys(dataset)) {
      let keyData = dataset[key].values.map(item => ({ value: item, label: item }))
      result[key] = keyData;
    }
    return result;
  }, [JSON.stringify(dataset)])


  useEffect(() => {
    if (Object.keys(dataset).length === 0) return;
    setOptionSelected((Object.keys(filters))
      .reduce(
        (accumulator, key) => (
          {
            ...accumulator, [key]: accumulator[key][0] == '!=' ? (accumulator[key]
              .map(val => ({ value: val, label: val }))).splice(1, accumulator[key].length) : dataset[key].values
              .filter(filter => (accumulator[key].indexOf(filter) === -1))
              .map(filter => ({ value: filter, label: filter,isDisable:true }))
          })
        , filters
      ));
  }, [JSON.stringify(filters)])

  const Option = (props) => {

    const isDisabled = filteredData[props.selectProps.id.replace('select-', '')].indexOf(props.data.value) == -1;
    //props.isDisabled = isDisabled;
    return (
      <div>
        <components.Option {...props}>
          <input
            type="checkbox"
            disabled={isDisabled}
            checked={!props.isSelected && !isDisabled}
            onChange={() => null}
          />{" "}
          <label>{props.label}</label>
        </components.Option>
      </div>
    );
  };

  const keys = Object.keys(dataset).map(key => ({ value: key, label: cfg?.style.hasOwnProperty(key) ? cfg.style[key] : dataset[key].title }));
  const handleChange = (selected, key) => {
    functionHandler.setFilters({ [key]: ['!=', ...selected.map(item => (item.value))] });

  }
  return (
    <div style={{ overflow: 'auto' }}>
      <div>
        <div style={{ display: 'flex', position: 'relative', flexDirection: 'column', maxWidth: "95%", marginLeft: '2.5%' }}>
          {keys.map(key => (
            <div>
              <label>{key.label}</label>
              <ReactSelect
                id={`select-${key.value}`}
                options={data[key?.value]}
                isMulti
                closeMenuOnSelect={false}
                hideSelectedOptions={true}
                maxMenuHeight={100}
                styles={{option:(styles,{data,selectProps})=>{
                  return {...styles,color: filteredData[selectProps.id.replace('select-', '')].indexOf(data.value) == -1? 'gray' : 'black'}
                }}}
                components={{
                  Option
                }}

                onChange={event => (handleChange(event, key.value))}
                value={optionSelected[key.value]}
              />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}


/*optionSelected.current= ( Object.keys(model?.filters)
.reduce(
  (accumulator, key) =>  (
  {...accumulator,[key] :accumulator[key][0]=='!='? (accumulator[key]
    .filter((f)=>{ return f !== '!=' && f !== '=' })
    .map(val=>({value:val,label:val}))): data[key].filter(filter=>(accumulator[key].indexOf(filter.value)>-1)).map(filter=>({value:filter,label:filter}))
  })
  ,model.filters
));*/

/**   setOptionSelected( Object.keys(model.filters)
    .reduce(
      (accumulator, currentValue) =>  (
      {...accumulator,[currentValue] :accumulator[currentValue]
        .filter((f)=>{ return f !== '!=' })
        .map(val=>({value:val,label:val}))
      })
      ,model.filters
    )); */
