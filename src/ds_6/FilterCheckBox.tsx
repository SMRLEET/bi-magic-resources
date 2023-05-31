import React from "react";
import { useState, useEffect,useRef } from "react";
import { MyService } from "./MyService";
import { default as ReactSelect, components } from "react-select";

export default function FilterCheckBox(props) {
  const cfg = props.cfg.getRaw();
  const [filters, setFilters] = useState({});
  const outerfilters = useRef({})
  const outerfilterSeted = useRef(true)

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState({});
  const filteredData = useRef({});
  const optionSelected = useRef({});
  const dataSource = cfg.dataSource;
  const myService = MyService.createInstance(dataSource.koob);
  const koobFiltersService = window.__koobFiltersService||window.parent.__koobFiltersService;
  useEffect(() => {
    myService.subscribeUpdatesAndNotify(changeParams);
    koobFiltersService.subscribeUpdatesAndNotify(changeParams);
    return () => {
      myService.unsubscribe(changeParams);

    }
  }, [])
  function changeParams(model) {
    setLoading(model.loading);
    setError(model?.erorr);
    outerfilters.current = model.filters;
    outerfilterSeted.current = true;
  }
  useEffect(() => {
    if (Object.keys(data).length === 0) return
    optionSelected.current = (Object.keys(outerfilters.current)
      .reduce(
        (accumulator, key) => (
          {
            ...accumulator, [key]: accumulator[key][0] == '!=' ? (accumulator[key]
              .filter((f) => { return f !== '!=' })
              .map(val => ({ value: val, label: val }))) : data[key].filter(filter => (accumulator[key].indexOf(filter.value) == -1))
          })
        , outerfilters.current
      ));
  }, [JSON.stringify(outerfilters.current)])

  useEffect(() => {

    setFilters((Object.keys(optionSelected.current).reduce((accumulator, currentValue) => (
      { ...accumulator, [currentValue]: ['!=', ...optionSelected.current[currentValue].map(data => data.value)] }), optionSelected.current)))
  }, [JSON.stringify(optionSelected.current)])

  useEffect(() => {
    if (error || loading) return;
    myService.getKoobDataByCfg({
      with: dataSource.koob,
      columns: [...dataSource.dimensions]
      ,
      distinct: [
        ...dataSource.dimensions
      ]
    }).then(data => {
      const keys = Object.keys(data[0])
      let result = Object.assign({}, data[0]);
      for (let key of keys) {
        let keyData = data.map(item => ({ value: item[key], label: item[key] })).filter((value, index, self) =>
          index === self.findIndex((t) => (
            t.value === value.value
          )));
        result[key] = keyData;
      }
      setData(result);
    })

  }, []);

  useEffect(() => {
    if (error || loading) return;

    myService.getKoobDataByCfg({
      with: dataSource.koob,
      columns: [...dataSource.dimensions]
      , filters,
      distinct: [
        ...dataSource.dimensions
      ]
    }).then(data => {
      if (!data[0]) {
        filteredData.current = Object.keys(filteredData.current).reduce((accumulator, key) => ({ ...accumulator, [key]: [] }), filteredData.current)
        return
      }
      const keys = Object.keys(data[0])
      let result = Object.assign({}, data[0]);
      for (let key of keys) {
        let keyData = data.map(item => (item[key])).filter((value, index, self) =>
          index === self.findIndex((t) => (
            t === value
          )));
        result[key] = keyData;
      }
      filteredData.current = result;
    })

  }, [JSON.stringify(filters)]);


  useEffect(() => {

    if (outerfilterSeted.current) return
    koobFiltersService.setFilters(dataSource.koob, filters);
    //koobFiltersService._updateWithData({ filters });
    //myService.setFilters(filters);
  }, [JSON.stringify(filters)]);

  const Option = (props) => {

    const s = "2312"
    const isDisabled = filteredData.current[props.selectProps.id.replace('select-', '')].indexOf(props.data.value) == -1;
    props.isDisabled = isDisabled;
    return (
      <div>
        <components.Option {...props}>
          <input
            type="checkbox"
            checked={!isDisabled && !props.isSelected}
            onChange={() => null}
          />{" "}
          <label>{props.label}</label>
        </components.Option>
      </div>
    );
  };

  const keys = Object.keys(data).map(data => ({ value: data, label: cfg.style[data] }));
  const handleChange = (selected, key) => {
    outerfilterSeted.current = false;
    optionSelected.current = { ...optionSelected.current, [key]: selected };
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
                hideSelectedOptions={false}
                maxMenuHeight={100}

                components={{
                  Option
                }}

                onChange={event => (handleChange(event, key.value))}
                value={optionSelected.current?.[key.value]}
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
