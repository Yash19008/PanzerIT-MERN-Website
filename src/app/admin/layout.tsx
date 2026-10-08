import { ChildrenType } from '../../types/component-props'
import ClientAdminLayout from './ClientAdminLayout'
import { readSetting } from './settings/settingsStore'

export const dynamic = 'force-dynamic'

const AdminLayout = async ({ children }: ChildrenType) => {
  const dynamicFavicon = await readSetting<string>('frontend_favicon', '')
  const faviconUrl = dynamicFavicon || '/assets/images/favicons/favicon.jpeg'

  return (
    <>
      <link rel="icon" href={faviconUrl} sizes="any" />
      <link rel="shortcut icon" href={faviconUrl} />
      <link rel="apple-touch-icon" href={faviconUrl} />
      <ClientAdminLayout>{children}</ClientAdminLayout>
    </>
  )
}

export default AdminLayout
