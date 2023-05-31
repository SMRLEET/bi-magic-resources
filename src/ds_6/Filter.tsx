import React, { useRef } from "react";
import { useState,useEffect } from "react";
import { MyService } from "./MyService";
import {Button,FormSelect} from 'react-bootstrap';
import './Select.css';
export default function Filter(props){
  const cfg = useRef(props.cfg.getRaw());
  const filters = useRef({});
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(false);
  const [data,setData]=useState({});
  const dataSource=cfg.current.dataSource;
  const myService = MyService.createInstance(dataSource.koob);
  useEffect(()=>{
    myService.subscribeUpdatesAndNotify(changeParams);
    return()=>{ myService.unsubscribe(changeParams);}
  },[])
  function changeParams(model){
    setLoading(model.loading);
    setError( model?.erorr);
  }

  useEffect(()=>{
    if(!error){
    myService.getKoobDataByCfg({with: dataSource.koob,
      columns: [...dataSource.dimensions]
      ,
      distinct:[
        ...dataSource.dimensions
      ]
     }).then(data=>{
      const keys = Object.keys(data[0]);
      let result=Object.assign({},data[0]);
      for(let key of keys)
      {
        let keyData = data.map(item => item[key]) .filter((item, index, arr) => {
          return arr.indexOf(item) === index;
        });;
        result[key]=keyData;
      }
      setData(result);
    })
  }
  },[loading,error])
  function onFilterChange(event) {
    const dim = event.target.name;
    const options = event.target.selectedOptions;
    const values = Array.from(options).map((option: any) => option.value);
    filters.current=({...filters.current,[dim]:['=',...values]})
  }
useEffect(()=>{
  myService.setFilters(filters.current);
},[JSON.stringify(filters.current)])
  const keys=Object.keys(data);
  return (
    <div style={{overflow: 'auto'}}>
      <div>
      <div style={{display: 'flex', flexDirection: 'column', maxWidth: "100%"}}>
      <ul>
      {keys.map(key => (
        <div>
          <div style={{marginTop:'30px'}}>
            <a style={{marginLeft:'40px',marginTop:'30px'}}>{cfg.current?.style?.hasOwnProperty(key)|| key}</a>
          </div>
          <div>
            <FormSelect className="custom-select" style={{height:((100/(keys.length)).toString()+'%'),width:'95%',marginTop:'10px',}}  id={`select-${key}`} name={key}
            onChange={event => { onFilterChange(event) }}
             multiple>
              {data[key].map(option => <option id={`select-${key}-option-${option}`}  value={option}>{option}</option>)}
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
