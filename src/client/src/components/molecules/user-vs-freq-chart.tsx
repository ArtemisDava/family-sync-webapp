import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface ChartDataPoint {
  name: string;
  value: number;
  year?: number;
}

export interface UserVsFreqChartProps {
  aspect: number;
  title: string;
  id: string;
  data: ChartDataPoint[];
  isLoading?: boolean;
  color?: string;
}

export default function Chart({
  aspect,
  title,
  id,
  data,
  isLoading = false,
  color = "currentColor",
}: UserVsFreqChartProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col p-4 shadow-md bg-white rounded-md h-full">
        <div className="mb-4 text-lg font-semibold text-gray-500">{title}</div>
        <div className="flex-1 flex items-center justify-center min-h-[200px]">
          <div className="animate-pulse flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-400">Loading data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col p-4 shadow-md bg-white rounded-md h-full">
        <div className="mb-4 text-lg font-semibold text-gray-500">{title}</div>
        <div className="flex-1 flex items-center justify-center min-h-[200px]">
          <span className="text-sm text-gray-400">No data available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 shadow-md bg-white rounded-lg transition-shadow hover:shadow-lg">
      <div className="mb-4 text-lg font-semibold text-gray-600">{title}</div>
      <ResponsiveContainer width="100%" aspect={aspect} key={id}>
        <AreaChart
          width={730}
          height={250}
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={`gradient-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#9ca3af"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) =>
              value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value
            }
          />
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100" />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            labelStyle={{ color: "#374151", fontWeight: 600 }}
            formatter={(value: number) => [value, "Count"]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#gradient-${id})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
