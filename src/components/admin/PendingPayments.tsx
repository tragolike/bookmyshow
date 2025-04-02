
import { useState, useEffect } from 'react';
import { db } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Check, 
  X, 
  Search, 
  Loader2, 
  AlertTriangle, 
  ClipboardCheck,
  Clock,
  FileSpreadsheet,
  QrCode,
  User,
  RefreshCw
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';

interface PendingBooking {
  id: string;
  user_id: string;
  event_id: string;
  seat_numbers: string[];
  total_amount: number;
  payment_status: string;
  booking_status: string;
  created_at: string;
  utr_number?: string;
  event?: {
    title: string;
    date: string;
    venue: string;
  };
  user?: {
    email: string;
    phone?: string;
    name?: string;
  };
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

const PendingPayments = () => {
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<PendingBooking | null>(null);
  const [utrVerification, setUtrVerification] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const fetchPendingBookings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await db.bookings()
        .select(`
          *,
          event:event_id (
            title,
            date,
            venue
          ),
          user:user_id (
            email
          )
        `)
        .eq('payment_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingBookings(data || []);
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
      toast.error('Failed to load pending payments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!selectedBooking) return;
    
    // Validate UTR format (12-22 alphanumeric characters)
    const utrRegex = /^[A-Z0-9]{12,22}$/;
    if (!utrRegex.test(utrVerification)) {
      toast.error('Invalid UTR format. Must be 12-22 alphanumeric characters.');
      return;
    }
    
    setIsVerifying(true);
    try {
      const { error } = await db.bookings()
        .update({
          payment_status: 'completed',
          booking_status: 'confirmed',
          utr_number: utrVerification
        })
        .eq('id', selectedBooking.id);

      if (error) throw error;
      
      toast.success('Payment verified successfully');
      fetchPendingBookings();
      setDialogOpen(false);
      setSelectedBooking(null);
      setUtrVerification('');
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Failed to verify payment');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedBooking) return;
    
    setIsRejecting(true);
    try {
      const { error } = await db.bookings()
        .update({
          payment_status: 'failed',
          booking_status: 'cancelled'
        })
        .eq('id', selectedBooking.id);

      if (error) throw error;
      
      toast.success('Booking rejected successfully');
      fetchPendingBookings();
      setDialogOpen(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error rejecting booking:', error);
      toast.error('Failed to reject booking');
    } finally {
      setIsRejecting(false);
    }
  };

  const filteredBookings = pendingBookings.filter(booking => 
    booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (booking.event?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (booking.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (booking.utr_number || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Pending Payments</h2>
          <p className="text-gray-500">Verify UPI payments and confirm bookings</p>
        </div>
        
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by ID, event or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full sm:w-64"
          />
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Pending UTR Verification</CardTitle>
          <CardDescription>
            These bookings are awaiting payment verification. Check UTR numbers against your UPI account.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-book-primary" />
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>UTR</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-mono text-xs">
                        {booking.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>{booking.event?.title || 'Unknown Event'}</TableCell>
                      <TableCell>{booking.user?.email || 'Unknown User'}</TableCell>
                      <TableCell>₹{booking.total_amount.toLocaleString()}</TableCell>
                      <TableCell>{formatDate(booking.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          Pending
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {booking.utr_number || 'Not provided'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setUtrVerification(booking.utr_number || '');
                            setDialogOpen(true);
                          }}
                          className="ml-2"
                        >
                          Verify
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              {searchTerm ? (
                <>
                  <Search className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No bookings matching "{searchTerm}"</p>
                </>
              ) : (
                <>
                  <CheckCircleCheck className="h-10 w-10 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">No pending payments!</p>
                  <p className="text-gray-500 mt-1">All bookings have been processed</p>
                </>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="justify-between border-t pt-4">
          <div className="text-sm text-gray-500">
            Total pending: {filteredBookings.length}
          </div>
          
          <Button 
            variant="outline" 
            onClick={fetchPendingBookings}
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardFooter>
      </Card>
      
      {/* Verification Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Payment</DialogTitle>
            <DialogDescription>
              Check the UTR number against your UPI account transactions.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Booking ID:</span>
                  <span className="font-mono text-sm">{selectedBooking.id.substring(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Event:</span>
                  <span>{selectedBooking.event?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Amount:</span>
                  <span className="font-semibold">₹{selectedBooking.total_amount.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="utr-verification" className="text-sm font-medium">
                  UTR Number Verification
                </label>
                <Input
                  id="utr-verification"
                  value={utrVerification}
                  onChange={(e) => setUtrVerification(e.target.value.toUpperCase())}
                  placeholder="Enter UTR number"
                  className="font-mono"
                />
                <p className="text-xs text-gray-500">
                  UTR should be 12-22 alphanumeric characters (e.g., ABCDE12345FGHIJ)
                </p>
              </div>
              
              <div className="bg-amber-50 border border-amber-100 rounded-md p-3">
                <div className="flex gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">Important:</p>
                    <p>Verify this UTR number in your UPI account or bank statement before confirming.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
            <Button
              variant="destructive"
              onClick={handleRejectPayment}
              disabled={isRejecting || isVerifying}
            >
              {isRejecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Reject Payment
                </>
              )}
            </Button>
            
            <Button
              onClick={handleVerifyPayment}
              disabled={!utrVerification || isVerifying || isRejecting}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Confirm Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingPayments;

function CheckCircleCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
