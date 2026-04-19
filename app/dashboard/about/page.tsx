import Image from "next/image";
import { Music, Code2, GraduationCap, Award, Mail, Globe, Sparkles } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/95 to-primary p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Sparkles size={200} />
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative group">
            <div className="absolute -inset-1 bg-white/20 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
              <Image 
                src="/founder.png" 
                alt="Baxtiyarov Jaxongir" 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
          </div>
          
          <div className="text-center md:text-left space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium backdrop-blur-md">
              <Award size={12} className="text-yellow-400" />
              Loyiha Asoschisi
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Baxtiyarov Jaxongir
            </h1>
            <p className="text-lg text-white/80 max-w-lg leading-relaxed font-medium capitalize">
              Full Stack Dasturchi & Professional Musiqachi
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                <Mail size={14} />
                jaxongir@example.com
              </div>
              <div className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                <Globe size={14} />
                Gway.uz
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats/Badge Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Sparkles, label: "Tajriba", value: "10+ yillik" },
          { icon: Code2, label: "Texnologiya", value: "Next.js / AI" },
          { icon: Music, label: "Yo'nalish", value: "Instrumental" },
          { icon: GraduationCap, label: "Ta'lim", value: "Ustoz" },
        ].map((item, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-center group">
            <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <item.icon size={20} />
            </div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{item.label}</p>
            <p className="text-sm font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Content Section */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-primary/20 transition-colors h-full">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Code2 className="text-primary" /> Professional Yo'li
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              IT sohasida 10 yillik tajribaga ega bo'lgan Full Stack dasturchi sifatida loyihalarni 
              mukammal darajaga yetkazishga intiladi. Sun'iy intellekt, murakkab tizimlar va 
              foydalanuvchi interfeyslari ustida ishlash bo'yicha katta tajribaga ega. Gway.uz 
              loyihasini yaratishdan maqsad — tadbirkorlar va bot egalari uchun eng qulay chat 
              ekotizimini yaratishdir.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-primary/20 transition-colors h-full">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Music className="text-primary" /> San'at va Ta'lim
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              Musiqa sohasida uzoq yillik tajribaga ega ustoz va mohir sozanda. Musiqa faqatgina 
              san'at emas, balki kodingda aniqlik va tartib beruvchi ilhom manbai ekanligini ta'kidlaydi. 
              Talabalarga musiqa nazariyasi va amaliyoti bo'yicha dars berish orqali yangi avlod 
              san'atkorlarini tayyorlab kelmoqda.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Quote */}
      <div className="text-center py-8">
        <p className="text-slate-400 italic text-sm">
          "Kod yozish — bu musiqa yozish kabidir, har bir qator o'z o'rnida bo'lishi shart."
        </p>
      </div>
    </div>
  );
}
