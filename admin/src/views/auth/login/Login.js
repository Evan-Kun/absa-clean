import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import logo from '../../../assets/logo.png'
import authServices from '../../../services/api-services/auth-api.service'
import { useToast } from '../../../components/ToastContext'
import { useDispatch } from 'react-redux'

const Login = () => {
  const dispatch = useDispatch()
  const { LoginAdmin } = authServices();
  const toast = useToast();
  const navigate = useNavigate()
  const [loader, setLoader] = useState(false)
  const [formValue, setFormValue] = useState({
    email: "",
    password: ""
  })

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValue({ ...formValue, [name]: value?.trim() });
  };

  const handleLogin = async () => {
    try {
      setLoader(true)
      // SET DATA ACCORDING TO FROMVALUE
      const resAuth = await LoginAdmin({ ...formValue })
      if (resAuth?.success) {
        localStorage.setItem('userId', resAuth?.data?.id)
        localStorage.setItem('token', resAuth?.data?.token)
        localStorage.setItem('role', resAuth?.data?.roleName)
        localStorage.setItem('organization', resAuth?.data?.organization_id);
        localStorage.setItem('loginUserEmail', resAuth?.data?.email);
        toast(resAuth?.data?.message || 'Login successful', 'success');
        navigate('/dashboard');
      } else {
        toast(resAuth?.data?.message || 'An error occurred', 'danger');
      }
      setLoader(false)
    } catch (error) {
      toast(error?.message || 'An error occurred', 'danger');
      setLoader(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault(); 
                        handleLogin(); 
                      }
                    }}
                  >
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput placeholder="Email" autoComplete="email" name='email' value={formValue?.email} onChange={handleChange} />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        name="password"
                        value={formValue?.password}
                        onChange={handleChange}
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton disabled={loader} color="secondary" className="px-4" onClick={() => handleLogin()}>
                          Login
                        </CButton>
                      </CCol>
                      {/* <CCol xs={6} className="text-right">
                        <CButton color="link" className="px-0">
                          Forgot password?
                        </CButton>
                      </CCol> */}
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-primary py-5">
                <CCardBody className="text-center">
                  <div className='mt-4'>
                    <img src={logo} alt='logo' style={{ width: "100%" }} />
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
