'use client';
import { useState } from 'react';
import Header from '@/components/Header';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('general');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate submission
    setSubmitted(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setMessage('');
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />
      <div className="max-w-4xl mx-auto pt-8 px-6 pb-12">
        <h1 className="text-white text-[40px] font-bold mb-2">Contact Us</h1>
        <p className="text-[#8B9DB8] mb-12">Have questions? We'd love to hear from you.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8">
            <h2 className="text-white text-[20px] font-bold mb-6">Send us a message</h2>
            
            {submitted ? (
              <div className="bg-[#00F260]/10 border border-[#00F260]/20 text-[#00F260] rounded-xl p-8 text-center">
                <div className="text-[48px] mb-4">✓</div>
                <p className="font-bold mb-2">Message sent!</p>
                <p className="text-[13px]">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-[#B8C4D4] text-[13px] font-medium block mb-2">Your Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                    className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-3 text-white outline-none focus:border-[#00F260]/40" />
                </div>

                <div>
                  <label className="text-[#B8C4D4] text-[13px] font-medium block mb-2">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-3 text-white outline-none focus:border-[#00F260]/40" />
                </div>

                <div>
                  <label className="text-[#B8C4D4] text-[13px] font-medium block mb-2">Subject</label>
                  <select value={subject} onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-3 text-white outline-none">
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="sales">Sales</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#B8C4D4] text-[13px] font-medium block mb-2">Message</label>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5}
                    className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-3 text-white outline-none focus:border-[#00F260]/40 resize-none" />
                </div>

                <button type="submit"
                  className="w-full bg-[#00F260] text-black py-4 rounded-xl font-bold hover:bg-[#00D954] transition-all">
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            {/* Email */}
            <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6">
              <div className="text-[32px] mb-3">📧</div>
              <h3 className="text-white font-bold mb-2">Email</h3>
              <p className="text-[#8B9DB8] text-[14px] mb-3">For general inquiries and support</p>
              <a href="mailto:hello@courthero.app" className="text-[#00F260] font-medium hover:underline">
                hello@courthero.app
              </a>
            </div>

            {/* Enterprise */}
            <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6">
              <div className="text-[32px] mb-3">🏢</div>
              <h3 className="text-white font-bold mb-2">Enterprise Sales</h3>
              <p className="text-[#8B9DB8] text-[14px] mb-3">For large venues and leagues</p>
              <a href="mailto:sales@courthero.app" className="text-[#00F260] font-medium hover:underline">
                sales@courthero.app
              </a>
            </div>

            {/* Social */}
            <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6">
              <div className="text-[32px] mb-3">💬</div>
              <h3 className="text-white font-bold mb-2">Social Media</h3>
              <p className="text-[#8B9DB8] text-[14px] mb-4">Follow us for updates</p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-[#0A0D12] rounded-lg flex items-center justify-center hover:bg-[#00F260]/10 transition-all">
                  <span className="text-[18px]">𝕏</span>
                </a>
                <a href="#" className="w-10 h-10 bg-[#0A0D12] rounded-lg flex items-center justify-center hover:bg-[#00F260]/10 transition-all">
                  <span className="text-[18px]">in</span>
                </a>
                <a href="#" className="w-10 h-10 bg-[#0A0D12] rounded-lg flex items-center justify-center hover:bg-[#00F260]/10 transition-all">
                  <span className="text-[18px]">📘</span>
                </a>
              </div>
            </div>

            {/* Response Time */}
            <div className="bg-[#00F260]/5 border border-[#00F260]/20 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-2">⏰ Response Time</h3>
              <p className="text-[#B8C4D4] text-[14px]">
                We typically respond within 24 hours on weekdays. Enterprise customers get priority support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
