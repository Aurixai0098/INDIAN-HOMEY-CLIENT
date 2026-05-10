import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-black text-[#f8f8f8] pt-16 pb-8 px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* TOP SECTION: Branding, Support, Company, Legal, Press */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-16">
          
          {/* Brand & Contact */}
          <div className="col-span-1">
            <h2 className="text-3xl font-bold mb-6">Ghar Seva</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Feel free to reach us at:</p>
                <a href="mailto:help@gharseva.com" className="text-[#22c55e] hover:underline block">help@gharseva.com</a>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Careers:</p>
                <a href="mailto:careers@gharseva.com" className="text-[#22c55e] hover:underline block">careers@gharseva.com</a>
              </div>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6">Support</h4>
            <ul className="space-y-4 text-sm text-gray-300">
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
              <li><a href="#" className="hover:text-white">Frequently Asked Questions</a></li>
              <li><a href="#" className="hover:text-white">Delete Account</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-gray-300">
              <li><a href="#" className="hover:text-white">Become a Ghar Seva Professional</a></li>
              <li><a href="#" className="hover:text-white">Become a Ghar Seva Buddy</a></li>
              <li><a href="#" className="hover:text-white">Request Ghar Seva in your locality</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-gray-300">
              <li><a href="#" className="hover:text-white">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Cancellation Policy</a></li>
              <li><a href="#" className="hover:text-white">Photo Credits</a></li>
            </ul>
          </div>

          {/* Press */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6">Press</h4>
            <ul className="space-y-4 text-sm text-gray-300">
              <li><a href="mailto:press@gharseva.com" className="text-[#22c55e] hover:underline">press@gharseva.com</a></li>
              <li><a href="#" className="hover:text-white">Press Kit</a></li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-800 mb-12" />

        {/* MIDDLE SECTION: All Services & All Cities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          
          {/* All Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6">All Services</h4>
            <div className="grid grid-cols-2 gap-y-3 text-sm text-gray-400">
              <div className="space-y-3">
                <p>Hourly bookings</p>
                <p>Fridge Cleaning</p>
                <p>Utensils</p>
                <p>Dusting & Wiping</p>
                <p>Pre-Party Express Clean</p>
                <p>After-Party Express Clean</p>
                <p>Window Cleaning</p>
                <p>Kitchen Cleaning</p>
                <p>Fan Cleaning</p>
                <p>Plant Care</p>
              </div>
              <div className="space-y-3">
                <p>Bathroom Cleaning</p>
                <p>Packing or Unpacking</p>
                <p>Kitchen Prep</p>
                <p>Sweeping & Mopping</p>
                <p>Complete Wardrobe Cleaning</p>
                <p>Ironing & Folding</p>
                <p>Laundry</p>
                <p>Balcony Cleaning</p>
                <p>Kitchen Cabinet Cleaning</p>
                <p>Car Surface Cleaning</p>
              </div>
            </div>
          </div>

          {/* All Cities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6">All Cities</h4>
            <div className="grid grid-cols-3 gap-y-3 text-sm text-gray-400">
              <div className="space-y-3">
                <p>Ahmedabad</p>
                <p>Delhi</p>
                <p>Gurgaon</p>
                <p>Kolkata</p>
                <p>Noida</p>
              </div>
              <div className="space-y-3">
                <p>Bangalore</p>
                <p>Faridabad</p>
                <p>Hyderabad</p>
                <p>Mumbai</p>
                <p>Pune</p>
              </div>
              <div className="space-y-3">
                <p>Chennai</p>
                <p>Ghaziabad</p>
                <p>Jaipur</p>
                <p>Navi Mumbai</p>
                <p>Thane</p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR: Socials & Copyright */}
        <div className="pt-8 border-t border-gray-900 flex justify-between items-center">
          <div className="flex gap-6 text-gray-400">
            {/* Instagram SVG */}
            <a href="#" className="hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            {/* LinkedIn SVG */}
            <a href="#" className="hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
            {/* YouTube SVG */}
            <a href="#" className="hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
            </a>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-widest">
            Ghar Seva © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;