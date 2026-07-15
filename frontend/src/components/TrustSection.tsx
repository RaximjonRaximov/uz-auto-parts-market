import { ShieldCheck, Truck, BadgeCheck, Lock, Headphones, Clock } from 'lucide-react';
import { useInView } from '../hooks/useInView';

const features = [
  {
    icon: ShieldCheck,
    title: "Tekshirilgan sotuvchilar",
    desc: "Har bir do'kon va sotuvchi ma'lumotlari tekshiriladi.",
  },
  {
    icon: Lock,
    title: "Xavfsiy aloqa",
    desc: "Telefon raqamlaringiz shifrlangan va uchinchi tomonlarga berilmaydi.",
  },
  {
    icon: Truck,
    title: "Butun O'zbekiston",
    desc: "Barcha viloyat va shaharlar bo'ylab zapchastlar topiladi.",
  },
  {
    icon: BadgeCheck,
    title: "Sifat kafolati",
    desc: "Yangi va tiklangan qismlar kategoriyasi bilan filtrlash oson.",
  },
  {
    icon: Clock,
    title: "Tez qidiruv",
    desc: "Brend, model, yil va narx bo'yicha soniyalar ichida natija.",
  },
  {
    icon: Headphones,
    title: "Qo'llab-quvvatlash",
    desc: "Savollaringiz bo'lsa, sotuvchi bilan to'g'ridan-to'g'ri bog'laning.",
  },
];

export function TrustSection() {
  const [ref, visible] = useInView<HTMLDivElement>();

  return (
    <section ref={ref} className={`section space-y-12 ${visible ? '' : 'reveal'} ${visible ? 'visible' : ''}`}>
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--foreground)]">
          Nega aynan <span className="text-gradient">biz?</span>
        </h2>
        <p className="text-lg text-[var(--foreground)]/70 font-medium">
          Zamonaviy, xavfsiz va qulay avto zapchastlar marketpleysi.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
        {features.map((f) => (
          <div key={f.title} className="card p-7 flex flex-col gap-4 group">
            <div className="w-13 h-13 rounded-2xl bg-[var(--primary-50)] text-[var(--primary)] flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
              <f.icon size={24} />
            </div>
            <div>
              <h3 className="font-bold text-xl text-[var(--foreground)]">{f.title}</h3>
              <p className="mt-2 text-[var(--foreground)]/70 font-semibold leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
