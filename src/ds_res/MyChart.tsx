import React from "react";
import { hide } from "yargs";
import Echart from './Echart';
import { MyService } from "./MyService";
import './MyTable.css';

export default class MyLineChart extends React.Component<any> {
  private _myService: MyService;
  public _chart: any = null;
  public state: {
    data: any;
    viewType: string;
    model: any;
  };

  public constructor(props) {
    super(props);
    this.onViewTypeChange = this.onViewTypeChange.bind(this);
    this.getViewType = this.getViewType.bind(this);
    this.setViewType = this.setViewType.bind(this);
    this.state = {
      data: [],
      viewType: this.getViewType() || 'table',
      model: {},
    };
  }

  public componentDidMount(): void {
    const { cfg } = this.props;
    const koob = cfg.getRaw().dataSource.koob;
    this._myService = MyService.createInstance(koob);
    this._myService.subscribeUpdatesAndNotify(this._onSvcUpdated);
  }
  private _onSvcUpdated = (model) => {
    const { cfg } = this.props;
    const koob = cfg.getRaw().dataSource?.koob;
    const { dimensions, measures } = cfg.getRaw().dataSource;
    this.setState({
      ...this.state,
      error: model.error,
      loading: model.loading,
    })
    if (model.loading || model.error) return;
    this._myService.getKoobDataByCfg({
      with: koob,
      columns: [...dimensions, ...measures],
      filters: {
        ...model.filters,
      }
    }).then(data => {
      this.setState({ ...this.state, data, model });
    })
  }

  private getSearchParamsFromHash() {
    return new URLSearchParams(window.location.hash);
  }

  private setViewType(viewType) {
    const searchParams = this.getSearchParamsFromHash();
    searchParams.set('viewType', viewType);
    window.location.hash = decodeURIComponent(searchParams.toString());
  }

  private getViewType() {
    const searchParams = this.getSearchParamsFromHash();
    return searchParams.get('viewType');
  }

  private onViewTypeChange(event) {
    const viewType = event.target.value;
    this.setState({ ...this.state, viewType });
    this.setViewType(viewType);
  }
  public render() {
    const { data, viewType } = this.state;
    return (
      <div style={{overflow: 'auto'}}>
        <select name="viewType" onChange={this.onViewTypeChange} value={this.state.viewType}>
          <option value="table">Table</option>
          <option value="line">Line Chart</option>
        </select>
        {viewType == 'table' && (
          <table id="mytable">
            <tr>
              <th>Код финансирования</th>
              <th>Название организации</th>
              <th>Имя</th>
              <th>Тотал</th>
            </tr>
            {data.map(el =>
              <tr>
                <td>{el.code_finance}</td>
                <td>{el.org_name}</td>
                <td>{el.name}</td>
                <td>{el.value}</td>
              </tr>
            )}
          </table>
        )}
        {viewType == 'line' && (
          <Echart
            width={640}
            height={468}
            echartOptions={{
              tooltip: {
                show: true,
              },
              xAxis: {
                type: 'category',
                boundaryGap: false,
                data: data?.reduce((acc, el) => {
                  if (!acc.includes(el.org_name)) acc.push(el.org_name);
                  return acc;
                }, []) || [],
                axisLabel: {
                  rotate: 45,
                },
              },
              yAxis: {
                type: 'value',
                max: 20,
              },
              series: [
                {
                  data: data.map(el => el.value),
                  type: 'line',
                  areaStyle: {}
                }
              ]
            }} />
        )}
      </div>
    );
  }
}
