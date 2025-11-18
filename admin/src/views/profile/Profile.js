import { CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormCheck, CFormInput, CFormLabel, CFormSelect, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CPagination, CPaginationItem, CRow, CSidebarToggler, CSpinner, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow, CTooltip } from "@coreui/react";
import React, { useEffect, useState } from "react";
import DataTable from "../../components/common/DataTable";
import profileService from "../../services/api-services/profile-api-service";
import { DEFAULT_LIMIT, DEFAULT_PAGE, IMAGEPATH } from "../../services/api-helper";
import dummyUser from "../../assets/images/avatars/dummyUser.png";
import { useToast } from "../../components/ToastContext";
import CIcon from "@coreui/icons-react";
import { cilReload } from "@coreui/icons";

const Profile = (props) => {
  const { loader, setLoader } = props;
  const { fetchUserProfile, updateProfile } = profileService();
  const toast = useToast();

  const DATATABLE_COLUMNS = [
    { label: "Profile Image", style: { width: "10%" } },
    "Email",
    "Full Name",
    "status",
    "Organization",
  ];

  const [paginations, setPaginations] = useState();
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [autofocus, setAutofocus] = useState(false);
  const loginuserId = localStorage.getItem("userId");

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
    getProfiles();
  }, [page, limit, debounceValue]);

  const previewImage = (img) => {
    window.open(`${IMAGEPATH}${img}`, "_blank");
  };


  const handlePublicProfile = async (value, item) => {
    try {
      setLoader(true)
      const payload = {
        id: item?.id,
        userId: item?.userId,
        isPublic: value,
      };

      const resProfile = await updateProfile(payload);
      if (resProfile?.success) {
        toast(
          `Profile ${item?.isPublic ? "Private" : "Public"} successfuly`,
          "success",
        );
        setLoader(false)
        await getProfiles();
      } else {
        setLoader(false)
        toast(resProfile?.message || `An error ocured`, "danger");
      }
    } catch (error) {
      toast(error?.message || `An error ocured`, "danger");
    }
  };

  const getProfiles = async () => {
    try {
      setLoader(true);
      const resProfile = await fetchUserProfile(page, limit, search);
      if (resProfile?.data?.length > 0) {
        const datatable = resProfile?.data?.map((item) => {
          return {
            // View IN Datatable
            id: item?.id,
            profileImage: {
              display: (
                <img
                  src={
                    item?.profileImage
                      ? `${IMAGEPATH}${item?.profileImage}`
                      : dummyUser
                  }
                  alt="user profile"
                  className="object-fit-cover"
                  width={70}
                  height={70}
                />
              ),
              action: (row) => previewImage(row?.profileImage),
            },
            Email: item?.user?.email,
            fullName: `${item?.firstName} ${item?.lastName}`,
            status: item?.isActive ? "Active" : "Inactive",
            organization: item?.user?.organization?.organizationName || ' ',
            // Extra Props This data will not show in datatable
            row_data: item
          }
        });
        setData(datatable);
        setPaginations(resProfile?.pagination);
      } else {
        setData([]);
      }
    } catch (error) {
      toast(error?.message || "An error while fetch users list", "danger");
    }
    setLoader(false);
  };

  const onPagination = async (newPage, itemsPerPage) => {
    setPage(newPage);
    setLimit(itemsPerPage);
  };

  const handleUserStatus = async (row) => {
    try {
      setLoader(true);
      const payload = {
        id: row?.id,
        userId: row?.userId,
        isActive: row?.isActive ? false : true,
      };

      const resProfile = await updateProfile(payload);
      if (resProfile?.success) {
        toast(
          `Profile ${row?.isActive ? "inactive" : "active"} successfuly`,
          "success",
        );
        await getProfiles();
      } else {
        toast(resProfile?.message || `An error ocured`, "danger");
      }
      setLoader(false);
    } catch (error) {
      toast(error?.message || `An error ocured`, "danger");
    }
  };

  const customActions = (row, index) => {
    return (
      loginuserId != row?.userId && (
        <CButton
          key={index}
          color={`${row?.isActive ? "danger" : "primary"}`}
          size="sm"
          onClick={() => handleUserStatus(row)}
        >
           {row?.isActive ? "Make Inactive" : "Make Active"}
        </CButton>
      )
    );
  };

  const customFields = [
    {
      header: "Public Profile",
      key: "PublicProfile",
      render: (rowData, index) => (
        //

        <div className="form-check form-switch">
          <input
            className="form-check-input cursor-pointer"
            type="checkbox"
            role="switch"
            id="flexSwitchCheckChecked"
            checked={rowData?.isPublic}
            onChange={(e) => handlePublicProfile(e.target.checked, rowData)}
          />
        </div>
      ),
    },
  ];

  const reloadData = () => {
    setPage(DEFAULT_PAGE);
    setLimit(DEFAULT_LIMIT);
  };

  const onSearchChange = (e) => {
    setSearch(e.target.value);
    setAutofocus(true);
  };

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between">
              <div>
                <strong>Profile List</strong>
                <CTooltip content="Reload">
                  <CButton color="link" size="sm" disabled={loader}>
                    <CIcon
                      icon={cilReload}
                      onClick={() => reloadData()}
                      className="cursor-pointer"
                      style={{ marginLeft: "10px" }}
                    />
                  </CButton>
                </CTooltip>
              </div>
            </CCardHeader>
            <CCardBody className="pb-0">
              <CForm className="row mb-4 justify-content-end">
                <CCol md={3}>
                  <CFormInput
                    type="text"
                    autoFocus={autofocus}
                    id="search"
                    label="Search"
                    name="search"
                    value={search}
                    onChange={(e) => onSearchChange(e)}
                  />
                </CCol>
              </CForm>

              <div>
                {/* COMMON DATA TABLE */}
                <DataTable
                  columns={DATATABLE_COLUMNS}
                  data={data}
                  customActions={customActions}
                  customFields={customFields}
                  onPagination={onPagination}
                  paginations={paginations}
                />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  );
};
export default Profile;
