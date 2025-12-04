import React, { useState, useEffect, useRef, useCallback } from 'react';
import { dataService } from '../services/firebase';
import { Visitor, VisitorStatus, UserRole } from '../types';
import { Card, Button, Badge, Input } from '../components/UI';
import { Search, LogIn, LogOut, Truck, User as UserIcon, PlusCircle, Phone, Camera, Car, Bell } from 'lucide-react';
import { format } from 'date-fns';

export const GuardDashboard: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [searchCode, setSearchCode] = useState('');
  const [activeTab, setActiveTab] = useState<'expected' | 'inside'>('expected');
  
  // State for Check-in / Walk-in Modal
  const [processingVisitor, setProcessingVisitor] = useState<Visitor | 'walk-in' | null>(null);
  
  // Form State
  const [wiName, setWiName] = useState('');
  const [wiPhone, setWiPhone] = useState('');
  const [wiFlat, setWiFlat] = useState('A-101'); // Default
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [notifying, setNotifying] = useState(false);

  // Camera State
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  const { flats } = dataService.getFlatsConfig();

  const fetchVisitors = useCallback(() => {
    dataService.getVisitors(UserRole.GUARD).then(setVisitors);
  }, []);

  useEffect(() => {
    fetchVisitors();
    const interval = setInterval(fetchVisitors, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchVisitors]);

  // Clean up camera stream on unmount or when modal closes
  useEffect(() => {
    if (!processingVisitor && isCameraOn) {
      stopCamera();
    }
  }, [processingVisitor, isCameraOn]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOn(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 320, 240);
        const data = canvasRef.current.toDataURL('image/jpeg');
        setPhotoData(data);
        stopCamera();
      }
    }
  };

  const handleOpenCheckIn = (visitor: Visitor | 'walk-in') => {
    setProcessingVisitor(visitor);
    setVehicleNumber('');
    setPhotoData(null);
    setWiName('');
    setWiPhone('');
    setWiFlat('A-101');
    setNotifying(false);
  };

  const handleCloseCheckIn = () => {
    stopCamera();
    setProcessingVisitor(null);
  };

  const handleConfirmEntry = async () => {
    if (processingVisitor === 'walk-in') {
      setNotifying(true);
      // Simulate Notification Delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await dataService.addVisitor({
        name: wiName,
        type: 'guest',
        code: 'WALK-IN',
        expectedArrival: new Date().toISOString(),
        entryTime: new Date().toISOString(), // Auto enter
        hostId: 'unknown',
        hostName: 'Unknown',
        hostFlat: wiFlat,
        phone: wiPhone,
        vehicleNumber,
        entryPhoto: photoData || undefined
      });
      setActiveTab('inside');
    } else if (processingVisitor) {
      await dataService.updateVisitorStatus(
        processingVisitor.id, 
        VisitorStatus.ENTERED,
        { vehicleNumber, entryPhoto: photoData || undefined }
      );
    }
    
    setNotifying(false);
    handleCloseCheckIn();
    fetchVisitors();
  };

  const handleExit = async (id: string) => {
    await dataService.updateVisitorStatus(id, VisitorStatus.EXITED);
    fetchVisitors();
  };

  const filteredVisitors = visitors.filter(v => {
    const matchesCode = searchCode === '' || v.code.includes(searchCode) || v.name.toLowerCase().includes(searchCode.toLowerCase());
    if (!matchesCode) return false;

    if (activeTab === 'expected') return v.status === VisitorStatus.PRE_APPROVED;
    if (activeTab === 'inside') return v.status === VisitorStatus.ENTERED;
    return false;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Security Gate</h1>
        <div className="flex space-x-2">
           <Button 
             variant={activeTab === 'expected' ? 'primary' : 'outline'} 
             onClick={() => setActiveTab('expected')}
           >
             Expected
           </Button>
           <Button 
             variant={activeTab === 'inside' ? 'primary' : 'outline'} 
             onClick={() => setActiveTab('inside')}
           >
             Inside Now
           </Button>
           <Button variant="danger" onClick={() => handleOpenCheckIn('walk-in')}>
             <PlusCircle className="w-4 h-4 mr-2" /> Walk-In Entry
           </Button>
        </div>
      </div>

      {/* Check-In / Walk-In Modal */}
      {processingVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <Card className="w-full max-w-lg bg-white relative">
             <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-xl">
                  {processingVisitor === 'walk-in' ? 'Register Walk-In' : `Check-In: ${processingVisitor.name}`}
                </h3>
                <button onClick={handleCloseCheckIn} className="text-gray-500 hover:text-gray-700">&times;</button>
             </div>
             
             <div className="p-6 space-y-6">
               {/* Walk-in Fields */}
               {processingVisitor === 'walk-in' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Visitor Name" value={wiName} onChange={e => setWiName(e.target.value)} required />
                    <Input label="Phone" value={wiPhone} onChange={e => setWiPhone(e.target.value)} required />
                    <div className="md:col-span-2">
                       <label className="block text-sm font-medium text-gray-700 mb-1">Select Flat to Visit</label>
                       <select 
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500"
                         value={wiFlat}
                         onChange={e => setWiFlat(e.target.value)}
                       >
                         {flats.map(f => (
                           <option key={f} value={f}>Flat {f}</option>
                         ))}
                       </select>
                       <p className="text-xs text-blue-600 mt-1 flex items-center">
                         <Bell className="w-3 h-3 mr-1"/>
                         Entry triggers notification to registered flat owners.
                       </p>
                    </div>
                 </div>
               )}

               {/* Pre-approved details */}
               {processingVisitor !== 'walk-in' && (
                 <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 mb-4">
                    <p><span className="font-semibold">Code:</span> {processingVisitor.code}</p>
                    <p><span className="font-semibold">Host:</span> {processingVisitor.hostName} ({processingVisitor.hostFlat})</p>
                 </div>
               )}

               <div className="border-t border-gray-200 pt-4 space-y-4">
                 <h4 className="font-semibold text-gray-700">Entry Details</h4>
                 <Input 
                   label="Vehicle Number (Optional)" 
                   placeholder="e.g. KA-01-AB-1234"
                   value={vehicleNumber}
                   onChange={e => setVehicleNumber(e.target.value)}
                   icon={<Car className="w-4 h-4 text-gray-400" />}
                 />

                 <div className="space-y-2">
                   <label className="block text-sm font-medium text-gray-700">Visitor Photo</label>
                   <div className="bg-gray-100 rounded-lg overflow-hidden h-48 flex items-center justify-center border border-gray-300 relative">
                      {photoData ? (
                        <img src={photoData} alt="Visitor" className="h-full w-full object-cover" />
                      ) : isCameraOn ? (
                        <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
                      ) : (
                        <div className="text-center text-gray-400">
                          <Camera className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-sm">No photo captured</p>
                        </div>
                      )}
                      
                      {/* Hidden canvas for capture */}
                      <canvas ref={canvasRef} width="320" height="240" className="hidden" />
                   </div>
                   
                   <div className="flex justify-center space-x-2">
                      {!isCameraOn && !photoData && (
                        <Button size="sm" variant="outline" onClick={startCamera}>Start Camera</Button>
                      )}
                      {isCameraOn && (
                        <Button size="sm" onClick={capturePhoto}>Capture Photo</Button>
                      )}
                      {photoData && (
                        <Button size="sm" variant="outline" onClick={() => setPhotoData(null)}>Retake</Button>
                      )}
                   </div>
                 </div>
               </div>
             </div>

             <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCloseCheckIn} disabled={notifying}>Cancel</Button>
                <Button onClick={handleConfirmEntry} className="bg-green-600 hover:bg-green-700" isLoading={notifying}>
                  {processingVisitor === 'walk-in' 
                     ? (notifying ? 'Notifying Owners...' : 'Register & Notify') 
                     : 'Confirm Entry'
                  }
                </Button>
             </div>
          </Card>
        </div>
      )}

      {/* Visitor List */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input 
          placeholder="Search by Code or Name..." 
          className="pl-10" 
          value={searchCode}
          onChange={e => setSearchCode(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredVisitors.map(v => (
          <Card key={v.id} className={`border-l-4 ${v.code === 'WALK-IN' ? 'border-l-orange-500' : 'border-l-indigo-500'}`}>
             <div className="flex flex-col md:flex-row justify-between items-center p-2">
               <div className="flex items-center space-x-4 mb-4 md:mb-0 w-full md:w-auto">
                 <div className="relative">
                   {v.entryPhoto ? (
                     <img src={v.entryPhoto} alt={v.name} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                   ) : (
                     <div className="bg-gray-100 p-3 rounded-full">
                        {v.type === 'delivery' ? <Truck className="w-6 h-6 text-gray-600"/> : <UserIcon className="w-6 h-6 text-gray-600"/>}
                     </div>
                   )}
                 </div>
                 
                 <div>
                   <h3 className="font-bold text-lg">{v.name}</h3>
                   <div className="text-sm text-gray-500 flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                      <span className="font-mono bg-gray-100 px-1 rounded">#{v.code}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>Visiting: {v.hostFlat} ({v.hostName})</span>
                      {v.vehicleNumber && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="flex items-center text-indigo-600 font-medium"><Car className="w-3 h-3 mr-1"/> {v.vehicleNumber}</span>
                        </>
                      )}
                   </div>
                 </div>
               </div>

               <div className="flex items-center space-x-4">
                 {v.status === VisitorStatus.PRE_APPROVED && (
                   <Button onClick={() => handleOpenCheckIn(v)} className="bg-green-600 hover:bg-green-700 text-white">
                     <LogIn className="w-4 h-4 mr-2" /> Allow Entry
                   </Button>
                 )}
                 {v.status === VisitorStatus.ENTERED && (
                   <div className="flex items-center space-x-3">
                     <span className="text-xs text-gray-400">Entered: {format(new Date(v.entryTime!), 'h:mm a')}</span>
                     <Button onClick={() => handleExit(v.id)} variant="secondary">
                       <LogOut className="w-4 h-4 mr-2" /> Mark Exit
                     </Button>
                   </div>
                 )}
               </div>
             </div>
          </Card>
        ))}
        {filteredVisitors.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            No visitors found in this list.
          </div>
        )}
      </div>
    </div>
  );
};