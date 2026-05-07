import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Label } from 'recharts';

const CATEGORY_COLORS = {
    'Food': '#F59E0B',
    'Travel': '#3B82F6',
    'Rent': '#7C3AED',
    'Utilities': '#10B981',
    'Entertainment': '#EF4444',
    'Others': '#64748B',
    'Other': '#64748B'
};

// 1. Wrap the entire component in React.memo to prevent unnecessary re-renders
const Stats = ({ chartData }) => {
    
    // 2. Data transformation remains inside useMemo for extra stability
    const finalData = useMemo(() => {
        if (!chartData || chartData.length === 0) return [];
        return chartData.map(item => ({
            name: item._id || "Uncategorized",
            value: parseFloat(item.totalExpenses?.$numberDecimal || 0)
        }));
    }, [chartData]);

    const totalAmount = useMemo(() => 
        finalData.reduce((sum, entry) => sum + entry.value, 0), 
    [finalData]);

    const renderLegendText = (value, entry) => {
        const { payload } = entry;
        return (
            <span style={{ color: '#444', fontWeight: '500', fontSize: '12px' }}>
                {value}: <span style={{ color: '#000', marginLeft: '5px' }}>
                    ₹{payload.value.toLocaleString('en-IN')}
                </span>
            </span>
        );
    };

    if (finalData.length === 0) return null;

    return (
        <div className="container-fluid py-4" style={{ background: 'rgba(240, 255, 255, 0.557)', borderRadius: '12px',  boxShadow: '0 8px 20px 5px rgba(0,0,0,0.4)' }}>
            <div style={{ width: '100%', height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={finalData}
                            innerRadius={60}
                            outerRadius={150}
                            paddingAngle={5}
                            dataKey="value"
                            nameKey="name"
                            // isAnimationActive={false} 
                            // 4. Using 50% for true responsive centering
                            cx="58%" 
                            cy="50%"
                        >
                            {finalData.map((entry) => (
                                <Cell 
                                    key={`cell-${entry.name}`} 
                                    fill={CATEGORY_COLORS[entry.name] || '#94A3B8'} 
                                />
                            ))}
                            {/* 5. Removed dx offset and added position="center" to keep text anchored */}
                            <Label 
                                value={`₹${totalAmount.toLocaleString('en-IN')}`} 
                                position="center" 
                                dx={90}
                                style={{ fontSize: '18px', fontWeight: 'bold', fill: '#333' }}
                            />
                        </Pie>
                        
                        <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} />
                        
                        <Legend 
                            layout="vertical" 
                            align="right" 
                            verticalAlign="middle" 
                            iconType="circle"
                            formatter={renderLegendText}
                            wrapperStyle={{ paddingLeft: "20px" }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Stats;