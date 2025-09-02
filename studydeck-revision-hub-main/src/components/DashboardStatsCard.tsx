
import React from "react";
import StatsDashboard from "@/components/StatsDashboard";

type PieStat = {
  completed: number;
  left: number;
};

type StatData = {
  title: string;
  stat: PieStat;
  color: string;
};

type DashboardStatsCardProps = {
  stats: StatData[];
};

const DashboardStatsCard: React.FC<DashboardStatsCardProps> = ({ stats }) => (
  <div className="w-full mb-4">
    <StatsDashboard stats={stats} />
  </div>
);

export default DashboardStatsCard;
