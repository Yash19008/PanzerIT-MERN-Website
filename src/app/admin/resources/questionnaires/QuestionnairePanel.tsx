'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import {
  getResourceDirectorySettings,
  updateResourceDirectorySettings,
} from '../resourceStore'
import {
  DEFAULT_DIRECTORY_SETTINGS,
  type ResourceDirectorySettings
} from '../resourceTypes'
import tableStyles from '../../solutions/SolutionsPanel.module.scss'
import formStyles from '../../posts/PostFormPage.module.scss'

const QuestionnairePanel = () => {
  // Directory / External Questionnaire Link Settings
  const [dirSettings, setDirSettings] = useState<ResourceDirectorySettings>(DEFAULT_DIRECTORY_SETTINGS)
  const [savingDir, setSavingDir] = useState(false)

  const load = async () => {
    const ds = await getResourceDirectorySettings()
    setDirSettings(ds)
  }

  useEffect(() => { load() }, [])

  const setDir = <K extends keyof ResourceDirectorySettings>(key: K, value: ResourceDirectorySettings[K]) =>
    setDirSettings((prev: ResourceDirectorySettings) => ({ ...prev, [key]: value }))

  const handleSaveDirSettings = async (e: FormEvent) => {
    e.preventDefault()
    try {
      setSavingDir(true)
      const res = await updateResourceDirectorySettings(dirSettings)
      if (res.success) {
        toast.success('Directory link settings saved successfully!')
      } else {
        toast.error(res.error || 'Failed to save settings')
      }
    } catch {
      toast.error('An error occurred while saving directory settings')
    } finally {
      setSavingDir(false)
    }
  }

  return (
    <>
      <PageTitle title="Questionnaires" subTitle="Resources" />

      {/* ── Directory / External Questionnaire Link Settings ── */}
      <div className={tableStyles.card} style={{ border: '1px solid #cbd5e1' }}>
        <div className={tableStyles.cardHeader} style={{ background: '#f8fafc' }}>
          <div className={tableStyles.cardHeaderLeft}>
            <IconifyIcon icon="tabler:link" style={{ fontSize: '22px', color: '#1053f3' }} />
            <div>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Resources Page "Directories / Questionnaire" Sidebar Card</h3>
              <small style={{ color: '#64748b' }}>Configure the sidebar card and questionnaire link shown on the public Resources page (/resources)</small>
            </div>
          </div>
          <div className={tableStyles.headerActions}>
            <Link href="/admin/resources" className={formStyles.backBtn}>
              <IconifyIcon icon="tabler:arrow-left" />
              Back to Resources
            </Link>
          </div>
        </div>

        <form onSubmit={handleSaveDirSettings} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                Card Heading / Title
              </label>
              <input
                type="text"
                value={dirSettings.title}
                onChange={e => setDir('title', e.target.value)}
                placeholder="e.g. Directories"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                Button Text
              </label>
              <input
                type="text"
                value={dirSettings.buttonText}
                onChange={e => setDir('buttonText', e.target.value)}
                placeholder="e.g. Open Questionnaire"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '14px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Button Link URL (Destination)
            </label>
            <input
              type="text"
              value={dirSettings.buttonLink}
              onChange={e => setDir('buttonLink', e.target.value)}
              placeholder="e.g. https://panzerit.com/resources or /contact"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Card Description
            </label>
            <textarea
              rows={3}
              value={dirSettings.description}
              onChange={e => setDir('description', e.target.value)}
              placeholder="e.g. Access and fill out our questionnaires by clicking the link below."
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '14px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0, fontSize: '14px', fontWeight: 600, color: '#334155' }}>
              <input
                type="checkbox"
                checked={dirSettings.openInNewTab !== false}
                onChange={e => setDir('openInNewTab', e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              Open link in new tab (_blank)
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0, fontSize: '14px', fontWeight: 600, color: '#334155' }}>
              <input
                type="checkbox"
                checked={dirSettings.enabled !== false}
                onChange={e => setDir('enabled', e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              Display this card on Resources sidebar
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              type="submit"
              disabled={savingDir}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                background: '#1053f3',
                color: '#fff',
                border: 'none',
                borderRadius: '7px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                opacity: savingDir ? 0.7 : 1
              }}
            >
              <IconifyIcon icon={savingDir ? 'tabler:loader-2' : 'tabler:device-floppy'} />
              {savingDir ? 'Saving...' : 'Save Questionnaire Link Settings'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default QuestionnairePanel


