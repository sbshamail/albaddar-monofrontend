// Mirrors backend GET /dashboard/counts (src/api/routers/dashboard/dashboardRoute.py).

export interface DashboardCounts {
  products: number;
  orders: number;
  categories: number;
}
