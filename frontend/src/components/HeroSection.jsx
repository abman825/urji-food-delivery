import React, { useEffect, useState, useRef } from 'react';
import { Star, ArrowRight } from 'lucide-react';

export default function HeroSection({ t }) {
  const [step, setStep] = useState(0); // 0: Welcome, 1: 3D Text Rotation, 2: Final Button
  const [activeCard, setActiveCard] = useState(0);
  const videoRef = useRef(null);

  const cardData = [
    { title: t?.features?.[0]?.title || "ትኩስ እና ጥራት ያለው", desc: t?.features?.[0]?.desc || "በየቀኑ በተመረጡ እና ትኩስ ግብአቶች የተዘጋጁ ጣፋጭ የምግብ ዓይነቶችን እናቀርባለን።", position: "left" },
   // { title: t?.features?.[1]?.title || "ፈጣን ማድረስ", desc: t?.features?.[1]?.desc || "ያዘዙትን ምግብ ባሉበት ቦታ በጥራት እና በሙቀቱ በቅጽበት እናደርሳለን።", position: "right" },
    { title: t?.features?.[2]?.title || "ንፅህናው የተጠበቀ", desc: t?.features?.[2]?.desc || "በከፍተኛ ንፅህና እና ደረጃውን በጠበቀ ኩሽና ውስጥ በሙያተኞች የሚዘጋጅ።", position: "right" },
    { title: t?.features?.[3]?.title || "ተመጣጣኝ ዋጋ", desc: t?.features?.[3]?.desc || "ምርጥ እና አሪፍ አገልግሎት ከተመጣጣኝ ዋጋ ጋር ያገኛሉ።", position: "left" },
   // { title: t?.features?.[4]?.title || "ቀላል ክፍያ", desc: t?.features?.[4]?.desc || "በ Chapa እና በባንክ ማስተላለፊያ በቀላሉ ክፍያዎን መፈጸም ይችላሉ።", position: "left" },
    { title: t?.features?.[5]?.title || "ሁልጊዜ ዝግጁ", desc: t?.features?.[5]?.desc || "በማንኛውም ሰዓት ትዕዛዝዎን ለመቀበል እና ለማስተናገድ ዝግጁ ነን።", position: "right" }
  ];

  useEffect(() => {
    // 1. "እንኳን ደህና መጡ" ጽሁፍ በትክክል ለ 4 ሰከንድ ታይቶ ይቆያል
    const welcomeTimer = setTimeout(() => {
      setStep(1);

      // 2. ጽሁፎቹ ብቻቸውን በ 3D እየተሽከረከሩ በየ 4 ሰከንዱ ይቀያየራሉ
      let cardIndex = 0;
      const interval = setInterval(() => {
        cardIndex++;
        if (cardIndex < cardData.length) {
          setActiveCard(cardIndex);
        } else {
          clearInterval(interval);
          // 3. ጽሁፎቹ ሲያልቁ ወደ Order Button ያልፋል
          setStep(2);
        }
      }, 4000); // ልክ እንደጠየቅከው 4 ሰከንድ (4000ms)

    }, 4000); // የመጀመሪያው ጽሁፍ 4 ሰከንድ

    return () => clearTimeout(welcomeTimer);
  }, []);

  return (
    <div id="home" className="relative h-screen w-full bg-black overflow-hidden sticky top-0 perspective-1000">
      
      {/* የጀርባ ቪዲዮ */}
      <video
        ref={videoRef}
        src="/asss.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover opacity-50"
      />

      <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />

      {/* Step 0: "እንኳን ደህና መጡ" (ለ 4 ሰከንድ የሚቆይ) */}
      <div 
        className={`absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6 transition-all duration-1000 z-10 ${
          step === 0 
            ? 'opacity-100 scale-100 rotate-x-0' 
            : 'opacity-0 scale-95 -rotate-x-90 pointer-events-none'
        }`}
      >
        <div className="inline-flex items-center gap-2 bg-orange-600/90 text-white px-6 py-2.5 rounded-full text-xs md:text-sm font-black uppercase tracking-widest mb-6 animate-bounce shadow-lg shadow-orange-600/50">
          <Star size={16} fill="currentColor" /> {t?.heroBadge || "እንኳን ደህና መጡ"}
        </div>
        <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-4 text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
          {t?.welcomeTitle || "እንኳን ወደ ኡርጂ ካፌ መጡ"}
        </h1>
        <p className="text-gray-200 text-lg md:text-2xl max-w-xl font-bold drop-shadow-md">
          {t?.welcomeSub || "የካፌያችንን ድባብ እና ምርጥ አገልግሎት ይጎብኙ"}
        </p>
      </div>

      {/* Step 1: ያለ Card/Box ጽሁፎች ብቻ ተንሳፈፈው በ 3D የሚሽከረከሩበት (4 Seconds Interval) */}
      <div 
        className={`absolute inset-0 flex items-center justify-center px-6 md:px-20 text-white transition-all duration-1000 pointer-events-none z-10 ${
          step === 1 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="relative w-full max-w-5xl h-72 flex items-center justify-center">
          {cardData.map((card, idx) => {
            const isLeft = card.position === 'left';
            const isActive = activeCard === idx;

            return (
              <div 
                key={idx}
                className={`absolute max-w-2xl w-full flex flex-col transition-all duration-1000 ease-in-out ${
                  isLeft ? 'left-4 md:left-12 text-left' : 'right-4 md:right-12 text-right'
                } ${
                  isActive 
                    ? 'opacity-100 scale-100 rotate-y-0 translate-z-0' 
                    : `opacity-0 scale-75 ${
                        isLeft ? '-rotate-y-90 -translate-x-32' : 'rotate-y-90 translate-x-32'
                      } pointer-events-none`
                }`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className={`inline-flex items-center gap-2 text-orange-400 text-xs md:text-sm font-black uppercase tracking-widest mb-3 drop-shadow-[0_2px_10px_rgba(249,115,22,0.8)] ${
                  isLeft ? 'justify-start' : 'justify-end'
                }`}>
                  <Star size={16} fill="currentColor" /> 0{idx + 1} / 06
                </div>
                <h3 className="text-3xl md:text-6xl font-black text-white mb-4 drop-shadow-[0_4px_25px_rgba(0,0,0,0.95)] tracking-tight leading-tight">
                  {card.title}
                </h3>
                <p className="text-base md:text-2xl text-gray-200 font-bold leading-relaxed drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)] max-w-xl">
                  {card.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Order Button (ከጽሁፎቹ በኋላ) */}
      <div 
        className={`absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6 transition-all duration-1000 z-10 ${
          step === 2 ? 'opacity-100 scale-100 rotate-x-0' : 'opacity-0 scale-110 rotate-x-45 pointer-events-none'
        }`}
      >
        <h2 className="text-4xl md:text-7xl font-black text-white tracking-tight mb-6 leading-[1.1] drop-shadow-2xl">
          {t?.heroTitle1 || "ዛሬ ምን መመገብ"} <br/>
          <span className="text-orange-500">{t?.heroTitle2 || "ይፈልጋሉ?"}</span>
        </h2>
        <p className="text-gray-200 text-base md:text-xl max-w-2xl mx-auto font-medium leading-relaxed mb-8 drop-shadow">
          {t?.heroDesc || "ትኩስ እና ጣፋጭ የሀገራችንን ምግቦች በጥቂት ደቂቃዎች ውስጥ ከኡርጂ ቤት!"}
        </p>
        <a 
          href="#menu" 
          className="bg-orange-600 text-white px-10 py-5 rounded-3xl font-black text-lg shadow-2xl hover:bg-orange-700 hover:scale-105 transition-all flex items-center gap-3 pointer-events-auto shadow-orange-600/40 animate-pulse"
        >
          {t?.orderNow || "አሁን ይዘዙ"} <ArrowRight size={22} />
        </a>
      </div>

    </div>
  );
}