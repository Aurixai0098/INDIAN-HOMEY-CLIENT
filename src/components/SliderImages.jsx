 
import { Star, Quote } from 'lucide-react';

// ─── 30 DEMO REVIEWS ────────────────────────────────────────────────
const DEMO_REVIEWS = [
  { id: 1, name: "A Rahman", rating: 5, comment: "Amazing service! The technician was very professional and fixed my AC in no time. Highly recommended!", date: "2 days ago" },
  { id: 2, name: "J Smith", rating: 5, comment: "Best home service app ever. The plumber arrived on time and did a fantastic job fixing the leak.", date: "1 week ago" },
  { id: 3, name: "Priya Sharma", rating: 5, comment: "Super impressed with the quality of service. My house looks spotless after the deep cleaning!", date: "3 days ago" },
  { id: 4, name: "K Khan", rating: 4, comment: "Great experience overall. The electrician was knowledgeable and fixed all the wiring issues quickly.", date: "5 days ago" },
  { id: 5, name: "R Verma", rating: 5, comment: "Absolutely loved the service! The carpenter built beautiful custom shelves for my living room.", date: "1 day ago" },
  { id: 6, name: "S Gupta", rating: 5, comment: "Fast, reliable, and affordable. The pest control team was thorough and professional.", date: "4 days ago" },
  { id: 7, name: "M Ali", rating: 4, comment: "Very satisfied with the painting service. The team was punctual and the finish is excellent.", date: "6 days ago" },
  { id: 8, name: "D Singh", rating: 5, comment: "The RO repair service was top-notch. Technician explained everything clearly. Will use again!", date: "2 weeks ago" },
  { id: 9, name: "N Patel", rating: 5, comment: "INDIAN HOMEY never disappoints! The sofa cleaning service made my 5-year-old sofa look brand new.", date: "3 days ago" },
  { id: 10, name: "A Kumar", rating: 4, comment: "Good service at reasonable prices. The microwave repair was done within an hour.", date: "1 week ago" },
  { id: 11, name: "S Reddy", rating: 5, comment: "The bathroom cleaning team was incredibly thorough. Every corner sparkles now!", date: "4 days ago" },
  { id: 12, name: "P Mishra", rating: 5, comment: "Best decision to use INDIAN HOMEY for my kitchen chimney repair. Works like new now!", date: "5 days ago" },
  { id: 13, name: "V Joshi", rating: 4, comment: "The inverter repair service was quick and efficient. Fair pricing too.", date: "1 week ago" },
  { id: 14, name: "T Nair", rating: 5, comment: "Exceptional service! The team installed my new washing machine perfectly and even gave usage tips.", date: "2 days ago" },
  { id: 15, name: "R Iyer", rating: 5, comment: "The water tank cleaning service was excellent. They used proper equipment and cleaned up after.", date: "6 days ago" },
  { id: 16, name: "K Mehta", rating: 4, comment: "Very happy with the CCTV installation. The technician was professional and the setup is working great.", date: "3 days ago" },
  { id: 17, name: "A Banerjee", rating: 5, comment: "The refrigerator repair service saved me from buying a new fridge! Amazing work.", date: "1 week ago" },
  { id: 18, name: "S Yadav", rating: 5, comment: "Geyser repair was done same day. The technician was courteous and skilled. Highly recommend!", date: "4 days ago" },
  { id: 19, name: "P Choudhary", rating: 4, comment: "Good experience with the tile cleaning service. My bathroom tiles look brand new.", date: "5 days ago" },
  { id: 20, name: "M Thakur", rating: 5, comment: "The curtain cleaning service was fantastic. They picked up, cleaned, and delivered back perfectly.", date: "2 days ago" },
  { id: 21, name: "R Pandey", rating: 5, comment: "Best plumbing service I've ever used. Fixed the chronic leakage issue that others couldn't.", date: "1 week ago" },
  { id: 22, name: "A Desai", rating: 4, comment: "The laptop repair service was quick and affordable. My laptop is working smoothly now.", date: "3 days ago" },
  { id: 23, name: "S Kaur", rating: 5, comment: "Amazing deep cleaning service! The team was professional and left my apartment spotless.", date: "6 days ago" },
  { id: 24, name: "V Malhotra", rating: 5, comment: "The AC installation service was flawless. Proper piping, neat work, and excellent cooling.", date: "4 days ago" },
  { id: 25, name: "N Bhatia", rating: 4, comment: "Good service for chimney cleaning. The technician was knowledgeable and used quality products.", date: "5 days ago" },
  { id: 26, name: "K Agarwal", rating: 5, comment: "The mattress cleaning service removed all stains and odors. Sleeping much better now!", date: "2 days ago" },
  { id: 27, name: "P Saxena", rating: 5, comment: "Exceptional carpentry work! The custom wardrobe fits perfectly and looks stunning.", date: "1 week ago" },
  { id: 28, name: "R Chauhan", rating: 4, comment: "The electrical work was done safely and efficiently. All switches and fittings work perfectly.", date: "3 days ago" },
  { id: 29, name: "A Khanna", rating: 5, comment: "Best home cleaning service in the city! The team is thorough, polite, and always on time.", date: "4 days ago" },
  { id: 30, name: "S Kapoor", rating: 5, comment: "The dishwasher repair was done in one visit. The technician carried all necessary parts. Brilliant!", date: "5 days ago" },
];

