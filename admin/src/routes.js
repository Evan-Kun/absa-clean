import React from 'react'
import Page404 from './views/auth/page404/Page404'
import Dashboard from './views/dashboard/Dashboard'
import User from './views/user/User'
import Profile from './views/profile/Profile'
import Page from './views/page/Page';
import Skills from './views/skills/Skills'

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/users', name: 'Users', element: User },
  { path: '/profile', name: 'Profile', element: Profile },
  { path: '/pages', name: 'Page', element: Page },
  { path: '/skills', name: 'Skills', element: Skills },

  { path: '*', name: 'Login', element: Page404 },
]

export default routes
