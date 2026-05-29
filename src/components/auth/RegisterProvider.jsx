import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  fetchCategories, 
  fetchServices, 
  registerProvider, 
  register as registerUser,
  createCustomService
} from '../../services/api';
import { 
  Plus, X, Loader2, Upload, Trash2, 
  User, Calendar, MapPin, CreditCard, 
  Briefcase, Clock, CheckCircle, ChevronRight, ChevronLeft,
  FileText, Banknote
} from 'lucide-react';

const RegisterProvider = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(user ? 2 : 1);
  const [currentStep, setCurrentStep] = useState(2);
  const totalSteps = 7;

  // User registration state (step 1)
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // Provider form state
  const [providerData, setProviderData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    avatar: null,
    avatarPreview: null,
    category: '',
    customServices: [],
    experience: '',
    skills: [],
    currentAddress: '',
    state: '',
    city: '',
    pincode: '',
    coordinates: { lat: null, lng: null },
    aadharFront: null,
    aadharFrontPreview: null,
    aadharBack: null,
    aadharBackPreview: null,
    panFront: null,
    panFrontPreview: null,
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
    isAvailable: true,
    workingHours: [
      { day: 'monday', isWorking: true, slots: [{ startTime: '09:00', endTime: '18:00' }] },
      { day: 'tuesday', isWorking: true, slots: [{ startTime: '09:00', endTime: '18:00' }] },
      { day: 'wednesday', isWorking: true, slots: [{ startTime: '09:00', endTime: '18:00' }] },
      { day: 'thursday', isWorking: true, slots: [{ startTime: '09:00', endTime: '18:00' }] },
      { day: 'friday', isWorking: true, slots: [{ startTime: '09:00', endTime: '18:00' }] },
      { day: 'saturday', isWorking: true, slots: [{ startTime: '09:00', endTime: '14:00' }] },
      { day: 'sunday', isWorking: false, slots: [] },
    ],
    emergencyServiceAvailable: false
  });

  // Categories & sub‑services
  const [categories, setCategories] = useState([]);
  const [subServices, setSubServices] = useState([]);
  const [filteredSubServices, setFilteredSubServices] = useState([]);
  const [selectedSubServices, setSelectedSubServices] = useState([]);

  // Custom service modal
  const [showCustomServiceModal, setShowCustomServiceModal] = useState(false);
  const [customServiceName, setCustomServiceName] = useState('');
  const [customServicePrice, setCustomServicePrice] = useState('');
  const [customServiceDescription, setCustomServiceDescription] = useState('');
  const [customServiceImage, setCustomServiceImage] = useState(null);
  const [customServiceImagePreview, setCustomServiceImagePreview] = useState(null);
  const [creatingCustomService, setCreatingCustomService] = useState(false);
  const [customServiceError, setCustomServiceError] = useState('');
  const customFileInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const aadharFrontInputRef = useRef(null);
  const aadharBackInputRef = useRef(null);
  const panFrontInputRef = useRef(null);

  // Load categories
  useEffect(() => {
    loadCategoriesAndServices();
  }, []);

  const loadCategoriesAndServices = async () => {
    try {
      const [catRes, svcRes] = await Promise.all([
        fetchCategories(),
        fetchServices(1, 100)
      ]);
      if (catRes.success) setCategories(catRes.data.categories || []);
      if (svcRes.success) setSubServices(svcRes.data.services || []);
    } catch (err) {
      console.error('Failed to load data', err);
    }
  };

  useEffect(() => {
    if (providerData.category) {
      const filtered = subServices.filter(s => s.category?._id === providerData.category);
      setFilteredSubServices(filtered);
    } else {
      setFilteredSubServices([]);
    }
  }, [providerData.category, subServices]);

  // Step 1: User registration
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (userForm.password !== userForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await registerUser({
        firstName: userForm.firstName,
        lastName: userForm.lastName,
        email: userForm.email,
        phone: userForm.phone,
        password: userForm.password
      });
      setStep(2);
      setCurrentStep(2);
      if (setUser) setUser(res.data.user);
    } catch (err) {
      const msg = err.data?.message || err.message || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // File upload handlers
  const handleFileChange = (e, field, previewField) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB. Please compress your image.');
      e.target.value = '';
      return;
    }
    if (providerData[previewField]) {
      URL.revokeObjectURL(providerData[previewField]);
    }
    setProviderData(prev => ({
      ...prev,
      [field]: file,
      [previewField]: URL.createObjectURL(file)
    }));
  };

  const removeFile = (field, previewField) => {
    if (providerData[previewField]) {
      URL.revokeObjectURL(providerData[previewField]);
    }
    setProviderData(prev => ({
      ...prev,
      [field]: null,
      [previewField]: null
    }));
    if (field === 'avatar' && avatarInputRef.current) avatarInputRef.current.value = '';
    if (field === 'aadharFront' && aadharFrontInputRef.current) aadharFrontInputRef.current.value = '';
    if (field === 'aadharBack' && aadharBackInputRef.current) aadharBackInputRef.current.value = '';
    if (field === 'panFront' && panFrontInputRef.current) panFrontInputRef.current.value = '';
  };

  // Custom service creation
  const handleCreateCustomService = async () => {
    setCustomServiceError('');
    if (!providerData.category) {
      setCustomServiceError('Please select a main category first.');
      return;
    }
    if (!customServiceName.trim()) {
      setCustomServiceError('Service name is required.');
      return;
    }
    if (!customServicePrice || isNaN(customServicePrice) || customServicePrice <= 0) {
      setCustomServiceError('Valid price is required.');
      return;
    }
    if (customServiceImage && customServiceImage.size > 5 * 1024 * 1024) {
      setCustomServiceError('Image size must be less than 5MB. Please compress.');
      return;
    }

    setCreatingCustomService(true);
    try {
      const formData = new FormData();
      formData.append('name', customServiceName.trim());
      formData.append('category', providerData.category);
      formData.append('basePrice', customServicePrice);
      formData.append('description', customServiceDescription || customServiceName);
      if (customServiceImage) {
        formData.append('image', customServiceImage);
      }

      const res = await createCustomService(formData);
      if (res.success && res.data.service) {
        const newService = res.data.service;
        setProviderData(prev => ({
          ...prev,
          customServices: [...prev.customServices, {
            _id: newService._id,
            name: newService.name,
            price: newService.basePrice,
            image: newService.images?.[0]?.url || null
          }]
        }));
        setShowCustomServiceModal(false);
        resetCustomServiceForm();
      } else {
        setCustomServiceError(res.message || 'Failed to create custom service.');
      }
    } catch (err) {
      setCustomServiceError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setCreatingCustomService(false);
    }
  };

  const resetCustomServiceForm = () => {
    setCustomServiceName('');
    setCustomServicePrice('');
    setCustomServiceDescription('');
    if (customServiceImagePreview) URL.revokeObjectURL(customServiceImagePreview);
    setCustomServiceImage(null);
    setCustomServiceImagePreview(null);
    setCustomServiceError('');
    if (customFileInputRef.current) customFileInputRef.current.value = '';
  };

  const removeCustomService = (index) => {
    setProviderData(prev => ({
      ...prev,
      customServices: prev.customServices.filter((_, i) => i !== index)
    }));
  };

  const toggleSubService = (serviceId) => {
    setSelectedSubServices(prev =>
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };

  const skillsList = ['Installation', 'Repair', 'Maintenance', 'Emergency Service'];
  const toggleSkill = (skill) => {
    setProviderData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleWorkingHourChange = (day, field, value) => {
    setProviderData(prev => ({
      ...prev,
      workingHours: prev.workingHours.map(wh =>
        wh.day === day ? { ...wh, [field]: value } : wh
      ),
    }));
  };

  const handleTimeChange = (day, slotIndex, field, value) => {
    setProviderData(prev => ({
      ...prev,
      workingHours: prev.workingHours.map(wh =>
        wh.day === day
          ? {
              ...wh,
              slots: wh.slots.map((slot, idx) =>
                idx === slotIndex ? { ...slot, [field]: value } : slot
              ),
            }
          : wh
      ),
    }));
  };

  // Error parser helper
  const parseBackendError = (err) => {
    // Validation error with fields (status 422)
    if (err.data && err.data.errors && Array.isArray(err.data.errors)) {
      const fieldErrors = {};
      err.data.errors.forEach(e => {
        if (e.field) fieldErrors[e.field] = e.message;
      });
      return { fieldErrors, generalMessage: err.data.message || 'Validation failed' };
    }
    // Multer file size error
    if (err.message && err.message.toLowerCase().includes('file too large')) {
      return { fieldErrors: {}, generalMessage: 'Image size should be less than 5MB. Please compress and try again.' };
    }
    return { fieldErrors: {}, generalMessage: err.message || 'Something went wrong. Please try again.' };
  };

  const handleProviderSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Client-side validations
    if (!providerData.fullName.trim()) {
      setError('Please enter your full name');
      setCurrentStep(2);
      setLoading(false);
      return;
    }
    if (!providerData.category) {
      setError('Please select a main service category');
      setCurrentStep(3);
      setLoading(false);
      return;
    }
    if (selectedSubServices.length === 0 && providerData.customServices.length === 0) {
      setError('Please select at least one sub‑service or add a custom service');
      setCurrentStep(3);
      setLoading(false);
      return;
    }
    if (!providerData.currentAddress.trim() || !providerData.city.trim() || !providerData.pincode.trim()) {
      setError('Please fill complete address details (Address, City, Pincode)');
      setCurrentStep(4);
      setLoading(false);
      return;
    }
    if (!providerData.accountHolderName.trim() || !providerData.bankName.trim() || !providerData.accountNumber.trim() || !providerData.ifscCode.trim()) {
      setError('Please fill all bank details (Account Holder, Bank Name, Account Number, IFSC)');
      setCurrentStep(6);
      setLoading(false);
      return;
    }
    if (!providerData.aadharFront && !providerData.panFront) {
      setError('Please upload at least Aadhaar Front or PAN card for KYC');
      setCurrentStep(5);
      setLoading(false);
      return;
    }

    console.log('📎 Files attached:', {
      avatar: !!providerData.avatar,
      aadharFront: !!providerData.aadharFront,
      aadharBack: !!providerData.aadharBack,
      panFront: !!providerData.panFront
    });

    try {
      const formData = new FormData();
      if (providerData.avatar) formData.append('avatar', providerData.avatar);
      formData.append('fullName', providerData.fullName);
      formData.append('dateOfBirth', providerData.dateOfBirth);
      formData.append('gender', providerData.gender);
      formData.append('bio', providerData.skills.join(', '));

      const allSubServiceIds = [...selectedSubServices, ...providerData.customServices.map(s => s._id)];
      const servicesPayload = [{ category: providerData.category, subServices: allSubServiceIds }];
      formData.append('services', JSON.stringify(servicesPayload));
      const experienceYears = parseInt(providerData.experience) || 0;
      formData.append('experience', JSON.stringify({ years: experienceYears, description: providerData.skills.join(', ') }));

      const serviceArea = {
        address: providerData.currentAddress,
        state: providerData.state,
        city: providerData.city,
        pincode: providerData.pincode,
        radius: 10,
        coordinates: {
          type: 'Point',
          coordinates: providerData.coordinates.lng && providerData.coordinates.lat
            ? [parseFloat(providerData.coordinates.lng), parseFloat(providerData.coordinates.lat)]
            : [0, 0]
        }
      };
      formData.append('serviceArea', JSON.stringify(serviceArea));
      formData.append('currentAddress', providerData.currentAddress);

      if (providerData.aadharFront) formData.append('aadharFront', providerData.aadharFront);
      if (providerData.aadharBack) formData.append('aadharBack', providerData.aadharBack);
      if (providerData.panFront) formData.append('panFront', providerData.panFront);

      formData.append('bankDetails', JSON.stringify({
        accountHolderName: providerData.accountHolderName,
        bankName: providerData.bankName,
        accountNumber: providerData.accountNumber,
        ifscCode: providerData.ifscCode,
        upiId: providerData.upiId || ''
      }));

      formData.append('workingHours', JSON.stringify(providerData.workingHours));
      formData.append('isAvailable', providerData.isAvailable);
      formData.append('emergencyServiceAvailable', providerData.emergencyServiceAvailable);
      formData.append('businessName', `${providerData.fullName}'s Services`);

      const res = await registerProvider(formData);
      if (res.success) {
        setSuccess(true);
        if (setUser) setUser(prev => ({ ...prev, role: 'provider' }));
        setTimeout(() => navigate('/provider'), 2000);
      } else {
        setError(res.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const { fieldErrors, generalMessage } = parseBackendError(err);
      
      if (Object.keys(fieldErrors).length > 0) {
        let step = null;
        let specificError = '';
        if (fieldErrors.fullName || fieldErrors.firstName || fieldErrors.lastName) {
          step = 2;
          specificError = fieldErrors.fullName || fieldErrors.firstName || fieldErrors.lastName || 'Please check your personal information.';
        } else if (fieldErrors.category || fieldErrors.services || fieldErrors.subServices) {
          step = 3;
          specificError = fieldErrors.category || fieldErrors.services || fieldErrors.subServices || 'Please select valid services.';
        } else if (fieldErrors.currentAddress || fieldErrors.city || fieldErrors.pincode) {
          step = 4;
          specificError = fieldErrors.currentAddress || fieldErrors.city || fieldErrors.pincode || 'Please fill complete address.';
        } else if (fieldErrors.aadharFront || fieldErrors.panFront || fieldErrors.documents) {
          step = 5;
          specificError = fieldErrors.aadharFront || fieldErrors.panFront || fieldErrors.documents || 'Please upload valid document images.';
        } else if (fieldErrors.accountHolderName || fieldErrors.bankName || fieldErrors.accountNumber || fieldErrors.ifscCode) {
          step = 6;
          specificError = fieldErrors.accountHolderName || fieldErrors.bankName || fieldErrors.accountNumber || fieldErrors.ifscCode || 'Please check your bank details.';
        } else {
          specificError = generalMessage;
        }
        if (step) setCurrentStep(step);
        setError(specificError);
      } else {
        setError(generalMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };
  const prevStep = () => {
    if (currentStep > 2) setCurrentStep(currentStep - 1);
  };

  // Render functions (unchanged but kept for completeness)
  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-emerald-600">
        <User size={24} />
        <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name *</label>
          <input type="text" value={providerData.fullName} onChange={e => setProviderData({...providerData, fullName: e.target.value})} className="w-full border rounded-lg px-4 py-2.5" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date of Birth</label>
          <input type="date" value={providerData.dateOfBirth} onChange={e => setProviderData({...providerData, dateOfBirth: e.target.value})} className="w-full border rounded-lg px-4 py-2.5" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Gender</label>
          <select value={providerData.gender} onChange={e => setProviderData({...providerData, gender: e.target.value})} className="w-full border rounded-lg px-4 py-2.5">
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Profile Photo</label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
            {providerData.avatarPreview ? (
              <div className="relative inline-block">
                <img src={providerData.avatarPreview} alt="Avatar" className="w-32 h-32 rounded-full object-cover mx-auto" />
                <button type="button" onClick={() => removeFile('avatar', 'avatarPreview')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => avatarInputRef.current?.click()} className="flex flex-col items-center gap-2 text-gray-500 hover:text-emerald-600 transition">
                <Upload size={24} />
                <span className="text-sm">Click to upload photo</span>
              </button>
            )}
            <input ref={avatarInputRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar', 'avatarPreview')} className="hidden" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderServiceDetails = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-emerald-600">
        <Briefcase size={24} />
        <h2 className="text-2xl font-bold text-gray-800">Service Details</h2>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Main Service Category *</label>
        <select value={providerData.category} onChange={e => setProviderData({...providerData, category: e.target.value})} className="w-full border rounded-lg px-4 py-2.5">
          <option value="">Select a category</option>
          {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
        </select>
      </div>
      {providerData.category && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Sub‑Services (Select from existing)</label>
            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto border rounded-lg p-3 bg-gray-50">
              {filteredSubServices.length === 0 ? (
                <p className="text-gray-500 text-sm col-span-2">No sub‑services available.</p>
              ) : (
                filteredSubServices.map(service => (
                  <label key={service._id} className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer">
                    <input type="checkbox" checked={selectedSubServices.includes(service._id)} onChange={() => toggleSubService(service._id)} className="w-4 h-4 text-emerald-600" />
                    <span>{service.name} (₹{service.basePrice})</span>
                  </label>
                ))
              )}
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Custom Services (Add your own)</label>
              <button type="button" onClick={() => setShowCustomServiceModal(true)} className="text-sm bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 flex items-center gap-1">
                <Plus size={14} /> Add Service
              </button>
            </div>
            {providerData.customServices.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500">No custom services added yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {providerData.customServices.map((svc, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border">
                    {svc.image ? <img src={svc.image} className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center"><FileText size={24} className="text-gray-400" /></div>}
                    <div className="flex-1"><p className="font-medium">{svc.name}</p><p className="text-emerald-600 font-semibold">₹{svc.price}</p></div>
                    <button type="button" onClick={() => removeCustomService(idx)} className="text-red-500 hover:bg-red-50 rounded-lg p-1"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Experience</label>
            <select value={providerData.experience} onChange={e => setProviderData({...providerData, experience: e.target.value})} className="w-full border rounded-lg px-4 py-2.5">
              <option value="">Select experience</option>
              <option value="1">0‑1 Year</option>
              <option value="2">1‑3 Years</option>
              <option value="4">3‑5 Years</option>
              <option value="6">5+ Years</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Skills</label>
            <div className="flex flex-wrap gap-3">
              {skillsList.map(skill => (
                <label key={skill} className="flex items-center gap-2">
                  <input type="checkbox" checked={providerData.skills.includes(skill)} onChange={() => toggleSkill(skill)} className="w-4 h-4 text-emerald-600" />
                  <span>{skill}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderLocationDetails = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-emerald-600">
        <MapPin size={24} />
        <h2 className="text-2xl font-bold text-gray-800">Location Details</h2>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Current Address *</label>
        <textarea rows={2} value={providerData.currentAddress} onChange={e => setProviderData({...providerData, currentAddress: e.target.value})} className="w-full border rounded-lg px-4 py-2.5" placeholder="House/Flat No., Street, Area" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div><label>State *</label><input type="text" value={providerData.state} onChange={e => setProviderData({...providerData, state: e.target.value})} className="w-full border rounded-lg px-4 py-2.5" /></div>
        <div><label>City *</label><input type="text" value={providerData.city} onChange={e => setProviderData({...providerData, city: e.target.value})} className="w-full border rounded-lg px-4 py-2.5" /></div>
        <div><label>Pincode *</label><input type="text" value={providerData.pincode} onChange={e => setProviderData({...providerData, pincode: e.target.value})} className="w-full border rounded-lg px-4 py-2.5" /></div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">GPS Location (Optional)</label>
        <button type="button" onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
              setProviderData(prev => ({ ...prev, coordinates: { lat: pos.coords.latitude, lng: pos.coords.longitude } }));
            });
          }
        }} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100">
          <MapPin size={18} /> Get Current Location
        </button>
        {providerData.coordinates.lat && <p className="text-xs text-gray-500 mt-1">Lat: {providerData.coordinates.lat}, Lng: {providerData.coordinates.lng}</p>}
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-emerald-600">
        <FileText size={24} />
        <h2 className="text-2xl font-bold text-gray-800">Required Documents</h2>
      </div>
      <div className="border rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-gray-800">Aadhaar Card</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>Front Side</label>
            <div className="border-2 border-dashed rounded-lg p-3 text-center mt-1">
              {providerData.aadharFrontPreview ? (
                <div className="relative inline-block"><img src={providerData.aadharFrontPreview} className="h-24 object-cover rounded" /><button type="button" onClick={() => removeFile('aadharFront', 'aadharFrontPreview')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12} /></button></div>
              ) : (
                <button type="button" onClick={() => aadharFrontInputRef.current?.click()} className="text-gray-500"><Upload size={20} /> Upload</button>
              )}
              <input ref={aadharFrontInputRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'aadharFront', 'aadharFrontPreview')} className="hidden" />
            </div>
          </div>
          <div>
            <label>Back Side</label>
            <div className="border-2 border-dashed rounded-lg p-3 text-center mt-1">
              {providerData.aadharBackPreview ? (
                <div className="relative inline-block"><img src={providerData.aadharBackPreview} className="h-24 object-cover rounded" /><button type="button" onClick={() => removeFile('aadharBack', 'aadharBackPreview')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12} /></button></div>
              ) : (
                <button type="button" onClick={() => aadharBackInputRef.current?.click()} className="text-gray-500"><Upload size={20} /> Upload</button>
              )}
              <input ref={aadharBackInputRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'aadharBack', 'aadharBackPreview')} className="hidden" />
            </div>
          </div>
        </div>
      </div>
      <div className="border rounded-xl p-5">
        <h3 className="font-semibold text-gray-800">PAN Card</h3>
        <div className="mt-2">
          <div className="border-2 border-dashed rounded-lg p-3 text-center">
            {providerData.panFrontPreview ? (
              <div className="relative inline-block"><img src={providerData.panFrontPreview} className="h-24 object-cover rounded" /><button type="button" onClick={() => removeFile('panFront', 'panFrontPreview')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12} /></button></div>
            ) : (
              <button type="button" onClick={() => panFrontInputRef.current?.click()} className="text-gray-500"><Upload size={20} /> Upload Front Side</button>
            )}
            <input ref={panFrontInputRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'panFront', 'panFrontPreview')} className="hidden" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderBankDetails = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-emerald-600">
        <CreditCard size={24} />
        <h2 className="text-2xl font-bold text-gray-800">Bank Details (For Withdrawals)</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div><label>Account Holder Name *</label><input value={providerData.accountHolderName} onChange={e => setProviderData({...providerData, accountHolderName: e.target.value})} className="w-full border rounded-lg px-4 py-2.5" /></div>
        <div><label>Bank Name *</label><input value={providerData.bankName} onChange={e => setProviderData({...providerData, bankName: e.target.value})} className="w-full border rounded-lg px-4 py-2.5" /></div>
        <div><label>Account Number *</label><input type="number" value={providerData.accountNumber} onChange={e => setProviderData({...providerData, accountNumber: e.target.value})} className="w-full border rounded-lg px-4 py-2.5" /></div>
        <div><label>IFSC Code *</label><input value={providerData.ifscCode} onChange={e => setProviderData({...providerData, ifscCode: e.target.value})} className="w-full border rounded-lg px-4 py-2.5" /></div>
        <div><label>UPI ID (Optional)</label><input value={providerData.upiId} onChange={e => setProviderData({...providerData, upiId: e.target.value})} className="w-full border rounded-lg px-4 py-2.5" placeholder="example@upi" /></div>
      </div>
    </div>
  );

  const renderWorkSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-emerald-600">
        <Clock size={24} />
        <h2 className="text-2xl font-bold text-gray-800">Work Settings</h2>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Availability</label>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setProviderData({...providerData, isAvailable: true})} className={`px-4 py-2 rounded-lg flex items-center gap-2 ${providerData.isAvailable ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Online</button>
          <button type="button" onClick={() => setProviderData({...providerData, isAvailable: false})} className={`px-4 py-2 rounded-lg flex items-center gap-2 ${!providerData.isAvailable ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Offline</button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Working Hours</label>
        <div className="space-y-3">
          {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => {
            const wh = providerData.workingHours.find(w => w.day === day);
            return (
              <div key={day} className="flex flex-wrap items-center gap-3 border-b pb-2">
                <div className="w-24 font-medium capitalize">{day}</div>
                <label className="flex items-center gap-2"><input type="checkbox" checked={wh.isWorking} onChange={e => handleWorkingHourChange(day, 'isWorking', e.target.checked)} /> Open</label>
                {wh.isWorking && (
                  <div className="flex items-center gap-2">
                    <input type="time" value={wh.slots[0]?.startTime || '09:00'} onChange={e => handleTimeChange(day, 0, 'startTime', e.target.value)} className="border rounded px-2 py-1" />
                    <span>–</span>
                    <input type="time" value={wh.slots[0]?.endTime || '18:00'} onChange={e => handleTimeChange(day, 0, 'endTime', e.target.value)} className="border rounded px-2 py-1" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Emergency Service Available</label>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setProviderData({...providerData, emergencyServiceAvailable: true})} className={`px-4 py-2 rounded-lg ${providerData.emergencyServiceAvailable ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Yes</button>
          <button type="button" onClick={() => setProviderData({...providerData, emergencyServiceAvailable: false})} className={`px-4 py-2 rounded-lg ${!providerData.emergencyServiceAvailable ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}>No</button>
        </div>
      </div>
    </div>
  );

  // Custom service modal with improved error display and image size check
  const customServiceModal = showCustomServiceModal && (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Add Custom Service</h3>
          <button onClick={() => setShowCustomServiceModal(false)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
        </div>
        {customServiceError && (
          <div className="mb-4 p-2 bg-red-50 text-red-700 rounded text-sm flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{customServiceError}</span>
          </div>
        )}
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Service Name *</label><input type="text" value={customServiceName} onChange={e => setCustomServiceName(e.target.value)} className="w-full border rounded-lg px-4 py-2" /></div>
          <div><label className="block text-sm font-medium mb-1">Price (₹) *</label><input type="number" step="1" value={customServicePrice} onChange={e => setCustomServicePrice(e.target.value)} className="w-full border rounded-lg px-4 py-2" /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea rows="2" value={customServiceDescription} onChange={e => setCustomServiceDescription(e.target.value)} className="w-full border rounded-lg px-4 py-2" /></div>
          <div><label className="block text-sm font-medium mb-1">Service Image (max 5MB)</label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              {customServiceImagePreview ? (
                <div className="relative inline-block"><img src={customServiceImagePreview} className="w-32 h-32 object-cover rounded-lg" /><button type="button" onClick={() => { URL.revokeObjectURL(customServiceImagePreview); setCustomServiceImage(null); setCustomServiceImagePreview(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={14} /></button></div>
              ) : (
                <button type="button" onClick={() => customFileInputRef.current?.click()} className="flex flex-col items-center gap-2 text-gray-500"><Upload size={24} /><span>Click to upload</span></button>
              )}
              <input ref={customFileInputRef} type="file" accept="image/*" onChange={(e) => { 
                const file = e.target.files[0]; 
                if (file) {
                  if (file.size > 5 * 1024 * 1024) {
                    setCustomServiceError('Image size must be less than 5MB. Please compress.');
                    e.target.value = '';
                    return;
                  }
                  setCustomServiceImage(file); 
                  setCustomServiceImagePreview(URL.createObjectURL(file)); 
                  setCustomServiceError('');
                } 
              }} className="hidden" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setShowCustomServiceModal(false); resetCustomServiceForm(); }} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
            <button onClick={handleCreateCustomService} disabled={creatingCustomService} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center justify-center gap-2">
              {creatingCustomService ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Early returns (already a provider, success)
  if (user?.role === 'provider') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">You are already a provider</h2>
          <Link to="/provider" className="text-emerald-600 hover:underline">Go to your dashboard</Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2">Registration Submitted!</h2>
          <p className="text-gray-600 mb-4">Your application is under review. You will be notified once verified.</p>
          <Link to="/" className="bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-700 transition">Go Home</Link>
        </div>
      </div>
    );
  }

  // Step 1: User registration
  if (!user && step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create an Account</h1>
            <p className="text-gray-600 mt-2">Join as a service provider</p>
          </div>
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
          <form onSubmit={handleUserSubmit} className="bg-white shadow-lg rounded-2xl p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="First Name" value={userForm.firstName} onChange={e => setUserForm({...userForm, firstName: e.target.value})} className="border rounded-lg px-3 py-2" required />
              <input type="text" placeholder="Last Name" value={userForm.lastName} onChange={e => setUserForm({...userForm, lastName: e.target.value})} className="border rounded-lg px-3 py-2" required />
            </div>
            <input type="email" placeholder="Email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
            <input type="tel" placeholder="Phone (10 digits)" value={userForm.phone} onChange={e => setUserForm({...userForm, phone: e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
            <input type="password" placeholder="Password (min 8 chars)" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
            <input type="password" placeholder="Confirm Password" value={userForm.confirmPassword} onChange={e => setUserForm({...userForm, confirmPassword: e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
            <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50">
              {loading ? 'Creating account...' : 'Continue'}
            </button>
            <p className="text-center text-sm text-gray-500">Already have an account? <Link to="/login" className="text-emerald-600">Login</Link></p>
          </form>
        </div>
      </div>
    );
  }

  // Step 2–7: Provider Registration
  const steps = [2, 3, 4, 5, 6, 7];
  const stepTitles = ['Personal Info', 'Service Details', 'Location', 'Documents', 'Bank Details', 'Work Settings'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900">Become a Professional</h1>
          <p className="text-gray-600 mt-2">
            Step {steps.indexOf(currentStep) + 1} of {totalSteps - 1}: {stepTitles[steps.indexOf(currentStep)]}
          </p>
        </div>

        {error && <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md">{error}</div>}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleProviderSubmit}>
              {currentStep === 2 && renderPersonalInfo()}
              {currentStep === 3 && renderServiceDetails()}
              {currentStep === 4 && renderLocationDetails()}
              {currentStep === 5 && renderDocuments()}
              {currentStep === 6 && renderBankDetails()}
              {currentStep === 7 && renderWorkSettings()}

              <div className="flex justify-between mt-8 pt-4 border-t">
                {currentStep > 2 && (
                  <button type="button" onClick={prevStep} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition flex items-center gap-2">
                    <ChevronLeft size={18} /> Previous
                  </button>
                )}
                {currentStep < totalSteps ? (
                  <button type="button" onClick={nextStep} className="ml-auto px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition flex items-center gap-2">
                    Next <ChevronRight size={18} />
                  </button>
                ) : (
                  <button type="submit" disabled={loading} className="ml-auto px-8 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition flex items-center gap-2">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                    {loading ? 'Submitting...' : 'Submit Registration'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      {customServiceModal}
    </div>
  );
};

export default RegisterProvider;