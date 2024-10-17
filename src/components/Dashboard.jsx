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

const StationVisitsPieChart = ({ data, title }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="bg-white rounded-lg shadow-md p-4 md:p-6" // Adjust padding for small screens
    style={{ maxWidth: "100%", overflow: "hidden" }} // Prevent overflow issues
  >
    <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4 text-gray-700 text-center">
      {title}
    </h2>

    <div className="w-full h-64 md:h-80">
      {" "}
      {/* Dynamic height based on screen */}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius="80%"
            dataKey="visits"
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend
            align="center"
            verticalAlign="bottom"
            wrapperStyle={{ fontSize: "12px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

const StationVisitsAllChart = ({ data }) => {
  const [selectedStations, setSelectedStations] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (data.length > 0 && selectedStations.length === 0) {
      setSelectedStations(data.map((station) => station.name));
    }
  }, [data]);

  const handleSelectAllToggle = (isChecked) => {
    if (isChecked) {
      // Select all stations
      setSelectedStations(data.map((s) => s.name));
    } else {
      // Unselect all stations
      setSelectedStations([]);
    }
  };

  const handleStationToggle = (stationName) => {
    setSelectedStations((prev) =>
      prev.includes(stationName)
        ? prev.filter((name) => name !== stationName)
        : [...prev, stationName]
    );
  };

  const chartData = useMemo(() => {
    return selectedStations.map((stationName) => {
      const station = data.find((s) => s.name === stationName);
      return { name: stationName, visitors: station.visits };
    });
  }, [data, selectedStations]);

  const calculateChartHeight = () => Math.max(500, chartData.length * 30);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 bg-white rounded-lg shadow-md mb-12"
    >
      <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-700 text-center">
        All Stations Visit Count
      </h2>

      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="relative inline-block w-full md:w-auto">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-indigo-400 text-white px-3 py-2 rounded transition-all duration-300 hover:bg-indigo-500 focus:outline-none"
          >
            {isDropdownOpen ? "Close List" : "Select Stations"}
          </button>

          {isDropdownOpen && (
            <div className="absolute mt-2 border border-gray-300 rounded p-2 max-h-[200px] overflow-y-auto w-full md:w-[200px] bg-white shadow-lg z-10">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={selectedStations.length === data.length}
                  onChange={(e) => handleSelectAllToggle(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="select-all" className="text-sm font-semibold">
                  Select All
                </label>
              </div>

              {data.map((station) => (
                <div key={station.name} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={station.name}
                    checked={selectedStations.includes(station.name)}
                    onChange={() => handleStationToggle(station.name)}
                    className="mr-2"
                  />
                  <label htmlFor={station.name} className="text-sm">
                    {station.name}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {chartData.length > 0 ? (
        <div style={{ height: `${calculateChartHeight()}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              barSize={20}
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                dataKey="name"
                type="category"
                width={100}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) =>
                  value.length > 12 ? `${value.slice(0, 12)}...` : value
                }
                interval={0}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                formatter={(value, name, props) => [
                  `${props.payload.name}: ${value}`,
                ]}
              />
              <Bar dataKey="visitors" radius={[0, 10, 10, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={LIGHT_COLORS[index % LIGHT_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-center text-gray-500">No data available</p>
      )}
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
  const [topPlaces, setTopPlaces] = useState([]);
  const [placesMap, setPlacesMap] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch station data
        const stationsResponse = await axios.get(
          `${process.env.REACT_APP_BASE_URL}items/Stations?limit=100000000`
        );
        const stationsData = stationsResponse.data.data;
    
        // Create a map to associate Station.id with Station_Name
        const stationNameMap = stationsData.reduce((acc, station) => {
          acc[station.id] = station.Station_Name;
          return acc;
        }, {});
    
        // Fetch place data
        const placesResponse = await axios.get(
          `${process.env.REACT_APP_BASE_URL}items/Places?limit=1000000000000`
        );
        const placesData = placesResponse.data.data;
    
        // Create a map to associate Place.id with Locality_Name
        const placeNameMap = placesData.reduce((acc, place) => {
          acc[place.id] = place.Locality_Name;
          return acc;
        }, {});
    
        // Fetch visitor analysis data
        const visitorsResponse = await axios.get(
          `${process.env.REACT_APP_BASE_URL}items/Visitor_Analysis?limit=1000000000000000`
        );
        const visitorsData = visitorsResponse.data.data;
    
        // Count visits by Station and Place
        const stationVisitCounts = visitorsData.reduce((acc, record) => {
          acc[record.Station] = (acc[record.Station] || 0) + 1;
          return acc;
        }, {});
    
        const placeVisitCounts = visitorsData.reduce((acc, record) => {
          acc[record.Place] = (acc[record.Place] || 0) + 1;
          return acc;
        }, {});
    
        // Sort and get top 5 stations
        const sortedStations = Object.entries(stationVisitCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([stationId, count]) => ({
            name: stationNameMap[stationId] || `Station ${stationId}`, // Fetch name from map or fallback to ID
            visits: count,
          }));
    
        setTopStations(sortedStations);
    
        // Set all stations data for bar graph
        const allStations = Object.entries(stationVisitCounts).map(
          ([stationId, count]) => ({
            name: stationNameMap[stationId] || `Station ${stationId}`, // Fetch name from map or fallback to ID
            visits: count,
          })
        );
        setAllStations(allStations);
    
        // Sort and get top 5 places
        const sortedPlaces = Object.entries(placeVisitCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([placeId, count]) => ({
            name: placeNameMap[placeId] || `Place ${placeId}`, // Fetch name from map or fallback to ID
            visits: count,
          }));
    
        setTopPlaces(sortedPlaces);
    
        // Parse visitor data and group by date
        const parsedVisitorsData = visitorsData.map((record) => ({
          date: parseISO(record.date_created),
        }));
    
        const today = new Date();
    
        // Generate date ranges
        const yesterday = subDays(today, 1);
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
        const previousDailyTotalVisitors = getVisitorsInRange(yesterday, yesterday);
        const dailyTrend =
          previousDailyTotalVisitors === 0
            ? 0
            : ((dailyTotalVisitors - previousDailyTotalVisitors) /
                previousDailyTotalVisitors) *
              100;
    
        // Weekly totals
        const currentWeekTotalVisitors = getVisitorsInRange(thisWeekStart, today);
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
        const currentMonthTotalVisitors = getVisitorsInRange(thisMonthStart, today);
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
        const currentYearTotalVisitors = getVisitorsInRange(thisYearStart, today);
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
        ></motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card
            title="Daily Visitors"
            value={visitorCount.daily.value}
            color="bg-yellow-100"
          />
          <Card
            title="Weekly Visitors"
            value={visitorCount.weekly.value}
            color="bg-purple-100"
          />
          <Card
            title="Monthly Visitors"
            value={visitorCount.monthly.value}
            color="bg-green-100"
          />
          <Card
            title="Yearly Visitors"
            value={visitorCount.yearly.value}
            color="bg-blue-100"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Top 5 Most Visited Stations */}
          <StationVisitsPieChart
            data={topStations}
            title={"Top 5 Most Visited Stations"}
          />

          {/* Top 5 Most Visited Places */}
          <StationVisitsPieChart
            data={topPlaces}
            title={"Top 5 Most Visited Places"}
          />
        </div>
      </div>

      {/* All Stations Visit Count */}
      <StationVisitsAllChart data={allStations} />
    </motion.div>
  );
};

export default Dashboard;
