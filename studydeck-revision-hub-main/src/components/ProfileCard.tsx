import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Phone, Mail } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ProfileCardProps {
  userId: string;
  totalTasks: number;
}

interface ProfileData {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  dateOfBirth?: Date | null;
  city?: string | null;
  profilePhoto: string | null;
}

interface Note {
  _id: string;
  user:string;
  title: string;
  content: string;
  tags: string[];
  subject: string;
  createdAt: string;
  updatedAt: string;
  isMarkedForRevision: boolean;
  folderId?: string;
  type: 'note' | 'pdf';
}

interface Folder {
  _id: string;
  name: string;
  parentId?: string;
  color: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ userId, totalTasks }) => {
  // State variables
  const [editMode, setEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  // Individual attributes - initialized from profileData
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [city, setCity] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profileImg, setProfileImg] = useState<string | null>(null); // Temporary image for upload

  // Initialize input states when profile data loads
  useEffect(() => {
    if (profileData) {
      setName(profileData.name);
      setMobile(profileData.mobile || "");
      // Convert Date object to string format
      const date = profileData.dateOfBirth;
      setDateOfBirth(date ? new Date(date).toISOString().split('T')[0] : "");
      setCity(profileData.city || "");
      setProfilePhoto(profileData.profilePhoto);
    }
  }, [profileData]);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        console.log('Fetching profile from:', `${import.meta.env.VITE_API_URL}/api/profile`);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`API Error: ${response.status} - ${text.substring(0, 200)}...`);
        }

        const text = await response.text();
        console.log('Full response:', text);

        try {
          const data = JSON.parse(text);
          if (!data || typeof data !== 'object') {
            throw new Error('Invalid response format');
          }
          setProfileData(data);
          setName(data.name);
          setMobile(data.mobile || "");
          setDateOfBirth(data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : "");
          setCity(data.city || "");
          setProfilePhoto(data.profilePhoto);
        } catch (err) {
          console.error('Response parsing error:', {
            error: err,
            status: response.status,
            responseText: text.substring(0, 200)
          });
          throw new Error(`Failed to fetch profile: ${err.message}`);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Failed to load profile data');
        // Log the full error for debugging
        console.error('Full error details:', {
          message: err.message,
          name: err.name,
          stack: err.stack
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []); // Empty dependency array since we're using token from localStorage

  const fileRef = useRef<HTMLInputElement>(null);

  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);

  const hasFetchedData = useRef(false);
  const isFirstRender = useRef(true);
  const debounceTimeout = 1000; // 1s delay to debounce changes
    useEffect(() => {
      const fetchData = async () => {
        const token = localStorage.getItem("token");
        if (!token || hasFetchedData.current) return;
  
        try {
          const response = await fetch("http://localhost:5000/api/data/data", {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          if (!response.ok) throw new Error("Failed to fetch notes and folders");
  
          const data = await response.json();
          setNotes(data.notes);
          setFolders(data.folders);
          console.log(notes);
          hasFetchedData.current = true;
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
  
      fetchData();
    }, []);
    console.log(notes);
   
     const totalNotes = notes.length;
     const notesInQueue = notes.filter(note => note.isMarkedForRevision).length;
   
  // Statistics from props
  const tasksToday = totalTasks;

  // Handle image upload
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfileImg(ev.target?.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  // Validate input fields
  const validateFields = () => {
    if (!name.trim()) {
      setError('Name is required');
      return false;
    }

    if (mobile && !/^\+?[0-9]{10,15}$/.test(mobile)) {
      setError('Mobile number should be 10-15 digits, with optional + prefix');
      return false;
    }

    if (profileImg && !/^data:image\/(jpeg|jpg|png|gif);base64,/.test(profileImg)) {
      // Fixed validation for base64 images from file upload
      setError('Invalid image format');
      return false;
    }

    setError(null);
    return true;
  };

  const handleSave = async () => {
    if (!validateFields()) return;

    try {
      setIsUpdating(true);
      setError(null);
      
      const updates = {
        name: name.trim(),
        mobile: mobile.trim() || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
        city: city.trim() || null,
        profilePhoto: profileImg || profilePhoto // Use new image if uploaded, otherwise keep existing
      };

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Update local state
      setProfileData((prev) => ({
        ...prev!,
        ...updates,
        dateOfBirth: updates.dateOfBirth ? new Date(updates.dateOfBirth) : prev?.dateOfBirth,
      }));
      setProfileImg(null); // Clear temporary image after successful update
      setEditMode(false); // Exit edit mode after successful update
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setName(profileData?.name || "");
    const email = profileData?.email || ""; // Email is read-only from profileData // Email is read-only from profileData
    setProfileImg(null);
    setError(null);
    setEditMode(false);
  };
  
  return (
    <Card className="shadow-xl animate-fade-in h-fit px-0 py-0 overflow-hidden relative rounded-2xl">
      {/* Edit Icon - Now Golden */}
      <button
        className="absolute top-3 right-3 z-10 bg-yellow-400/90 backdrop-blur-sm hover:bg-yellow-500 transition-colors rounded-full p-1.5 shadow focus:outline-none"
        aria-label="Edit profile"
        type="button"
        onClick={() => setEditMode((m) => !m)}
        disabled={loading || isUpdating}
      >
        <Pencil size={18} className="text-yellow-900" />
      </button>
      
      {/* Banner + Avatar with Custom Background */}
      <div 
        className="pt-8 pb-4 px-6 relative"
        style={{
          backgroundImage: `url('image.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="flex flex-col items-center relative z-10">
          {/* Uploadable Avatar */}
          <div className="relative group">
            <button
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white cursor-pointer group-hover:bg-gray-100 transition-colors focus:outline-none"
              title="Upload profile image"
              onClick={() => editMode && fileRef.current?.click()}
              aria-label="Edit profile image"
              type="button"
              tabIndex={editMode ? 0 : -1}
              disabled={!editMode || loading || isUpdating}
            >
              {(profileImg || profilePhoto) ? (
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profileImg || profilePhoto || ""} alt="Profile" />
                  <AvatarFallback>
                    <Pencil size={40} className="text-yellow-600" />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Pencil size={40} className="text-yellow-600 group-hover:text-yellow-700" />
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif"
                style={{ display: "none" }}
                ref={fileRef}
                onChange={onFileChange}
                aria-label="Choose profile image"
                disabled={!editMode || loading || isUpdating}
              />
            </button>
            {editMode && (
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition text-center whitespace-nowrap bg-white px-2 py-1 rounded shadow border">
                Edit profile image
              </span>
            )}
          </div>
          <div className="text-xl font-semibold mt-4 text-yellow-300">
            {editMode ? (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-center font-semibold bg-white/90"
              />
            ) : (
              name
            )}
          </div>
        </div>
      </div>
      
      <CardContent className="px-6 pt-2 pb-6">
        <div className="text-xs font-semibold text-muted-foreground mb-1 mt-2">Basic Information</div>
        <div className="text-sm space-y-1 mb-4">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-yellow-600" />
            <span className="w-28">Phone number</span>
            <span className="flex-1 text-right">
              {editMode ? (
                <Input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="!m-0 py-0 pr-0 bg-white rounded border"
                  maxLength={15}
                  placeholder="Enter phone number"
                  disabled={loading || isUpdating}
                />
              ) : (
                mobile || "Not provided"
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-yellow-600" />
            <span className="w-28">E-Mail</span>
            <span className="flex-1 text-right truncate">
              <span className={editMode ? "bg-gray-100 cursor-not-allowed px-1 rounded" : ""}>
                {profileData?.email || "Not provided"}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 text-yellow-600">🎂</span>
            <span className="w-28">Date of Birth</span>
            <span className="flex-1 text-right truncate">
              {editMode ? (
                <Input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full"
                />
              ) : (
                <span className="bg-gray-100 cursor-not-allowed px-1 rounded">
                  {profileData?.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : "Not provided"}
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 text-yellow-600">🏙️</span>
            <span className="w-28">City</span>
            <span className="flex-1 text-right truncate">
              {editMode ? (
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter your city"
                  className="w-full"
                />
              ) : (
                <span className="bg-gray-100 cursor-not-allowed px-1 rounded">
                  {profileData?.city || "Not provided"}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Save/Cancel buttons for edit mode */}
        {editMode && (
          <div className="flex gap-2 mb-4">
            <Button
              onClick={handleSave}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
              disabled={isUpdating || loading}
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
              disabled={isUpdating || loading}
            >
              Cancel
            </Button>
          </div>
        )}
        
        {/* Error message if any */}
        {error && (
          <div className="text-sm text-red-500 mb-4">
            {error}
          </div>
        )}
        
        {/* Statistics Section */}
        <div className="mb-4">
          <div className="text-xs font-semibold text-muted-foreground mb-2 mt-3">Statistics</div>
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex items-center justify-between">
              <span>Total notes added</span>
              <span className="font-bold text-yellow-600">{totalNotes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Notes in queue</span>
              <span className="font-bold text-yellow-600">{notesInQueue}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tasks today</span>
              <span className="font-bold text-yellow-600">{tasksToday}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;