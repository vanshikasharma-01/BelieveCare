import { useRef, useLayoutEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface OrderMedicineItem {
  medicine?: { category?: string; name?: string } | null;
  name?: string;
  quantity: number;
  price: number;
}

interface Order {
  medicines: OrderMedicineItem[];
  orderStatus?: string;
}

interface CategorySalesChartProps {
  orders: Order[];
}

interface CategorySales {
  category: string;
  sales: number;
}

// Sums quantity * price for every ordered item, grouped by the
// medicine's category, so owners can see which category is driving sales.
function buildCategorySales(orders: Order[]): CategorySales[] {
  const totals: Record<string, number> = {};

  orders
    .filter((order) => order.orderStatus !== "Cancelled")
    .forEach((order) => {
      order.medicines?.forEach((item) => {
        const category = item.medicine?.category || "Uncategorized";
        const lineTotal = (item.price || 0) * (item.quantity || 0);

        totals[category] = (totals[category] || 0) + lineTotal;
      });
    });

  return Object.entries(totals)
    .map(([category, sales]) => ({ category, sales }))
    .sort((a, b) => b.sales - a.sales);
}

function CategorySalesChart({ orders }: CategorySalesChartProps) {
  const chartRootRef = useRef<am5.Root | null>(null);
  const chartDivId = "category-sales-chart-div";

  useLayoutEffect(() => {
    const root = am5.Root.new(chartDivId);
    chartRootRef.current = root;

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
        innerRadius: am5.percent(45),
      })
    );

    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "sales",
        categoryField: "category",
        alignLabels: false,
      })
    );

    series.labels.template.setAll({
      textType: "circular",
      radius: 4,
    });

    series.slices.template.set("tooltipText", "{category}: ₹{value}");

    const data = buildCategorySales(orders);

    series.data.setAll(data);

    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        marginTop: 15,
        marginBottom: 5,
      })
    );

    legend.data.setAll(series.dataItems);

    series.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [orders]);

  return (
    <div className="dashboard-chart-card">
      <h3>Category-wise Sales</h3>
      <div id={chartDivId} style={{ width: "100%", height: "340px" }} />
    </div>
  );
}

export default CategorySalesChart;
