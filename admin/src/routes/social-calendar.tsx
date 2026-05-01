import * as React from "react";
import { Calendar, Share2, PlusCircle, CheckCircle2 } from "lucide-react";

interface SocialPost {
  id: string;
  tenant_id: string;
  platform: string;
  content: string;
  image_url: string;
  scheduled_at: string;
  published_at: string;
  status: string;
  ai_generated: number;
  created_at: string;
}

export default function SocialCalendarPage() {
  const [data, setData] = React.useState<SocialPost[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/social-posts");
        if (res.ok) {
          setData(await res.json());
        } else {
          console.error("Failed to load posts", res.status);
        }
      } catch (err) {
        console.error("Failed to load posts", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await fetch(`/api/admin/social-posts/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "approved" }),
      });
      setData(prev => prev.map(p => p.id === id ? { ...p, status: "approved" } : p));
    } catch (err) {}
  };

  return (
    <div className="max-w-[1600px] w-full px-10 md:px-12 py-10 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col">
      
      <div className="flex items-center justify-between shrink-0">
         <div className="flex flex-col">
            <h3 className="text-xl font-bold text-white tracking-tight italic">Content Pipeline</h3>
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest leading-none mt-1">Ness Social Distribution Hub</span>
         </div>
         <button className="h-11 px-6 rounded-xl bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest shadow-[0_10px_20px_rgba(0,173,232,0.2)] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3">
           <PlusCircle size={14} strokeWidth={3} /> Injetar Post Manual
         </button>
      </div>

      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
               <div key={i} className="h-80 bg-white/2 rounded-[40px] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="relative group overflow-visible flex flex-col items-center justify-center pt-20">
             <div className="absolute -inset-20 bg-brand-primary/5 rounded-full blur-[100px] opacity-30" />
             <div className="relative bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[48px] radial-gradient-glass shadow-2xl p-16 flex flex-col items-center text-center space-y-6 max-w-xl">
                <div className="w-20 h-20 rounded-3xl bg-white/2 border border-white/10 flex items-center justify-center text-zinc-600">
                   <Calendar size={32} strokeWidth={2.5} />
                </div>
                <div className="space-y-2">
                   <h3 className="text-xl font-bold text-white uppercase tracking-tight italic">Fluxo de Conteúdo em Espera</h3>
                   <p className="text-[11px] font-medium text-zinc-500 leading-relaxed max-w-sm">
                      Nenhum ativo de mídia detectado no pipeline atual. Utilize a Engenharia de IA para gerar briefings e posts automáticos baseados em seus Cases.
                   </p>
                </div>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-y-auto custom-scrollbar h-full pr-2">
            {data.map(post => (
              <div key={post.id} className="group relative bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[40px] radial-gradient-glass shadow-2xl p-8 flex flex-col h-full hover:scale-[1.02] transition-all duration-500 overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/2 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className={`px-4 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${post.platform === 'linkedin' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'bg-pink-500/10 text-pink-400 border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.15)]'}`}>
                    <span className="mr-2 italic opacity-50">#</span>{post.platform}
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    post.status === 'published' ? 'bg-emerald-500/10 text-emerald-500' :
                    post.status === 'approved' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${post.status === 'published' ? 'bg-emerald-500 animate-pulse' : post.status === 'approved' ? 'bg-brand-primary' : 'bg-amber-500'}`} />
                    {post.status === 'published' ? 'Distribuído' : post.status === 'approved' ? 'Auditado' : 'Draft Protocol'}
                  </div>
                </div>

                <div className="relative z-10 flex-1 space-y-6">
                   <div className="p-6 rounded-3xl bg-white/2 border border-white/5 shadow-inner">
                      <p className="text-sm font-medium text-zinc-300 leading-relaxed whitespace-pre-wrap italic">"{post.content}"</p>
                   </div>
                   
                   <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto bg-transparent">
                      <div className="flex flex-col gap-1">
                         <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Scheduled Node</span>
                         <span className="text-[10px] font-mono text-white tracking-tighter italic">
                           {post.scheduled_at ? new Date(post.scheduled_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : 'NO SCHEDULE'}
                         </span>
                      </div>
                      
                      {post.status === 'draft' && (
                        <button 
                           onClick={() => handleApprove(post.id)} 
                           className="h-10 px-5 rounded-xl bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                           <CheckCircle2 size={12} strokeWidth={3} /> Validar Pub
                        </button>
                      )}
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

  );
}
