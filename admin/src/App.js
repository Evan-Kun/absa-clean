import React, { Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'

// Containers
import DefaultLayout from './layout/DefaultLayout';

// Pages
import Login from './views/auth/login/Login';
import Register from './views/auth/register/Register';
import Page404 from './views/auth/page404/Page404';
import Page500 from './views/auth/page500/Page500';


const App = () => {
  // set light theme
  const { setColorMode } = useColorModes()

  useEffect(() => {
    setColorMode('light')
  }, [])

  return (
    <HashRouter >
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          <Route exact path="/login" name="Login Page" element={<Login />} />
          <Route exact path="/register" name="Register Page" element={<Register />} />
          <Route exact path="/404" name="Page 404" element={<Page404 />} />
          <Route exact path="/500" name="Page 500" element={<Page500 />} />
          <Route exact path="/" name="Dashboard" element={<DefaultLayout />} />

          <Route path="*" name="Dashboard" element={<DefaultLayout />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App
