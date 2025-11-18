import { CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormInput, CFormSelect, CRow, CSpinner, CTooltip, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter } from '@coreui/react'
import React, { useEffect, useState } from 'react'
import { cilReload, cilTrash, cilPencil } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import DataTable from '../../components/common/DataTable'
import authServices from '../../services/api-services/auth-api.service'
import { useToast } from '../../components/ToastContext'
import userService from '../../services/api-services/user-api.service'
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../../services/api-helper';
import { WEB_URL } from '../../services/api-helper';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

const User = (props) => {
  const { loader, setLoader } = props;
  const { fetchRoles, fetchOrganizations } = authServices();
  const { createUser, listAllUsers, updateUser, changePassword, deleteUser } = userService();
  const toast = useToast();
  const [formView, setFormView] = useState(false)
  const [modalView, setModalView] = useState(false)
  const [validated, setValidated] = useState(false)
  const [passwordValidate, setPasswordValidate] = useState(false)
  const [organizationsList, setOrganizationsList] = useState([])
  const [paginations, setPaginations] = useState()

  const [roleList, setRoleList] = useState([]);

  // data table
  const [data, setData] = useState([]);
  const [formValue, setFormValue] = useState({});
  const [newPassword, setNewPassword] = useState('');
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [search, setSearch] = useState('');
  const [autofocus, setAutofocus] = useState(false);
  const [userIDToRemove, setUserIDToRemove] = useState(null);

  const loginuser_roleName = localStorage.getItem('role');
  const loginuser_organization_id = localStorage.getItem('organization');
  const loginuserId = localStorage.getItem('userId');

  function useDebounce(cb) {
    const [debounceValue, setDebounceValue] = useState(cb);
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebounceValue(cb);
      }, 500);

      return () => {
        clearTimeout(handler);
      };
    }, [cb]);
    return debounceValue;
  }

  const debounceValue = useDebounce(search);

  useEffect(() => {
    getUsers();
  }, [page, limit, debounceValue]);

  useEffect(() => {
    getRoles();
    getOrganizations();
  }, [])

  const getUsers = async () => {
    try {
      setLoader(true)
      const resUser = await listAllUsers(page, limit, search);
      if (resUser?.data?.length > 0) {
        const datatable = resUser?.data?.map((item) => {
          return {
            // Prepare dataTable columns data
            id: item?.id,
            email: item?.email,
            role: item?.role?.roleName == 'orgadmin' ? 'Organization Admin' : item?.role?.roleName?.charAt(0).toUpperCase() + item?.role?.roleName?.slice(1) || '',
            organization: {
              display: item?.organization?.sysName ? <span onClick={() => handleRedirectToUserProfile(item?.organization?.sysName, true)} style={{ color: "#2626e2", cursor: "pointer" }}>{item?.organization?.organizationName}</span> : item?.organization?.organizationName,
            },
            status: item?.isActive ? "Active" : "Inactive",
            row_data: item
          }
        })
        setData(datatable);
        setPaginations(resUser?.pagination);
      } else {
        setData([]);
      }
    } catch (error) {
      toast(error?.message || 'An error while fetch users list', 'danger');
    }
    setLoader(false)
  }

  const getRoles = async () => {
    try {
      const resRoles = await fetchRoles({});
      if (resRoles?.data?.length > 0) {
        setRoleList(resRoles?.data || []);
      }
    } catch (error) {
      toast(error?.message || 'An error occurred While getting Roles', 'danger');
    }
  }

  const getOrganizations = async () => {
    try {
      const resOrg = await fetchOrganizations();
      if (resOrg?.data?.length > 0) {
        setOrganizationsList(resOrg?.data || []);
      }
    } catch (error) {
      toast(error?.message || 'An error occurred While getting Organization', 'danger');
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValue((prev) => {
      const updatedForm = { ...prev, [name]: value };
      if (name === 'role_id') {
        const data = roleList?.find((i) => i?.id == value);
        if (data?.roleName === 'user') {
          delete updatedForm.organizationName
          loginuser_roleName == 'orgadmin' && (updatedForm['organization_id'] = loginuser_organization_id);
        }
        if (data?.roleName === "orgadmin") {
          delete updatedForm.organization_id, delete updatedForm.organizationName
        }
      }
      if (name === 'organizationName') { delete updatedForm.organization_id }
      if (name === 'organization_id') { delete updatedForm.organizationName }
      return updatedForm;
    });
  };

  const handleUserStatus = async (row) => {
    try {
      setLoader(true);
      const resUser = await updateUser(
        {
          id: row?.id,
          isActive: row?.isActive ? false : true,
        }
      )
      if (resUser?.success) {
        toast(`User ${row?.isActive ? 'inactived' : 'actived'}`, 'success');
        setLoader(false);
        await getUsers();
      }
      else {
        setLoader(false);
        toast('An error occurred while update user status', 'danger');
      }
    }
    catch (error) {
      toast('An error occurred during handleUserStatus', 'danger');
    }

  }


  const handleSaveData = async (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if (form?.checkValidity() === false) {
      setValidated(true);
    } else {
      setLoader(true);
      let resUser;

      try {
        // const payload = { ...formValue };
        const payload = formValue?.id
          ? {
            id: formValue.id,
            email: formValue.email,
            role_id: formValue.role_id,
            organization_id: formValue.organization_id,
            organizationName: loginuser_roleName != 'orgadmin' ? formValue.organizationName : null,
            firstName: formValue.firstName,
            lastName: formValue.lastName,
          }
          : { ...formValue };

        resUser = formValue?.id ? await updateUser(payload) : await createUser(payload);
        if (resUser?.success) {
          toast(resUser?.data?.message || 'User details saved successfully', 'success');
          setLoader(false);
          await getUsers();
          if (formValue?.organizationName) await getOrganizations();
          setFormValue({});
          setValidated(false);
          setFormView(false);
        } else {
          setLoader(false);
          toast(resUser?.data?.message || 'An error occurred', 'danger');
        }
      } catch (error) {
        setLoader(false);
        console.error('Error during form submission: ', error);
        toast('An error occurred during form submission', 'danger');
      }
    }
  };

  const saveChangePassword = async (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();

    if (form?.checkValidity() === false) {
      setPasswordValidate(true);
    } else {
      setLoader(true)
      try {
        const resPassword = await changePassword({
          id: formValue?.id,
          newPassword: newPassword
        })

        if (resPassword?.success) {
          toast(resPassword?.data?.message || 'Password changed successfully', 'success');
          modalClose();
        } else {
          toast(resPassword?.data?.message || 'An error occurred', 'danger');
        }
        setLoader(false)
      }
      catch (error) {
        toast('An error occurred during change password', 'danger');
      }
    }
  }


  // #region DATATABLE Events
  const handleEdit = (item) => {
    setFormView(true)
    setFormValue({
      ...item,
      firstName: item?.profile?.firstName || '',
      lastName: item?.profile?.lastName || '',
      role_id: item?.role_id || '',
      organization_id: item?.organization_id || '',
      organizationName: item?.role?.roleName == 'user' ? item?.organization?.organizationName : '',
    })
  };

  const handleDelete = (item) => {
    setUserIDToRemove(item);
  }

  const onDeleteButton = async () => {
    try {
      setLoader(true);
      const resDeleteUser = await deleteUser(userIDToRemove?.id);
      if (resDeleteUser?.success) {
        toast(resDeleteUser?.data?.message, 'success');
        setUserIDToRemove(null);
        await getUsers();
      }
      else toast('An error occurred while delete user', 'danger');

      setLoader(false);
    } catch (error) {
      setLoader(false);
      toast('An error occurred during delete user', 'danger');
    }
  }

  const handleChangePassword = (item) => {
    setFormValue({ id: item?.id })
    setModalView(true);
  }

  const handleRedirectToUserProfile = (item, redirectToOrgProfile = false) => {
    let profileUrl
    if (redirectToOrgProfile) {
      profileUrl = WEB_URL + '/org/' + item;
    } else {
      profileUrl = WEB_URL + '/profile/' + item?.profile?.sysName;
    }
    window.open(profileUrl);
  }

  const onPagination = async (newPage, itemsPerPage) => {
    setPage(newPage);
    setLimit(itemsPerPage);
  };

  const customActions = (row, index) => {
    return (
      <>
        {loginuserId != row?.id && (
          <>
            <CTooltip content="Edit">
              <CButton color="primary" size="sm" onClick={() => handleEdit(row)}>
                <CIcon icon={cilPencil} />
              </CButton>
            </CTooltip>

            <CButton color={row?.isActive ? 'danger' : 'primary'} onClick={() => handleUserStatus(row)} size="sm">{row?.isActive ? 'Make Inactive' : 'Make Active'}</CButton>

            <CTooltip content="Change Password">
              <CButton color="primary" size="sm" onClick={() => handleChangePassword(row)}>
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#FFFFFF"><path d="M420-680q0-33 23.5-56.5T500-760q33 0 56.5 23.5T580-680q0 33-23.5 56.5T500-600q-33 0-56.5-23.5T420-680ZM500 0 320-180l60-80-60-80 60-85v-47q-54-32-87-86.5T260-680q0-100 70-170t170-70q100 0 170 70t70 170q0 67-33 121.5T620-472v352L500 0ZM340-680q0 56 34 98.5t86 56.5v125l-41 58 61 82-55 71 75 75 40-40v-371q52-14 86-56.5t34-98.5q0-66-47-113t-113-47q-66 0-113 47t-47 113Z" /></svg>
              </CButton>
            </CTooltip>
            <CTooltip content="Open Profile">
              <CButton color="primary" size="sm" onClick={() => handleRedirectToUserProfile(row)}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 372-372H560v-80h280v280h-80v-144L388-332Z" /></svg>
              </CButton>
            </CTooltip>

            {loginuser_roleName === "superadmin" && (
              <CTooltip content="Delete User">
                <CButton color="danger" size="sm" onClick={() => handleDelete(row)}>
                  <CIcon icon={cilTrash} />
                </CButton>
              </CTooltip>
            )}
          </>
        )}
      </>
    );
  };

  // #endregion

  const renderSelectedRoleWiseInputFields = () => {
    const role = roleList?.find((i) => i?.id == formValue?.role_id);
    return (
      <>
        <div className="d-flex flex-wrap align-items-center gap-2">
          {loginuser_roleName === "superadmin" && (
            <>
              <CCol md={4}>
                <CFormSelect
                  required={!(formValue?.organization_id || formValue?.organizationName)}
                  feedbackInvalid="Please select organization"
                  id="organization_id"
                  name="organization_id"
                  value={formValue?.organization_id || ""}
                  onChange={handleChange}
                  label="Select Organization"
                >
                  <option value="">Select</option>
                  {organizationsList?.map((i) => (
                    <option key={i?.id} value={i?.id}>
                      {i?.organizationName}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>

              {role?.roleName === "orgadmin" && (
                <>
                  <CCol md="auto" className="text-center  text-muted mt-4">
                    - OR -
                  </CCol>

                  <CCol md={4}>
                    <CFormInput
                      required={!(formValue?.organization_id || formValue?.organizationName)}
                      feedbackInvalid="Please enter organization"
                      placeholder="Enter organization name"
                      type="text"
                      id="organizationName"
                      name="organizationName"
                      value={formValue?.organizationName || ""}
                      onChange={handleChange}
                      label="New Organization"
                    />
                  </CCol>
                </>
              )}
            </>
          )}
        </div>
      </>
    )
  }

  const handleClose = () => {
    setFormValue({});
    setValidated(false);
    setFormView(false);
  }

  const reloadData = () => {
    setPage(DEFAULT_PAGE);
    setLimit(DEFAULT_LIMIT);
  }

  const onSearchChange = (e) => {
    setSearch(e.target.value);
    setAutofocus(true);
  }

  const modalClose = () => {
    setNewPassword('');
    setModalView(false);
    setPasswordValidate(false);
    setFormValue({})
  }

  const onAddUser = () => {
    getUsers();
    setFormView(true)
  }

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <>
            {!formView ? (
              <CCard className="mb-4">
                <CCardHeader className='d-flex justify-content-between'>
                  <div>
                    <strong>Users List</strong>
                    <CTooltip content="Reload">
                      <CButton color="link" size="sm" disabled={loader}>
                        <CIcon onClick={() => reloadData()} className='cursor-pointer' icon={cilReload} style={{ marginLeft: "10px" }} />
                      </CButton>
                    </CTooltip>
                  </div>
                  <CButton color="primary" size='sm' onClick={() => onAddUser()}>Add User</CButton>
                </CCardHeader>
                <CCardBody className='pb-0'>
                  <CForm className='row mb-4 justify-content-end'>
                    <CCol md={3}>
                      <CFormInput autoFocus={autofocus} id="search" placeholder='Search...' type="text" name='search' value={search} onChange={onSearchChange} />
                    </CCol>
                  </CForm>
                  <div>
                    {/* COMMON DATA TABLE */}
                    <DataTable
                      columns={['email', 'role', 'organization', 'status']}
                      data={data}
                      customActions={customActions}
                      onPagination={onPagination}
                      paginations={paginations}
                    />
                  </div>
                </CCardBody>
              </CCard>
            ) :
              (
                <CCard className="mb-4">
                  <CCardHeader>
                    <strong>Add User</strong>
                  </CCardHeader>
                  <CCardBody >
                    <CForm noValidate validated={validated} onSubmit={handleSaveData} className="row g-3">
                      <CCol md={4}>
                        <CFormInput required feedbackInvalid="Please enter valid email" type="email" id="email" name='email' value={formValue?.email} onChange={handleChange} label="Email" placeholder='Enter emailId' pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$" />
                      </CCol>
                      <CCol md={4}>
                        <CFormInput required feedbackInvalid="Please enter First name" type="text" name='firstName' value={formValue?.firstName} onChange={handleChange} label="First name" placeholder='Enter first name' />
                      </CCol>
                      <CCol md={4}>
                        <CFormInput required feedbackInvalid="Please enter Last name" type="text" name='lastName' value={formValue?.lastName} onChange={handleChange} label="Last name" placeholder='Enter last name' />
                      </CCol>
                      <CCol md={4}>
                        <CFormSelect
                          required
                          feedbackInvalid="Please Select role"
                          id="role_id"
                          name='role_id'
                          value={formValue?.role_id || ''}
                          onChange={handleChange}
                          label="Select Role"
                        >
                          <option value="">Select</option>
                          {roleList?.length > 0 && roleList?.map((data, index) => {
                            return <option value={data?.id} key={index}>{data?.roleName == 'orgadmin' ? "Organization Admin" : data?.roleName?.charAt(0).toUpperCase() + data?.roleName?.slice(1)}</option>
                          })}
                        </CFormSelect>
                      </CCol>
                      <CCol xs={12}>
                        {renderSelectedRoleWiseInputFields()}
                      </CCol>

                      <CCol xs={12} type="submit" className='d-flex gap-2'>
                        <CButton color='primary' disabled={loader} type="submit"> Save</CButton>
                        <CButton color="primary" variant="outline" onClick={() => handleClose()}>Cancel</CButton>
                      </CCol>
                    </CForm>
                  </CCardBody>
                </CCard>
              )}
          </>
        </CCol>
      </CRow>
      {modalView && (
        <CModal
          visible={modalView}
          onClose={() => modalClose()}
        >
          <CModalHeader>
            <CModalTitle>Change Password</CModalTitle>
          </CModalHeader>
          <CForm noValidate validated={passwordValidate} onSubmit={saveChangePassword}>
            <CModalBody>
              <CFormInput required placeholder='Enter new password' minLength={6} feedbackInvalid="Password must be at least 6 characters long" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value?.trim())} id="password" name='password' label="New Password" />
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => modalClose()}>
                Close
              </CButton>
              <CButton color="primary" type="submit" disabled={loader}>Change</CButton>
            </CModalFooter>
          </CForm>
        </CModal>
      )}

      {userIDToRemove && (
        <Modal show={true} onHide={() => setUserIDToRemove(null)}>
          <Modal.Header closeButton>
            <Modal.Title>Alert!</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to delete <b>{userIDToRemove?.email}?</b> Once deleted, the data cannot be recovered.</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setUserIDToRemove(null)}>
              Close
            </Button>
            <Button variant="danger" disabled={loader} onClick={() => { !loader && onDeleteButton() }}>
              Delete User {loader && <CSpinner size="sm" />}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  )
}

export default User
