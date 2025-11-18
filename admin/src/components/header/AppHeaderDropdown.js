import React from 'react'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilEnvelopeOpen,
  cilLockLocked,
  cilTask,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../ToastContext';
import dummyUser from "../../assets/images/avatars/dummyUser.png";

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const toast = useToast();
  const loginUserEmail = localStorage.getItem('loginUserEmail');


  const logout = () => {
    localStorage.clear();
    navigate('/login');
    toast('Profile Logout', 'success');
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={dummyUser} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">Account</CDropdownHeader>
        {/* <CDropdownDivider /> */}
        {loginUserEmail && (
          <CDropdownItem disabled>
            <CIcon icon={cilUser} className="me-2" />
            {loginUserEmail}
          </CDropdownItem>
        )}
        <CDropdownItem onClick={() => logout()}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
