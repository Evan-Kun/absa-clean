import React, { useContext, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { dummyUserImage } from "../../services/mock_data";
import { CircularProgress, FormControlLabel, IconButton, Switch, Tooltip } from "@mui/material";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useUser } from "../../context/UserContext";
import organizationProfileServices from "../../services/api-services/orgazation-api.service";
import ImageUpload from "../../components/forms/ImageUpload";
import { IMAGEPATH } from "../../services/api-helper";
import CompnayBasicInfoForm from "../../components/forms/CompnayBasicInfoForm";
import { useSnackbar } from "../../context/SnackbarContext";
import Home from "../home/Home";
import { showFullContent } from "../../services/utils";
import EmailTemplateForm from "../../components/forms/EmailTemplateForm";
import { log } from "node:console";

const ComponyProfile = () => {
    const { sysName } = useParams()
    const { user, setUser } = useUser();
    const navigate = useNavigate();
    const showSnackbar = useSnackbar();
    const { fetchOrganizationsDetails, updateOrganizationsDetails } = organizationProfileServices();
    const [cloading, setCLoading] = useState<boolean>(false);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [companyDetail, setCompanyDetail] = useState<any>({});
    const [editFormModal, setEditFormModal] = useState<any>(null);
    const [showFullDescription, setShowFullDescription] = useState<boolean>(false);

    useEffect(() => {
        if (sysName) getCompanyDetails();
    }, [sysName]);

    const getCompanyDetails = async () => {
        setCLoading(true)
        const resDetails = await fetchOrganizationsDetails(sysName);
        if (resDetails?.success) {
            setCompanyDetail(resDetails?.data)
            if (user?.organization_id?.toString() == resDetails?.data?.id?.toString() && user?.organization?.sysName != resDetails?.data?.sysName) {
                setUser((prev: any) => {
                    return {
                        ...prev,
                        organization: {
                            sysName: resDetails?.data?.sysName
                        }
                    }
                })
            }
            setCLoading(false)
        } else {
            showSnackbar(resDetails?.message || resDetails?.data?.message || 'An error occurred', 'error');
            setCompanyDetail(null)
            setCLoading(false)
        }
    }

    const handleModalFormView = (eventProps: any) => {
        const { formType, data } = eventProps;
        setEditFormModal(formType)
    }

    const handleUpdateProfile = async (URL: string) => {
        setCLoading(true)
        const resUpdate = await updateOrganizationsDetails(companyDetail?.id, { logo: URL });
        if (resUpdate) {
            getCompanyDetails()
            setEditFormModal(null);
        } else {
            showSnackbar(resUpdate?.message || resUpdate?.data?.message || 'An error occurred', 'error');
        }
        setCLoading(false)
    }

    const handleCloseModal = (updatedFormData: any) => {
        if (updatedFormData) {
            setEditFormModal(null)
            if (updatedFormData?.sysName == sysName) {
                getCompanyDetails()
            } else {
                navigate(`/org/${updatedFormData?.sysName}`)
            }
        } else {
            setEditFormModal(null)
        }
    }

    const handleToggleDescription = () => {
        setShowFullDescription(!showFullDescription);
    };

    return (
        <>
            {cloading ? <div className='d-flex justify-content-center align-items-center'><CircularProgress color="secondary" /></div> : <>
                <div className='d-flex justify-content-end'>
                    {(user?.isSuperadmin || (user?.isOrgadmin && user?.organization_id == companyDetail?.id)) && (
                        <FormControlLabel
                            sx={{ display: 'block' }}
                            control={
                                <Switch
                                    checked={isEditMode}
                                    onChange={() => setIsEditMode(!isEditMode)}
                                    name="cloading"
                                    color="secondary"
                                />
                            }
                            label="Edit Profile"
                        />
                    )}
                </div>
                <div className="mb-3">
                    <div className="row">
                        {(companyDetail?.logo || isEditMode) && (
                            <div className="col-md-2 pt-0">
                                <div className="position-relative">
                                    <div className="image-wrapper position-relative">
                                        <div className="position-absolute" style={{ top: '10px', right: '10px' }}>
                                            {isEditMode &&
                                                <Tooltip title="Update Company Logo" arrow>
                                                    <IconButton
                                                        onClick={(e) => handleModalFormView({ formType: 'imageUpload' })}
                                                        sx={{
                                                            color: "white",
                                                            borderColor: 'secondary.main',
                                                            borderRadius: '100%',
                                                            backgroundColor: 'secondary.main',
                                                            '&:hover': { backgroundColor: 'secondary.main' }
                                                        }}
                                                    >
                                                        <EditOutlinedIcon className="icon" />
                                                    </IconButton>
                                                </Tooltip>
                                            }
                                        </div>

                                        <img src={companyDetail?.logo ? `${IMAGEPATH}${companyDetail?.logo}` : dummyUserImage} alt="user image"
                                            className="img-fluid" style={{ objectFit: "cover" }} />
                                    </div>
                                </div>
                            </div>)}

                        {/* Profile Details */}
                        <div className="col-md-10">
                            <div className="mt-2">
                                {/* basic info */}
                                <div className="d-flex ">
                                    <h2 className="fs-2 text-secondary mb-2 mb-md-0">{companyDetail?.organizationName || ' '}</h2>

                                    {isEditMode && (
                                        <Tooltip title="Edit Basic Information" arrow>
                                            <IconButton onClick={(e) => handleModalFormView({ e, formType: 'basicInfoForm' })} color='secondary'>
                                                <EditOutlinedIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </div>
                                {companyDetail?.contactEmail && (
                                    <section className="mt-3">
                                        <label className="d-flex align-items-center gap-2 pt-2 pb-2 mb-1">
                                            <Tooltip title="Contact Email" arrow>
                                                <svg xmlns="http://www.w3.org/2000/svg" height="21px" viewBox="0 -960 960 960" width="21px" fill="#666666"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z" /></svg>
                                            </Tooltip>
                                            {companyDetail?.contactEmail}
                                            {isEditMode && (
                                                <Tooltip title="Edit Email Template" arrow>
                                                    <IconButton onClick={(e) => handleModalFormView({ e, formType: 'emailTemplate' })} color='secondary'>
                                                        <EditOutlinedIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </label>
                                    </section>
                                )}

                                <section className="mt-3">
                                    <label className="text-uppercase mb-1 text-muted small-font">Description</label>
                                    {companyDetail?.description ?
                                        <p className="text-muted">
                                            <span dangerouslySetInnerHTML={{
                                                __html: showFullDescription
                                                    ? companyDetail?.description?.replace(/\n/g, "<br />")
                                                    : showFullContent(companyDetail?.description, 340)
                                            }}
                                            />
                                            {companyDetail?.description?.length > 340 && (
                                                <>
                                                    <br />
                                                    <span
                                                        className="text-secondary cursor-pointer"
                                                        onClick={handleToggleDescription}
                                                    >
                                                        {showFullDescription ? "Show Less" : "Show More"}
                                                    </span>
                                                </>
                                            )}
                                        </p>
                                        : <p className="text-muted"></p>
                                    }
                                </section>
                            </div>
                        </div>
                    </div >
                </div>
                {companyDetail?.id && <Home companyDetail={companyDetail} displayFilterOption={{ organization: false }} />}
                <>
                    {editFormModal && editFormModal === 'imageUpload' ? (
                        <ImageUpload
                            title="Company logo"
                            profileUserId={companyDetail?.id}
                            handleCloseModal={() => handleCloseModal(false)}
                            uploadProfileUrl={(url: any) => handleUpdateProfile(url)}
                        />
                    ) : editFormModal === 'basicInfoForm' ?
                        <CompnayBasicInfoForm
                            companyDetail={companyDetail}
                            handleCloseModal={(updatedFormData: any) => handleCloseModal(updatedFormData)}
                        />
                        : editFormModal === 'emailTemplate' ?
                            <EmailTemplateForm
                                companyDetail={companyDetail}
                                handleCloseModal={(updatedFormData: any) => handleCloseModal(updatedFormData)}
                            />
                            : null}
                </>
            </>
            }
        </>
    )
}

export default ComponyProfile