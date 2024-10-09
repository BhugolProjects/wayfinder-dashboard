import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import axios from "axios";
import { motion } from "framer-motion";
import {
  parseISO,
  formatISO,
  startOfWeek,
  startOfMonth,
  startOfYear,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  isWithinInterval,
} from "date-fns";

const COLORS = [
  "#FFAB91",
  "#FFCC80",
  "#FFF59D",
  "#A5D6A7",
  "#81D4FA",
  "#B39DDB",
  "#F48FB1",
];
const LIGHT_COLORS = [
  "#FFAB91",
  "#FFCC80",
  "#FFF59D",
  "#A5D6A7",
  "#81D4FA",
  "#B39DDB",
  "#F48FB1",
];

const Card = ({ title, value, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`${color} rounded-lg shadow-md p-6 flex flex-col items-center justify-center hover:shadow-lg hover:scale-105 transition-all duration-300`}
  >
    <h3 className="text-lg font-semibold mb-2 text-gray-700">{title}</h3>
    <motion.p
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="text-3xl font-bold text-indigo-600"
    >
      {value.toLocaleString()}
    </motion.p>
    {/* <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className={`mt-2 ${trend >= 0 ? "text-green-500" : "text-red-500"}`}
    >
      {trend >= 0 ? "↑" : "↓"} {Math.abs(trend.toFixed(2))}%
    </motion.div> */}
  </motion.div>
);

const StationVisitsPieChart = ({ data }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="bg-white rounded-lg shadow-md p-6"
  >
    <h2 className="text-xl font-semibold mb-4 text-gray-700">
      Top 5 Most Visited Stations
    </h2>

    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="visits"
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>

        <Tooltip />

        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </motion.div>
);

