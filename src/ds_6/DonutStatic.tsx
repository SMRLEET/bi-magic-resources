import React, { useRef, useEffect } from "react";
import Echart from "./Echart";
type Item = {
  Date: string;
  scales: number;
};
export const
  option = {
    legend: {},
    tooltip: {},
    dataZoom: [
      {
        show: true,
        start: 94,
        end: 100,
      },
      {
        type: 'inside',
        start: 94,
        end: 100,
      },
      {
        show: true,
        yAxisIndex: 0,
        filterMode: 'empty',
        width: 30,
        height: '80%',
        showDataShadow: false,
        left: '93%',
      },
    ],
    dataset: {

      dimensions: ['recruitment_stage', 'sum_people_quantity'],
      source: [
        { recruitment_stage: 'Получено откликов', sum_people_quantity: 55324 },
        { recruitment_stage: 'Просмотрено резюме', sum_people_quantity: 44117 },
        { recruitment_stage: 'Проведено интервью', sum_people_quantity: 33143 },
      ]
    },
    xAxis: { type: 'category' },
    yAxis: {},
    series: [{ type: 'bar' }, { type: 'bar' }, { type: 'bar' }]
  };

const donut = () => {
  return (
    <Echart
      width={450}
      height={450}
      echartOptions={option}
    />
  );
}





export default donut
