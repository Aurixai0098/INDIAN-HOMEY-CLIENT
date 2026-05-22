// src/components/InfiniteProvidersMarquee.jsx
import { useState, useEffect, useRef } from 'react';
import { Star, CheckCircle, Briefcase, DollarSign,Clock, Award, MapPin, Wifi } from 'lucide-react';

const ProviderCard = ({ provider }) => {
    const fullStars = Math.floor(provider.rating);
    const hasHalfStar = provider.rating % 1 >= 0.5;
    const ratingDisplay = provider.rating.toFixed(1);

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 w-72 flex-shrink-0 mx-3 hover:shadow-xl transition-all duration-300">
            <div className="p-5">
                {/* Avatar & Name */}
                <div className="flex items-center gap-3 mb-3">
                    <img 
                        src={provider.avatar} 
                        alt={provider.businessName}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-100"
                    />
                    <div className="flex-1">
                        <h4 className="font-bold text-gray-800 text-base">{provider.businessName}</h4>
                        <div className="flex items-center gap-1">
                            <div className="flex text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className="text-sm">
                                        {i < fullStars ? '★' : (i === fullStars && hasHalfStar ? '½' : '☆')}
                                    </span>
                                ))}
                            </div>
                            <span className="text-xs text-gray-500 ml-1">{ratingDisplay} ({provider.reviewCount} reviews)</span>
                        </div>
                    </div>
                </div>

                {/* Status badges */}
                <div className="flex items-center gap-2 mb-3">
                    {provider.isOnline ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            <Wifi className="w-3 h-3" /> Available
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" /> Offline
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-sm border-t border-gray-100 pt-3 mt-2">
                    <div className="flex items-center gap-1 text-gray-600">
                        <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{provider.completedJobs} Completed</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                        <span>₹{provider.totalEarnings.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 col-span-2">
                        <Award className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{provider.experienceYears}+ Years Exp.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfiniteProvidersMarquee = () => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollContainerRef = useRef(null);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const fetchProviders = async () => {
            try {
                const res = await fetch('/api/v1/providers/featured?limit=30');
                const data = await res.json();
                if (data.success) {
                    // Duplicate array for seamless infinite loop
                    setProviders([...data.data.providers, ...data.data.providers, ...data.data.providers]);
                }
            } catch (err) {
                console.error("Failed to load providers:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProviders();
    }, []);

    useEffect(() => {
        if (loading || providers.length === 0) return;
        const container = scrollContainerRef.current;
        let animationId;
        let scrollPos = 0;
        const speed = 0.8; // pixels per frame

        const step = () => {
            if (!isPaused && container) {
                scrollPos += speed;
                if (scrollPos >= container.scrollWidth / 3) {
                    scrollPos = 0;
                }
                container.scrollLeft = scrollPos;
            }
            animationId = requestAnimationFrame(step);
        };
        animationId = requestAnimationFrame(step);
        return () => cancelAnimationFrame(animationId);
    }, [loading, providers, isPaused]);

    if (loading) {
        return (
            <div className="py-12 text-center">
                <div className="animate-pulse flex justify-center gap-4">
                    {[1,2,3].map(i => (
                        <div key={i} className="w-72 h-64 bg-gray-100 rounded-2xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (providers.length === 0) return null;

    return (
        <div className="w-full overflow-hidden py-8 bg-gray-50">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Our Trusted Professionals</h2>
                <p className="text-gray-500">Skilled experts ready to serve you</p>
            </div>
            <div 
                ref={scrollContainerRef}
                className="flex overflow-x-auto scrollbar-hide cursor-grab"
                style={{ scrollBehavior: 'smooth' }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <div className="flex py-4">
                    {providers.map((provider, idx) => (
                        <ProviderCard key={idx} provider={provider} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InfiniteProvidersMarquee;