
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  Download, 
  Calendar 
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const AdminReports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reportType, setReportType] = useState('revenue');
  const [dateRange, setDateRange] = useState('7days');
  
  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
  };
  
  // Sample data for reports
  const revenueData = [
    { name: 'Jan', movies: 4000, events: 2400, total: 6400 },
    { name: 'Feb', movies: 3000, events: 1398, total: 4398 },
    { name: 'Mar', movies: 2000, events: 5800, total: 7800 },
    { name: 'Apr', movies: 2780, events: 3908, total: 6688 },
    { name: 'May', movies: 1890, events: 4800, total: 6690 },
    { name: 'Jun', movies: 2390, events: 3800, total: 6190 },
    { name: 'Jul', movies: 3490, events: 4300, total: 7790 },
  ];
  
  const bookingsData = [
    { name: 'Mon', value: 10 },
    { name: 'Tue', value: 15 },
    { name: 'Wed', value: 12 },
    { name: 'Thu', value: 8 },
    { name: 'Fri', value: 20 },
    { name: 'Sat', value: 27 },
    { name: 'Sun', value: 22 },
  ];
  
  const categoryData = [
    { name: 'Movies', value: 400 },
    { name: 'Sports', value: 300 },
    { name: 'Music', value: 300 },
    { name: 'Comedy', value: 200 },
    { name: 'Theatre', value: 100 },
  ];
  
  const visitorData = [
    { name: '1 AM', visitors: 0 },
    { name: '5 AM', visitors: 20 },
    { name: '9 AM', visitors: 150 },
    { name: '1 PM', visitors: 300 },
    { name: '5 PM', visitors: 450 },
    { name: '9 PM', visitors: 320 },
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  return (
    <AdminLayout title="Reports & Analytics">
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-4 border-b">
          <div className="flex flex-wrap gap-4">
            <button 
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                reportType === 'revenue' ? 'bg-book-primary text-white' : 'border hover:bg-gray-50'
              }`}
              onClick={() => setReportType('revenue')}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Revenue</span>
            </button>
            
            <button 
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                reportType === 'bookings' ? 'bg-book-primary text-white' : 'border hover:bg-gray-50'
              }`}
              onClick={() => setReportType('bookings')}
            >
              <LineChartIcon className="w-4 h-4" />
              <span>Bookings</span>
            </button>
            
            <button 
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                reportType === 'categories' ? 'bg-book-primary text-white' : 'border hover:bg-gray-50'
              }`}
              onClick={() => setReportType('categories')}
            >
              <PieChartIcon className="w-4 h-4" />
              <span>Categories</span>
            </button>
            
            <button 
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                reportType === 'visitors' ? 'bg-book-primary text-white' : 'border hover:bg-gray-50'
              }`}
              onClick={() => setReportType('visitors')}
            >
              <LineChartIcon className="w-4 h-4" />
              <span>Visitors</span>
            </button>
          </div>
        </div>
        
        <div className="flex justify-between p-4 border-b">
          <div className="flex gap-4">
            <button 
              className={`text-sm px-3 py-1 rounded ${dateRange === '7days' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              onClick={() => handleDateRangeChange('7days')}
            >
              Last 7 days
            </button>
            <button 
              className={`text-sm px-3 py-1 rounded ${dateRange === '30days' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              onClick={() => handleDateRangeChange('30days')}
            >
              Last 30 days
            </button>
            <button 
              className={`text-sm px-3 py-1 rounded ${dateRange === 'quarter' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              onClick={() => handleDateRangeChange('quarter')}
            >
              This Quarter
            </button>
            <button 
              className={`text-sm px-3 py-1 rounded ${dateRange === 'year' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              onClick={() => handleDateRangeChange('year')}
            >
              This Year
            </button>
          </div>
          
          <div className="flex gap-2">
            <button className="border px-3 py-1 rounded text-sm flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Custom Range</span>
            </button>
            <button className="border px-3 py-1 rounded text-sm flex items-center gap-1">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="h-96">
            {reportType === 'revenue' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Legend />
                  <Bar dataKey="movies" fill="#8884d8" name="Movies" />
                  <Bar dataKey="events" fill="#82ca9d" name="Events" />
                </BarChart>
              </ResponsiveContainer>
            )}
            
            {reportType === 'bookings' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bookingsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                    name="Bookings"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
            
            {reportType === 'categories' && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            {reportType === 'visitors' && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={visitorData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    name="Visitors"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Top Selling Events</h3>
          </div>
          <div className="p-4">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left pb-3 font-medium text-gray-500">Event</th>
                  <th className="text-left pb-3 font-medium text-gray-500">Sales</th>
                  <th className="text-left pb-3 font-medium text-gray-500">Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2">KKR vs RCB</td>
                  <td className="py-2">523 tickets</td>
                  <td className="py-2">₹4,70,700</td>
                </tr>
                <tr>
                  <td className="py-2">Arijit Singh Concert</td>
                  <td className="py-2">312 tickets</td>
                  <td className="py-2">₹7,80,000</td>
                </tr>
                <tr>
                  <td className="py-2">Comedy Night with Vir Das</td>
                  <td className="py-2">178 tickets</td>
                  <td className="py-2">₹2,13,600</td>
                </tr>
                <tr>
                  <td className="py-2">CSK vs MI</td>
                  <td className="py-2">412 tickets</td>
                  <td className="py-2">₹4,53,200</td>
                </tr>
                <tr>
                  <td className="py-2">Humare Ram - Theatre Play</td>
                  <td className="py-2">89 tickets</td>
                  <td className="py-2">₹1,78,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Top Selling Movies</h3>
          </div>
          <div className="p-4">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left pb-3 font-medium text-gray-500">Movie</th>
                  <th className="text-left pb-3 font-medium text-gray-500">Sales</th>
                  <th className="text-left pb-3 font-medium text-gray-500">Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2">Khadaan</td>
                  <td className="py-2">1,245 tickets</td>
                  <td className="py-2">₹5,60,250</td>
                </tr>
                <tr>
                  <td className="py-2">Love Story 2025</td>
                  <td className="py-2">987 tickets</td>
                  <td className="py-2">₹4,44,150</td>
                </tr>
                <tr>
                  <td className="py-2">The Diplomat</td>
                  <td className="py-2">756 tickets</td>
                  <td className="py-2">₹3,40,200</td>
                </tr>
                <tr>
                  <td className="py-2">The Godfather</td>
                  <td className="py-2">542 tickets</td>
                  <td className="py-2">₹2,43,900</td>
                </tr>
                <tr>
                  <td className="py-2">Pintu Ki Pappi</td>
                  <td className="py-2">423 tickets</td>
                  <td className="py-2">₹1,90,350</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
