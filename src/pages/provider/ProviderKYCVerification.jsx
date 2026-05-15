// src/pages/provider/ProviderKYCVerification.jsx

import { useState, useEffect } from 'react';
import { 
  Upload, CheckCircle, XCircle, AlertTriangle, Loader2,
  IdCard, CreditCard, Clock, Shield,
  Camera, Trash2, Check, Ban, Info
} from 'lucide-react';
import { uploadProviderKYCDocuments, fetchProviderVerificationStatus } from '../../services/api';

const ProviderKYCVerification = () => {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [documents, setDocuments] = useState({
    aadhar: { 
      frontFile: null, frontPreview: null, frontUrl: null,
      backFile: null, backPreview: null, backUrl: null,
      number: '' 
    },
    pan: { 
      frontFile: null, frontPreview: null, frontUrl: null,
      number: '' 
    }
  });
  const [activeTab, setActiveTab] = useState('aadhar');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    loadVerificationStatus();
  }, []);

  const loadVerificationStatus = async () => {
    setLoading(true);
    try {
      const res = await fetchProviderVerificationStatus();
      console.log('Verification Status:', res);
      if (res.success) {
        setVerificationStatus(res.data);
        if (res.data.documents) {
          setDocuments(prev => ({
            aadhar: { 
              ...prev.aadhar, 
              frontUrl: res.data.documents.aadhar?.frontImage?.url,
              backUrl: res.data.documents.aadhar?.backImage?.url,
              number: res.data.documents.aadhar?.documentNumber || '' 
            },
            pan: { 
              ...prev.pan, 
              frontUrl: res.data.documents.pan?.frontImage?.url,
              number: res.data.documents.pan?.documentNumber || '' 
            }
          }));
        }
      }
    } catch (err) {
      console.error('Error loading status:', err);
      setMessage('Failed to load verification status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (type, side, file) => {
    if (!file) return;
    
    console.log(`Selected file for ${type} ${side}:`, file.name);
    
    if (!file.type.startsWith('image/')) {
      setMessage('Please upload an image file (JPEG, PNG)');
      setMessageType('error');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setMessage('File size should be less than 5MB');
      setMessageType('error');
      return;
    }
    
    const preview = URL.createObjectURL(file);
    
    if (type === 'aadhar') {
      setDocuments(prev => ({
        ...prev,
        aadhar: { 
          ...prev.aadhar, 
          [`${side}File`]: file, 
          [`${side}Preview`]: preview,
          [`${side}Url`]: null 
        }
      }));
    } else if (type === 'pan') {
      setDocuments(prev => ({
        ...prev,
        pan: { 
          ...prev.pan, 
          frontFile: file, 
          frontPreview: preview,
          frontUrl: null 
        }
      }));
    }
    
    setMessage('');
    setMessageType('');
  };

  const removeFile = (type, side) => {
    if (type === 'aadhar') {
      setDocuments(prev => ({
        ...prev,
        aadhar: { 
          ...prev.aadhar, 
          [`${side}File`]: null, 
          [`${side}Preview`]: null,
          [`${side}Url`]: null 
        }
      }));
    } else if (type === 'pan') {
      setDocuments(prev => ({
        ...prev,
        pan: { 
          ...prev.pan, 
          frontFile: null, 
          frontPreview: null,
          frontUrl: null 
        }
      }));
    }
  };

  const handleSubmit = async () => {
    console.log('Submit button clicked');
    
    const hasAadharFront = documents.aadhar.frontFile || documents.aadhar.frontUrl;
    const hasPanFront = documents.pan.frontFile || documents.pan.frontUrl;
    
    if (!hasAadharFront && !hasPanFront) {
      setMessage('Please upload at least Aadhaar card (front side) or PAN card');
      setMessageType('error');
      return;
    }
    
    setUploading(true);
    setMessage('');
    setMessageType('');
    
    try {
      const formData = new FormData();
      
      if (documents.aadhar.frontFile) {
        console.log('Adding Aadhaar front file:', documents.aadhar.frontFile.name);
        formData.append('aadharFront', documents.aadhar.frontFile);
      }
      if (documents.aadhar.backFile) {
        console.log('Adding Aadhaar back file:', documents.aadhar.backFile.name);
        formData.append('aadharBack', documents.aadhar.backFile);
      }
      if (documents.pan.frontFile) {
        console.log('Adding PAN front file:', documents.pan.frontFile.name);
        formData.append('panFront', documents.pan.frontFile);
      }
      if (documents.aadhar.number) {
        formData.append('aadharNumber', documents.aadhar.number);
      }
      if (documents.pan.number) {
        formData.append('panNumber', documents.pan.number);
      }
      
      console.log('FormData entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
      
      const res = await uploadProviderKYCDocuments(formData);
      console.log('Upload response:', res);
      
      if (res.success) {
        setMessage('Documents uploaded successfully! Verification pending.');
        setMessageType('success');
        loadVerificationStatus();
        setDocuments({
          aadhar: { frontFile: null, frontPreview: null, backFile: null, backPreview: null, number: '', frontUrl: null, backUrl: null },
          pan: { frontFile: null, frontPreview: null, number: '', frontUrl: null }
        });
      } else {
        setMessage(res.message || 'Upload failed. Please try again.');
        setMessageType('error');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setMessage(err.message || 'Upload failed. Please try again.');
      setMessageType('error');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = () => {
    if (!verificationStatus) return null;
    
    const status = verificationStatus.verificationStatus;
    const hasAadhaar = verificationStatus.hasAadhaar;
    const hasPAN = verificationStatus.hasPAN;
    
    if (status === 'verified') {
      if (hasAadhaar && hasPAN) {
        return (
          <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} />
            <div>
              <p className="font-medium">KYC Fully Verified ✓</p>
              <p className="text-sm">Your Aadhaar and PAN cards are verified. You have full access.</p>
            </div>
          </div>
        );
      } else {
        return (
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertTriangle size={20} />
            <div>
              <p className="font-medium">Partially Verified</p>
              <p className="text-sm">Your KYC is partially verified. Please upload remaining documents.</p>
            </div>
          </div>
        );
      }
    } else if (status === 'rejected') {
      return (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <XCircle size={20} />
          <div>
            <p className="font-medium">KYC Rejected</p>
            <p className="text-sm">{verificationStatus.verificationNote || 'Please upload clear documents.'}</p>
          </div>
        </div>
      );
    } else if (status === 'under_review') {
      return (
        <div className="bg-blue-100 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <Clock size={20} />
          <div>
            <p className="font-medium">Documents Under Review</p>
            <p className="text-sm">Your documents are being reviewed by admin.</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertTriangle size={20} />
          <div>
            <p className="font-medium">KYC Pending</p>
            <p className="text-sm">Please upload your KYC documents to start accepting bookings.</p>
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-gray-500">Loading verification status...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">KYC Verification</h1>
      <p className="text-gray-500 mb-6">Upload your documents to get verified and start accepting bookings</p>
      
      {/* Status Banner */}
      {getStatusBadge()}
      
      {/* Message */}
      {message && (
        <div className={`mt-4 p-3 rounded-lg ${messageType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
      
      {/* Tabs */}
      <div className="flex gap-2 mt-6 border-b">
        <button
          onClick={() => setActiveTab('aadhar')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'aadhar' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500'}`}
        >
          <CreditCard size={16} className="inline mr-2" />
          Aadhaar Card
        </button>
        <button
          onClick={() => setActiveTab('pan')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'pan' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500'}`}
        >
          <IdCard size={16} className="inline mr-2" />
          PAN Card
        </button>
      </div>
      
      {/* Aadhaar Card Upload Section */}
      {activeTab === 'aadhar' && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <CreditCard size={20} className="text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Aadhaar Card</h3>
                <p className="text-xs text-gray-500">Upload front and back side of Aadhaar card</p>
              </div>
            </div>
            {verificationStatus?.documents?.aadhar?.isVerified && (
              <span className="text-green-600 text-xs flex items-center gap-1">
                <CheckCircle size={14} /> Verified
              </span>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Front Side */}
            <div>
              <label className="block text-sm font-medium mb-2">Front Side *</label>
              {(documents.aadhar.frontPreview || documents.aadhar.frontUrl) ? (
                <div className="relative">
                  <img 
                    src={documents.aadhar.frontPreview || documents.aadhar.frontUrl} 
                    alt="Aadhaar Front"
                    className="w-full h-40 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => removeFile('aadhar', 'front')}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-orange-500 transition-colors block">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect('aadhar', 'front', e.target.files[0]);
                      }
                    }}
                  />
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Upload front side</p>
                </label>
              )}
            </div>
            
            {/* Back Side */}
            <div>
              <label className="block text-sm font-medium mb-2">Back Side (Optional)</label>
              {(documents.aadhar.backPreview || documents.aadhar.backUrl) ? (
                <div className="relative">
                  <img 
                    src={documents.aadhar.backPreview || documents.aadhar.backUrl} 
                    alt="Aadhaar Back"
                    className="w-full h-40 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => removeFile('aadhar', 'back')}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-orange-500 transition-colors block">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect('aadhar', 'back', e.target.files[0]);
                      }
                    }}
                  />
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Upload back side</p>
                </label>
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Aadhaar Number (Optional)</label>
            <input
              type="text"
              placeholder="XXXX XXXX XXXX"
              value={documents.aadhar.number}
              onChange={(e) => setDocuments(prev => ({ 
                ...prev, 
                aadhar: { ...prev.aadhar, number: e.target.value } 
              }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
      )}
      
      {/* PAN Card Upload Section */}
      {activeTab === 'pan' && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <IdCard size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">PAN Card</h3>
                <p className="text-xs text-gray-500">Upload front side of PAN card</p>
              </div>
            </div>
            {verificationStatus?.documents?.pan?.isVerified && (
              <span className="text-green-600 text-xs flex items-center gap-1">
                <CheckCircle size={14} /> Verified
              </span>
            )}
          </div>
          
          {(documents.pan.frontPreview || documents.pan.frontUrl) ? (
            <div className="relative">
              <img 
                src={documents.pan.frontPreview || documents.pan.frontUrl} 
                alt="PAN Card"
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
              />
              <button
                onClick={() => removeFile('pan', 'front')}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors block">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect('pan', 'front', e.target.files[0]);
                  }
                }}
              />
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Click to upload PAN card</p>
              <p className="text-xs text-gray-400 mt-1">JPEG, PNG (Max 5MB)</p>
            </label>
          )}
          
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">PAN Number (Optional)</label>
            <input
              type="text"
              placeholder="ABCDE1234F"
              value={documents.pan.number}
              onChange={(e) => setDocuments(prev => ({ 
                ...prev, 
                pan: { ...prev.pan, number: e.target.value } 
              }))}
              className="w-full border rounded-lg px-3 py-2 text-sm uppercase"
              maxLength={10}
            />
          </div>
        </div>
      )}
      
      {/* Submit Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={uploading || verificationStatus?.verificationStatus === 'verified' || verificationStatus?.verificationStatus === 'under_review'}
          className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
        >
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
          {uploading ? 'Uploading...' : 'Submit Documents'}
        </button>
      </div>
      
      {/* Info Box */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-700">Why KYC is required?</p>
            <p className="text-xs text-gray-500 mt-1">
              KYC verification is mandatory for all service providers on GharSeva platform. 
              This helps us ensure the safety and trust of our customers. 
              Once verified, you can start accepting bookings and withdraw your earnings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderKYCVerification;