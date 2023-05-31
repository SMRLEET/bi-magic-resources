import React, { useRef, useEffect, useState,useLayoutEffect } from "react";
import { BaseService } from "bi-internal/core";
import { MyService } from "./MyService";


import Echart from "./Echart";


type Item = {
  Date: string;
  scales: number;
};
export default function Donut(props){
  console.log('props');
  console.log(props);
  console.log('props');
  const [cfg,setCfg]=useState(props.cfg.getRaw());
  console.log('cfg');
  console.log(cfg);
  console.log('cfg');
  const filters = cfg.filters;
  const jsonOption = JSON.stringify(cfg.echartOptions);
  console.log('filters');
  console.log(filters);
  console.log('filters');
  const dataSource=cfg.dataSource;
  console.log('dataSource');
  console.log(dataSource);
  console.log('dataSource');
  const koob=dataSource.koob;
  const [data, setData]=useState(null)
  const _myService = MyService.createInstance(dataSource.koob);
  console.log('_myService');
  console.log(_myService);
  console.log('_myService');
  const __koobFiltersService = window.__koobFiltersService || window.parent.__koobFiltersService;

  console.log(__koobFiltersService);

  let option =JSON.parse(jsonOption);
  console.log('option1');
  console.log(option);
  console.log('option1');

  useLayoutEffect (()=>{
    const {measures, dimensions} = dataSource
  _myService.getKoobDataByCfg(
      { with: koob,
        columns: [...dimensions, ...measures],
        filters,})
        .then(data=>{
        const keys = Object.keys(data['0']);
        option.series.dimensions=keys;
        option.dataset.source=data;
        console.log(data);
        console.log('option3');
        console.log(option);
        console.log('option3');
        setData(data);
    }
  )},[cfg]);

  console.log('option2');
  console.log(option);
  console.log('option2');
  return (
    <Echart
      width={450}
      height={450}
      echartOptions={option}
    />
  );
}








