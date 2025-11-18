import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilUser,
  cilBorderAll
} from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilBorderAll} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Manage',
    to: '/admin',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'User',
        to: '/users',
      },
      {
        component: CNavItem,
        name: 'Profile',
        to: '/profile',
      },
      {
        component: CNavItem,
        name: 'Pages',
        to: '/pages',
      },
      {
        component: CNavItem,
        name: 'Skills',
        to: '/skills',
      },
    ],
  },
]

export default _nav
