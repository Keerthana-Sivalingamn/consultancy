import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Enhanced color palette for furniture categories with better contrast
const FURNITURE_COLORS = [
  "#8B4513", // SaddleBrown (wooden furniture)
  "#4682B4", // SteelBlue (upholstered)
  "#B22222", // FireBrick (accent pieces)
  "#228B22", // ForestGreen
  "#9932CC", // DarkOrchid
  "#FF8C00", // DarkOrange
  "#2F4F4F", // DarkSlateGray
  "#8FBC8F", // DarkSeaGreen
  "#DAA520", // GoldenRod
  "#4B0082", // Indigo
];

// Custom tooltip component for better styling
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-lg">
        <p className="font-bold">{`Category: ${payload[0].name}`}</p>
        <p className="text-lg text-green-600">{`Revenue: $${payload[0].value.toFixed(2)}`}</p>
        <p className="text-gray-600 text-sm">{`${(payload[0].percent * 100).toFixed(1)}% of total`}</p>
      </div>
    );
  }
  return null;
};

// Custom legend formatter to add color dots
const renderLegend = (props) => {
  const { payload } = props;
  
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center">
          <div 
            className="w-3 h-3 rounded-full mr-2" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-700">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const RevenueChart = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://consultancysrc.onrender.com/api/orders/revenue-by-category", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch revenue data");

        const revenueData = await res.json();
        console.log("Raw revenue data for delivered products:", revenueData);

        // Format the data for the chart - capitalize category names for better display
        const formattedData = revenueData.map((item) => ({
          name: item._id === "Uncategorized" ? item._id : capitalizeFirstLetter(item._id),
          value: parseFloat(item.totalRevenue.toFixed(2))
        }));

        console.log("Formatted data for delivered products:", formattedData);
        setData(formattedData);
      } catch (err) {
        console.error("Error fetching revenue data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [token]);

  // Helper function to capitalize the first letter of each word
  const capitalizeFirstLetter = (string) => {
    if (!string) return "Uncategorized";
    return string
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Calculate total delivered revenue
  const totalRevenue = data.reduce((sum, item) => sum + item.value, 0);
  
  // Handle pie sector hover
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };
  
  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-lg border border-gray-100">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Revenue by Category</h2>
        <div className="w-16 h-1 bg-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Analysis of delivered products revenue by furniture category</p>
        
        {totalRevenue > 0 && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg inline-block">
            <p className="text-lg">
              <span className="text-gray-700">Total Revenue: </span>
              <span className="text-green-600 font-bold text-xl">${totalRevenue.toFixed(2)}</span>
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      ) : data.length > 0 ? (
        <div className="bg-gray-50 p-4 rounded-lg">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={130}
                dataKey="value"
                nameKey="name"
                paddingAngle={2}
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={FURNITURE_COLORS[index % FURNITURE_COLORS.length]} 
                    stroke="#fff"
                    strokeWidth={activeIndex === index ? 2 : 1}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderLegend} />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((category, index) => (
              <div 
                key={`category-${index}`} 
                className="p-3 bg-white rounded-lg shadow flex items-center"
              >
                <div 
                  className="w-4 h-12 mr-3 rounded-sm" 
                  style={{ backgroundColor: FURNITURE_COLORS[index % FURNITURE_COLORS.length] }}
                ></div>
                <div>
                  <h3 className="font-medium text-gray-800">{category.name}</h3>
                  <p className="text-green-600 font-bold">${category.value.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-4 text-gray-600 text-lg">No revenue data available</p>
          <p className="text-gray-500 text-sm mt-2">Check back once products have been delivered</p>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;