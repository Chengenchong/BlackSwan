"use client";

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ArrowUp, ArrowDown, CircleDollarSign } from 'lucide-react';

interface PriceData {
  timestamp: number;
  price: number;
  date: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
  }>;
  label?: string;
}

type TimeframeType = '24h' | '7d' | '30d' | '1y';

// Generate sample data for different timeframes
const generateSampleData = () => {
  const now = new Date();
  const data: PriceData[] = [];
  
  // Generate hourly data for last 24 hours
  for (let i = 23; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      timestamp: date.getTime(),
      price: 30000 + Math.random() * 5000,
      date: date.toLocaleString()
    });
  }

  // Generate daily data for last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    data.push({
      timestamp: date.getTime(),
      price: 30000 + Math.random() * 5000,
      date: date.toLocaleDateString()
    });
  }

  // Generate monthly data for last year
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    data.push({
      timestamp: date.getTime(),
      price: 30000 + Math.random() * 5000,
      date: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    });
  }

  return data;
};

const sampleData = generateSampleData();

const PriceChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState<TimeframeType>('24h');

  const formatPrice = (value: number): string => {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="text-sm text-black">{label}</p>
          <p className="text-lg font-bold text-black">
            {formatPrice(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const getTimeframeData = () => {
    switch (timeframe) {
      case '24h':
        return sampleData.slice(0, 24);
      case '7d':
        return sampleData.slice(24, 31);
      case '30d':
        return sampleData.slice(24, 54);
      case '1y':
        return sampleData.slice(54);
      default:
        return sampleData;
    }
  };

  const priceStats = useMemo(() => {
    const currentData = getTimeframeData();
    const prices = currentData.map(d => d.price);
    return {
      current: prices[prices.length - 1],
      highest: Math.max(...prices),
      lowest: Math.min(...prices),
      timeframe
    };
  }, [timeframe]);

  const TimeframeButton: React.FC<{
    value: TimeframeType;
    label: string;
    current: TimeframeType;
    onClick: (value: TimeframeType) => void;
  }> = ({ value, label, current, onClick }) => (
    <button
      className={`px-4 py-2 rounded-lg transition-colors ${
        current === value 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-200 text-black hover:bg-gray-300'
      }`}
      onClick={() => onClick(value)}
    >
      {label}
    </button>
  );

  const StatCard: React.FC<{
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <span className={`${color}`}>
          {icon}
        </span>
        <span className="text-black text-sm font-medium">{title}</span>
      </div>
      <span className="text-xl font-bold text-black">{value}</span>
    </div>
  ); //done

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main chart */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-black">Bitcoin Price Chart</h2>
            <div className="flex gap-2">
              <TimeframeButton 
                value="24h" 
                label="24H" 
                current={timeframe} 
                onClick={setTimeframe}
              />
              <TimeframeButton 
                value="7d" 
                label="7D" 
                current={timeframe} 
                onClick={setTimeframe}
              />
              <TimeframeButton 
                value="30d" 
                label="30D" 
                current={timeframe} 
                onClick={setTimeframe}
              />
              <TimeframeButton 
                value="1y" 
                label="1Y" 
                current={timeframe} 
                onClick={setTimeframe}
              />
            </div>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={getTimeframeData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#000' }}
                  tickLine={{ stroke: '#000' }}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fill: '#000' }}
                  tickLine={{ stroke: '#000' }}
                  tickFormatter={formatPrice}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats cards */}
        <div className="lg:col-span-1 grid grid-rows-3 gap-4">
          <StatCard
            title="Current Price"
            value={formatPrice(priceStats.current)}
            icon={<CircleDollarSign className="w-5 h-5" />}
            color="text-blue-600"
          />
          <StatCard
            title="Highest Price"
            value={formatPrice(priceStats.highest)}
            icon={<ArrowUp className="w-5 h-5" />}
            color="text-green-600"
          />
          <StatCard
            title="Lowest Price"
            value={formatPrice(priceStats.lowest)}
            icon={<ArrowDown className="w-5 h-5" />}
            color="text-red-600"
          />
        </div>
      </div>
    </div>
  );
};

export default PriceChart;