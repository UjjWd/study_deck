import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartPie } from "lucide-react";

type PieStat = {
  completed: number;
  left: number;
};

type StatData = {
  title: string;
  stat: PieStat;
  color: string;
};

type StatsDashboardProps = {
  stats: StatData[];
  label?: string;
};

const COLORS = [
  "#2ecc40", // completed: green
  "#ffd600", // left: yellow
];

const CustomTooltip = ({
  active,
  payload,
  label,
}: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded border bg-white px-3 py-2 text-sm shadow">
        <span className="font-semibold">{payload[0].name}: </span>
        <span className="font-mono text-primary">{payload[0].value}</span>
      </div>
    );
  }
  return null;
};

const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats, label }) => {
  return (
    <section className="w-full mt-8">
      {label && (
        <div className="font-semibold text-lg mb-2">{label}</div>
      )}
      <Card className="w-full shadow-md">
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <ChartPie className="w-6 h-6 text-yellow-500" />
          <CardTitle className="text-lg">Todo Coverage Statistics</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-4">
          {stats.map((data, i) => (
            <div key={data.title} className="flex flex-col items-center min-w-[180px]">
              <span className="font-medium mb-2">{data.title}</span>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Completed", value: data.stat.completed },
                      { name: "Left", value: data.stat.left },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={62}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => data.stat.completed + data.stat.left > 0 ? `${Math.round(percent * 100)}%` : ""}
                  >
                    <Cell key="completed" fill={COLORS[0]} />
                    <Cell key="left" fill={COLORS[1]} />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={32}/>
                </PieChart>
              </ResponsiveContainer>
              <span className="mt-2 text-xs text-muted-foreground">
                Total: <b>{data.stat.completed + data.stat.left}</b>
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
};

export default StatsDashboard;
