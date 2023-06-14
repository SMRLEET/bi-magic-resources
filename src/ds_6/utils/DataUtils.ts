import axios from "axios";
import { AppConfig } from "bi-internal/core";

export { getKoobDataByCfg, getFilterData, }
async function getKoobDataByCfg(cfg): Promise<any> {
    const url: string = AppConfig.fixRequestUrl(`/api/v3/koob/data`);
    const columns = cfg.columns;
    let filters: any;
    if (cfg.filter && typeof cfg.filter === "object") {
        filters = {};
        Object.keys(cfg.filter).forEach((key) => {
            if (!cfg?.filterCfg?.hasOwnProperty(key)) return;
            let value = cfg.filter[key];
            if (value === "∀" || value === "*") {
                // фильтр подразумевающий 'ВСЕ'
                return; // просто не выносим в фильтры
            } else if (Array.isArray(value) && value[0] === "IN") {
                // много где сконфигурировано ['IN', 'a', 'b']
                value = ["="].concat(value.slice(1));
            }
            filters[key] = value;
        });
    }

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
    if (cfg.distinct) {
        // если нет measures, то лучше применить distinct
        body.distinct = cfg.distinct;
    }
    try {
        const response = await axios({
            url,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/stream+json",
            },
            data: body,
            cancelToken: cfg.cancelToken,
        });

        let data = response.data;

        if (
            String(response.headers["content-type"]).startsWith(
                "application/stream+json"
            )
        ) {
            if (typeof data === "string") {
                data = data
                    .split("\n")
                    .filter((line: string) => !!line)
                    .map((line: string) => JSON.parse(line));
            } else if (data && typeof data === "object" && !Array.isArray(data)) {
                data = [data];
            }
        }
        return data;
    } catch (e) {
        return "";
    }
}

async function getFilterData(koobId, dimensions): Promise<any> {
    const url: string = AppConfig.fixRequestUrl(`/api/v3/koob/`);

    let dictionaries = {};
    return await Promise.all(
        dimensions.map((dim) =>
            fetch(`${url}${koobId}.${dim}`).then((resp) => resp.json())
        )
    ).then((responses) => {
        dimensions.map((dim, i) => {
            if (!dictionaries.hasOwnProperty(dim)) {
                dictionaries[dim] = {
                    title: responses[i].title,
                    id: responses[i].id,
                    values: responses[i].values,
                };
            }

        });
        return dictionaries;
    });
}