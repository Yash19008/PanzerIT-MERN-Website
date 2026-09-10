'use client'

import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useEffect, useState, useTransition, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import styles from '../seo/SeoSettingsPanel.module.scss'
import {
  getBreadcrumbData,
  updateBreadcrumbData,
  type PageBreadcrumbData,
} from '../seo/seoStore'
import MediaPickerModal from '@/components/admin/MediaPickerModal'

const PAGES = [
  {
    key: 'breadcrumb_solution_list',
    label: 'Solutions List Page (/solution)',
    defaults: {
      title: 'Cyber Security, Data Protection & Compliance',
      description: 'Identity Management, Data Leak Prevention, Backup & Disaster Recovery, Employee Monitoring, Endpoint Security and Cyber Security Consultancy Services.',
    },
  },
  {
    key: 'breadcrumb_brand_list',
    label: 'Brands List Page (/brand)',
    defaults: {
      title: 'Brands',
      description: 'Explore Panzer IT resources, solutions and security insights designed to help your business stay informed and protected.',
    },
  },
  {
    key: 'breadcrumb_blog_list',
    label: 'Blogs List Page (/blog)',
    defaults: {
      title: 'Blogs',
      description: 'Explore Panzer IT resources, solutions and security insights designed to help your business stay informed and protected.',
    },
  },
]

const EMPTY: PageBreadcrumbData = { title: '', description: '', image: '', imageAlt: '' }

export default function BreadcrumbSettingsPanel() {
  const [selectedKey, setSelectedKey] = useState(PAGES[0].key)
  const [data, setData] = useState<PageBreadcrumbData>(EMPTY)
  const [imagePreview, setImagePreview] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)
  const [showImagePicker, setShowImagePicker] = useState(false)

  const currentPage = PAGES.find((p) => p.key === selectedKey)!

  useEffect(() => {
    let active = true
    setIsLoading(true)
    getBreadcrumbData(selectedKey).then((res) => {
      if (!active) return
      setData(res)
      setImagePreview(res.image || '')
      setIsLoading(false)
    })
    return () => { active = false }
  }, [selectedKey])

  const set = <K extends keyof PageBreadcrumbData>(key: K, value: PageBreadcrumbData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }))

  const handleMediaSelect = (url: string) => {
    setImagePreview(url)
    set('image', url)
  }

  const handleRemoveImage = () => {
    setImagePreview('')
    set('image', '')
    set('imageAlt', '')
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const res = await updateBreadcrumbData(selectedKey, data)
      if (res.success) toast.success('Breadcrumb settings saved')
      else toast.error(res.error ?? 'Save failed')
    })
  }

  return (
    <div className={styles.shell}>
      <PageTitle title="Breadcrumb Settings" subTitle="Settings" />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <IconifyIcon icon="tabler:layout-navbar" />
            <h3>List Page Breadcrumb Configuration</h3>
          </div>
        </div>

        <div className={styles.pageSelector}>
          <label className={styles.pageLabel}>Select Page to Configure:</label>
          <select
            className={styles.platformSelect}
            style={{ width: '100%', maxWidth: '400px' }}
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
          >
            {PAGES.map((p) => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 14px' }}>
              Leave any field blank to use the default value shown on the page.
            </p>

            <label className={styles.field}>
              <span>Breadcrumb Title</span>
              <input
                value={data.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder={currentPage.defaults.title}
              />
            </label>

            <label className={styles.field}>
              <span>Breadcrumb Description</span>
              <textarea
                className={styles.textarea}
                rows={3}
                value={data.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder={currentPage.defaults.description}
              />
            </label>

            <div className={styles.sectionTitle}>
              <IconifyIcon icon="tabler:photo" />
              <h4>Background Image</h4>
            </div>

            <div className={styles.upload}>
              {imagePreview ? (
                <div className={styles.imagePreview}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Breadcrumb background preview" />
                  <button type="button" className={styles.iconBtn} onClick={handleRemoveImage} title="Remove image">
                    <IconifyIcon icon="tabler:x" />
                  </button>
                </div>
              ) : (
                <div
                  className={styles.uploadPlaceholder}
                  style={{ cursor: 'default' }}
                >
                  <IconifyIcon icon="tabler:photo" />
                  <strong>No image selected</strong>
                  <small>Pick an image from the media library below</small>
                </div>
              )}

              <button type="button" className={styles.secondaryBtn} onClick={() => setShowImagePicker(true)}>
                <IconifyIcon icon="tabler:photo-search" /> {imagePreview ? 'Change Image' : 'Pick from Media'}
              </button>
            </div>

            {imagePreview && (
              <label className={styles.field}>
                <span>Image Alt Text</span>
                <input
                  value={data.imageAlt}
                  onChange={(e) => set('imageAlt', e.target.value)}
                  placeholder="Descriptive text for the banner image"
                />
              </label>
            )}

            <button type="submit" className={styles.saveBtn} disabled={isPending}>
              <IconifyIcon icon={isPending ? 'tabler:loader-2' : 'tabler:device-floppy'} />
              {isPending ? 'Saving…' : 'Save Breadcrumb Settings'}
            </button>
          </form>
        )}
      </div>

      {showImagePicker && (
        <MediaPickerModal
          show={showImagePicker}
          onClose={() => setShowImagePicker(false)}
          onSelect={handleMediaSelect}
        />
      )}
    </div>
  )
}
