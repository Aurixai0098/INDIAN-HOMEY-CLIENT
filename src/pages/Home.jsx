import React, { useRef  , useState , useEffect} from 'react';

const categories = [
  { name: 'Air Conditioner', icon: '❄️' },
  { name: 'Beauty salon', icon: '💄' },
  { name: 'Refrigerator', icon: '🧊' },
  { name: 'Geyser', icon: '🚿' },
  { name: 'Cleaning', icon: '🧹' },
  { name: 'Washing machine', icon: '🧺' },
  { name: 'Microwave oven', icon: '🍲' },
  { name: 'Water purifier', icon: '💧' },
];

const reviews = [
  {
    id: 1,
    name: "Rajat Jangra",
    date: "24/04/2026",
    rating: 5,
    comment: "Excellent service! The plumber arrived on time and fixed the leakage perfectly. Highly recommended for home services.",
    image: "https://ui-avatars.com/api/?name=Rajat+Jangra&background=10b981&color=fff"
  },
  {
    id: 2,
    name: "Rahul Rao",
    date: "20/03/2026",
    rating: 5,
    comment: "AC servicing was very professional. They cleaned everything and checked for gas leaks too. Very satisfied.",
    image: "https://ui-avatars.com/api/?name=Rahul+Rao&background=3b82f6&color=fff"
  },
  {
    id: 3,
    name: "Amit Kumar",
    date: "15/02/2026",
    rating: 4,
    comment: "The cleaning team did a great job with the deep cleaning of my kitchen. It looks brand new now.",
    image: "https://ui-avatars.com/api/?name=Amit+Kumar&background=f59e0b&color=fff"
  },
  {
    id: 4,
    name: "Sandeep Saini",
    date: "10/01/2026",
    rating: 5,
    comment: "Best platform for local experts. I booked an electrician for wiring work and he was very skilled.",
    image: "https://ui-avatars.com/api/?name=Sandeep+Saini&background=ef4444&color=fff"
  }
];

// Slider Images for the main banner
const sliderImages = [
  "https://www.urbancompany.com/img?bucket=urbanclap-prod&quality=90&format=auto/w_1232,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/supply/customer-app-supply/1778178479978-7aada8.jpeg",
  "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=1200&h=400&fit=crop"
];

export default function Home() {
  const scrollRef = useRef(null);
  const categoryRef = useRef(null);
  const reviewRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);


  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 350;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };




  // Auto-slide logic for Image Slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === sliderImages.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const scrollContainer = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 350;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* 1. Hero Section (Pehle wala) */}
      <section className="relative bg-[#10b981] pt-12 pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center relative z-10">
          <div className="md:w-1/2 text-white space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">Expert Professional <br /> Home Services, <br /> Book Online</h1>
            <p className="text-lg opacity-90 max-w-md">Service On Wheel helps you live smarter, giving you time to focus on what's most important.</p>
            <button className="bg-white text-gray-800 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition shadow-lg">Contact Us</button>
          </div>
          <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center relative">
            <img src="https://www.serviceonwheel.com/images/banner-clean.png" alt="Cleaning Service" className="w-full max-w-md drop-shadow-2xl" />
          </div>
        </div>
      </section>

      {/* 2. IMAGE SLIDER SECTION */}
      <section className="relative -mt-72  px-6 z-20">
        <div className="max-w-6xl mx-auto relative group">
          <div className="overflow-hidden rounded-2xl shadow-2xl aspect-[21/9]">
            <div className="flex transition-transform duration-700 ease-in-out h-full" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {sliderImages.map((img, idx) => (
                <img key={idx} src={img} alt={`Slide ${idx}`} className="w-full h-full object-cover shrink-0" />
              ))}
            </div>
          </div>
          <button onClick={() => setCurrentSlide(prev => (prev === 0 ? sliderImages.length - 1 : prev - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all">❮</button>
          <button onClick={() => setCurrentSlide(prev => (prev === sliderImages.length - 1 ? 0 : prev + 1))} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all">❯</button>
        </div>
      </section>

      {/* 2. Categories Slider Section */}
      <section className="relative mt-1 px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="relative bg-white p-4 rounded-xl shadow-lg border border-gray-50">
            <div className='flex flex-row items-center gap-4'>
              <button onClick={() => scroll('left')} className="shrink-0 w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-md border border-gray-100 text-slate-600 hover:bg-gray-50 active:scale-95 transition-all z-10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
              </button>
              <div ref={scrollRef} className="flex flex-1 items-start gap-10 overflow-x-auto no-scrollbar scroll-smooth py-4">
                {categories.map((item, index) => (
                  <div key={index} className="flex flex-col items-center min-w-[120px] group cursor-pointer">
                    <div className="w-20 h-20 bg-[#f8fafc] rounded-2xl flex items-center justify-center text-4xl mb-4 group-hover:bg-white group-hover:shadow-lg transition-all duration-300">{item.icon}</div>
                    <span className="text-sm font-medium text-slate-600 text-center group-hover:text-[#10b981] transition-colors whitespace-nowrap">{item.name}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => scroll('right')} className="shrink-0 w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-md border border-gray-100 text-slate-600 hover:bg-gray-50 active:scale-95 transition-all z-10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. NEW: How It Works Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-2">How it works</h2>
            <p className="text-slate-500">3 simple steps to Ghar Seva freedom</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center relative">

            {/* Step 1 */}
            <div className="flex items-center gap-6 relative">
              <div className="w-32 h-32 flex-shrink-0 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-4 flex items-center justify-center border border-gray-50">
                <img src="https://img.icons8.com/color/96/appointment-reminders--v1.png" alt="Step 1" className="w-20" />
              </div>
              <div>
                <span className="text-[#10b981] font-bold text-sm block mb-1">Step 1</span>
                <h4 className="text-xl font-bold text-slate-800 leading-tight">Book Online or Phone</h4>
              </div>
              {/* Dashed Arrow 1 */}
              <div className="hidden md:block absolute -right-8 top-1/2 -translate-y-1/2 w-16 h-8 overflow-visible">
                <svg width="60" height="30" viewBox="0 0 60 30" fill="none" className="text-gray-300">
                  <path d="M1 15C10 25 30 25 55 5" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" strokeLinecap="round" />
                  <path d="M50 5H55V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-6 relative">
              <div className="w-32 h-32 flex-shrink-0 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-4 flex items-center justify-center border border-gray-50">
                <img src="https://img.icons8.com/color/96/smartphone--v1.png" alt="Step 2" className="w-20" />
              </div>
              <div>
                <span className="text-[#10b981] font-bold text-sm block mb-1">Step 2</span>
                <h4 className="text-xl font-bold text-slate-800 leading-tight">Get Booking Details Via SMS</h4>
              </div>
              {/* Dashed Arrow 2 */}
              <div className="hidden md:block absolute -right-8 top-1/2 -translate-y-1/2 w-16 h-8 overflow-visible">
                <svg width="60" height="30" viewBox="0 0 60 30" fill="none" className="text-gray-300">
                  <path d="M1 5C25 25 50 25 55 15" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" strokeLinecap="round" />
                  <path d="M50 15H55V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 flex-shrink-0 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-4 flex items-center justify-center border border-gray-50">
                <img src="https://img.icons8.com/color/96/money-transfer.png" alt="Step 3" className="w-20" />
              </div>
              <div>
                <span className="text-[#10b981] font-bold text-sm block mb-1">Step 3</span>
                <h4 className="text-xl font-bold text-slate-800 leading-tight">Pay After Work is Done</h4>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Carpenter Services Section */}
      <section className="py-16 px-6 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto">

          {/* Section Header */}
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-2">Carpenter</h2>
              <p className="text-slate-500 italic">Our Carpentry work is the Illusion of Perfection!!!!</p>
            </div>

            {/* View All Link */}
            <a href="/services/carpenter" className="flex items-center gap-2 text-slate-800 font-semibold hover:text-[#10b981] transition-colors group">
              View All Services
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">

            {/* Service Card 1 */}
            <div className="group cursor-pointer">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 mb-4">
                <img
                  src="https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=400&h=300&fit=crop"
                  alt="Cupboard & Drawer"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h4 className="text-center font-bold text-slate-800 text-lg">Cupboard & Drawer</h4>
            </div>

            {/* Service Card 2 */}
            <div className="group cursor-pointer">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 mb-4">
                <img
                  src="https://images.unsplash.com/photo-1581141849291-1125c7b692b5?q=80&w=400&h=300&fit=crop"
                  alt="Repair"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h4 className="text-center font-bold text-slate-800 text-lg">Repair</h4>
            </div>

            {/* Service Card 3 */}
            <div className="group cursor-pointer">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 mb-4">
                <img
                  src="https://www.serviceonwheel.com/uploads/service/849891670587516.jpg"
                  alt="Installation"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h4 className="text-center font-bold text-slate-800 text-lg">Installation</h4>
            </div>

            {/* Service Card 4 */}
            <div className="group cursor-pointer">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 mb-4">
                <img
                  src="https://www.serviceonwheel.com/uploads/service/117811671188219.jpg"
                  alt="Hardware material supplier"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h4 className="text-center font-bold text-slate-800 text-lg">Hardware material supplier</h4>
            </div>

          </div>
        </div>
      </section>


      {/* 5. Plumber Services Section */}
      <section className="py-20 px-6 bg-[#e2eef1] relative overflow-hidden">
        {/* Background Decorative Blobs */}
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-white/40 rounded-full blur-3xl"></div>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/40 rounded-full blur-3xl"></div>

        <div className="max-w-6xl mx-auto relative z-10">

          {/* Section Header */}
          <div className="flex justify-between items-end mb-12">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-bold text-slate-900 mb-3">Plumber</h2>
              <p className="text-slate-600 italic leading-relaxed">
                "People say they are always waiting for GOD to appear, but have you ever tried to find a plumber on a Sunday?"
              </p>
            </div>

            {/* View All Link */}
            <a href="/services/plumber" className="flex items-center gap-2 text-slate-800 font-bold hover:text-[#10b981] transition-all group whitespace-nowrap">
              View All Services
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

            {/* Service: Repair */}
            <div className="group">
              <div className="rounded-2xl overflow-hidden shadow-md group-hover:shadow-2xl transition-all duration-500 mb-5 aspect-[4/3]">
                <img
                  src="https://www.serviceonwheel.com/uploads/service/891591670584966.jpg"
                  alt="Repair"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <h4 className="text-center font-bold text-slate-900 text-lg">Repair</h4>
            </div>

            {/* Service: Removal */}
            <div className="group">
              <div className="rounded-2xl overflow-hidden shadow-md group-hover:shadow-2xl transition-all duration-500 mb-5 aspect-[4/3]">
                <img
                  src="https://www.serviceonwheel.com/uploads/service/478661670587230.jpg"
                  alt="Removal"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <h4 className="text-center font-bold text-slate-900 text-lg">Removal</h4>
            </div>

            {/* Service: Installation */}
            <div className="group">
              <div className="rounded-2xl overflow-hidden shadow-md group-hover:shadow-2xl transition-all duration-500 mb-5 aspect-[4/3]">
                <img
                  src="https://www.serviceonwheel.com/uploads/service/609611670584726.jpg"
                  alt="Installation"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <h4 className="text-center font-bold text-slate-900 text-lg">Installation</h4>
            </div>

            {/* Service: Other */}
            <div className="group">
              <div className="rounded-2xl overflow-hidden shadow-md group-hover:shadow-2xl transition-all duration-500 mb-5 aspect-[4/3]">
                <img
                  src="https://www.serviceonwheel.com/uploads/service/315811673929679.jpg"
                  alt="Other Services"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <h4 className="text-center font-bold text-slate-900 text-lg">Other</h4>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Air Conditioner Services Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">

          {/* Section Header */}
          <div className="flex justify-between items-end mb-12">
            <div className="max-w-xl">
              <h2 className="text-4xl font-bold text-slate-900 mb-3">Air Conditioner</h2>
              <p className="text-slate-500 text-lg">Beat the heat, Book for instant Services</p>
            </div>

            {/* View All Link */}
            <a href="/services/ac" className="flex items-center gap-2 text-slate-800 font-bold hover:text-[#10b981] transition-all group whitespace-nowrap">
              View All Services
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">

            {/* Service: Repair */}
            <div className="group cursor-pointer">
              <div className="bg-white rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-gray-50 mb-5 aspect-square flex items-center justify-center p-4">
                <img
                  src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&h=400&fit=crop"
                  alt="AC Repair"
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h4 className="text-center font-bold text-slate-900 text-lg">Repair</h4>
            </div>

            {/* Service: Service */}
            <div className="group cursor-pointer">
              <div className="bg-white rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-gray-50 mb-5 aspect-square flex items-center justify-center p-4">
                <img
                  src="https://www.serviceonwheel.com/uploads/service/885241673525900.jpg"
                  alt="AC Service"
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h4 className="text-center font-bold text-slate-900 text-lg">Service</h4>
            </div>

            {/* Service: Installation */}
            <div className="group cursor-pointer">
              <div className="bg-white rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-gray-50 mb-5 aspect-square flex items-center justify-center p-4">
                <img
                  src="https://www.serviceonwheel.com/uploads/service/765461670409535.jpg"
                  alt="AC Installation"
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h4 className="text-center font-bold text-slate-900 text-lg">Installation</h4>
            </div>

            {/* Service: Purchase */}
            <div className="group cursor-pointer">
              <div className="bg-white rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-gray-50 mb-5 aspect-square flex items-center justify-center p-4">
                <img
                  src="https://www.serviceonwheel.com/uploads/service/748141670401655.jpg"
                  alt="AC Purchase"
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h4 className="text-center font-bold text-slate-900 text-lg">Air Conditioner Purchase</h4>
            </div>

          </div>
        </div>
      </section>

      {/* 9. Cleaning Services Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">

          <div className="flex justify-between items-end mb-12">
            <div className="max-w-xl">
              <h2 className="text-4xl font-bold text-slate-900 mb-3">Cleaning</h2>
              <p className="text-slate-500 italic">
                "A clean house is a happy house. Let us do the dirty work while you enjoy your free time!"
              </p>
            </div>

            <a href="/services/cleaning" className="flex items-center gap-2 text-slate-800 font-bold hover:text-[#10b981] transition-all group whitespace-nowrap">
              View All Services
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {/* Service: Deep Cleaning */}
            <div className="group cursor-pointer">
              <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 mb-5 aspect-square p-2">
                <img src="https://www.urbancompany.com/img?bucket=urbanclap-prod&quality=90&format=auto/w_128,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/luminosity/1731490009388-aece6d.jpeg" alt="Deep Cleaning" className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h4 className="text-center font-bold text-slate-900 text-lg">Full Home Deep Cleaning</h4>
            </div>

            {/* Service: Kitchen Cleaning */}
            <div className="group cursor-pointer">
              <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 mb-5 aspect-square p-2">
                <img src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=400&h=400&fit=crop" alt="Kitchen Cleaning" className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h4 className="text-center font-bold text-slate-900 text-lg">Kitchen Cleaning</h4>
            </div>

            {/* Service: Sofa Cleaning */}
            <div className="group cursor-pointer">
              <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 mb-5 aspect-square p-2">
                <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400&h=400&fit=crop" alt="Sofa Cleaning" className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h4 className="text-center font-bold text-slate-900 text-lg">Sofa & Carpet Cleaning</h4>
            </div>

            {/* Service: Bathroom Cleaning */}
            <div className="group cursor-pointer">
              <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 mb-5 aspect-square p-2">
                <img src="https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=400&h=400&fit=crop" alt="Bathroom Cleaning" className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h4 className="text-center font-bold text-slate-900 text-lg">Bathroom Cleaning</h4>
            </div>
          </div>
        </div>
      </section>


      {/* 8. Electrician Services Section */}
      <section className="py-20 px-6 bg-[#fff9f2]">
        <div className="max-w-6xl mx-auto">

          <div className="flex justify-between items-end mb-12">
            <div className="max-w-xl">
              <h2 className="text-4xl font-bold text-slate-900 mb-3">Electrician</h2>
              <p className="text-slate-500 italic">
                "Don't be a DIY disaster. Our expert electricians are here to brighten your day (and your home)!"
              </p>
            </div>

            <a href="/services/electrician" className="flex items-center gap-2 text-slate-800 font-bold hover:text-[#10b981] transition-all group whitespace-nowrap">
              View All Services
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {/* Service: Repair */}
            <div className="group cursor-pointer">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 mb-5 aspect-[4/3]">
                <img src="https://www.urbancompany.com/img?bucket=urbanclap-prod&quality=90&format=auto/w_128,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/luminosity/1729158496446-b93dbc.jpeg" alt="Repair" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <h4 className="text-center font-bold text-slate-900 text-lg">Repair</h4>
            </div>

            {/* Service: Installation */}
            <div className="group cursor-pointer">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 mb-5 aspect-[4/3]">
                <img src="https://www.urbancompany.com/img?bucket=urbanclap-prod&quality=90&format=auto/w_128,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/growth/luminosity/1713781380730-bb1e82.jpeg" alt="Installation" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <h4 className="text-center font-bold text-slate-900 text-lg">Installation</h4>
            </div>

            {/* Service: Maintenance */}
            <div className="group cursor-pointer">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 mb-5 aspect-[4/3]">
                <img src="https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?q=80&w=500&h=400&fit=crop" alt="Maintenance" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <h4 className="text-center font-bold text-slate-900 text-lg">Maintenance</h4>
            </div>

            {/* Service: Other */}
            <div className="group cursor-pointer">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 mb-5 aspect-[4/3]">
                <img src="https://www.urbancompany.com/img?bucket=urbanclap-prod&quality=90&format=auto/w_128,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/supply/customer-app-supply/1727251276143-d8cc28.jpeg" />
              </div>
              <h4 className="text-center font-bold text-slate-900 text-lg">Other</h4>
            </div>
          </div>
        </div>
      </section>


      {/* 10. Customer Reviews Section */}
      <section className="py-20 px-6 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto">

          {/* Header with Scroll Buttons */}
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-2">Our Customer Reviews</h2>
              <p className="text-slate-500 italic">What our happy clients say about Ghar Seva</p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => scroll('left')}
                className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-md border border-gray-100 text-slate-600 hover:bg-[#10b981] hover:text-white transition-all active:scale-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-md border border-gray-100 text-slate-600 hover:bg-[#10b981] hover:text-white transition-all active:scale-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-8"
          >
            {reviews.map((review) => (
              <div
                key={review.id}
                className="min-w-[320px] md:min-w-[400px] bg-white p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col justify-between"
              >
                <div>
                  {/* Stars */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(review.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xl">★</span>
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-slate-600 leading-relaxed italic mb-8">
                    "{review.comment}"
                  </p>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={review.image}
                    alt={review.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900">{review.name}</h4>
                    <p className="text-sm text-slate-400">{review.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}