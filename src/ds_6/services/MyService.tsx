import { BaseService } from 'bi-internal/core';

// повторные фильтры будут срабатывать в течение этого времени
export interface IMyServiceModel {
  loading?: boolean;
  error?: string;
  data: any;
  filters: any;
  hierarchyDim: object
}

export class MyService extends BaseService<IMyServiceModel> {
  private readonly id: string | number;
  private koobFiltersService: Object;
  private constructor(koobId: string) {
    super({
      loading: false,
      error: undefined,
      data: [],
      filters: {},
      hierarchyDim: {}
    });
    this.id = koobId;
  }

  public setHierarchyDim(hierarchy, selectedValue) {
    const hierarchyId = String(hierarchy).replaceAll(',', '')
    const currentDim = this._model.hierarchyDim[hierarchyId];
    const hierarchyLevel = hierarchy.indexOf(currentDim);
    if (hierarchyLevel === -1) return;
    if (hierarchyLevel < hierarchy.length - 1) {
      this._updateModel({
        filters: { ...this._model.filters, [hierarchy[hierarchyLevel]]: ['=', selectedValue] },
        hierarchyDim: { ...this._model.hierarchyDim, [hierarchyId]: hierarchy[hierarchyLevel + 1] }
      });
    }
    else {
      const dropFilters = {};
      for (let filt of hierarchy) {
        dropFilters[filt] = ['!='];
      };
      this._updateModel({
        filters: { ...this._model.filters, ...dropFilters },
        hierarchyDim: { ...this._model.hierarchyDim, [hierarchyId]: hierarchy[0] }
      });

    }
    if (this.koobFiltersService) {
      this.koobFiltersService._updateModel({ filters: { ...this.koobFiltersService._model.filters, ...this._model.filters } });
    }
  }
  public dropHierarchy(hierarchy: string[], dropDim: string) {
    const hierarchyId = String(hierarchy).replaceAll(',', '')
    const currentDim = this._model.hierarchyDim[hierarchyId];
    const hierarchyLevel = hierarchy.indexOf(currentDim);
    let dropLevel = hierarchy.indexOf(dropDim);
    if (hierarchyLevel === -1 || dropLevel === -1) return;
    const dropFilters = {};
    for (let i = hierarchyLevel; i >= hierarchy.indexOf(dropDim); i--)
      dropFilters[hierarchy[i]] = ['!='];
    this._updateModel({
      filters: { ...this._model.filters, ...dropFilters },
      hierarchyDim: { ...this._model.hierarchyDim, [hierarchyId]: hierarchy[dropLevel] }
    });
    if (this.koobFiltersService) {
      this.koobFiltersService._updateModel({ filters: { ...this.koobFiltersService._model.filters, ...this._model.filters } });
    }
  }

  public setFilters(filters) {
    this._updateWithData({ ...this._model.filters, ...filters });
    if (this.koobFiltersService) {
      this.koobFiltersService._updateModel({ filters: { ...this.koobFiltersService._model.filters, ...filters } });
    }
  }

  protected _dispose() {
    if (window.LuxmsService && window.LuxmsService[String(this.id)]) {
      delete window.LuxmsService[String(this.id)];
    }
    super._dispose();
  }

  public static createInstance(id: string | number, hierarchy: String[] | undefined): MyService {
    if (window.__koobFiltersService) {
    }
    if (!(window.LuxmsService)) {
      window.LuxmsService = {};
    }
    const strID = String(id);

    if (!window.LuxmsService.hasOwnProperty(String(id))) {
      window.LuxmsService[strID] = new MyService(strID, hierarchy);
      window.LuxmsService[strID].koobFiltersService = window.__koobFiltersService;
      window.LuxmsService[strID].koobFiltersService.subscribeUpdatesAndNotify((model) => {
        if (JSON.stringify(window.LuxmsService[strID]._model.filters) === JSON.stringify(model.filters)) return;
        window.LuxmsService[strID]._updateModel({
          loading: model.loading,
          error: model.error,
          filters: { ...window.LuxmsService[strID]._model.filters, ...model.filters }
        });
      });
    }
    const hierarchyId = String(hierarchy).replaceAll(',', '')
    if (window.LuxmsService.hasOwnProperty(String(id))
      && hierarchy
      && !window.LuxmsService[strID]._model.hierarchyDim.hasOwnProperty(hierarchyId)) {
      window.LuxmsService[strID]._model.hierarchyDim[hierarchyId] = hierarchy[0];
    }
    return window.LuxmsService[strID];
  };
}
