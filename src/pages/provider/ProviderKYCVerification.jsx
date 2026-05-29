// src/pages/provider/ProviderKYCVerification.jsx

import { useState, useEffect } from 'react';
import { 
  Upload, CheckCircle, XCircle, AlertTriangle, Loader2,
  IdCard, CreditCard, Clock, Shield, Camera, Trash2, Info,
  ChevronRight, FileCheck, FileWarning, Globe, Lock
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
      console.error(err);
      setMessage('Failed to load verification status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (type, side, file) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setMessage('Please upload an image file (JPEG, PNG)', 'error');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setMessage('File size should be less than 5MB', 'error');
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
    const hasAadharFront = documents.aadhar.frontFile || documents.aadhar.frontUrl;
    const hasPanFront = documents.pan.frontFile || documents.pan.frontUrl;
    
    if (!hasAadharFront && !hasPanFront) {
      setMessage('Please upload at least Aadhaar card (front side) or PAN card', 'error');
      return;
    }
    
    setUploading(true);
    setMessage('');
    setMessageType('');
    
    try {
      const formData = new FormData();
      
      if (documents.aadhar.frontFile) formData.append('aadharFront', documents.aadhar.frontFile);
      if (documents.aadhar.backFile) formData.append('aadharBack', documents.aadhar.backFile);
      if (documents.pan.frontFile) formData.append('panFront', documents.pan.frontFile);
      if (documents.aadhar.number) formData.append('aadharNumber', documents.aadhar.number);
      if (documents.pan.number) formData.append('panNumber', documents.pan.number);
      
      const res = await uploadProviderKYCDocuments(formData);
      
      if (res.success) {
        setMessage('Documents uploaded successfully! Verification pending.', 'success');
        loadVerificationStatus();
        setDocuments({
          aadhar: { frontFile: null, frontPreview: null, backFile: null, backPreview: null, number: '', frontUrl: null, backUrl: null },
          pan: { frontFile: null, frontPreview: null, number: '', frontUrl: null }
        });
      } else {
        setMessage(res.message || 'Upload failed. Please try again.', 'error');
      }
    } catch (err) {
      setMessage(err.message || 'Upload failed. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = () => {
    if (!verificationStatus) return null;
    
    const status = verificationStatus.verificationStatus;
    const hasAadhaar = verificationStatus.hasAadhaar;
    const hasPAN = verificationStatus.hasPAN;
    const isFullyVerified = verificationStatus.isFullyVerified;
    
    if (status === 'verified') {
      if (isFullyVerified) {
        return (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-green-800 flex items-center gap-2">
                  KYC Fully Verified ✓
                  <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">Trusted Provider</span>
                </h4>
                <p className="text-sm text-green-700 mt-1">Your Aadhaar and PAN are verified. You have full access to all features.</p>
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <FileWarning className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-800">Partially Verified</h4>
                <p className="text-sm text-yellow-700 mt-1">Your KYC is partially verified. Please upload remaining documents for full access.</p>
              </div>
            </div>
          </div>
        );
      }
    } else if (status === 'rejected') {
      return (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-red-800">KYC Rejected</h4>
              <p className="text-sm text-red-700 mt-1">{verificationStatus.verificationNote || 'Please upload clear and valid documents.'}</p>
            </div>
          </div>
        </div>
      );
    } else if (status === 'under_review') {
      return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-800">Documents Under Review</h4>
              <p className="text-sm text-blue-700 mt-1">Our team is reviewing your documents. You will be notified once verified.</p>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <FileCheck className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">KYC Pending</h4>
              <p className="text-sm text-gray-600 mt-1">Please upload your KYC documents to start accepting bookings and withdraw earnings.</p>
            </div>
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500">Loading verification status...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Shield className="w-6 h-6 text-emerald-600" />
          KYC Verification
        </h1>
        <p className="text-gray-500 mt-1">Complete your identity verification to unlock all provider features</p>
      </div>

      {/* Status Banner */}
      {getStatusBadge()}

      {/* Message Toast */}
      {message && (
        <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-200 ${
          messageType === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          {messageType === 'error' ? <XCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mt-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('aadhar')}
          className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
            activeTab === 'aadhar' 
              ? 'bg-white text-emerald-600 border-b-2 border-emerald-600 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <CreditCard className="w-4 h-4 inline mr-2" />
          Aadhaar Card
          {verificationStatus?.documents?.aadhar?.isVerified && (
            <CheckCircle className="w-3.5 h-3.5 inline ml-1.5 text-green-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('pan')}
          className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
            activeTab === 'pan' 
              ? 'bg-white text-emerald-600 border-b-2 border-emerald-600 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <IdCard className="w-4 h-4 inline mr-2" />
          PAN Card
          {verificationStatus?.documents?.pan?.isVerified && (
            <CheckCircle className="w-3.5 h-3.5 inline ml-1.5 text-green-500" />
          )}
        </button>
      </div>

      {/* Aadhaar Card Section */}
      {activeTab === 'aadhar' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-4">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Aadhaar Card</h3>
                <p className="text-xs text-gray-500">Upload front and back side (optional)</p>
              </div>
            </div>
            {verificationStatus?.documents?.aadhar?.isVerified && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                <CheckCircle className="w-3.5 h-3.5" />
                Verified
              </span>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Front Side */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Front Side *</label>
              {(documents.aadhar.frontPreview || documents.aadhar.frontUrl) ? (
                <div className="relative group">
                  <img 
                    src={documents.aadhar.frontPreview || documents.aadhar.frontUrl} 
                    alt="Aadhaar Front"
                    className="w-full h-40 object-cover rounded-xl border border-gray-200 shadow-sm"
                  />
                  <button
                    onClick={() => removeFile('aadhar', 'front')}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all block">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileSelect('aadhar', 'front', e.target.files[0]);
                      }
                    }}
                  />
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Click to upload</p>
                  <p className="text-xs text-gray-400 mt-1">JPEG, PNG (max 5MB)</p>
                </label>
              )}
            </div>

            {/* Back Side */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Back Side (Optional)</label>
              {(documents.aadhar.backPreview || documents.aadhar.backUrl) ? (
                <div className="relative group">
                  <img 
                    src={documents.aadhar.backPreview || documents.aadhar.backUrl} 
                    alt="Aadhaar Back"
                    className="w-full h-40 object-cover rounded-xl border border-gray-200 shadow-sm"
                  />
                  <button
                    onClick={() => removeFile('aadhar', 'back')}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all block">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileSelect('aadhar', 'back', e.target.files[0]);
                      }
                    }}
                  />
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Click to upload (back side)</p>
                </label>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number (Optional)</label>
            <input
              type="text"
              placeholder="XXXX XXXX XXXX"
              value={documents.aadhar.number}
              onChange={(e) => setDocuments(prev => ({ 
                ...prev, 
                aadhar: { ...prev.aadhar, number: e.target.value } 
              }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-400 mt-1">Helps speed up verification</p>
          </div>
        </div>
      )}

      {/* PAN Card Section */}
      {activeTab === 'pan' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-4">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                <IdCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">PAN Card</h3>
                <p className="text-xs text-gray-500">Upload front side of PAN card</p>
              </div>
            </div>
            {verificationStatus?.documents?.pan?.isVerified && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                <CheckCircle className="w-3.5 h-3.5" />
                Verified
              </span>
            )}
          </div>

          {(documents.pan.frontPreview || documents.pan.frontUrl) ? (
            <div className="relative group">
              <img 
                src={documents.pan.frontPreview || documents.pan.frontUrl} 
                alt="PAN Card"
                className="w-full h-48 object-cover rounded-xl border border-gray-200 shadow-sm"
              />
              <button
                onClick={() => removeFile('pan', 'front')}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all block">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileSelect('pan', 'front', e.target.files[0]);
                  }
                }}
              />
              <Camera className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Click to upload PAN card</p>
              <p className="text-xs text-gray-400 mt-1">JPEG, PNG (max 5MB)</p>
            </label>
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number (Optional)</label>
            <input
              type="text"
              placeholder="ABCDE1234F"
              value={documents.pan.number}
              onChange={(e) => setDocuments(prev => ({ 
                ...prev, 
                pan: { ...prev.pan, number: e.target.value.toUpperCase() } 
              }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm uppercase focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              maxLength={10}
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={uploading || verificationStatus?.verificationStatus === 'verified' || verificationStatus?.verificationStatus === 'under_review'}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading...' : 'Submit Documents'}
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Info className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-800">Why KYC is required?</h4>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              KYC verification is mandatory for all service providers on GharSeva platform. 
              This helps us maintain a trusted marketplace and ensure customer safety. 
              Once verified, you can start accepting bookings, withdraw earnings, and access all provider features.
            </p>
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Data encrypted</span>
              <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Trusted platform</span>
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure verification</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderKYCVerification;