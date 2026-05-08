import React from 'react';

const Footer = () => {
  const logoUrl = "https://res.cloudinary.com/djtvxmttf/image/upload/v1778086674/seva_uuvngp-removebg-preview_mq4ctm.png";

  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* 1. Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <img src={logoUrl} alt="Ghar Seva Logo" className="h-12 w-auto object-contain bg-white rounded-lg p-1" />
              <span className="text-2xl font-bold tracking-tight">Ghar Seva</span>
            </div>
            <p className="text-slate-400 leading-relaxed mb-6">
              Your one-stop destination for all home services. We bring expert professionals right to your doorstep.
            </p>
            <div className="flex gap-4">
              {/* Social Icons Placeholder */}
              <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-[#10b981] transition-colors cursor-pointer">
                <i className="fab fa-facebook-f"></i>
              </div>
              <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-[#10b981] transition-colors cursor-pointer">
                <i className="fab fa-instagram"></i>
              </div>
              <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-[#10b981] transition-colors cursor-pointer">
                <i className="fab fa-linkedin-in"></i>
              </div>
            </div>
          </div>

          {/* 2. Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-4 text-slate-400">
              <li><a href="/" className="hover:text-[#10b981] transition-colors">Home</a></li>
              <li><a href="/services" className="hover:text-[#10b981] transition-colors">All Services</a></li>
              <li><a href="/about" className="hover:text-[#10b981] transition-colors">About Us</a></li>
              <li><a href="/contact" className="hover:text-[#10b981] transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* 3. Services */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Our Services</h4>
            <ul className="space-y-4 text-slate-400">
              <li><a href="#" className="hover:text-[#10b981] transition-colors">Plumbing</a></li>
              <li><a href="#" className="hover:text-[#10b981] transition-colors">Electrician</a></li>
              <li><a href="#" className="hover:text-[#10b981] transition-colors">AC Repair</a></li>
              <li><a href="#" className="hover:text-[#10b981] transition-colors">Cleaning</a></li>
            </ul>
          </div>

          {/* 4. Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Contact Info</h4>
            <ul className="space-y-4 text-slate-400">
              <li className="flex items-start gap-3">
                <span className="text-[#10b981]">📞</span>
                <a href="tel:+917023009861" className="hover:text-white">+91 7023009861</a>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#10b981]">🌐</span>
                <a href="https://www.aurixaisoftware.com" target="_blank" rel="noreferrer" className="hover:text-white">
                  www.aurixaisoftware.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#10b981]">📍</span>
                <span>Alwar, Rajasthan, India</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Ghar Seva. All rights reserved.</p>
          <p>
            Powered by <a href="https://www.aurixaisoftware.com" className="text-[#10b981] font-medium hover:underline">Aurix AI Software Company</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;