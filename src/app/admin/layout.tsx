import { ChildrenType } from '../../types/component-props'
import ClientAdminLayout from './ClientAdminLayout'

export const dynamic = 'force-dynamic'

const AdminLayout = ({ children }: ChildrenType) => {
  return <ClientAdminLayout>{children}</ClientAdminLayout>
}

export default AdminLayout
