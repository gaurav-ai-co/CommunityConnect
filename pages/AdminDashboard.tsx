import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Badge } from '../components/UI';
import { Users, DollarSign, AlertTriangle, Activity, Wrench, Plus, UserPlus, Bell, Car, Clock, Check, X, Cat } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Complaint, User, UserRole, Payment, Visitor, VisitorStatus } from '../types';
import { dataService } from '../services/firebase';
import { format } from 'date-fns';

const dataPayment = [
  { name: 'Collected', value: 75000 },
  { name: 'Pending', value: 25000 },
];
const COLORS = ['#4f46e5', '#e5e7eb'];

const dataVisitors = [
  { name: 'Mon', count: 40 },
  { name: 'Tue', count: 30 },
  { name: 'Wed', count: 45 },
  { name: 'Thu', count: 50 },
  { name: 'Fri', count: 65 },
  { name: 'Sat', count: 80 },
  { name: 'Sun', count: 70 },
];

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'complaints' | 'users' | 'maintenance' | 'logs'>('overview');
  
  return (
    <div className="space-y-6">
      <div className="flex space-x-2 border-b border-gray-200 pb-2 overflow-x-auto">
        {['Overview', 'Complaints', 'Users', 'Maintenance', 'Visitor Logs'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '') as any)}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
              (tab === 'Visitor Logs' ? 'logs' : tab.toLowerCase()) === activeTab
              ? 'bg-indigo-100 text-indigo-700' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <AdminOverview />}
      {activeTab === 'complaints' && <AdminComplaints />}
      {activeTab === 'users' && <AdminUsers />}
      {activeTab === 'maintenance' && <AdminMaintenance />}
      {activeTab === 'logs' && <AdminVisitorLogs />}
    </div>
  );
};

// --- Sub Components ---

const AdminOverview: React.FC = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Residents</p>
            <p className="text-xl font-bold">124</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-green-100 text-green-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Revenue (Oct)</p>
            <p className="text-xl font-bold">$75k</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-red-100 text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Complaints</p>
            <p className="text-xl font-bold">8 Open</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Visitors Today</p>
            <p className="text-xl font-bold">42</p>
          </div>
        </Card>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Payment Collection Status" className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={dataPayment} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                {dataPayment.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold text-gray-700">75%</text>
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Visitor Traffic (Last 7 Days)" className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataVisitors}>
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
              <Tooltip cursor={{fill: '#f3f4f6'}} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
  </div>
);

const AdminComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    dataService.getComplaints(UserRole.ADMIN).then(setComplaints);
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: 'open' | 'in_progress' | 'resolved') => {
    await dataService.updateComplaintStatus(id, newStatus);
    dataService.getComplaints(UserRole.ADMIN).then(setComplaints);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Complaint Management</h2>
      <div className="grid grid-cols-1 gap-4">
        {complaints.map(c => (
          <Card key={c.id} className="p-4 flex flex-col md:flex-row justify-between">
             <div className="flex-1">
               <div className="flex items-center space-x-2">
                 <h3 className="font-bold text-gray-900">{c.title}</h3>
                 <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500 uppercase">{c.category}</span>
               </div>
               <p className="text-sm text-gray-600 mt-1">{c.description}</p>
               <p className="text-xs text-gray-400 mt-2">Raised by: {c.residentName} ({c.flat})</p>
             </div>
             <div className="mt-4 md:mt-0 flex items-center space-x-2">
               <Badge status={c.status} />
               <select 
                 className="text-sm border-gray-300 rounded-md shadow-sm"
                 value={c.status}
                 onChange={(e) => handleStatusUpdate(c.id, e.target.value as any)}
               >
                 <option value="open">Mark Open</option>
                 <option value="in_progress">In Progress</option>
                 <option value="resolved">Resolved</option>
               </select>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const AdminUsers: React.FC = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const { blocks, flats } = dataService.getFlatsConfig();

  const fetchUsers = () => {
    dataService.getAllUsers().then(setAllUsers);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApproval = async (uid: string, status: 'approved' | 'rejected') => {
    try {
      await dataService.updateUserStatus(uid, status);
      fetchUsers();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const pendingUsers = allUsers.filter(u => u.status === 'pending');
  const approvedUsers = allUsers.filter(u => u.status === 'approved' && u.role === UserRole.RESIDENT);

  // Calculate occupancy per flat
  const getOccupancy = (block: string, flat: string) => {
    return approvedUsers.filter(u => u.block === block && u.flatNumber === flat).length;
  };

  return (
    <div className="space-y-8">
      
      {/* Pending Approvals */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-orange-600 flex items-center"><UserPlus className="w-5 h-5 mr-2" /> Pending Approvals</h2>
        {pendingUsers.length === 0 && <p className="text-gray-500 italic">No pending requests.</p>}
        {pendingUsers.map(u => (
          <Card key={u.uid} className="p-4 flex justify-between items-center border-l-4 border-l-orange-400">
             <div>
                <h3 className="font-bold">{u.displayName}</h3>
                <p className="text-sm text-gray-600">Requesting: {u.block}-{u.flatNumber}</p>
                <p className="text-xs text-gray-500">{u.email}</p>
             </div>
             <div className="flex space-x-2">
                <Button variant="danger" size="sm" onClick={() => handleApproval(u.uid, 'rejected')}>Reject</Button>
                <Button size="sm" onClick={() => handleApproval(u.uid, 'approved')} className="bg-green-600 hover:bg-green-700">Approve</Button>
             </div>
          </Card>
        ))}
      </div>

      <div className="border-t border-gray-200 my-4"></div>

      {/* Directory Table */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
           <h2 className="text-xl font-bold">Resident Directory</h2>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
           <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                 <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Flat</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pets</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Flat Status</th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {approvedUsers.map((u) => {
                   const occupancy = getOccupancy(u.block || '', u.flatNumber || '');
                   return (
                     <tr key={u.uid}>
                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.displayName}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.block}-{u.flatNumber}</td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         {u.pets && u.pets.length > 0 ? (
                            <div className="flex -space-x-2 overflow-hidden">
                              {u.pets.map(p => (
                                <span key={p.id} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-orange-100 flex items-center justify-center text-xs" title={`${p.name} (${p.type})`}>
                                  🐾
                                </span>
                              ))}
                            </div>
                         ) : <span className="text-gray-400">-</span>}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm">
                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${occupancy >= 3 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                           {occupancy}/3 Occupied
                         </span>
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
};

const AdminMaintenance: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [residentId, setResidentId] = useState('1'); // Mock selection
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);

  const fetchPayments = () => {
    dataService.getPayments().then(setPayments);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    await dataService.createInvoice({
      residentId,
      title,
      amount: Number(amount),
      dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      category: 'maintenance'
    });
    alert('Invoice Sent!');
    setAmount('');
    setTitle('');
    fetchPayments();
  };

  const handleSendReminder = async (paymentId: string) => {
    setSendingReminder(paymentId);
    await dataService.sendPaymentReminder(paymentId);
    setSendingReminder(null);
    alert('Reminder sent successfully (simulated).');
  };

  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'overdue');

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Maintenance & Invoices</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Generate New Invoice">
          <form onSubmit={handleCreateInvoice} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Input label="Description" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Monthly Maintenance Nov" required />
              <Input label="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Resident</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={residentId} onChange={e => setResidentId(e.target.value)}>
                  <option value="1">Alice Resident (A-101)</option>
                  <option value="4">Bob Neighbor (A-102)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button type="submit">Generate Invoice</Button>
            </div>
          </form>
        </Card>

        <Card title="Pending Invoices">
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {pendingPayments.length === 0 && <p className="text-gray-500">No pending invoices.</p>}
            {pendingPayments.map(p => (
              <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="font-semibold text-gray-800">{p.title}</p>
                  <p className="text-sm text-gray-500">Due: {format(new Date(p.dueDate), 'MMM d, yyyy')}</p>
                  <p className="text-xs font-mono text-gray-400">ID: {p.id}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 mb-1">${p.amount}</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleSendReminder(p.id)}
                    isLoading={sendingReminder === p.id}
                  >
                    <Bell className="w-3 h-3 mr-1" /> Remind
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const AdminVisitorLogs: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'type'>('date');

  useEffect(() => {
    dataService.getVisitors(UserRole.ADMIN).then(setVisitors);
  }, []);

  const sortedVisitors = [...visitors].sort((a, b) => {
    if (sortBy === 'date') {
      const timeA = a.entryTime || a.expectedArrival;
      const timeB = b.entryTime || b.expectedArrival;
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    }
    return a.type.localeCompare(b.type);
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Visitor Entry/Exit Logs</h2>
        <div className="flex items-center space-x-2">
           <span className="text-sm text-gray-500">Sort by:</span>
           <select 
             className="text-sm border-gray-300 rounded-md shadow-sm"
             value={sortBy}
             onChange={(e) => setSortBy(e.target.value as any)}
           >
             <option value="date">Date (Newest)</option>
             <option value="type">Type</option>
           </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
         <div className="overflow-x-auto">
           <table className="min-w-full divide-y divide-gray-200">
             <thead className="bg-gray-50">
               <tr>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitor</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Host</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Time</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exit Time</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
               </tr>
             </thead>
             <tbody className="bg-white divide-y divide-gray-200">
               {sortedVisitors.map((v) => (
                 <tr key={v.id}>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <div className="text-sm font-medium text-gray-900">{v.name}</div>
                     <div className="text-xs text-gray-500 capitalize">{v.type}</div>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <div className="text-sm text-gray-900">{v.hostFlat}</div>
                     <div className="text-xs text-gray-500">{v.hostName}</div>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     {v.vehicleNumber ? (
                       <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                         <Car className="w-3 h-3 mr-1" /> {v.vehicleNumber}
                       </span>
                     ) : (
                       <span className="text-gray-400 text-xs">-</span>
                     )}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     {v.entryTime ? format(new Date(v.entryTime), 'MMM d, h:mm a') : '-'}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     {v.exitTime ? format(new Date(v.exitTime), 'MMM d, h:mm a') : '-'}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                      {v.entryPhoto ? (
                        <img src={v.entryPhoto} alt="Entry" className="h-8 w-8 rounded object-cover border border-gray-200" />
                      ) : (
                        <span className="text-xs text-gray-400">No Photo</span>
                      )}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <Badge status={v.status} />
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      </div>
    </div>
  );
};