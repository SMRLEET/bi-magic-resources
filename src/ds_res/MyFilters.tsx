import React from "react";
import * as echarts from 'echarts';
import { MyService } from "./MyService";
import './MyTable.css';

export default class MyFilters extends React.Component<any> {
  private _myService: MyService;
  public _chart: any = null;
  public state: {
    data: any;
    model: any;
    filters: any;
  };

  public constructor(props) {
    super(props);
    this.state = {
      data: [],
      model: {},
      filters: {},
    };
    this.renderSelect = this.renderSelect.bind(this);
    this.applyFilters = this.applyFilters.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);
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
    const filters = this.state.filters;
    if (model.loading || model.error) return;
    this._myService.getKoobDataByCfg({
      with: koob,
      columns: [
        'code_finance',
        'name',
        'org_name',
      ],
      filters: {
        ...model.filters,
        ...filters,
      }
    }).then(data => {
      this.setState({ ...this.state, data, model });
    })
  }

  private applyFilters() {
    this._myService.setFilters(this.state.filters);
  }

  private onFilterChange(event) {
    const dim = event.target.name;
    const options = event.target.selectedOptions;
    const values = Array.from(options).map((option: any) => option.value);
    const filters = {
      ...this.state.filters,
      [dim]: ["=", ...values],
    };
    this.setState({ ...this.state, filters })
  }

  private renderSelect(name) {
    const { model } = this.state;
    const dim = (model.dictionaries || {})[name];
    const values = dim['values'];
    const label = this.state.model.dictionaries[name].title;
    return (
      <div style={{display: 'flex', flexDirection: 'column', maxWidth: "80%"}}>
        <label htmlFor={`select-${name}`}>{label}</label>
        <select id={`select-${name}`} name={name} onChange={event => { this.onFilterChange(event) }} multiple>
        {values.map(option => <option value={option}>{option}</option>)}
      </select>
      </div>
    )
  }

  public render() {
    const { model } = this.state;
    const dims = Object.keys(model.dictionaries || {});
    return (
      <div style={{overflow: 'auto'}}>
        <div>
          {dims.map(this.renderSelect)}
        </div>
        <button onClick={this.applyFilters}>Apply</button>
      </div>
    );
  }
}
