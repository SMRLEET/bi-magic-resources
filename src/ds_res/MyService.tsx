import { AppConfig } from 'bi-internal/core';
import { BaseService } from 'bi-internal/core';
import axios from "axios";

// повторные фильтры будут срабатывать в течение этого времени
export interface IMyServiceModel{
  loading?: boolean;
  error?: string;
  data: any;
  filters: any;
}

export class MyService extends BaseService<IMyServiceModel> {
  private readonly id: string | number;
  private constructor(koobId: string) {
    super({
      loading: false,
      error: undefined,
      data: [],
      filters: {},
    });
    this.id = koobId;
  }

  public setFilters(filters) {
    this._updateWithData({ filters });
  }

  public async getKoobDataByCfg(cfg): Promise<any> {
    const url: string = AppConfig.fixRequestUrl(`/api/v3/koob/data`);
    const columns = cfg.columns;

    let filters = {};
    if (cfg.filters) filters = {...cfg.filters};

    const body: any = {
      with: cfg.with,
      columns,
      filters,
    };

    if (cfg.offset) body.offset = cfg.offset;
    if (cfg.limit) body.limit = cfg.limit;
    if (cfg.sort) body.sort = cfg.sort;
    if (cfg.options) body.options = cfg.options;
    if (cfg.subtotals?.length) body.subtotals = cfg.subtotals;

    if (cfg.distinct) {                                                                           // если нет measures, то лучше применить distinct
      body.distinct = [];
    }

    try {
      const response = await axios({
        url,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/stream+json',
        },
        data: body,
        cancelToken: cfg.cancelToken,
      });

      let data = response.data;

      if (String(response.headers['content-type']).startsWith('application/stream+json')) {
        if (typeof data === 'string') {
          data = data.split('\n').filter((line: string) => !!line).map((line: string) => JSON.parse(line));
        } else if (data && (typeof data === 'object') && !Array.isArray(data)) {
          data = [data];
        }
      }

      return data;

    } catch (e) {
      return '';
    }
  }

  protected _dispose() {
    if (window.LuxmsService && window.LuxmsService[String(this.id)]) {
      delete window.LuxmsService[String(this.id)];
    }
    super._dispose();
  }
  public static createInstance(id: string | number): MyService {
    if (!(window.LuxmsService)) {
      window.LuxmsService = {};
    }
    if (!window.LuxmsService.hasOwnProperty(String(id))) {
      window.LuxmsService[String(id)] = new MyService(String(id));
    }
    return window.LuxmsService[String(id)];
  };
}
