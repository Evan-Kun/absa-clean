import React, { useEffect, useState } from 'react'
import { CCard, CCol, CRow, CSpinner, } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPeople, cibWebcomponentsOrg } from '@coreui/icons'
import { useToast } from '../../components/ToastContext';
import commonSerive from '../../services/api-services/common-api-service'


const Dashboard = () => {
  const { fetchAllcount, backUpDatabase } = commonSerive();
  const [count, setCount] = useState({});
  const [loader, setLoader] = useState(false);
  const [proccessLoader, setProccessLoader] = useState(false);
  const userRole = localStorage.getItem('role');
  const toast = useToast();

  useEffect(() => {
    getAllcount();
  }, [])

  const getAllcount = async () => {
    try {
      setLoader(true);
      const resCount = await fetchAllcount();
      if (resCount?.success === true) {
        setCount(resCount?.data);
      }
    } catch (error) {
      toast(error?.message || 'An error occurred While getting Count', 'danger');
    }
    setLoader(false);
  }

  const dbDump = async () => {
    try {
      setProccessLoader(true);
      const res = await backUpDatabase();
      if (res.success) {
        toast(res?.message || 'Data backup success');
      } else {
        toast('An error occurred While process', 'danger');
      }
      setProccessLoader(false);
    } catch (error) {
      setProccessLoader(false);
      toast(error?.message || 'An error occurred While getting Count', 'danger');
    }
  }


  return (
    <>
      <CRow>
        {loader ?
          <div className='text-center'><CSpinner color="primary" /></div>
          : <>
            {/* Organizations */}
            <CRow xs={12}>
              {count?.organizations && (
                <CCol xs={4}>
                  <CCard >
                    <div className="card-body d-flex align-items-center justify-content-between">
                      <div className="d-flex">
                        <div className="me-3 text-white bg-primary p-3"> <CIcon icon={cibWebcomponentsOrg} height={24} /> </div>
                        <div>
                          <div className="fs-3 fw-semibold text-primary">{count?.organizations?.total || '0'}</div>
                          <div className="text-body-secondary text-uppercase fw-semibold small">Total Organizations</div>
                        </div>
                      </div>
                      <div>
                        <div className="row text-center">
                          <div className="col">
                            <div className="fs-5 fw-semibold text-primary">{count?.organizations?.active || '0'}</div>
                            <div className="text-uppercase text-body-secondary small">Active</div>
                          </div>
                          <div className="vr"></div>
                          <div className="col"><div class="fs-5 fw-semibold text-primary">{count?.organizations?.inactive || '0'}</div>
                            <div className="text-uppercase text-body-secondary small">Inactive</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CCard>
                </CCol>
              )}

              {/* Users */}
              {count?.user && (
                <CCol xs={4}>
                  <CCard >
                    <div className="card-body d-flex align-items-center justify-content-between">
                      <div className="d-flex">
                        <div className="me-3 text-white bg-secondary p-3"> <CIcon icon={cilPeople} height={24} /> </div>
                        <div>
                          <div className="fs-3 fw-semibold text-secondary">{count?.user?.total || '0'}</div>
                          <div className="text-body-secondary text-uppercase fw-semibold small">Total Users</div>
                        </div>
                      </div>
                      <div >
                        <div className="row text-center">
                          <div className="col">
                            <div className="fs-5 fw-semibold text-secondary">{count?.user?.active || '0'}</div>
                            <div className="text-uppercase text-body-secondary small">Active</div>
                          </div><div className="vr"></div>
                          <div className="col"><div class="fs-5 fw-semibold text-secondary">{count?.user?.inactive || '0'}</div>
                            <div className="text-uppercase text-body-secondary small">Inactive</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CCard>
                </CCol>
              )}

              {/* Profiles */}

              {count?.profiles && (
                <CCol xs={4}>
                  <CCard >
                    <div className="card-body d-flex align-items-center justify-content-between">
                      <div className="d-flex">
                        <div className="me-3 text-white bg-warning p-3"> <CIcon icon={cilPeople} height={24} /> </div>
                        <div>
                          <div className="fs-3 fw-semibold text-warning">{count?.profiles?.total || '0'}</div>
                          <div className="text-body-secondary text-uppercase fw-semibold small">Total Profiles</div>
                        </div>
                      </div>
                      <div>
                        <div className="row text-center">
                          <div className="col">
                            <div className="fs-5 fw-semibold text-warning">{count?.profiles?.active || '0'}</div>
                            <div className="text-uppercase text-body-secondary small">Active</div>
                          </div><div className="vr"></div>
                          <div className="col">
                            <div class="fs-5 fw-semibold text-warning">{count?.profiles?.inactive || '0'}</div>
                            <div className="text-uppercase text-body-secondary small">Inactive</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CCard>
                </CCol>
              )}

              {userRole === 'superadmin' && (
                <>
                  <CRow style={{ marginTop: '10px' }}>
                    <CCol xs={4}>
                      <div class="callout callout-primary">
                        Click here to initiate the backup process.
                        <br />
                        <label
                          onClick={() => !proccessLoader && dbDump()}
                          style={{ color: "blue", textDecoration: proccessLoader ? "none" : "underline", cursor: "pointer" }}
                        >  {proccessLoader ? "Process started..." : "Start Backup"}</label>
                      </div>
                    </CCol>
                  </CRow>
                </>
              )}
            </CRow>
          </>}
      </CRow >

    </>
  )
}

export default Dashboard