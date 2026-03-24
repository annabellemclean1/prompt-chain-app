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

  const [flavors, setFlavors] = useState<Flavor[]>([])
  const [selectedFlavor, setSelectedFlavor] = useState<Flavor | null>(null)
  const [steps, setSteps] = useState<Step[]>([])
  const [images, setImages] = useState<Image[]>([])
  const [selectedImageId, setSelectedImageId] = useState('')

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFlavors()
    loadImages()
  }, [])

  useEffect(() => {
    if (selectedFlavor) loadSteps(selectedFlavor.id)
  }, [selectedFlavor])

  const loadFlavors = async () => {
    setLoading(true)
    const { data } = await supabase.from('humor_flavors').select('*').order('id')
    setFlavors(data || [])
    setLoading(false)
  }

  const loadSteps = async (flavorId: number) => {
    const { data } = await supabase
      .from('humor_flavor_steps')
      .select('*')
      .eq('humor_flavor_id', flavorId)
      .order('order_by')
    setSteps(data || [])
  }

  const loadImages = async () => {
    const { data } = await supabase.from('images').select('id, url').limit(50)
    setImages(data || [])
    if (data?.length) setSelectedImageId(data[0].id)
  }

  const theme = {
    bg: '#0f172a',
    panel: '#1e293b',
    border: 'rgba(255,255,255,0.06)',
    accent: '#00ff88',
    subAccent: '#00e5ff',
    textMain: '#f8fafc',
    textMuted: '#94a3b8'
  }

  const glassPanel = {
    background: theme.panel,
    border: `1px solid ${theme.border}`,
    borderRadius: '12px'
  }

  return (
    <div
      style={{
        padding: '40px',
        minHeight: '100vh',
        background: theme.bg,
        color: theme.textMain,
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      {/* HEADER */}
      <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: 24 }}>
        Pipeline <span style={{ color: theme.accent }}>Studio</span>
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '24px',
          alignItems: 'start'
        }}
      >
        {/* SIDEBAR */}
        <div style={{ ...glassPanel, maxHeight: '80vh', overflowY: 'auto' }}>
          <div style={{ padding: 16 }}>
            {loading ? (
              <div>Loading...</div>
            ) : (
              flavors.map(f => (
                <div
                  key={f.id}
                  onClick={() => setSelectedFlavor(f)}
                  style={{
                    padding: 12,
                    cursor: 'pointer',
                    borderRadius: 6,
                    marginBottom: 6,
                    background:
                      selectedFlavor?.id === f.id
                        ? 'rgba(0,255,136,0.1)'
                        : 'transparent'
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{f.slug}</div>
                  <div
                    style={{
                      fontSize: 12,
                      color: theme.textMuted,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {f.description}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MAIN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {selectedFlavor ? (
            <>
              {/* FLAVOR HEADER */}
              <div style={{ ...glassPanel, padding: 20 }}>
                <h2 style={{ fontSize: 22, fontWeight: 900 }}>
                  {selectedFlavor.slug}
                </h2>
                <p style={{ color: theme.textMuted }}>
                  {selectedFlavor.description}
                </p>
              </div>

              {/* STEPS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {steps.map((s, idx) => (
                  <div
                    key={s.id}
                    style={{
                      ...glassPanel,
                      padding: 16,
                      maxWidth: '100%',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        marginBottom: 12,
                        fontWeight: 800,
                        color: theme.accent
                      }}
                    >
                      STEP {idx + 1}: {s.description}
                    </div>

                    {/* FIXED RESPONSIVE GRID */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 16
                      }}
                    >
                      <div
                        style={{
                          background: '#020617',
                          padding: 12,
                          borderRadius: 8,
                          overflowWrap: 'break-word'
                        }}
                      >
                        <div style={{ fontSize: 10, color: theme.textMuted }}>
                          SYSTEM
                        </div>
                        <div style={{ fontSize: 12 }}>
                          {s.llm_system_prompt}
                        </div>
                      </div>

                      <div
                        style={{
                          background: '#020617',
                          padding: 12,
                          borderRadius: 8,
                          overflowWrap: 'break-word'
                        }}
                      >
                        <div style={{ fontSize: 10, color: theme.textMuted }}>
                          USER
                        </div>
                        <div style={{ fontSize: 12 }}>
                          {s.llm_user_prompt}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* IMAGE ROW */}
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
                {images.map(img => (
                  <img
                    key={img.id}
                    src={img.url}
                    onClick={() => setSelectedImageId(img.id)}
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 6,
                      border:
                        selectedImageId === img.id
                          ? `2px solid ${theme.accent}`
                          : 'none'
                    }}
                  />
                ))}
              </div>
            </>
          ) : (
            <div style={{ opacity: 0.5 }}>
              Select a configuration
            </div>
          )}
        </div>
      </div>
    </div>
  )
}