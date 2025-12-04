import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { dataService } from '../services/firebase';
import { geminiService } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';
import { Visitor, Payment, Notice, ChatMessage, Complaint, Vehicle, Amenity, Booking, User, Pet } from '../types';
import { Card, Button, Input, Badge } from '../components/UI';
import { Plus, Clock, DollarSign, Send, Sparkles, AlertCircle, Wrench, Car as CarIcon, Calendar, Contact, Cat } from 'lucide-react';
import { format } from 'date-fns';

// --- HOME ---
const ResidentHome: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    dataService.getNotices().then(setNotices);
  }, []);

  const handleSummarize = async () => {
    setLoadingSummary(true);
    const text = await geminiService.summarizeNotices();
    setSummary(text);
    setLoadingSummary(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Welcome Home</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Community Notices" className="h-full">
          <div className="space-y-4 max-h-60 overflow-y-auto">
            {notices.map(notice => (
              <div key={notice.id} className={`p-4 rounded-lg border-l-4 ${notice.priority === 'high' ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'}`}>
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-gray-800">{notice.title}</h4>
                  <span className="text-xs text-gray-500">{format(new Date(notice.date), 'MMM d')}</span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{notice.content}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100">
            {!summary ? (
              <Button variant="outline" size="sm" onClick={handleSummarize} isLoading={loadingSummary} className="w-full">
                <Sparkles className="w-4 h-4 mr-2 text-indigo-500" />
                Summarize with AI
              </Button>
            ) : (
              <div className="bg-indigo-50 p-4 rounded-lg text-sm text-indigo-900">
                <h5 className="font-semibold mb-2 flex items-center"><Sparkles className="w-3 h-3 mr-1"/> AI Summary</h5>
                <p>{summary}</p>
              </div>
            )}
          </div>
        </Card>

        <Card title="Quick Actions">
            <div className="grid grid-cols-2 gap-4">
               <Button onClick={() => navigate('visitors')} variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
                 <div className="p-2 bg-indigo-100 text-indigo-600 rounded-full"><Plus className="w-6 h-6"/></div>
                 <span>Visitor Pass</span>
               </Button>
               <Button onClick={() => navigate('payments')} variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
                 <div className="p-2 bg-green-100 text-green-600 rounded-full"><DollarSign className="w-6 h-6"/></div>
                 <span>Pay Dues</span>
               </Button>
               <Button onClick={() => navigate('complaints')} variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
                 <div className="p-2 bg-orange-100 text-orange-600 rounded-full"><Wrench className="w-6 h-6"/></div>
                 <span>Raise Complaint</span>
               </Button>
               <Button onClick={() => navigate('amenities')} variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
                 <div className="p-2 bg-purple-100 text-purple-600 rounded-full"><Calendar className="w-6 h-6"/></div>
                 <span>Book Amenity</span>
               </Button>
            </div>
        </Card>
      </div>
    </div>
  );
};

// --- VISITORS ---
const ResidentVisitors: React.FC = () => {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newVisitorName, setNewVisitorName] = useState('');
  const [newVisitorType, setNewVisitorType] = useState('guest');

  useEffect(() => {
    if (user) dataService.getVisitors(user.role, user.uid).then(setVisitors);
  }, [user]);

  const handleAddVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    await dataService.addVisitor({
      name: newVisitorName,
      type: newVisitorType as any,
      code: Math.floor(1000 + Math.random() * 9000).toString(), // Mock logic
      expectedArrival: new Date().toISOString(),
      hostId: user.uid,
      hostName: user.displayName,
      hostFlat: (user.block && user.flatNumber) ? `${user.block}-${user.flatNumber}` : 'Unknown'
    });
    
    setShowAdd(false);
    setNewVisitorName('');
    dataService.getVisitors(user.role, user.uid).then(setVisitors);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Visitors</h1>
        <Button onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-4 h-4 mr-2" /> Pre-approve
        </Button>
      </div>

      {showAdd && (
        <Card className="mb-6 animate-fade-in">
          <form onSubmit={handleAddVisitor} className="space-y-4">
            <h3 className="text-lg font-medium">New Visitor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Name" 
                value={newVisitorName} 
                onChange={e => setNewVisitorName(e.target.value)} 
                required 
              />
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={newVisitorType}
                  onChange={e => setNewVisitorType(e.target.value)}
                >
                  <option value="guest">Guest</option>
                  <option value="delivery">Delivery</option>
                  <option value="service">Service (Maid/Repair)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit">Create Pass</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {visitors.length === 0 && <p className="text-gray-500 text-center py-8">No active visitor passes.</p>}
        {visitors.map(v => (
          <Card key={v.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4">
            <div className="flex items-start space-x-4">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                 {v.type === 'delivery' ? '📦' : v.type === 'service' ? '🔧' : '👤'}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{v.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{v.type}</p>
                <div className="flex items-center text-xs text-gray-400 mt-1">
                   <Clock className="w-3 h-3 mr-1"/> {v.expectedArrival ? format(new Date(v.expectedArrival), 'MMM d, h:mm a') : 'Now'}
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col items-end space-y-2">
              <div className="text-2xl font-mono font-bold text-indigo-600 tracking-wider bg-indigo-50 px-3 py-1 rounded">
                {v.code}
              </div>
              <Badge status={v.status} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// --- PAYMENTS ---
const ResidentPayments: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (user) dataService.getPayments(user.uid).then(setPayments);
  }, [user]);

  const handlePay = async (id: string) => {
    await dataService.payInvoice(id);
    if (user) dataService.getPayments(user.uid).then(setPayments);
  };

  return (
    <div className="space-y-6">
       <h1 className="text-2xl font-bold text-gray-900">Payments & Dues</h1>
       <div className="space-y-4">
         {payments.length === 0 && <p className="text-gray-500">No pending or past payments.</p>}
         {payments.map(p => (
           <Card key={p.id} className="flex justify-between items-center p-4">
             <div>
               <h4 className="font-bold text-gray-900">{p.title}</h4>
               <p className="text-sm text-gray-500">Due: {format(new Date(p.dueDate), 'MMM d, yyyy')}</p>
             </div>
             <div className="text-right">
               <p className="text-lg font-bold mb-2">${p.amount}</p>
               {p.status === 'paid' ? (
                 <Badge status="paid" />
               ) : (
                 <Button size="sm" onClick={() => handlePay(p.id)}>Pay Now</Button>
               )}
             </div>
           </Card>
         ))}
       </div>
    </div>
  );
};

// --- COMPLAINTS ---
const ResidentComplaints: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState('plumbing');

  const fetchComplaints = () => {
    if (user) dataService.getComplaints(user.role, user.uid).then(setComplaints);
  };

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await dataService.addComplaint({
      title,
      description: desc,
      category: cat as any,
      residentId: user.uid,
      residentName: user.displayName,
      flat: (user.block && user.flatNumber) ? `${user.block}-${user.flatNumber}` : '',
    });
    setShowForm(false);
    setTitle('');
    setDesc('');
    fetchComplaints();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Helpdesk & Complaints</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" /> New Ticket
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-medium">Raise Complaint</h3>
            <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Leaking Tap" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={cat} onChange={e => setCat(e.target.value)}>
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="security">Security</option>
                <option value="common_area">Common Area</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                rows={3} 
                value={desc} 
                onChange={e => setDesc(e.target.value)}
                required 
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit">Submit Ticket</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {complaints.length === 0 && <p className="text-gray-500">No active complaints.</p>}
        {complaints.map(c => (
           <Card key={c.id} className="p-4">
              <div className="flex justify-between items-start">
                 <div>
                   <h3 className="font-bold text-gray-900">{c.title}</h3>
                   <p className="text-sm text-gray-500 mt-1">{c.description}</p>
                   <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">{c.category}</span>
                      <span className="text-xs text-gray-400">{format(new Date(c.createdAt), 'MMM d, yyyy')}</span>
                   </div>
                 </div>
                 <div className="flex flex-col items-end">
                   <Badge status={c.status} />
                 </div>
              </div>
           </Card>
        ))}
      </div>
    </div>
  );
};

// --- VEHICLES ---
const ResidentVehicles: React.FC = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');
  const [type, setType] = useState('car');

  useEffect(() => {
    if (user) dataService.getVehicles(user.uid).then(setVehicles);
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await dataService.addVehicle({
      residentId: user.uid,
      make,
      model,
      plateNumber: plate,
      type: type as any
    });
    setShowAdd(false);
    dataService.getVehicles(user.uid).then(setVehicles);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold text-gray-900">My Vehicles</h1>
         <Button onClick={() => setShowAdd(!showAdd)}><Plus className="w-4 h-4 mr-2"/> Add Vehicle</Button>
      </div>

      {showAdd && (
        <Card className="mb-6">
           <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Input label="Make (e.g. Honda)" value={make} onChange={e => setMake(e.target.value)} required />
                 <Input label="Model (e.g. City)" value={model} onChange={e => setModel(e.target.value)} required />
                 <Input label="Plate Number" value={plate} onChange={e => setPlate(e.target.value)} required />
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={type} onChange={e => setType(e.target.value)}>
                      <option value="car">Car</option>
                      <option value="bike">Bike</option>
                    </select>
                 </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button type="submit">Register Vehicle</Button>
              </div>
           </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {vehicles.map(v => (
            <Card key={v.id} className="flex items-center p-4 space-x-4">
               <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                  <CarIcon className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="font-bold text-gray-900">{v.make} {v.model}</h3>
                  <p className="text-sm font-mono text-gray-600 bg-gray-50 px-2 rounded inline-block mt-1">{v.plateNumber}</p>
                  <p className="text-xs text-gray-400 mt-1 capitalize">{v.type}</p>
               </div>
            </Card>
         ))}
      </div>
    </div>
  );
};

// --- PETS ---
const ResidentPets: React.FC = () => {
  const { user } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('dog');
  const [breed, setBreed] = useState('');
  const [localPets, setLocalPets] = useState<Pet[]>(user?.pets || []);

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    await dataService.addPet(user.uid, {
       name,
       type: type as any,
       breed
    });
    
    // Optimistic update for demo since AuthContext doesn't auto-refresh from DB deeply
    setLocalPets([...localPets, { id: Date.now().toString(), name, type: type as any, breed }]);
    setShowAdd(false);
    setName('');
    setBreed('');
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold text-gray-900">My Pets</h1>
         <Button onClick={() => setShowAdd(!showAdd)}><Plus className="w-4 h-4 mr-2"/> Add Pet</Button>
       </div>

       {showAdd && (
          <Card className="mb-6">
             <form onSubmit={handleAddPet} className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Input label="Pet Name" value={name} onChange={e => setName(e.target.value)} required />
                 <Input label="Breed" value={breed} onChange={e => setBreed(e.target.value)} />
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={type} onChange={e => setType(e.target.value)}>
                      <option value="dog">Dog</option>
                      <option value="cat">Cat</option>
                      <option value="other">Other</option>
                    </select>
                 </div>
               </div>
               <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                  <Button type="submit">Add Pet</Button>
               </div>
             </form>
          </Card>
       )}

       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {localPets.length === 0 && <p className="text-gray-500">No pets registered.</p>}
          {localPets.map(pet => (
             <Card key={pet.id} className="p-4 flex items-center space-x-4">
                <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
                   <Cat className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="font-bold text-gray-900">{pet.name}</h3>
                   <p className="text-sm text-gray-500 capitalize">{pet.breed} {pet.type}</p>
                </div>
             </Card>
          ))}
       </div>
    </div>
  );
};

// --- AMENITIES ---
const ResidentAmenities: React.FC = () => {
  const { user } = useAuth();
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('');

  useEffect(() => {
    dataService.getAmenities().then(setAmenities);
    if (user) dataService.getBookings(user.uid).then(setBookings);
  }, [user]);

  const handleBook = async () => {
    if (!user || !selectedAmenity) return;
    try {
      await dataService.addBooking({
         amenityId: selectedAmenity.id,
         amenityName: selectedAmenity.name,
         residentId: user.uid,
         residentName: user.displayName,
         date: bookDate,
         startTime: bookTime,
         endTime: bookTime // Simplified for demo
      });
      alert('Booking Confirmed!');
      setSelectedAmenity(null);
      dataService.getBookings(user.uid).then(setBookings);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  return (
     <div className="space-y-6">
       <h1 className="text-2xl font-bold text-gray-900">Amenities & Booking</h1>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
             <h2 className="text-lg font-semibold">Available Amenities</h2>
             {amenities.map(a => (
                <Card key={a.id} className="p-4 flex justify-between items-center">
                   <div>
                      <h3 className="font-bold">{a.name}</h3>
                      <p className="text-sm text-gray-500">{a.description}</p>
                      <p className="text-xs text-gray-400 mt-1">Open: {a.openTime} - {a.closeTime}</p>
                   </div>
                   <Button onClick={() => setSelectedAmenity(a)}>Book</Button>
                </Card>
             ))}
          </div>

          <div className="space-y-4">
             <h2 className="text-lg font-semibold">My Bookings</h2>
             {bookings.length === 0 && <p className="text-gray-500 text-sm">No upcoming bookings.</p>}
             {bookings.map(b => (
                <div key={b.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                   <h4 className="font-bold text-indigo-600">{b.amenityName}</h4>
                   <p className="text-sm text-gray-600">{b.date} at {b.startTime}</p>
                   <Badge status={b.status} />
                </div>
             ))}
          </div>
       </div>

       {/* Simple Modal for Booking */}
       {selectedAmenity && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md p-6">
               <h3 className="text-xl font-bold mb-4">Book {selectedAmenity.name}</h3>
               <Input type="date" label="Date" value={bookDate} onChange={e => setBookDate(e.target.value)} />
               <Input type="time" label="Time" value={bookTime} onChange={e => setBookTime(e.target.value)} />
               <div className="flex justify-end space-x-2 mt-4">
                 <Button variant="outline" onClick={() => setSelectedAmenity(null)}>Cancel</Button>
                 <Button onClick={handleBook}>Confirm Booking</Button>
               </div>
            </Card>
         </div>
       )}
     </div>
  );
};

// --- DIRECTORY ---
const ResidentDirectory: React.FC = () => {
  const [residents, setResidents] = useState<User[]>([]);

  useEffect(() => {
    dataService.getResidents().then(res => setResidents(res.filter(r => r.status === 'approved')));
  }, []);

  return (
    <div className="space-y-6">
       <h1 className="text-2xl font-bold text-gray-900">Community Directory</h1>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {residents.map(r => (
             <Card key={r.uid} className="p-4 flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                   {r.displayName.charAt(0)}
                </div>
                <div>
                   <h3 className="font-bold text-gray-900">{r.displayName}</h3>
                   <p className="text-sm text-gray-500">Block {r.block} - {r.flatNumber}</p>
                   {r.isPublic && r.phone ? (
                     <p className="text-xs text-indigo-600 mt-1">{r.phone}</p>
                   ) : (
                     <p className="text-xs text-gray-400 mt-1 italic">Contact hidden</p>
                   )}
                </div>
             </Card>
          ))}
       </div>
    </div>
  );
};

// --- AI ASSISTANT ---
const ResidentAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'model', text: 'Hi! I am your community assistant. Ask me about gym timings, visitor rules, or contact info.', timestamp: Date.now() }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Convert history for Gemini
    const history = messages.map(m => ({ role: m.role, parts: [m.text] }));
    const responseText = await geminiService.chatWithAssistant(input, history);

    const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: Date.now() };
    setMessages(prev => [...prev, botMsg]);
    setLoading(false);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
       <div className="flex-1 overflow-y-auto space-y-4 p-4">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[80%] p-3 rounded-2xl ${
                 m.role === 'user' 
                 ? 'bg-indigo-600 text-white rounded-br-none' 
                 : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
               }`}>
                 <p className="text-sm leading-relaxed">{m.text}</p>
               </div>
            </div>
          ))}
          {loading && (
             <div className="flex justify-start">
               <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex space-x-1">
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
       </div>
       <div className="p-4 bg-white border-t border-gray-200">
         <form onSubmit={handleSend} className="flex space-x-2">
           <input 
             value={input}
             onChange={e => setInput(e.target.value)}
             placeholder="Ask about rules, timings, etc..."
             className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
           />
           <Button type="submit" className="rounded-full px-4" disabled={loading}>
             <Send className="w-5 h-5" />
           </Button>
         </form>
       </div>
    </div>
  );
};

export const ResidentDashboard: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ResidentHome />} />
      <Route path="/visitors" element={<ResidentVisitors />} />
      <Route path="/payments" element={<ResidentPayments />} />
      <Route path="/complaints" element={<ResidentComplaints />} />
      <Route path="/vehicles" element={<ResidentVehicles />} />
      <Route path="/pets" element={<ResidentPets />} />
      <Route path="/amenities" element={<ResidentAmenities />} />
      <Route path="/directory" element={<ResidentDirectory />} />
      <Route path="/assistant" element={<ResidentAssistant />} />
    </Routes>
  );
};