// ─── Review Card ───────────────────────────────────────────────────
const ReviewCard = ({ review }) => (
  <div className="w-[280px] sm:w-[360px] md:w-[400px] bg-white p-5 md:p-7 rounded-2xl shadow-md border border-slate-100 flex flex-col justify-between flex-shrink-0 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 cursor-default group">
    <div>
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 transition-colors ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
          />
        ))}
      </div>
      {/* Quote */}
      <div className="relative">
        <Quote className="w-8 h-8 text-emerald-100 absolute -top-2 -left-1 group-hover:text-emerald-200 transition-colors" />
        <p className="text-slate-600 leading-relaxed italic text-sm md:text-base mb-6 line-clamp-4 relative z-10 pl-4">
          {review.comment}
        </p>
      </div>
    </div>
    {/* Author */}
    <div className="flex items-center gap-3 md:gap-4 pt-4 border-t border-slate-50">
      {review.image ? (
        <img 
          src={review.image} 
          alt={review.name} 
          className="w-11 h-11 md:w-12 md:h-12 rounded-full object-cover border-2 border-white shadow-md" 
        />
      ) : (
        <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
          {review.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-slate-900 text-sm md:text-base truncate">{review.name}</h4>
        <p className="text-xs text-slate-400">{review.date}</p>
      </div>
      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
        <Quote className="w-4 h-4 text-emerald-600" />
      </div>
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────
const InfiniteReviewsMarquee = ({ reviews }) => {
  // Use provided reviews or fallback to demo reviews
  const displayReviews = reviews?.length > 0 ? reviews : DEMO_REVIEWS;
  
  // Triple for seamless loop
  const tripleReviews = [...displayReviews, ...displayReviews, ...displayReviews];
  const reversedReviews = [...displayReviews].reverse();
  const tripleReversed = [...reversedReviews, ...reversedReviews, ...reversedReviews];
  const offsetReviews = [...displayReviews.slice(10), ...displayReviews.slice(0, 10)];
  const tripleOffset = [...offsetReviews, ...offsetReviews, ...offsetReviews];

  return (
    <section className="py-14 md:py-20 px-5 sm:px-6 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Our Customer Reviews
          </h2>
          <p className="text-slate-500 italic text-sm md:text-base max-w-xl mx-auto">
            What our happy clients say about Ghar Seva
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span className="font-bold text-slate-800 text-lg">4.9</span>
            <span className="text-slate-400 text-sm">({displayReviews.length}+ reviews)</span>
          </div>
        </div>

        {/* Marquee Container */}
        <div className="relative space-y-5">
          {/* Left Fade */}
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32  z-10 pointer-events-none"></div>
          {/* Right Fade */}
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32  z-10 pointer-events-none"></div>

          {/* Track 1 - Scrolls Left */}
          <div className="flex gap-5 animate-marquee-left hover:[animation-play-state:paused]">
            {tripleReviews.map((review, idx) => (
              <ReviewCard key={`row1-${review.id}-${idx}`} review={review} />
            ))}
          </div>

          {/* Track 2 - Scrolls Right */}
          <div className="flex gap-5 animate-marquee-right hover:[animation-play-state:paused]">
            {tripleReversed.map((review, idx) => (
              <ReviewCard key={`row2-${review.id}-${idx}`} review={review} />
            ))}
          </div>

        
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-33.333%); }
          100% { transform: translateX(0); }
        }
        @keyframes marquee-left-slow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-marquee-left {
          animation: marquee-left 100s linear infinite;
          width: max-content;
        }
        .animate-marquee-right {
          animation: marquee-right 100s linear infinite;
          width: max-content;
        }
        .animate-marquee-left-slow {
          animation: marquee-left-slow 35s linear infinite;
          width: max-content;
        }
      `}</style>
    </section>
  );
};

export default InfiniteReviewsMarquee;
 