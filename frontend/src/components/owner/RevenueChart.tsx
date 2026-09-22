import { useRef, useLayoutEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface Order {
  totalAmount: number;
  createdAt: string;
  orderStatus?: string;
}

interface RevenueChartProps {
  orders: Order[];
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

// Groups order totals by calendar month (oldest -> newest) so the chart
// shows a real revenue trend instead of one lump number.
function buildMonthlyRevenue(orders: Order[]): MonthlyRevenue[] {
  const buckets: Record<string, number> = {};

  orders
    .filter((order) => order.orderStatus !== "Cancelled")
    .forEach((order) => {
      const date = new Date(order.createdAt);
      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      buckets[key] = (buckets[key] || 0) + (order.totalAmount || 0);
    });

  return Object.keys(buckets)
    .sort()
    .map((key) => {
      const [year, month] = key.split("-");
      const label = new Date(
        Number(year),
        Number(month) - 1,
        1
      ).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });

      return { month: label, revenue: buckets[key] };
    });
}

function RevenueChart({ orders }: RevenueChartProps) {
  const chartRootRef = useRef<am5.Root | null>(null);
  const chartDivId = "revenue-chart-div";

  useLayoutEffect(() => {
    const root = am5.Root.new(chartDivId);
    chartRootRef.current = root;

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        layout: root.verticalLayout,
      })
    );

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "month",
        renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 30 }),
      })
    );

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "Revenue",
        xAxis,
        yAxis,
        valueYField: "revenue",
        categoryXField: "month",
        tooltip: am5.Tooltip.new(root, {
          labelText: "₹{valueY}",
        }),
      })
    );

    series.columns.template.setAll({
      fill: am5.color(0x0f9d8a),
      stroke: am5.color(0x0f9d8a),
      cornerRadiusTL: 6,
      cornerRadiusTR: 6,
      width: am5.percent(55),
    });

    const data = buildMonthlyRevenue(orders);

    xAxis.data.setAll(data);
    series.data.setAll(data);

    series.appear(1000);
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [orders]);

  return (
    <div className="dashboard-chart-card">
      <h3>Revenue Over Time</h3>
      <div id={chartDivId} style={{ width: "100%", height: "320px" }} />
    </div>
  );
}

export default RevenueChart;
