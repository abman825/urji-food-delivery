
import React from 'react';

export default function Footer({ lang }) {
  // የቋንቋ ተርጓሚ ዳታ ( Translations )
  const content = {
    am: {
      title: "ኡርጂ",
      subTitle: "ምግብ ቤት",
      desc: "ትኩስ እና ጣፋጭ ምግቦችን በደቂቃዎች ውስጥ ወደ እርሶ እናደርሳለን።",
      alertMsg: "ℹ️ ይህ አገልግሎት በቅርብ ቀን ይጠብቁ!",
      addressTitle: "አድራሻ",
      location: "አዲስ አበባ፣ ኢትዮጵያ",
      infoTitle: "መረጃ",
      privacy: "የግላዊነት ፖሊሲ",
      terms: "አገልግሎት ውሎች",
      payment: "የክፍያ አማራጮች",
      newsletterTitle: "NEWSLETTER",
      newsletterDesc: "አዳዲስ ምግቦች እና ቅናሾች ሲኖሩ እንልካለን።",
      rights: "ኡርጂ ምግብ ቤት | ALL RIGHTS RESERVED | DEVELOPED BY ABRAM"
    },
    om: {
      title: "Mana Nyata",
      subTitle: "Urjii",
      desc: "Nyaata aadaa fi mi'aawaa daqiiqaa muraasa keessatti bakka jirtanitti ni dhiyeessina.",
      alertMsg: "ℹ️ Tajaajilli kun dhiyootti ni eegalama!",
      addressTitle: "Teessoo",
      location: "Finfinnee, Itoophiyaa",
      infoTitle: "Odeeffannoo",
      privacy: "Imeelii fi Seera",
      terms: "Waliigaltee Tajaajilaa",
      payment: "Kaffaltii Dhiyaatan",
      newsletterTitle: "NEWSLETTER",
      newsletterDesc: "Odeeffannoo nyaata haaraa fi hir'ina gatii dafee akka isin ga'uuf.",
      rights: "Mana Nyata Urjii | ALL RIGHTS RESERVED | DEVELOPED BY ABRAM"
    },
    en: {
      title: "Urji",
      subTitle: "Restaurant",
      desc: "Fresh and delicious food delivered to your doorstep in minutes.",
      alertMsg: "ℹ️ This service is coming soon!",
      addressTitle: "Address",
      location: "Addis Ababa, Ethiopia",
      infoTitle: "Information",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      payment: "Payment Options",
      newsletterTitle: "NEWSLETTER",
      newsletterDesc: "We will send you updates on new meals and sales.",
      rights: "Urji Restaurant | ALL RIGHTS RESERVED | DEVELOPED BY ABRAM"
    }
  };

  const f = content[lang] || content.am;

  const handleComingSoon = (e) => {
    e.preventDefault();
    alert(f.alertMsg);
  };

  // የፎቶህ ሊንክ
  const bgImageUrl = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80";

  return (
    <footer 
      className="relative text-white pt-16 pb-12 border-t border-gray-800 bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: `url('${bgImageUrl}')` }}//('/bb.jpg')` }}
    >
      {/* ጽሑፎቹ በግልጽ እንዲታዩ ምስሉ ላይ ጥቁር overlay ማድረጊያ */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>

      {/* ዋናው Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* ብራንድ እና ሶሻል ሚዲያ */}
        <div>
          <h2 className="text-2xl font-black mb-4">
            {f.title} <span className="text-orange-600">{f.subTitle}</span>
          </h2>
          <p className="text-gray-300 text-sm mb-6">
            {f.desc}
          </p>
          <div className="flex gap-3">
            {['FB', 'IG', 'TG', 'WA'].map((item) => (
              <button 
                key={item} 
                onClick={handleComingSoon}
                className="w-10 h-10 rounded-xl bg-black/50 backdrop-blur-md border border-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 hover:border-orange-600 hover:text-orange-500 transition-all"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* አድራሻ */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-gray-100">{f.addressTitle}</h3>
          <div className="space-y-3 text-sm text-gray-300">
            <p className="font-bold text-white">+251 947 493 716</p>
            <p>{f.location}</p>
          </div>
        </div>

        {/* ወረቀቶች / መረጃ */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-gray-100">{f.infoTitle}</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <a href="#" onClick={handleComingSoon} className="hover:text-orange-500 transition-colors">
                {f.privacy}
              </a>
            </li>
            <li>
              <a href="#" onClick={handleComingSoon} className="hover:text-orange-500 transition-colors">
                {f.terms}
              </a>
            </li>
            <li>
              <a href="#" onClick={handleComingSoon} className="hover:text-orange-500 transition-colors">
                {f.payment}
              </a>
            </li>
          </ul>
        </div>

        {/* NEWSLETTER */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-gray-100">{f.newsletterTitle}</h3>
          <p className="text-gray-300 text-xs mb-4">{f.newsletterDesc}</p>
          <form onSubmit={handleComingSoon} className="flex gap-2">
            <input 
              type="email" 
              placeholder="Email..." 
              className="bg-black/50 backdrop-blur-md border border-gray-700 rounded-xl px-4 py-2 text-sm w-full focus:outline-none focus:border-orange-600 text-white"
            />
            <button type="submit" className="bg-orange-600 text-white px-4 rounded-xl font-bold hover:bg-orange-700 transition-colors">
              &gt;
            </button>
          </form>
        </div>

      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-gray-800/80 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} {f.rights}
      </div>
    </footer>
  );
}