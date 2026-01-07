import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function RatingChart({ 
  data, 
  dark 
}: { 
  data: Record<string, number>; 
  dark: boolean; 
}) {
  const chartData = Object.keys(data).sort().map(key => ({
    rating: `${key} ⭐`,
    count: data[key],
  }));

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={dark ? "#334155" : "#e5e7eb"}
          />
          <XAxis 
            dataKey="rating" 
            stroke={dark ? "#94a3b8" : "#6b7280"}
            style={{ fontSize: "12px" }}
          />
          <YAxis 
            stroke={dark ? "#94a3b8" : "#6b7280"}
            style={{ fontSize: "12px" }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: dark ? "#1e293b" : "#ffffff",
              border: `1px solid ${dark ? "#334155" : "#e5e7eb"}`,
              borderRadius: "8px",
              color: dark ? "#f1f5f9" : "#1f2937"
            }}
          />
          <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
