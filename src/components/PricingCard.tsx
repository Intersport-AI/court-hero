'use client';

interface PricingCardProps {
  title: string;
  price: string;
  period?: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  onSelect: () => void;
}

export default function PricingCard({ title, price, period, features, cta, highlighted = false, onSelect }: PricingCardProps) {
  return (
    <div className={`relative rounded-[32px] transition-all duration-300 ${
      highlighted ? 'bg-gradient-to-b from-[#00F260]/30 via-[#00F260]/10 to-transparent p-[1.5px] scale-[1.03] z-10' : 'bg-white/[0.08] p-[1px]'
    }`}>
      <div className={`rounded-[32px] h-full flex flex-col ${highlighted ? 'bg-[#0A0D12]' : 'bg-[#111827]/90'}`}>
        <div className="px-10 sm:px-12 pt-12 sm:pt-14 pb-12 sm:pb-14 flex flex-col flex-1">
          {highlighted && (
            <span className="self-start text-[11px] bg-[#00F260] text-black px-5 py-2 rounded-full font-bold mb-10 uppercase tracking-[0.14em]">
              Most Popular
            </span>
          )}
          <h3 className="text-[14px] font-semibold text-[#8B9DB8] uppercase tracking-[0.14em] mb-8">{title}</h3>
          <div className="flex items-baseline gap-2 mb-12">
            <span className="text-[60px] sm:text-[72px] font-black text-white tracking-tighter leading-none">{price}</span>
            {period && <span className="text-[18px] text-[#64748B] font-medium">/{period}</span>}
          </div>
          <ul className="space-y-5 sm:space-y-6 mb-14 flex-1">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="text-[#00F260] mt-[3px] flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10.5L8 14.5L16 5.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <span className="text-[16px] text-[#B8C4D4] leading-[1.55]">{f}</span>
              </li>
            ))}
          </ul>
          <button onClick={onSelect} className={`w-full rounded-2xl font-bold text-[17px] transition-all duration-200 active:scale-[0.97] cursor-pointer py-[22px] ${
            highlighted
              ? 'bg-[#00F260] text-black hover:bg-[#00D954] shadow-[0_0_40px_rgba(0,242,96,0.2)]'
              : 'bg-white/[0.08] text-white hover:bg-white/[0.14] border border-white/[0.1] hover:border-white/[0.18]'
          }`}>
            {cta}
          </button>
        </div>
      </div>
    </div>
  );
}
