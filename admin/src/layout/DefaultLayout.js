import React, { useState } from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'

const DefaultLayout = () => {
  const [loader, setLoader] = useState(false);

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader loader={loader} />
        <div className="body flex-grow-1">
          <AppContent setLoader={setLoader} loader={loader} />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout
