
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/integrations/supabase/client';
import { 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Edit, 
  Trash2, 
  MoreVertical,
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  avatar_url: string | null;
  created_at: string;
  email?: string;
}

const AdminUsers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      
      // In a real app, you would check if the user has admin privileges
    };
    
    checkAdmin();
  }, [user, navigate]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        
        // First get all profiles
        const { data: profiles, error: profilesError } = await db.profiles()
          .select('*')
          .order('created_at', { ascending: false });
          
        if (profilesError) throw profilesError;
        
        // In a real admin panel, you'd likely have access to auth.users directly,
        // but for this demo, we'll just use what we have in the profiles table
        // and add some mock email data
        
        if (profiles) {
          const enhancedProfiles = profiles.map(profile => ({
            ...profile,
            email: `user_${profile.id.slice(0, 5)}@example.com` // Mock email for demo purposes
          }));
          
          setUsers(enhancedProfiles);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchUsers();
    }
  }, [user]);
  
  const handleDeleteUser = async (id: string) => {
    try {
      // In a real app with proper admin access, you would use admin endpoints to delete users
      // For this demo, we'll just delete from profiles
      const { error } = await db.profiles()
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setUsers(users.filter(user => user.id !== id));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };
  
  // Add filtered users logic
  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const email = user.email?.toLowerCase() || '';
    const phone = user.phone_number?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    
    return fullName.includes(searchLower) || 
           email.includes(searchLower) || 
           phone.includes(searchLower);
  });
  
  return (
    <AdminLayout title="User Management">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button className="btn-outline px-4 py-2 flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-book-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verified
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {user.avatar_url ? (
                                <img 
                                  className="h-10 w-10 rounded-full object-cover" 
                                  src={user.avatar_url} 
                                  alt={`${user.first_name} ${user.last_name}`} 
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-500 font-medium">
                                    {user.first_name?.[0] || ''}{user.last_name?.[0] || ''}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-gray-500 text-sm">
                                ID: {user.id.slice(0, 8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <span>{user.email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            <span>{user.phone_number || 'Not provided'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {Math.random() > 0.3 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Check className="w-3 h-3 mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <X className="w-3 h-3 mr-1" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <button className="p-1 text-blue-600 hover:text-blue-800">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              className="p-1 text-red-600 hover:text-red-800"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-gray-600 hover:text-gray-800">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
