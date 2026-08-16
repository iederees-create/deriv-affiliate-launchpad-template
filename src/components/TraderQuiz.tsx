import { useState } from 'react';
import { Target, Clock, TrendingUp, Mail, ArrowRight, ShieldCheck, Zap, Activity } from 'lucide-react';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What is your primary trading goal?",
    icon: <Target size={24} className="text-[var(--primary)] mb-4" />,
    options: [
      { text: "Fast, daily profits", value: "scalper" },
      { text: "Steady, long-term growth", value: "swing" },
      { text: "Automated passive income", value: "algo" }
    ]
  },
  {
    id: 2,
    question: "How much time can you dedicate to trading daily?",
    icon: <Clock size={24} className="text-[var(--primary)] mb-4" />,
    options: [
      { text: "Less than 1 hour", value: "swing" },
      { text: "1 - 3 hours", value: "algo" },
      { text: "4+ hours (Full time)", value: "scalper" }
    ]
  },
  {
    id: 3,
    question: "How do you handle market volatility?",
    icon: <TrendingUp size={24} className="text-[var(--primary)] mb-4" />,
    options: [
      { text: "I love fast-moving markets (Crash/Boom)", value: "scalper" },
      { text: "I prefer predictable, trending markets", value: "swing" },
      { text: "I rely on strict rules and math", value: "algo" }
    ]
  }
];

export function TraderQuiz() {
  const [step, setStep] = useState(0); // 0 = start, 1-3 = questions, 4 = email capture, 5 = success
  const [answers, setAnswers] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnswer = (val: string) => {
    const newAnswers = [...answers, val];
    setAnswers(newAnswers);
    setStep(step + 1);
  };

  const getPersona = () => {
    const counts = answers.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    let maxCount = 0;
    let persona = "scalper";
    Object.entries(counts).forEach(([key, count]) => {
      if (count > maxCount) { maxCount = count; persona = key; }
    });

    switch(persona) {
      case 'scalper': return { title: "The Aggressive Scalper", icon: <Zap size={32}/>, desc: "You thrive in fast markets. Crash & Boom indices are perfect for you." };
      case 'swing': return { title: "The Strategic Swing Trader", icon: <ShieldCheck size={32}/>, desc: "You value patience and large moves. Currency pairs and Volatility Indices fit your style." };
      case 'algo': return { title: "The Systematic Algo Trader", icon: <Activity size={32}/>, desc: "You trade with math and rules. Deriv's automated bot platforms are your best friend." };
      default: return { title: "The Hybrid Trader", icon: <Target size={32}/>, desc: "You adapt to the market conditions seamlessly." };
    }
  };

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    // Redirect to VIP sign up page instead of just inserting to DB
    window.location.href = `/deriv-affiliate-launchpad-template/auth?email=${encodeURIComponent(email)}`;
  };

  return (
    <div className="quiz-container" style={{
      background: 'rgba(20, 20, 20, 0.6)',
      border: '1px solid var(--line)',
      borderRadius: '16px',
      padding: '32px',
      maxWidth: '500px',
      width: '100%',
      margin: '0 auto',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      backdropFilter: 'blur(10px)'
    }}>
      
      {/* Start Screen */}
      {step === 0 && (
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Discover Your Trading Persona</h3>
          <p style={{ color: 'var(--muted)', marginBottom: '24px', fontSize: '0.95rem' }}>Take our 3-question assessment to find your optimal trading strategy and ideal Deriv markets.</p>
          <button onClick={() => setStep(1)} className="cta cta-primary" style={{ width: '100%' }}>
            Start Assessment
          </button>
        </div>
      )}

      {/* Questions */}
      {step > 0 && step <= QUIZ_QUESTIONS.length && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>{QUIZ_QUESTIONS[step-1].icon}</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Question {step} of 3
          </p>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '24px' }}>{QUIZ_QUESTIONS[step-1].question}</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {QUIZ_QUESTIONS[step-1].options.map((opt, i) => (
              <button 
                key={i} 
                onClick={() => handleAnswer(opt.value)}
                style={{
                  padding: '16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--line)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  fontSize: '0.95rem'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(107, 228, 196, 0.1)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'var(--line)'; }}
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Email Capture */}
      {step === 4 && (
        <div style={{ textAlign: 'center' }}>
           <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Analysis Complete!</h3>
           <p style={{ color: 'var(--muted)', marginBottom: '24px', fontSize: '0.95rem' }}>We've calculated your Trading Persona. Enter your email to unlock your full profile and customized Deriv Strategy Guide.</p>
           
           <form onSubmit={submitEmail} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--muted)' }} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your best email..." 
                  required 
                  disabled={loading}
                  style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '8px', border: '1px solid var(--line)', background: 'rgba(0,0,0,0.3)', color: 'var(--text)', outline: 'none', fontSize: '1rem' }} 
                />
              </div>
              <button 
                type="submit" 
                className="cta cta-primary" 
                disabled={loading}
                style={{ border: 'none', cursor: loading ? 'wait' : 'pointer', width: '100%', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {loading ? "Unlocking..." : <>Unlock My Profile <ArrowRight size={18}/></>}
              </button>
           </form>
           <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '16px' }}>100% Free. No spam.</p>
        </div>
      )}

      {/* Success */}
      {step === 5 && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--primary)', display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            {getPersona().icon}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Your Persona
          </p>
          <h3 style={{ fontSize: '1.6rem', marginBottom: '12px' }}>{getPersona().title}</h3>
          <p style={{ color: 'var(--muted)', marginBottom: '24px', fontSize: '1rem', lineHeight: 1.5 }}>
            {getPersona().desc}
          </p>
          <div style={{ padding: '16px', background: 'rgba(107, 228, 196, 0.1)', border: '1px solid var(--primary)', borderRadius: '8px' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text)' }}>
              <strong>Check your inbox!</strong> We just sent your full strategy guide and recommended Deriv setup to <em>{email}</em>.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
