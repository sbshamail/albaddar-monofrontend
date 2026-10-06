// Pure querystring builder for the backend's list_query_params convention
// (backend/src/api/core/dependencies/query_params.py). Domain-agnostic —
// any list endpoint using listRecords() on the backend accepts this same
// encoding, so this belongs here rather than in one app's common/.
//
// The backend parses columnFilters/stringArrayFilters/objectArrayFilters/
// deepFilters with Python's ast.literal_eval, NOT json.loads — which means
// JSON's lowercase true/false/null are invalid syntax there (Python needs
// True/False/None). numberRange/dateRange/sort go through json.loads
// instead, so those use plain JSON. Mixing the two encodings up is the
// easiest way to make a filter silently 400 on the backend.

type Primitive = string | number | boolean | null;
type PyLiteralValue = Primitive | PyLiteralValue[];

function toPyLiteral(value: PyLiteralValue): string {
  if (value === null || value === undefined) return "None";
  if (typeof value === "boolean") return value ? "True" : "False";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(toPyLiteral).join(", ")}]`;
  return JSON.stringify(value);
}

export interface ListQueryFilters {
  searchTerm?: string;
  columnFilters?: Array<[string, PyLiteralValue]>;
  stringArrayFilters?: Array<[string, PyLiteralValue[]]>;
  objectArrayFilters?: PyLiteralValue[];
  deepFilters?: Array<[string, PyLiteralValue]>;
  numberRange?: [string, number | null, number | null];
  dateRange?: [string, string, string?];
  sort?: [string, "asc" | "desc"];
  page?: number;
  skip?: number;
  limit?: number;
  // Not part of the generic list_query_params contract — a product-specific
  // addition (see backend/src/api/routers/product/productRoute.py) since
  // Product.min_price/max_price are computed in Python, not real columns,
  // so they can't go through numberRange.
  minPrice?: number;
  maxPrice?: number;
}

export function buildListQuery(filters: ListQueryFilters): string {
  const params = new URLSearchParams();

  if (filters.searchTerm) params.set("searchTerm", filters.searchTerm);
  if (filters.columnFilters?.length)
    params.set("columnFilters", toPyLiteral(filters.columnFilters));
  if (filters.stringArrayFilters?.length)
    params.set("stringArrayFilters", toPyLiteral(filters.stringArrayFilters));
  if (filters.objectArrayFilters?.length)
    params.set("objectArrayFilters", toPyLiteral(filters.objectArrayFilters));
  if (filters.deepFilters?.length)
    params.set("deepFilters", toPyLiteral(filters.deepFilters));
  if (filters.numberRange) params.set("numberRange", JSON.stringify(filters.numberRange));
  if (filters.dateRange) params.set("dateRange", JSON.stringify(filters.dateRange));
  if (filters.sort) params.set("sort", JSON.stringify(filters.sort));
  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.skip !== undefined) params.set("skip", String(filters.skip));
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));

  return params.toString();
}
