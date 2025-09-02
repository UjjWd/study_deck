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
import { Tag } from "lucide-react";

// Custom label rendering for better visibility -- ALWAYS RENDER %
const renderCustomLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, value } = props;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Show 0% if segment is present but value=0
  if (value === 0 && percent === 0) return null;
  return (
    <text
      x={x}
      y={y}
      fill="#122132"
      fontSize="16"
      fontWeight="bold"
      textAnchor="middle"
      dominantBaseline="central"
      stroke="white"
      strokeWidth={1}
      style={{ filter: "drop-shadow(1px 1px 2px #fff9)" }}
    >
      {`${Math.round(percent * 100)}%`}
    </text>
  );
};

const PIE_COLORS = ["#2ecc40", "#ffd600"]; // Green for completed, yellow for left

type PieStat = {
  completed: number;
  left: number;
};

type LabelStats = {
  [label: string]: {
    day: PieStat;
    month: PieStat;
    year: PieStat;
  };
};

type LabelStatsSectionProps = {
  classStats: LabelStats;
};

const CustomTooltip = ({
  active,
  payload,
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

const LABELS = [
  { key: "day", label: "Today" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

const LabelStatsSection: React.FC<LabelStatsSectionProps> = ({ classStats }) => {
  const labelNames = Object.keys(classStats);
  if (labelNames.length === 0) return null;
  return (
    <section className="w-full mt-6">
      <Card className="w-full shadow-md bg-muted/50">
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <Tag className="w-6 h-6 text-primary" />
          <CardTitle className="text-lg">Task Completion by Label</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-8">
            {labelNames.map(labelName => (
              <div key={labelName}>
                <div className="font-semibold mb-2 text-md">{labelName}</div>
                <div className="flex flex-row gap-8 overflow-x-auto">
                  {LABELS.map(({ key, label: timeLabel }) => {
                    const currLabelStats = classStats[labelName];
                    const stat = currLabelStats[key as "day" | "month" | "year"];
                    return (
                      <div key={key} className="flex flex-col items-center min-w-[160px]">
                        <span className="font-medium mb-2">{timeLabel}</span>
                        <ResponsiveContainer width={140} height={140}>
                          <PieChart>
                            <Pie
                              data={[
                                { name: "Completed", value: stat.completed },
                                { name: "Left", value: stat.left },
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={30}
                              outerRadius={55}
                              paddingAngle={2}
                              dataKey="value"
                              label={renderCustomLabel}
                              labelLine={false}
                            >
                              <Cell key="completed" fill={PIE_COLORS[0]} />
                              <Cell key="left" fill={PIE_COLORS[1]} />
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="bottom" height={30} />
                          </PieChart>
                        </ResponsiveContainer>
                        <span className="mt-2 text-xs text-muted-foreground">
                          Total: <b>{stat.completed + stat.left}</b>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default LabelStatsSection;
