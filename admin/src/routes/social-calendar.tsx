import * as React from "react";
import { Calendar, PlusCircle, CheckCircle2 } from "lucide-react";
import { useApiResource } from "../hooks";

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
  const { data, loading, refetch } = useApiResource<SocialPost[]>("/api/admin/social-posts");
  const items = data ?? [];

  const handleApprove = async (id: string) => {
    try {
      await fetch(`/api/admin/social-posts/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "approved" }),
      });
      refetch();
    } catch (err) {}
  };

  return (
    <div className="max-w-7xl w-full px-6 py-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mx-auto">

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
             <div key={i} className="h-64 bg-card border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl">
           <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-zinc-500 mb-6">
              <Calendar size={28} strokeWidth={1.5} />
           </div>
           <h3 className="text-lg font-semibold text-white">Nenhum post agendado</h3>
           <p className="text-sm text-zinc-500 mt-2 max-w-sm text-center">
              Nenhum conteúdo no pipeline. Utilize a IA para gerar posts automáticos.
           </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(post => (
            <div key={post.id} className="group bg-card border border-border rounded-xl p-6 flex flex-col hover:border-border transition-colors">
              
              <div className="flex items-center justify-between mb-4">
                <div className={`px-3 py-1 rounded-md text-xs font-semibold uppercase ${post.platform === 'linkedin' ? 'bg-blue-500/10 text-blue-400' : 'bg-pink-500/10 text-pink-400'}`}>
                  {post.platform}
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                  post.status === 'published' ? 'bg-emerald-500/10 text-emerald-500' :
                  post.status === 'approved' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-amber-500/10 text-amber-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${post.status === 'published' ? 'bg-emerald-500' : post.status === 'approved' ? 'bg-brand-primary' : 'bg-amber-500'}`} />
                  {post.status === 'published' ? 'Publicado' : post.status === 'approved' ? 'Aprovado' : 'Rascunho'}
                </div>
              </div>

              <div className="flex-1 mb-4">
                 <div className="p-4 rounded-lg bg-background border border-border">
                    <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap line-clamp-4">{post.content}</p>
                 </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-border">
                 <div>
                    <span className="text-xs text-zinc-500">Agendado</span>
                    <span className="text-xs font-mono text-zinc-400 ml-2">
                      {post.scheduled_at ? new Date(post.scheduled_at).toLocaleDateString('pt-BR') : '—'}
                    </span>
                 </div>
                 
                 {post.status === 'draft' && (
                   <button 
                      onClick={() => handleApprove(post.id)} 
                      className="h-8 px-4 rounded-md bg-brand-primary text-white text-xs font-semibold hover:brightness-110 transition-all flex items-center gap-1.5"
                   >
                      <CheckCircle2 size={12} strokeWidth={2} /> Aprovar
                   </button>
                 )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
