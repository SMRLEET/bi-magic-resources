import React from 'react';
import { Theme, presetGpnDefault } from '@consta/uikit/Theme';
import { Line } from '@consta/charts/Line';

type Item = {
  Date: string;
  scales: number;
};

export const data: Item[] = [
  {
    Date: '2010-01',
    scales: 1998,
  },
  {
    Date: '2010-02',
    scales: 1850,
  },
  {
    Date: '2010-03',
    scales: 1720,
  },
  {
    Date: '2010-04',
    scales: 1818,
  },
  {
    Date: '2010-05',
    scales: 1920,
  },
  {
    Date: '2010-06',
    scales: 1802,
  },
];

const Consta = () => (
  <Theme preset={presetGpnDefault}>
    <Line data={data} xField="Date" yField="scales" />
  </Theme>
);

export default Consta;
