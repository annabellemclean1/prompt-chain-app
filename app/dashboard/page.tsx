'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Flavor = { id: number; slug: string; description: string; created_datetime_utc: string }
type Step = {
  id: number; order_by: number; description: string; llm_system_prompt: string;
  llm_user_prompt: string; llm_temperature: number; llm_model_id: number;
  humor_flavor_id: number; humor_flavor_step_type_id: number;
  llm_input_type_id: number; llm_output_type_id: number;
}
type Image = { id: string; url: string }
type Caption = { id: string; content: string }

export default function DashboardPage() {
  const supabase = createClient()

  // --- LOGIC (UNTOUCHED) ---
  const [flavors, setFlavors] = useState<Flavor[]>([])
  const [selectedFlavor, setSelectedFlavor] = useState<Flavor | null>(null)
  const [flavorModal, setFlavorModal] = useState<'create' | 'edit' | 'delete' | null>(null)
  const [flavorForm, setFlavorForm] = useState({ slug: '', description: '' })
  const [steps, setSteps] = useState<Step[]>([])
  const [stepModal, setStepModal] = useState<'create' | 'edit' | 'delete' | null>(null)
  const [selectedStep, setSelectedStep] = useState<Step | null>(null)
  const [stepForm, setStepForm] = useState({
    description: '', llm_system_prompt: '', llm_user_prompt: '',
    llm_temperature: '0.7', llm_model_id: '6', humor_flavor_step_type_id: '1',
    llm_input_type_id: '1', llm_output_type_id: '1'
  })
  const [flavorCaptions, setFlavorCaptions] = useState<Caption[]>([])
  const [captionsLoading, setCaptionsLoading] = useState(false)
  const [images, setImages] = useState<Image[]>([])
  const [selectedImageId, setSelectedImageId] = useState('')
  const [testLoading, setTestLoading] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])
  const [testError, setTestError] = useState('')
  const [token, setToken] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFlavors(); loadImages()
    supabase.auth.getSession().then(({ data: { session } }) => setToken(session?.access_token ?? ''))
  }, [])

  useEffect(() => {
    if (selectedFlavor) { loadSteps(selectedFlavor.id); loadFlavorCaptions(selectedFlavor.id) }
  }, [selectedFlavor])

  const loadFlavors = async () => {
    setLoading(true); const { data } = await supabase.from('humor_flavors').select('*').order('id')
    setFlavors(data || []); setLoading(false)
  }
  const loadSteps = async (flavorId: number) => {
    const { data } = await supabase.from('humor_flavor_steps').select('*').eq('humor_flavor_id', flavorId).order('order_by')
    setSteps(data || [])
  }
  const loadFlavorCaptions = async (flavorId: number) => {
    setCaptionsLoading(true); const { data } = await supabase.from('captions').select('id, content').eq('humor_flavor_id', flavorId).order('created_datetime_utc', { ascending: false }).limit(20)
    setFlavorCaptions(data || []); setCaptionsLoading(false)
  }
  const loadImages = async () => {
    const { data } = await supabase.from('images').select('id, url').limit(50)
    setImages(data || []); if (data?.length) setSelectedImageId(data[0].id)
  }

  const openCreateFlavor = () => { setFlavorForm({ slug: '', description: '' }); setError(''); setFlavorModal('create') }
  const openEditFlavor = (f: Flavor) => { setFlavorForm({ slug: f.slug, description: f.description }); setError(''); setFlavorModal('edit') }
  const saveFlavor = async () => {
    setSaving(true); const payload = { slug: flavorForm.slug, description: flavorForm.description }
    const { error: e } = flavorModal === 'create' ? await supabase.from('humor_flavors').insert(payload) : await supabase.from('humor_flavors').update(payload).eq('id', selectedFlavor!.id)
    if (e) { setError(e.message); setSaving(false); return }
    setSaving(false); setFlavorModal(null); loadFlavors(); if (flavorModal === 'edit' && selectedFlavor) setSelectedFlavor({ ...selectedFlavor, ...payload })
  }
  const deleteFlavor = async () => {
    if (!selectedFlavor) return; setSaving(true)
    const { error: e } = await supabase.from('humor_flavors').delete().eq('id', selectedFlavor.id)
    if (e) { setError(e.message); setSaving(false); return }
    setSaving(false); setFlavorModal(null); setSelectedFlavor(null); setSteps([]); loadFlavors()
  }

  const openCreateStep = () => { setStepForm({ description: '', llm_system_prompt: '', llm_user_prompt: '', llm_temperature: '0.7', llm_model_id: '6', humor_flavor_step_type_id: '1', llm_input_type_id: '1', llm_output_type_id: '1' }); setError(''); setStepModal('create') }
  const openEditStep = (s: Step) => { setSelectedStep(s); setStepForm({ description: s.description ?? '', llm_system_prompt: s.llm_system_prompt ?? '', llm_user_prompt: s.llm_user_prompt ?? '', llm_temperature: String(s.llm_temperature ?? 0.7), llm_model_id: String(s.llm_model_id ?? '6'), humor_flavor_step_type_id: String(s.humor_flavor_step_type_id ?? '1'), llm_input_type_id: String(s.llm_input_type_id ?? '1'), llm_output_type_id: String(s.llm_output_type_id ?? '1') }); setError(''); setStepModal('edit') }
  const saveStep = async () => {
    if (!selectedFlavor) return; setSaving(true)
    const maxOrder = steps.length > 0 ? Math.max(...steps.map(s => s.order_by)) : 0
    const payload: any = { humor_flavor_id: selectedFlavor.id, description: stepForm.description || null, llm_system_prompt: stepForm.llm_system_prompt || null, llm_user_prompt: stepForm.llm_user_prompt || null, llm_temperature: Number(stepForm.llm_temperature), llm_model_id: Number(stepForm.llm_model_id), humor_flavor_step_type_id: Number(stepForm.humor_flavor_step_type_id), llm_input_type_id: Number(stepForm.llm_input_type_id), llm_output_type_id: Number(stepForm.llm_output_type_id) }
    if (stepModal === 'create') payload.order_by = maxOrder + 1
    const { error: e } = stepModal === 'create' ? await supabase.from('humor_flavor_steps').insert(payload) : await supabase.from('humor_flavor_steps').update(payload).eq('id', selectedStep!.id)
    if (e) { setError(e.message); setSaving(false); return }
    setSaving(false); setStepModal(null); loadSteps(selectedFlavor.id)
  }
  const deleteStep = async () => {
    if (!selectedStep || !selectedFlavor) return; setSaving(true)
    const { error: e } = await supabase.from('humor_flavor_steps').delete().eq('id', selectedStep.id)
    if (e) { setError(e.message); setSaving(false); return }
    setSaving(false); setStepModal(null); loadSteps(selectedFlavor.id)
  }
  const moveStep = async (step: Step, dir: 'up' | 'down') => {
    const idx = steps.findIndex(s => s.id === step.id); const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= steps.length) return
    const swap = steps[swapIdx]; await supabase.from('humor_flavor_steps').update({ order_by: swap.order_by }).eq('id', step.id); await supabase.from('humor_flavor_steps').update({ order_by: step.order_by }).eq('id', swap.id); loadSteps(selectedFlavor!.id)
  }

  const testFlavor = async () => {
    if (!selectedFlavor || !selectedImageId || !token) return; setTestLoading(true); setTestError(''); setTestResults([])
    try {
      const res = await fetch('https://api.almostcrackd.ai/pipeline/generate-captions', { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ imageId: selectedImageId, humorFlavorId: selectedFlavor.id }) })
      if (!res.ok) throw new Error(`API error: ${await res.text()}`)
      const data = await res.json(); setTestResults(Array.isArray(data) ? data : [data])
    } catch (e: any) { setTestError(e.message) }
    setTestLoading(false)
  }

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-8 py-10">

        {/* Page Header */}
        <div className="flex justify-between items-end mb-10 border-b border-slate-200 dark:border-white/5 pb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Engine Console</h1>
            <p className="text-slate-500 text-sm mt-1">Configure humor pipelines and chaining logic.</p>
          </div>
          <button
            onClick={openCreateFlavor}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-indigo-500/10"
          >
            + ADD FLAVOR
          </button>
        </div>

        <div className="grid grid-cols-12 gap-10">

          {/* LEFT: Sidebar Navigation */}
          <div className="col-span-3">
            <div className="bg-white dark:bg-[#111] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Library</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-[70vh] overflow-y-auto">
                {loading ? (
                  <div className="p-10 text-center text-xs text-slate-400 animate-pulse">Syncing...</div>
                ) : flavors.map(f => (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFlavor(f)}
                    className={`px-5 py-4 cursor-pointer transition-all group ${
                      selectedFlavor?.id === f.id ? 'bg-indigo-500/5' : 'hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className={`text-sm font-semibold transition-colors ${selectedFlavor?.id === f.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-400 group-hover:text-black dark:group-hover:text-white'}`}>
                      {f.slug}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-1 italic">{f.description || 'No meta description'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Main Canvas */}
          <div className="col-span-9 space-y-8">
            {selectedFlavor ? (
              <>
                {/* Active Info Section */}
                <div className="bg-white dark:bg-[#111] p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-500/10 mb-3 inline-block">ID: {selectedFlavor.id}</span>
                      <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{selectedFlavor.slug}</h2>
                      <p className="text-slate-500 mt-2 max-w-2xl text-sm leading-relaxed">{selectedFlavor.description || 'Provide a description for this behavior model.'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditFlavor(selectedFlavor)} className="px-4 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-600 dark:text-slate-300">Edit</button>
                      <button onClick={() => setFlavorModal('delete')} className="px-4 py-2 border border-red-100 dark:border-red-900/20 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">Delete</button>
                    </div>
                  </div>
                </div>

                {/* Steps Timeline Area */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Logic Chain</span>
                    <button onClick={openCreateStep} className="text-xs font-bold text-indigo-500 hover:text-indigo-400 transition-colors">+ NEW STEP</button>
                  </div>

                  <div className="space-y-6 relative">
                    {/* Visual Connector Line */}
                    <div className="absolute left-[26px] top-6 bottom-6 w-[2px] bg-slate-200 dark:bg-white/5" />

                    {steps.map((s, idx) => (
                      <div key={s.id} className="relative pl-14 group">
                        {/* Number Indicator */}
                        <div className="absolute left-0 top-6 w-[52px] h-[52px] rounded-full border-2 border-white dark:border-[#0a0a0a] bg-slate-100 dark:bg-[#1a1a1a] flex items-center justify-center z-10 text-xs font-black text-slate-400 group-hover:text-indigo-500 transition-all shadow-sm">
                          {idx + 1}
                        </div>

                        <div className="bg-white dark:bg-[#111] rounded-2xl border border-slate-200 dark:border-white/5 p-7 transition-all group-hover:border-indigo-500/20 shadow-sm">
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-900 dark:text-white">{s.description || 'Unnamed Step'}</h3>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                              <button onClick={() => moveStep(s, 'up')} className="p-2 text-slate-400 hover:text-indigo-500">↑</button>
                              <button onClick={() => moveStep(s, 'down')} className="p-2 text-slate-400 hover:text-indigo-500">↓</button>
                              <button onClick={() => openEditStep(s)} className="p-2 text-slate-400 hover:text-indigo-500">Edit</button>
                              <button onClick={() => openDeleteStep(s)} className="p-2 text-red-400">Del</button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-8">
                            <div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">System Context</div>
                              <div className="bg-slate-50 dark:bg-black/40 rounded-xl p-4 text-[11px] text-slate-600 dark:text-slate-400 font-mono leading-relaxed min-h-[60px] max-h-[120px] overflow-auto border border-slate-100 dark:border-white/[0.02]">
                                {s.llm_system_prompt || 'No context set'}
                              </div>
                            </div>
                            <div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">User Instructions</div>
                              <div className="bg-slate-50 dark:bg-black/40 rounded-xl p-4 text-[11px] text-slate-600 dark:text-slate-400 font-mono leading-relaxed min-h-[60px] max-h-[120px] overflow-auto border border-slate-100 dark:border-white/[0.02]">
                                {s.llm_user_prompt || 'No instruction set'}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-6 mt-6 pt-4 border-t border-slate-50 dark:border-white/5">
                            <span className="text-[10px] font-mono text-slate-400 uppercase">Temp: <span className="text-indigo-500">{s.llm_temperature}</span></span>
                            <span className="text-[10px] font-mono text-slate-400 uppercase">Model_ID: <span className="text-indigo-500">{s.llm_model_id}</span></span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulation Area */}
                <div className="bg-white dark:bg-[#111] rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
                  <div className="px-8 py-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/[0.02]">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white italic underline underline-offset-4 decoration-indigo-500">Sandbox</span>
                    <button onClick={testFlavor} disabled={testLoading} className="px-6 py-2 bg-slate-900 dark:bg-white dark:text-black text-white text-[10px] font-black rounded-lg transition-all hover:opacity-80 active:scale-95 disabled:opacity-20 uppercase tracking-widest">
                      {testLoading ? 'Processing Chain...' : 'Run Simulation'}
                    </button>
                  </div>
                  <div className="p-8 space-y-8">
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">Select Source Image</div>
                      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                        {images.slice(0, 15).map(img => (
                          <div key={img.id} onClick={() => setSelectedImageId(img.id)} className={`relative flex-none w-20 h-20 rounded-xl overflow-hidden cursor-pointer transition-all border-2 ${selectedImageId === img.id ? 'border-indigo-500 scale-105 shadow-xl' : 'border-transparent grayscale opacity-40 hover:opacity-100 hover:grayscale-0'}`}>
                            <img src={img.url} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-black/50 rounded-2xl p-6 border border-slate-100 dark:border-white/5 min-h-[120px]">
                      {testError && <div className="text-red-500 text-xs mb-4 font-bold tracking-tighter uppercase p-3 bg-red-500/5 rounded-lg border border-red-500/10">Error: {testError}</div>}
                      {testResults.length > 0 ? (
                        <div className="space-y-4">
                          {testResults.map((r, i) => (
                            <div key={i} className="text-sm text-slate-800 dark:text-slate-300 leading-relaxed animate-in fade-in slide-in-from-left duration-300">
                              <span className="text-indigo-500 font-bold mr-2 opacity-50">→</span> {r.content ?? r}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs text-slate-400 italic">No output in console.</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Production History */}
                <div className="bg-white dark:bg-[#111] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-50 dark:border-white/5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Output Logs</div>
                  <div className="max-h-[300px] overflow-auto divide-y divide-slate-50 dark:divide-white/5">
                    {flavorCaptions.length ? flavorCaptions.map(c => (
                      <div key={c.id} className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">{c.content}</div>
                    )) : (
                      <div className="p-8 text-center text-xs text-slate-400 italic font-mono uppercase tracking-widest">No active logs</div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* EMPTY STATE */
              <div className="h-[70vh] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-3xl bg-white dark:bg-[#111] opacity-60">
                <div className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Select a flavor to begin</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODALS (Simplified for the "Graphite" look) --- */}
      {(flavorModal === 'create' || flavorModal === 'edit') && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-[440px] p-10 shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">{flavorModal === 'create' ? 'New Flavor' : 'Edit Flavor'}</h3>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Identifier Slug</label>
                <input className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white" value={flavorForm.slug} onChange={e => setFlavorForm(v => ({ ...v, slug: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Description</label>
                <textarea className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white min-h-[100px]" value={flavorForm.description} onChange={e => setFlavorForm(v => ({ ...v, description: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setFlavorModal(null)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">Cancel</button>
                <button onClick={saveFlavor} disabled={saving} className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50">{saving ? 'Syncing...' : 'Save Changes'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {flavorModal === 'delete' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[110] p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111] border border-red-500/20 rounded-3xl w-full max-w-[360px] p-10 text-center shadow-2xl">
            <h3 className="text-xl font-black mb-4 text-red-500 uppercase tracking-tighter">Confirm Purge</h3>
            <p className="text-xs text-slate-500 mb-8 leading-relaxed">This will permanently delete the flavor <span className="text-black dark:text-white font-bold italic">"{selectedFlavor?.slug}"</span> and all associated sequence steps.</p>
            <div className="flex gap-3">
              <button onClick={() => setFlavorModal(null)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">Abort</button>
              <button onClick={deleteFlavor} disabled={saving} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-500/20">{saving ? '...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Step Create/Edit Modal */}
      {(stepModal === 'create' || stepModal === 'edit') && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-[40px] w-full max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-10 pb-0 overflow-y-auto custom-scrollbar space-y-8 mb-10">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{stepModal === 'create' ? 'Append Step' : 'Update Step'}</h3>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Description</label>
                  <input className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" value={stepForm.description} onChange={e => setStepForm(v => ({ ...v, description: e.target.value }))} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Temperature</label>
                    <input className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" value={stepForm.llm_temperature} onChange={e => setStepForm(v => ({ ...v, llm_temperature: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Model ID</label>
                    <input className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" value={stepForm.llm_model_id} onChange={e => setStepForm(v => ({ ...v, llm_model_id: e.target.value }))} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">System Prompt</label>
                  <textarea className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-4 text-xs font-mono dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[120px]" value={stepForm.llm_system_prompt} onChange={e => setStepForm(v => ({ ...v, llm_system_prompt: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">User Prompt Template</label>
                  <textarea className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-4 text-xs font-mono dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[120px]" value={stepForm.llm_user_prompt} onChange={e => setStepForm(v => ({ ...v, llm_user_prompt: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className="p-10 border-t border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex gap-3">
              <button onClick={() => setStepModal(null)} className="flex-1 px-4 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all">Discard</button>
              <button onClick={saveStep} disabled={saving} className="flex-1 px-4 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50">{saving ? 'Syncing...' : 'Save Step'}</button>
            </div>
          </div>
        </div>
      )}

      {stepModal === 'delete' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[110] p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111] border border-red-500/20 rounded-3xl w-full max-w-[360px] p-10 text-center shadow-2xl">
            <h3 className="text-xl font-black mb-4 text-red-500 uppercase tracking-tighter">Delete Step</h3>
            <p className="text-xs text-slate-500 mb-8 leading-relaxed">Remove <span className="text-black dark:text-white font-bold italic">Step {selectedStep?.order_by}</span> from the sequence? This action is immediate.</p>
            <div className="flex gap-3">
              <button onClick={() => setStepModal(null)} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">Abort</button>
              <button onClick={deleteStep} disabled={saving} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-500/20">{saving ? '...' : 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); }
      `}</style>

    </div>
  )
}