const StationVisitsAllChart = ({ data }) => {
  const [selectedStations, setSelectedStations] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (data.length > 0 && selectedStations.length === 0) {
      setSelectedStations(data.map((station) => station.Station_Name));
    }
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((station) =>
      station.Station_Name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const handleStationToggle = (stationName) => {
    setSelectedStations((prev) =>
      prev.includes(stationName)
        ? prev.filter((name) => name !== stationName)
        : [...prev, stationName]
    );
  };

  const chartData = useMemo(() => {
    let selectedData = selectedStations.map((stationName) => {
      const station = data.find((s) => s.Station_Name === stationName);

      return {
        name: stationName,

        visitors: parseInt(station.Visitors_Count),
      };
    });

    // Apply the filter based on selected criteria

    if (filter === "top10") {
      return selectedData.sort((a, b) => b.visitors - a.visitors).slice(0, 10);
    } else if (filter === "least10") {
      return selectedData.sort((a, b) => a.visitors - b.visitors).slice(0, 10);
    }

    return selectedData;
  }, [data, selectedStations, filter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-white rounded-lg shadow-md mb-12"
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        All Stations Visit Count
      </h2>

      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between">
        {/* <input
          type="text"
          placeholder="Search stations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 p-2 border border-gray-300 rounded mb-4 md:mb-0"
          /> */}
        <div
          className="w-full md:w-1/3 p-2  md:mb-0"
        ></div>

        <div className="relative inline-block">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-indigo-400 text-white px-3 py-2 rounded flex items-center justify-center transition-all duration-300 hover:bg-indigo-500 focus:outline-none"
          >
            {isDropdownOpen ? "Close List" : "Select Stations"}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 border border-gray-300 rounded p-2 max-h-[200px] overflow-y-auto w-[200px] bg-white shadow-lg z-10">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={
                    selectedStations.length === filteredData.length &&
                    filteredData.length > 0
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStations(
                        filteredData.map((station) => station.Station_Name)
                      );
                    } else {
                      setSelectedStations([]);
                    }
                  }}
                  className="mr-2"
                />

                <label htmlFor="select-all" className="text-sm font-semibold">
                  Select All
                </label>
              </div>

              {filteredData.map((station) => (
                <div
                  key={station.Station_Name}
                  className="flex items-center mb-2"
                >
                  <input
                    type="checkbox"
                    id={station.Station_Name}
                    checked={selectedStations.includes(station.Station_Name)}
                    onChange={() => handleStationToggle(station.Station_Name)}
                    className="mr-2"
                  />

                  <label htmlFor={station.Station_Name} className="text-sm">
                    {station.Station_Name}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />

            <YAxis />

            <Tooltip cursor={{ fill: "transparent" }} />

            <Bar dataKey="visitors" radius={[10, 10, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={LIGHT_COLORS[index % LIGHT_COLORS.length]} // Apply light colors
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const [visitorCount, setVisitorCount] = useState({
    daily: { value: 0, trend: 0 },
    weekly: { value: 0, trend: 0 },
    monthly: { value: 0, trend: 0 },
    yearly: { value: 0, trend: 0 },
  });

  const [topStations, setTopStations] = useState([]);
  const [allStations, setAllStations] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stations data

        const stationsResponse = await axios.get(
          `${process.env.REACT_APP_BASE_URL}items/Stations?limit=1000000`
        );

        const stations = stationsResponse.data.data;

        const sortedStations = stations.sort(
          (a, b) => b.Visitors_Count - a.Visitors_Count
        );

        setTopStations(
          sortedStations.slice(0, 5).map((station) => ({
            name: station.Station_Name,

            visits: parseInt(station.Visitors_Count),
          }))
        );

        setAllStations(stations);
        // Fetch visitor analysis data
        const visitorsResponse = await axios.get(
          `${process.env.REACT_APP_BASE_URL}items/Visitor_Analysis?limit=100000000`
        );
        const visitorsData = visitorsResponse.data.data;

        // Parse visitor data and group by date
        const parsedVisitorsData = visitorsData.map((record) => ({
          date: parseISO(record.date_created),
        }));

        const today = new Date();

        // Generate last 30 days of dates
        const todayStr = formatISO(today, { representation: "date" });
        const yesterday = subDays(today, 1);
        const yesterdayStr = formatISO(yesterday, { representation: "date" });

        const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 });
        const lastWeekStart = subWeeks(thisWeekStart, 1);
        const lastWeekEnd = subDays(thisWeekStart, 1);

        const thisMonthStart = startOfMonth(today);
        const lastMonthStart = subMonths(thisMonthStart, 1);
        const lastMonthEnd = subDays(thisMonthStart, 1);

        const thisYearStart = startOfYear(today);
        const lastYearStart = subYears(thisYearStart, 1);
        const lastYearEnd = subDays(thisYearStart, 1);

        // Calculate totals for each period by filtering visitors based on date ranges
        const getVisitorsInRange = (startDate, endDate) =>
          parsedVisitorsData.filter((record) =>
            isWithinInterval(record.date, { start: startDate, end: endDate })
          ).length;

        // Daily totals
        const dailyTotalVisitors = getVisitorsInRange(today, today);
        const previousDailyTotalVisitors = getVisitorsInRange(
          yesterday,
          yesterday
        );
        const dailyTrend =
          previousDailyTotalVisitors === 0
            ? 0
            : ((dailyTotalVisitors - previousDailyTotalVisitors) /
                previousDailyTotalVisitors) *
              100;

        // Weekly totals
        const currentWeekTotalVisitors = getVisitorsInRange(
          thisWeekStart,
          today
        );
        const previousWeekTotalVisitors = getVisitorsInRange(
          lastWeekStart,
          lastWeekEnd
        );
        const weeklyTrend =
          previousWeekTotalVisitors === 0
            ? 0
            : ((currentWeekTotalVisitors - previousWeekTotalVisitors) /
                previousWeekTotalVisitors) *
              100;

        // Monthly totals
        const currentMonthTotalVisitors = getVisitorsInRange(
          thisMonthStart,
          today
        );
        const previousMonthTotalVisitors = getVisitorsInRange(
          lastMonthStart,
          lastMonthEnd
        );
        const monthlyTrend =
          previousMonthTotalVisitors === 0
            ? 0
            : ((currentMonthTotalVisitors - previousMonthTotalVisitors) /
                previousMonthTotalVisitors) *
              100;

        // Yearly totals
        const currentYearTotalVisitors = getVisitorsInRange(
          thisYearStart,
          today
        );
        const previousYearTotalVisitors = getVisitorsInRange(
          lastYearStart,
          lastYearEnd
        );
        const yearlyTrend =
          previousYearTotalVisitors === 0
            ? 0
            : ((currentYearTotalVisitors - previousYearTotalVisitors) /
                previousYearTotalVisitors) *
              100;

        setVisitorCount({
          daily: { value: dailyTotalVisitors, trend: dailyTrend },
          weekly: { value: currentWeekTotalVisitors, trend: weeklyTrend },
          monthly: { value: currentMonthTotalVisitors, trend: monthlyTrend },
          yearly: { value: currentYearTotalVisitors, trend: yearlyTrend },
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className=""
    >
      <div className="">
        <a href={process.env.REACT_APP_BASE_URL}>
          <img src="MMRC.png" alt="MMRC-Logo" className="w-20 h-20" />
          </a>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      </div>
      <div className="max-w-full mx-auto bg-white rounded-lg shadow-lg m-2 p-2">
        <motion.h1
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="text-3xl font-bold mb-8 text-gray-800"
        >
          
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Top 5 Most Visited Stations */}

          <StationVisitsPieChart data={topStations} />

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
            <Card
              title="Daily Visitors"
              value={visitorCount.daily.value}
              // trend={visitorCount.daily.trend}
              color="bg-yellow-100"
            />
            <Card
              title="Weekly Visitors"
              value={visitorCount.weekly.value}
              // trend={visitorCount.weekly.trend}
              color="bg-purple-100"
            />
            <Card
              title="Monthly Visitors"
              value={visitorCount.monthly.value}
              // trend={visitorCount.monthly.trend}
              color="bg-green-100"
            />
            <Card
              title="Yearly Visitors"
              value={visitorCount.yearly.value}
              // trend={visitorCount.yearly.trend}
              color="bg-blue-100"
            />
          </div>
        </div>
      </div>

      {/* All Stations Visit Count */}

      <StationVisitsAllChart data={allStations} />
    </motion.div>
  );
};

export default Dashboard;
