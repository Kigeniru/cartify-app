import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './Dashboard.css'; // Import the new CSS file

// Dummy data for the sales chart
const salesData = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 2000 },
  { name: 'Apr', sales: 2780 },
  { name: 'May', sales: 1890 },
  { name: 'Jun', sales: 2390 },
  { name: 'Jul', sales: 3490 },
  { name: 'Aug', sales: 4200 },
  { name: 'Sep', sales: 3800 },
  { name: 'Oct', sales: 4500 },
  { name: 'Nov', sales: 3900 },
  { name: 'Dec', sales: 5000 },
];

// Main Dashboard Overview Component
const Dashboard = () => {
  return (
    
    <div className="dashboard-container">
      <p className='dashboard-title'>Dashboard</p>
      {/* Dashboard Cards */}
      <div className="dashboard-cards-grid">
        <DashboardCard title="Total Orders" value="1,234" description="Last 30 days" />
        <DashboardCard title="Revenue" value="₱56,789.00" description="Last 30 days" />
        <DashboardCard title="New Customers" value="87" description="Last 30 days" />
        <DashboardCard title="Products Sold" value="5,432" description="All time" />
        <DashboardCard title="Pending Deliveries" value="15" description="Today" />
      </div>

      {/* Sales Chart Section */}
      <section className="dashboard-section">
        <h3 className="dashboard-section-title">Sales Performance</h3>
        <div className="sales-chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={salesData}
              margin={{
                top: 5, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: '#ccc' }} />
              <YAxis tickLine={false} axisLine={{ stroke: '#ccc' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#3b82f6" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="dashboard-section">
        <h3 className="dashboard-section-title">Recent Activity</h3>
        <ul className="recent-activity-list">
          <li className="recent-activity-item">
            <span className="recent-activity-text">Order #MVL-001 placed by Jane Doe</span>
            <span className="recent-activity-time">2 mins ago</span>
          </li>
          <li className="recent-activity-item">
            <span className="recent-activity-text">New product "Ube Leche Flan" added</span>
            <span className="recent-activity-time">1 hour ago</span>
          </li>
          <li className="recent-activity-item">
            <span className="recent-activity-text">Customer review received for Classic Leche Flan</span>
            <span className="recent-activity-time">4 hours ago</span>
          </li>
        </ul>
      </section>
    </div>
  );
};

// Dashboard Card Component
const DashboardCard = ({ title, value, description }) => (
  <div className="dashboard-card">
    <h3 className="dashboard-card-title">{title}</h3>
    <p className="dashboard-card-value">{value}</p>
    <p className="dashboard-card-description">{description}</p>
  </div>
);

export default Dashboard;
