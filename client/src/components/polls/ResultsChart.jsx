import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { calculatePercentage } from '../../utils/helpers.js';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-sm">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-blue-600">
          {payload[0].value} votes ({calculatePercentage(payload[0].value, payload[0].payload.total)}%)
        </p>
      </div>
    );
  }
  return null;
};

const ResultsChart = ({ poll }) => {
  const data = poll.options.map((option, index) => ({
    name: option.text,
    votes: option.votes,
    total: poll.totalVotes,
  }));

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#ec4899'];

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            fontSize={12}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
        {poll.options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="text-xs text-gray-600 truncate">
              {option.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsChart;