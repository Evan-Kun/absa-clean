import React, { useEffect, useState } from 'react'
import './profile.scss'
import { useParams, useLocation } from 'react-router-dom';
import { dummyUserImage, profile_small_logo } from '../../services/mock_data'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, IconButton, LinearProgress, Switch } from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Tooltip from '@mui/material/Tooltip';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UserBasicInformationForm from '../../components/forms/UserBasicInformationForm';
import ImageUpload from '../../components/forms/ImageUpload';
import WorkExperienceForm from '../../components/forms/WorkExperienceForm';
import ExperienceForm from '../../components/forms/ExperienceForm';
import EducationsForm from '../../components/forms/EducationsForm';
import ExperienceTagForm from '../../components/forms/ExperienceTagForm';
import ExpertiseTagForm from '../../components/forms/ExpertiseTagForm';
import CircularProgress from '@mui/material/CircularProgress';
import { useUser } from '../../context/UserContext';
import { IMAGEPATH, WEB_URL } from '../../services/api-helper';
import { useSnackbar } from '../../context/SnackbarContext';
import userProfileServices from '../../services/api-services/user-profile-api.service';
import { CopyToClipboard, showFullContent } from '../../services/utils';
import { useNavigate } from 'react-router-dom';
import CertificateForm from '../../components/forms/CertificateForm';
import ContactForm from '../../components/forms/ContactForm';
import ImportCVForm from '../../components/forms/ImportCVForm';

const Profile = () => {
    const { sysName }: any = useParams();
    const { user, setUser, organizationsList } = useUser();
    let location = useLocation();
    const { deleteProfileData, fetchProfileHistoryDetails, fetchProfile, updateProfileBasicDetails, updateOrder } = userProfileServices();
    const showSnackbar = useSnackbar();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [userDetails, setUserDetails] = useState<any>()
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [editRecordData, setEditRecordData] = useState<any>({});
    const [showFullBio, setShowFullBio] = useState<boolean>(false);
    const [deleteModal, setDeleteModal] = useState<boolean>(false);
    const [editFormModal, setEditFormModal] = useState<any>(null);
    const [deleteRecord, setDeleteRecord] = useState<any>({});
    const [profileDetailsLoader, setProfileDetailsLoader] = useState<any>(false);
    let profileUrl = WEB_URL?.concat(location.pathname);
    const fullName = [userDetails?.firstName, userDetails?.lastName].filter(Boolean).join(' ').trim();

    useEffect(() => {
        getValidateProfile()
    }, [sysName])

    const getValidateProfile = async () => {
        setLoading(true);
        const resProfile = await fetchProfile(sysName);
        if (resProfile?.success) {
            setUserDetails((prev: any) => ({
                ...prev,
                ...resProfile?.data,
                profileImage: resProfile?.data?.profileImage && `${IMAGEPATH}${resProfile?.data?.profileImage}?t=${new Date().getTime()}`
            }));

            if (user?.id?.toString() == resProfile?.data?.userId?.toString() && user?.profile?.sysName != resProfile?.data?.sysName) {
                setUser((prev: any) => {
                    return {
                        ...prev,
                        profile: {
                            sysName: resProfile?.data?.sysName
                        }
                    }
                })
            }
            getProfileWorkExperience(resProfile?.data?.userId)

            if (sysName == user?.profile?.sysName) {
                setIsEditMode(true);
            }
        } else {
            setUserDetails(null)
        }
        setLoading(false);
    }

    const getProfileWorkExperience = async (userID = null) => {
        setProfileDetailsLoader(true);
        const resDetails = await fetchProfileHistoryDetails(userID || userDetails?.userId);

        if (resDetails?.success) {
            setUserDetails((prev: any) => ({
                ...prev,
                ...resDetails?.data,
            }));

        }
        setProfileDetailsLoader(false);
    }

    const handleToggleBio = () => {
        setShowFullBio(!showFullBio);
    };


    const handleModalFormView = (eventProps: any) => {
        const { e, formType, data } = eventProps;
        e?.stopPropagation();
        setEditFormModal(formType)
        setEditRecordData(data);
    }

    const handleDeleteModalRecord = (eventProps: any) => {
        const { e, type, recordID } = eventProps;
        e?.stopPropagation();
        setDeleteModal(true);
        setDeleteRecord({ type, recordID })
    }

    const handleCloseModal = async (formType: string = '', updatedFormData: any = null) => {
        setEditFormModal(null);
        setEditRecordData({});

        switch (formType) {
            case 'basic-info':
                if (updatedFormData) {
                    setUserDetails((prev: any) => ({
                        ...prev,
                        ...updatedFormData,
                        profileImage: updatedFormData?.profileImage && `${IMAGEPATH}${updatedFormData?.profileImage}?t=${new Date().getTime()}`
                    }));
                    navigate(`/profile/${updatedFormData?.sysName}`)
                }
                break;

            case 'work-experience':
                await getProfileWorkExperience()
                break;

            default:
                break;
        }
    }


    const handleDeleteRecord = async () => {
        const resDelete = await deleteProfileData(deleteRecord?.type, deleteRecord?.recordID, userDetails?.userId)
        if (resDelete?.success) {
            setDeleteModal(false);
            showSnackbar(resDelete?.message, 'success');
            await getProfileWorkExperience()
        } else {
            showSnackbar(resDelete?.message, 'error');
        }
    }

    const handleUpdateProfile = async (URL: string) => {
        if (URL) {
            let payload: any = { profileImage: URL };
            if (user?.isSuperadmin || user?.isOrgadmin) { payload['userId'] = userDetails?.userId }
            const resUpdateProfileImage = await updateProfileBasicDetails(payload, 'basic-info');
            if (resUpdateProfileImage?.success) {
                showSnackbar('Profile Upload', 'success');
                handleCloseModal('basic-info', resUpdateProfileImage?.data?.data)
            } else {
                showSnackbar('An error occurred', 'error');
            }
        }
    }

    const redirectToCompany = () => {
        const sys_Name = userDetails?.user?.organization?.sysName || null;
        if (sys_Name) { navigate(`/org/${sys_Name}`) }
    }

    const moveItem = async (index: number, direction: number, name = "") => {
        let copyObject: any = [];
        let updateUserDetail: any;

        switch (name) {
            case 'educations':
                copyObject = [...userDetails?.educations];
                updateUserDetail = 'educations';
                break;

            case 'workExperiences':
                copyObject = [...userDetails?.workExperience];
                updateUserDetail = 'workExperience';
                break;

            case 'certificates':
                copyObject = [...userDetails?.certificates];
                updateUserDetail = 'certificates';
                break;

            default:
                copyObject = [...userDetails?.experiences];
                updateUserDetail = 'experiences';
                break;
        }

        const newEducations = copyObject;
        const newIndex = index + direction;

        let temp = newEducations[index]
        newEducations[index] = newEducations[newIndex]
        newEducations[newIndex] = temp

        const updatedOrderIndex = newEducations.map((ele: any, i: any) => ({ ...ele, order_index: i }))
        setUserDetails({ ...userDetails, [updateUserDetail]: updatedOrderIndex })

        const payload = updatedOrderIndex.map((ele: any) => ({ id: ele.id, order_index: ele.order_index }))

        const resUpdateOrder = await updateOrder(name, payload)
        if (!resUpdateOrder?.success) { showSnackbar(resUpdateOrder?.message || 'An error occurred', 'error'); }
    };

    const redirectToHome = () => {
        navigate(`/home`)
    }

    return (
        <div>
            {loading ? <div className='d-flex justify-content-center align-items-center'><CircularProgress color="secondary" /></div> :
                <>
                    {userDetails ?
                        <>

                            {(user?.id == userDetails?.userId || (user?.isSuperadmin || (user?.isOrgadmin && user?.organization_id == userDetails?.user?.organization?.id))) && (
                                <Box className='d-flex justify-content-end' gap={"10px"}>
                                    {isEditMode &&
                                        <Button
                                            variant='contained'
                                            onClick={(e) => handleModalFormView({ e, formType: 'importcv' })}
                                        >
                                            Import from CV
                                        </Button>
                                    }
                                    <FormControlLabel
                                        sx={{ display: 'block' }}
                                        control={
                                            <Switch
                                                checked={isEditMode}
                                                onChange={() => setIsEditMode(!isEditMode)}
                                                name="loading"
                                                color="secondary"
                                            />
                                        }
                                        label="Edit Profile"
                                    />
                                </Box>
                            )}

                            <div className="mb-5">
                                <div className="row">
                                    <div className="col-md-4 pt-0">

                                        {/* Profile Image Section */}
                                        <div className="position-relative">
                                            <div className="image-wrapper position-relative">
                                                <div className="position-absolute" style={{ top: '10px', right: '10px' }}>
                                                    {isEditMode &&
                                                        <Tooltip title="Update Profile Image" arrow key={userDetails?.userId}>
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
                                                                <EditOutlinedIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    }
                                                </div>
                                                <img src={userDetails?.profileImage ? userDetails?.profileImage : dummyUserImage} alt="user image" className="img-fluid" style={{ objectFit: "cover" }} />
                                            </div>

                                            <div className="position-absolute triangle-bottom-left">
                                                <img height="30" src={profile_small_logo} alt="user" className="triangle-image" />
                                            </div>
                                        </div>

                                        {/* Contact now Button */}
                                        {user?.id != userDetails?.userId && userDetails?.user?.organization?.contactEmail && (
                                            <div className="d-flex justify-content-between align-items-center mt-2 profile-available">
                                                <label>{fullName || userDetails?.firstName || userDetails?.lastName}</label>
                                                <Button variant='contained' color='primary' mat-raised-button className="btn-style" onClick={() => handleModalFormView({ formType: 'contact_now' })}>Contact now</Button>
                                            </div>
                                        )}

                                    </div>
                                    {/* Profile Details */}
                                    <div className="col-md-8">
                                        <div className="mt-2">
                                            {/* basic info */}
                                            <div className="d-flex ">
                                                <h2 className="fs-2 text-secondary mb-2 mb-md-0">{userDetails?.firstName || 'Name'} {userDetails?.lastName}</h2>
                                                {isEditMode && (
                                                    <Tooltip title="Edit Basic Information" arrow>
                                                        <IconButton color='secondary' onClick={(e) => handleModalFormView({ e, formType: 'basicInfoForm', data: userDetails })}>
                                                            <EditOutlinedIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </div>

                                            {userDetails?.slogan && (
                                                <div className="d-flex align-items-center text-muted mb-2">
                                                    <label>{userDetails?.slogan}</label>
                                                </div>
                                            )}

                                            {/* jobTitle */}
                                            {userDetails?.jobTitle && (
                                                <label className="d-flex align-items-center gap-2 pt-2 pb-2">
                                                    <Tooltip title="Job title" arrow>
                                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"
                                                            fill="#000000">
                                                            <path
                                                                d="M187.52-166.15q-25.77 0-43.57-17.8t-17.8-43.74v-390.77q0-25.94 17.8-43.74t43.74-17.8h176v-52.35q0-25.96 17.8-43.73 17.8-17.77 43.58-17.77h109.86q25.78 0 43.58 17.8 17.8 17.8 17.8 43.74V-680h176q25.94 0 43.74 17.8t17.8 43.74v390.77q0 25.94-17.8 43.74t-43.57 17.8H187.52Zm.17-36.93h584.62q9.23 0 16.92-7.69 7.69-7.69 7.69-16.92v-390.77q0-9.23-7.69-16.92-7.69-7.7-16.92-7.7H187.69q-9.23 0-16.92 7.7-7.69 7.69-7.69 16.92v390.77q0 9.23 7.69 16.92 7.69 7.69 16.92 7.69ZM400.62-680h158.76v-52.31q0-9.23-7.69-16.92-7.69-7.69-16.92-7.69H425.23q-9.23 0-16.92 7.69-7.69 7.69-7.69 16.92V-680ZM163.08-203.08v-440 440Z" />
                                                        </svg>
                                                    </Tooltip>
                                                    {userDetails?.jobTitle}
                                                </label>
                                            )}

                                            {/* organization */}
                                            {userDetails?.user?.organization && (
                                                <label className="d-flex align-items-center gap-2 pt-2 pb-2">
                                                    <Tooltip title="Organization" arrow onClick={() => redirectToCompany()} role='button'>
                                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#2626e2"><path d="M140-153.85v-520h160v-160h360v320h160v360H540v-160H420v160H140Zm40-40h120v-120H180v120Zm0-160h120v-120H180v120Zm0-160h120v-120H180v120Zm160 160h120v-120H340v120Zm0-160h120v-120H340v120Zm0-160h120v-120H340v120Zm160 320h120v-120H500v120Zm0-160h120v-120H500v120Zm0-160h120v-120H500v120Zm160 480h120v-120H660v120Zm0-160h120v-120H660v120Z" /></svg>
                                                    </Tooltip>
                                                    <span style={{ color: "#2626e2" }} role='button' onClick={() => redirectToCompany()} >{userDetails?.user?.organization?.organizationName}</span>
                                                </label>
                                            )}
                                            {/* available */}
                                            {userDetails?.available && (
                                                <label className="d-flex align-items-center gap-2 pt-2 pb-2">
                                                    <Tooltip title="Available" arrow>
                                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-575.39h560v-119.99q0-9.24-7.69-16.93-7.69-7.69-16.93-7.69H224.62q-9.24 0-16.93 7.69-7.69 7.69-7.69 16.93v119.99Zm0 0V-720-575.39ZM224.62-120q-27.62 0-46.12-18.5Q160-157 160-184.62v-510.76q0-27.62 18.5-46.12Q197-760 224.62-760h70.76v-89.23h43.08V-760h286.16v-89.23h40V-760h70.76q27.62 0 46.12 18.5Q800-723 800-695.38v210.07q-9.77-3.61-19.77-5.38T760-493.92v-41.46H200v350.76q0 9.24 7.69 16.93 7.69 7.69 16.93 7.69h268.15q3.15 11.23 8.04 20.85 4.88 9.61 10.19 19.15H224.62Zm510.76 40q-66.84 0-113.42-46.58-46.58-46.57-46.58-113.42t46.58-113.42Q668.54-400 735.38-400q66.85 0 113.43 46.58 46.57 46.57 46.57 113.42t-46.57 113.42Q802.23-80 735.38-80Zm66.24-71.92 21.84-21.85-72.69-72.69v-108.92H720v121.84l81.62 81.62Z" /></svg>
                                                    </Tooltip>
                                                    {userDetails?.available}
                                                </label>
                                            )}

                                            {/* Expertise */}
                                            <section className="mt-3">
                                                <div>
                                                    <label className="text-uppercase mb-1 text-muted small-font">Expertise</label>

                                                    {isEditMode && (
                                                        <Tooltip title="Add / Edit Expertise" arrow>
                                                            <IconButton onClick={(e) => {
                                                                handleModalFormView({ data: userDetails?.experienceTags, formType: 'expertiseTagForm' });
                                                            }}>
                                                                <EditOutlinedIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                                <div className="d-flex flex-wrap">
                                                    {userDetails?.experienceTags?.tags?.length > 0 ?
                                                        userDetails?.experienceTags?.tags?.filter((data: any) => data?.isHighlighted)?.map(({ skillName }: any, i: any) => {
                                                            return (
                                                                <label key={i} className="rounded-pill small-font skill-tags">{skillName}</label>
                                                            )
                                                        })
                                                        :
                                                        <p className='text-muted small-font'>No expertise found.</p>
                                                    }
                                                </div>
                                            </section>

                                            {/* About  */}
                                            <section className="mt-3">
                                                <label className="text-uppercase mb-1 text-muted small-font">Bio</label>
                                                {userDetails?.bio ? (
                                                    <p className="about text-muted">
                                                        <span dangerouslySetInnerHTML={{
                                                            __html: showFullBio
                                                                ? userDetails?.bio?.replace(/\n/g, "<br />")
                                                                : showFullContent(userDetails?.bio, 340)
                                                        }}
                                                        />
                                                        {userDetails?.bio?.length > 340 && (
                                                            <>
                                                                <br />
                                                                <span
                                                                    className="text-secondary cursor-pointer"
                                                                    onClick={handleToggleBio}
                                                                >
                                                                    {showFullBio ? "Show Less" : "Show More"}
                                                                </span>
                                                            </>
                                                        )}
                                                    </p>
                                                ) : (
                                                    <p className="text-muted"></p>
                                                )}


                                            </section>


                                            {profileDetailsLoader ? <LinearProgress color={'primary'} /> : <hr className="mt-4 mb-4" />}
                                            {!profileDetailsLoader && (
                                                <>
                                                    {/* Experience Tags */}
                                                    <section className='mb-4'>
                                                        <div className='d-flex align-items-center'>
                                                            <h5>Skills</h5>
                                                            {isEditMode && (
                                                                <Tooltip title="Add / Edit Skills" arrow>
                                                                    <IconButton onClick={(e) => {
                                                                        handleModalFormView({ data: userDetails?.experienceTags, formType: 'experienceTagForm' });
                                                                    }}>
                                                                        <EditOutlinedIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                        {userDetails?.experienceTags?.tags?.length > 0 ? (
                                                            <div className="d-flex flex-wrap mt-1">
                                                                {userDetails?.experienceTags?.tags?.map((data: any, i: any) => {
                                                                    return (
                                                                        <label key={i} className="text-muted small-font rounded-pill experience-tags">
                                                                            {data?.skillName} - {data?.level}
                                                                        </label>
                                                                    )
                                                                })}
                                                            </div>
                                                        )
                                                            : <p className='text-muted small-font'>No Skills found.</p>
                                                        }
                                                    </section>

                                                    {/* Availability cards */}
                                                    <section className='mb-3'>
                                                        <div className='row'>
                                                            {/* Availability */}
                                                            {userDetails?.available && (
                                                                <div className="col-md-4 bg-light p-4" style={{ border: "2px solid white" }}>
                                                                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4 w-12 h-12">
                                                                        <path d="M23.5 46.5C35.6503 46.5 45.5 36.6503 45.5 24.5C45.5 12.3497 35.6503 2.5 23.5 2.5C11.3497 2.5 1.5 12.3497 1.5 24.5C1.5 36.6503 11.3497 46.5 23.5 46.5Z" stroke="#204ECE" stroke-miterlimit="10"></path>
                                                                        <path d="M23.5 27V8" stroke="#204ECE" stroke-miterlimit="10"></path>
                                                                        <path d="M21 24.5H34" stroke="#204ECE" stroke-miterlimit="10"></path>
                                                                        <path d="M23.5 8V5" stroke="#204ECE" stroke-miterlimit="10"></path>
                                                                        <path d="M23.5 44V41" stroke="#204ECE" stroke-miterlimit="10"></path>
                                                                        <path d="M40 24.5H43" stroke="#204ECE" stroke-miterlimit="10"></path>
                                                                        <path d="M4 24.5H7" stroke="#204ECE" stroke-miterlimit="10"></path>
                                                                    </svg>
                                                                    <h6>Availability</h6>
                                                                    <p className='text-muted medium-font'>{userDetails?.available}</p>
                                                                </div>
                                                            )}

                                                            {userDetails?.preferredEnvironment && (
                                                                <div className="col-md-4 bg-light p-4" style={{ border: "2px solid white" }}>
                                                                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4 w-12 h-12">
                                                                        <path d="M43.5 4.5H4.5C3.39543 4.5 2.5 5.39543 2.5 6.5V32.5C2.5 33.6046 3.39543 34.5 4.5 34.5H43.5C44.6046 34.5 45.5 33.6046 45.5 32.5V6.5C45.5 5.39543 44.6046 4.5 43.5 4.5Z" stroke="#204ECE" stroke-miterlimit="10"></path>
                                                                        <path d="M14 45.5H34" stroke="#204ECE" stroke-miterlimit="10"></path>
                                                                        <path d="M19.5 42V35" stroke="#204ECE" stroke-miterlimit="10"></path>
                                                                        <path d="M28.5 42V35" stroke="#204ECE" stroke-miterlimit="10"></path>
                                                                        <path d="M3 28.5H45" stroke="#204ECE" stroke-miterlimit="10"></path>
                                                                    </svg>
                                                                    <h6>Preferred Environment</h6>
                                                                    <p className='text-muted medium-font'>{userDetails?.preferredEnvironment}</p>
                                                                </div>
                                                            )}

                                                            {/* he most amazing... */}
                                                            {userDetails?.mostAmazing && (
                                                                <div className="col-md-4 bg-light p-4" style={{ border: "2px solid white" }}>
                                                                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4 w-12 h-12">
                                                                        <path d="M23 2L29.34 14.84L43.5 16.9L33.25 26.89L35.67 41L23 34.34L10.33 41L12.75 26.89L2.5 16.9L16.66 14.84L23 2Z" stroke="#204ECE" stroke-miterlimit="10"></path>
                                                                        <path d="M23 47.5C24.933 47.5 26.5 45.933 26.5 44C26.5 42.067 24.933 40.5 23 40.5C21.067 40.5 19.5 42.067 19.5 44C19.5 45.933 21.067 47.5 23 47.5Z" stroke="#204ECE" stroke-miterlimit="10"></path>
                                                                        <path d="M43 33.5C44.933 33.5 46.5 31.933 46.5 30C46.5 28.067 44.933 26.5 43 26.5C41.067 26.5 39.5 28.067 39.5 30C39.5 31.933 41.067 33.5 43 33.5Z" stroke="#204ECE" stroke-miterlimit="10"></path>
                                                                        <path d="M4 33.5C5.933 33.5 7.5 31.933 7.5 30C7.5 28.067 5.933 26.5 4 26.5C2.067 26.5 0.5 28.067 0.5 30C0.5 31.933 2.067 33.5 4 33.5Z" stroke="#204ECE" stroke-miterlimit="10"></path>
                                                                        <path d="M11 10.5C12.933 10.5 14.5 8.933 14.5 7C14.5 5.067 12.933 3.5 11 3.5C9.067 3.5 7.5 5.067 7.5 7C7.5 8.933 9.067 10.5 11 10.5Z" stroke="#204ECE" stroke-miterlimit="10"></path>
                                                                        <path d="M36 10.5C37.933 10.5 39.5 8.933 39.5 7C39.5 5.067 37.933 3.5 36 3.5C34.067 3.5 32.5 5.067 32.5 7C32.5 8.933 34.067 10.5 36 10.5Z" stroke="#204ECE" stroke-miterlimit="10"></path>
                                                                    </svg>
                                                                    <h6>The most amazing...</h6>
                                                                    <p className='text-muted medium-font'>{userDetails?.mostAmazing}</p>
                                                                </div>
                                                            )}

                                                        </div>
                                                    </section>

                                                    {/* Accordion */}
                                                    <section>
                                                        <div>
                                                            {(userDetails?.workExperience?.length > 0 || isEditMode) && (
                                                                <Accordion defaultExpanded sx={{ boxShadow: "none" }} >
                                                                    <AccordionSummary
                                                                        expandIcon={<ExpandMoreIcon />}
                                                                        aria-controls="panel1-content"
                                                                        id="panel1-header"
                                                                        sx={{ padding: '10px 0' }}
                                                                    >
                                                                        <h5 className="w-100">Work Experience</h5>

                                                                        {isEditMode && (
                                                                            <Tooltip title="Add Work Experience" arrow>
                                                                                <IconButton onClick={(e) => {
                                                                                    handleModalFormView({ e, formType: 'workExperienceForm' });
                                                                                }}>
                                                                                    <AddOutlinedIcon />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        )}
                                                                    </AccordionSummary>

                                                                    <AccordionDetails className='p-0'>
                                                                        {userDetails?.workExperience?.length > 0 ?
                                                                            <div className="history-line position-relative p-0">
                                                                                {userDetails?.workExperience?.map((data: any, i: any) => {
                                                                                    return (
                                                                                        <div className={`p-4 pt-0`} key={i}>
                                                                                            <span className="position-absolute title-highlight">⦿</span>
                                                                                            <div className="d-flex justify-content-between align-items-top">
                                                                                                <div>
                                                                                                    <h2 className="fs-6 mb-1 ">{data?.jobTitle}</h2>
                                                                                                    <p className="text-muted d-flex align-items-center mb-3">{data?.companyName}</p>
                                                                                                </div>

                                                                                                {!isEditMode && (
                                                                                                    <p className={`text-muted fs-6 ${isEditMode && `text-c`}`}>
                                                                                                        {data?.joiningYear}
                                                                                                        {data?.isCurrentlyWorking ? ' PRESENT' : '-'}
                                                                                                        {!data?.isCurrentlyWorking ? data?.toYear : ''}
                                                                                                    </p>
                                                                                                )}

                                                                                                {isEditMode && (
                                                                                                    <div className='d-flex align-items-start'>
                                                                                                        {i !== 0 &&
                                                                                                            <Tooltip title='Up' arrow>
                                                                                                                <IconButton onClick={() => moveItem(i, -1, "workExperiences")}>
                                                                                                                    <ArrowUpwardIcon />
                                                                                                                </IconButton>
                                                                                                            </Tooltip>
                                                                                                        }
                                                                                                        {i !== userDetails?.workExperience?.length - 1 &&
                                                                                                            <Tooltip title='Down' arrow>
                                                                                                                <IconButton onClick={() => moveItem(i, 1, "workExperiences")}>
                                                                                                                    <ArrowDownwardIcon />
                                                                                                                </IconButton>
                                                                                                            </Tooltip>
                                                                                                        }
                                                                                                        <Tooltip title="Edit Work Experience" arrow>
                                                                                                            <IconButton onClick={(e) => {
                                                                                                                handleModalFormView({ e, formType: 'workExperienceForm', data })
                                                                                                            }}>
                                                                                                                <EditOutlinedIcon />
                                                                                                            </IconButton>
                                                                                                        </Tooltip>

                                                                                                        <Tooltip title="Delete Work Experience" arrow>
                                                                                                            <IconButton onClick={(e) => handleDeleteModalRecord({ e, recordID: data?.id, type: "workexperience" })}>
                                                                                                                <DeleteOutlineOutlinedIcon />
                                                                                                            </IconButton>
                                                                                                        </Tooltip>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>

                                                                                            <ul>
                                                                                                {data?.description?.map((data: any, i: any) => {
                                                                                                    return (
                                                                                                        <li className='text-muted mb-3' key={i}>{data}</li>
                                                                                                    )
                                                                                                })}
                                                                                            </ul>
                                                                                        </div>
                                                                                    )
                                                                                })
                                                                                }
                                                                            </div>
                                                                            :
                                                                            <p className="text-muted">No work experience found.</p>
                                                                        }
                                                                    </AccordionDetails>
                                                                </Accordion>
                                                            )}

                                                            {/* Experience */}
                                                            {(userDetails?.experiences?.length > 0 || isEditMode) && (
                                                                <Accordion defaultExpanded className='expansion-panel' sx={{ borderTop: "1px solid #e0e0e0" }} >
                                                                    <AccordionSummary
                                                                        expandIcon={<ExpandMoreIcon />}
                                                                        aria-controls="panel2-content"
                                                                        id="panel2-header"
                                                                        sx={{ padding: '10px 0' }}

                                                                    >
                                                                        <h5 className='w-100'>Project Highlights</h5>
                                                                        {isEditMode && (
                                                                            <Tooltip title="Add project highlights" arrow>
                                                                                <IconButton onClick={(e) => {
                                                                                    handleModalFormView({ e, formType: 'experienceForm' });
                                                                                }}>
                                                                                    <AddOutlinedIcon />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        )}
                                                                    </AccordionSummary>
                                                                    <AccordionDetails sx={{ padding: "0" }}>
                                                                        {userDetails?.experiences?.length > 0 ?
                                                                            userDetails?.experiences?.map((data: any, i: any) => {
                                                                                return (
                                                                                    <div key={i}>
                                                                                        <div className='d-flex justify-content-between'>
                                                                                            <span>
                                                                                                <h6>{data?.title}</h6>
                                                                                                <a href={data?.link} target='_blank'>{data?.link}</a>
                                                                                            </span>
                                                                                            {isEditMode && (
                                                                                                <div className='d-flex align-items-start'>
                                                                                                    {i !== 0 &&
                                                                                                        <Tooltip title='Up' arrow>
                                                                                                            <IconButton onClick={() => moveItem(i, -1, "userExperiences")}>
                                                                                                                <ArrowUpwardIcon />
                                                                                                            </IconButton>
                                                                                                        </Tooltip>
                                                                                                    }
                                                                                                    {i !== userDetails?.experiences?.length - 1 &&
                                                                                                        <Tooltip title='Down' arrow>
                                                                                                            <IconButton onClick={() => moveItem(i, 1, "userExperiences")}>
                                                                                                                <ArrowDownwardIcon />
                                                                                                            </IconButton>
                                                                                                        </Tooltip>
                                                                                                    }
                                                                                                    <Tooltip title="Edit project highlight" arrow>
                                                                                                        <IconButton onClick={(e) => {
                                                                                                            handleModalFormView({ e, formType: 'experienceForm', data })
                                                                                                        }}>
                                                                                                            <EditOutlinedIcon />
                                                                                                        </IconButton>
                                                                                                    </Tooltip>

                                                                                                    <Tooltip title="Delete project highlight" arrow>
                                                                                                        <IconButton onClick={(e) => handleDeleteModalRecord({ e, recordID: data?.id, type: "userexperience" })}>
                                                                                                            <DeleteOutlineOutlinedIcon />
                                                                                                        </IconButton>
                                                                                                    </Tooltip>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                        <p className='text-muted'>{data?.description}</p>
                                                                                    </div>
                                                                                )
                                                                            })
                                                                            :
                                                                            <p className="text-muted">No project highlights found.</p>
                                                                        }

                                                                    </AccordionDetails>
                                                                </Accordion>
                                                            )}


                                                            {/* Education */}
                                                            {(userDetails?.educations?.length > 0 || isEditMode) && (
                                                                <Accordion defaultExpanded className='expansion-panel' sx={{ borderTop: "1px solid #e0e0e0" }}>
                                                                    <AccordionSummary
                                                                        expandIcon={<ExpandMoreIcon />}
                                                                        aria-controls="panel3-content"
                                                                        id="panel3-header"
                                                                        sx={{ padding: '10px 0' }}
                                                                    >
                                                                        <h5 className='w-100'>Education</h5>

                                                                        {isEditMode && (
                                                                            <Tooltip title="Add Education" arrow>
                                                                                <IconButton onClick={(e) => handleModalFormView({ e, formType: 'educationForm' })}>
                                                                                    <AddOutlinedIcon />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        )}
                                                                    </AccordionSummary>
                                                                    <AccordionDetails sx={{ padding: "0" }}>
                                                                        {userDetails?.educations?.length > 0 ? userDetails?.educations?.map((data: any, i: any) => {
                                                                            return (
                                                                                <div className='row mb-3' key={i}>
                                                                                    <div className="col-md-10">
                                                                                        <h6 >{data?.degreeName}</h6>
                                                                                        <p className='text-muted mb-0'>{data?.instituteName}, {data?.location} </p>
                                                                                    </div>
                                                                                    <div className="col-md-2 text-muted">
                                                                                        {!isEditMode && <label>{data?.startYear} - {data?.endYear}</label>}
                                                                                        {isEditMode && (
                                                                                            <div className='d-flex align-items-center justify-content-end'>
                                                                                                {i !== 0 &&
                                                                                                    <Tooltip title='Up' arrow>
                                                                                                        <IconButton onClick={() => moveItem(i, -1, "educations")}>
                                                                                                            <ArrowUpwardIcon />
                                                                                                        </IconButton>
                                                                                                    </Tooltip>
                                                                                                }
                                                                                                {i !== userDetails?.educations?.length - 1 &&
                                                                                                    <Tooltip title='Down' arrow>
                                                                                                        <IconButton onClick={() => moveItem(i, 1, "educations")}>
                                                                                                            <ArrowDownwardIcon />
                                                                                                        </IconButton>
                                                                                                    </Tooltip>
                                                                                                }
                                                                                                <Tooltip title="Edit Education" arrow>
                                                                                                    <IconButton onClick={(e) => handleModalFormView({ e, formType: 'educationForm', data })}>
                                                                                                        <EditOutlinedIcon />
                                                                                                    </IconButton>
                                                                                                </Tooltip>

                                                                                                <Tooltip title="Delete Education" arrow>
                                                                                                    <IconButton onClick={(e) => handleDeleteModalRecord({ e, recordID: data?.id, type: "education" })}>
                                                                                                        <DeleteOutlineOutlinedIcon />
                                                                                                    </IconButton>
                                                                                                </Tooltip>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        }) :
                                                                            <p className="text-muted">No education found.</p>
                                                                        }
                                                                    </AccordionDetails>
                                                                </Accordion>
                                                            )}


                                                            {/* Certificate */}
                                                            {(userDetails?.certificates?.length > 0 || isEditMode) && (
                                                                <Accordion defaultExpanded className='expansion-panel' sx={{ borderTop: "1px solid #e0e0e0", borderBottom: "1px solid #e0e0e0" }}>
                                                                    <AccordionSummary
                                                                        expandIcon={<ExpandMoreIcon />}
                                                                        aria-controls="panel3-content"
                                                                        id="panel3-header"
                                                                        sx={{ padding: '10px 0' }}
                                                                    >
                                                                        <h5 className='w-100'>Certificate</h5>

                                                                        {isEditMode && (
                                                                            <Tooltip title="Add Certificate" arrow>
                                                                                <IconButton onClick={(e) => handleModalFormView({ e, formType: 'certificateForm' })}>
                                                                                    <AddOutlinedIcon />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        )}
                                                                    </AccordionSummary>
                                                                    <AccordionDetails sx={{ padding: "0" }}>
                                                                        {userDetails?.certificates?.length > 0 ? userDetails?.certificates?.map((data: any, i: any) => {
                                                                            return (
                                                                                <div className='row mb-3' key={i}>
                                                                                    <div className="col-md-10">
                                                                                        <h6 >{data?.title}</h6>
                                                                                        <a href={data?.url} target='_blank'>{data?.url}</a>
                                                                                    </div>
                                                                                    <div className="col-md-2 text-muted">
                                                                                        {!isEditMode && <label>{data?.issuedYear}</label>}
                                                                                        {!isEditMode && data?.expiredOn && <label>-{data?.expiredOn}</label>}

                                                                                        {isEditMode && (
                                                                                            <div className='d-flex align-items-center justify-content-end'>
                                                                                                {i !== 0 &&
                                                                                                    <Tooltip title='Up' arrow>
                                                                                                        <IconButton onClick={() => moveItem(i, -1, "certificates")}>
                                                                                                            <ArrowUpwardIcon />
                                                                                                        </IconButton>
                                                                                                    </Tooltip>
                                                                                                }
                                                                                                {i !== userDetails?.certificates?.length - 1 &&
                                                                                                    <Tooltip title='Down' arrow>
                                                                                                        <IconButton onClick={() => moveItem(i, 1, "certificates")}>
                                                                                                            <ArrowDownwardIcon />
                                                                                                        </IconButton>
                                                                                                    </Tooltip>
                                                                                                }
                                                                                                <Tooltip title="Edit Certificate" arrow>
                                                                                                    <IconButton onClick={(e) => handleModalFormView({ e, formType: 'certificateForm', data })}>
                                                                                                        <EditOutlinedIcon />
                                                                                                    </IconButton>
                                                                                                </Tooltip>

                                                                                                <Tooltip title="Delete Certificate" arrow>
                                                                                                    <IconButton onClick={(e) => handleDeleteModalRecord({ e, recordID: data?.id, type: "certificate" })}>
                                                                                                        <DeleteOutlineOutlinedIcon />
                                                                                                    </IconButton>
                                                                                                </Tooltip>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        }) :
                                                                            <p className="text-muted">No certificate found.</p>
                                                                        }
                                                                    </AccordionDetails>
                                                                </Accordion>
                                                            )}
                                                        </div>
                                                    </section>

                                                    {/* Social Link */}
                                                    <section className='mt-4'>
                                                        <div className='d-flex align-items-center'>
                                                            {userDetails?.sysName && (
                                                                <Tooltip onClick={() => CopyToClipboard(profileUrl)} title="Click to Copy Profile Url" arrow>
                                                                    <div className='d-flex align-items-center cursor-pointer border p-2 gap-2 bg-light'>
                                                                        <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="24px" fill="#6c757d"><path d="M680-80q-50 0-85-35t-35-85q0-6 3-28L282-392q-16 15-37 23.5t-45 8.5q-50 0-85-35t-35-85q0-50 35-85t85-35q24 0 45 8.5t37 23.5l281-164q-2-7-2.5-13.5T560-760q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35q-24 0-45-8.5T598-672L317-508q2 7 2.5 13.5t.5 14.5q0 8-.5 14.5T317-452l281 164q16-15 37-23.5t45-8.5q50 0 85 35t35 85q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T720-200q0-17-11.5-28.5T680-240q-17 0-28.5 11.5T640-200q0 17 11.5 28.5T680-160ZM200-440q17 0 28.5-11.5T240-480q0-17-11.5-28.5T200-520q-17 0-28.5 11.5T160-480q0 17 11.5 28.5T200-440Zm480-280q17 0 28.5-11.5T720-760q0-17-11.5-28.5T680-800q-17 0-28.5 11.5T640-760q0 17 11.5 28.5T680-720Zm0 520ZM200-480Zm480-280Z" /></svg>
                                                                        <span className='text-uppercase text-muted' >Share</span>
                                                                    </div>
                                                                </Tooltip>
                                                            )}

                                                            {/* {userDetails?.x_url && (
                                                    <Tooltip onClick={() => CopyToClipboard(userDetails?.x_url)} title="Google Scholar" arrow>
                                                        <div className='border p-2'>
                                                            <a href={userDetails?.x_url} target='_blank'>
                                                                <svg className="_13B62mlb" width="20" height="16" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" fill-rule="evenodd" d="M20.33 1.9c-.73.31-1.53.54-2.36.63.85-.5 1.5-1.3 1.8-2.23-.78.46-1.67.8-2.6.97a4.12 4.12 0 0 0-6.99 3.7A11.71 11.71 0 0 1 1.73.73 4.02 4.02 0 0 0 3 6.14a4.18 4.18 0 0 1-1.85-.52v.05c0 1.97 1.4 3.6 3.28 3.97a4.4 4.4 0 0 1-1.85.07 4.1 4.1 0 0 0 3.83 2.8A8.29 8.29 0 0 1 .33 14.2 11.71 11.71 0 0 0 6.63 16 11.5 11.5 0 0 0 18.29 4.51L18.28 4c.8-.58 1.5-1.29 2.05-2.09Z" clip-rule="evenodd"></path></svg>
                                                            </a>
                                                        </div>
                                                    </Tooltip>
                                                )} */}

                                                            {userDetails?.google_scholar && (
                                                                <Tooltip onClick={() => CopyToClipboard(userDetails?.google_scholar)} title="Google Scholar" arrow>
                                                                    <div className='border p-2'>
                                                                        <a href={userDetails?.google_scholar} target='_blank'>
                                                                            <svg xmlns="http://www.w3.org/2000/svg" height="21px" viewBox="0 -960 960 960" width="21px" fill="currentColor"><path d="M480-120 200-272v-240L40-600l440-240 440 240v320h-80v-276l-80 44v240L480-120Zm0-332 274-148-274-148-274 148 274 148Zm0 241 200-108v-151L480-360 280-470v151l200 108Zm0-241Zm0 90Zm0 0Z" /></svg>
                                                                        </a>
                                                                    </div>
                                                                </Tooltip>
                                                            )}

                                                            {userDetails?.facebook_url && (
                                                                <Tooltip onClick={() => CopyToClipboard(userDetails?.facebook_url)} title="Facebook" arrow>
                                                                    <div className='border p-2'>
                                                                        <a href={userDetails?.facebook_url} target='_blank'>
                                                                            <svg className="_13B62mlb" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" fill-rule="evenodd" d="M14.2 2.1 12 2C9.8 2 8.3 3.3 8.3 5.8v2H5.8v2.9h2.5V18h3v-7.3h2.4l.4-2.8h-2.9V6c0-.8.3-1.3 1.4-1.3h1.6V2Z" clip-rule="evenodd"></path></svg>
                                                                        </a>
                                                                    </div>
                                                                </Tooltip>
                                                            )}

                                                            {userDetails?.linkdin_url && (
                                                                <Tooltip onClick={() => CopyToClipboard(userDetails?.linkdin_url)} title="linkedin" arrow>
                                                                    <div className='border p-2'>
                                                                        <a href={userDetails?.linkdin_url} target='_blank'>
                                                                            <svg className="_13B62mlb" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" fill-rule="evenodd" d="M5.8 7.2H1.9V18h3.9V7.2ZM6 3.9C6 2.9 5.2 2 4 2s-2.2.8-2.2 1.9c0 1 .8 1.8 2.1 1.8C5.2 5.7 6 5 6 4Zm5.7 4.8V7.2H8V18h3.8v-6c0-.4 0-.7.2-1 .3-.6.9-1.2 2-1.2 1.3 0 1.9 1 1.9 2.4V18h3.8v-6.2c0-3.3-1.9-4.9-4.4-4.9-2 0-3 1-3.5 1.8Z" clip-rule="evenodd"></path></svg>
                                                                        </a>
                                                                    </div>
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                    </section>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div >
                            </div >

                            {/* User forms */}
                            <>
                                {editFormModal && editFormModal === 'basicInfoForm' ? (
                                    <UserBasicInformationForm
                                        userDetails={userDetails}
                                        organization={organizationsList}
                                        editRecordData={editRecordData}
                                        handleCloseModal={handleCloseModal}
                                    />
                                ) : editFormModal === 'imageUpload' ? (
                                    <ImageUpload
                                        profileUserId={userDetails?.userId}
                                        handleCloseModal={handleCloseModal}
                                        uploadProfileUrl={(url: any) => handleUpdateProfile(url)}
                                    />
                                ) : editFormModal === 'workExperienceForm' ? (
                                    <WorkExperienceForm
                                        profileUserId={userDetails?.userId}
                                        editRecordData={editRecordData}
                                        handleCloseModal={handleCloseModal}
                                    />
                                ) : editFormModal === 'experienceForm' ? (
                                    <ExperienceForm
                                        profileUserId={userDetails?.userId}
                                        editRecordData={editRecordData}
                                        handleCloseModal={handleCloseModal}
                                    />
                                ) : editFormModal === 'educationForm' ? (
                                    <EducationsForm
                                        profileUserId={userDetails?.userId}
                                        editRecordData={editRecordData}
                                        handleCloseModal={handleCloseModal}
                                    />
                                ) : editFormModal === 'experienceTagForm' ? (
                                    <ExperienceTagForm
                                        profileUserId={userDetails?.userId}
                                        editRecordData={editRecordData}
                                        handleCloseModal={handleCloseModal}
                                    />
                                ) : editFormModal === 'expertiseTagForm' ? (
                                    <ExpertiseTagForm
                                        profileUserId={userDetails?.userId}
                                        editRecordData={editRecordData}
                                        handleCloseModal={handleCloseModal}
                                    />
                                ) : editFormModal === 'certificateForm' ? (
                                    <CertificateForm
                                        profileUserId={userDetails?.userId}
                                        editRecordData={editRecordData}
                                        handleCloseModal={handleCloseModal}
                                    />
                                ) : editFormModal === 'contact_now' ? (
                                    <ContactForm
                                        profile_Details={userDetails}
                                        handleCloseModal={handleCloseModal}
                                    />
                                ) : editFormModal === 'importcv' ? (
                                    <ImportCVForm
                                        profile_Details={userDetails}
                                        settings={user?.settings}
                                        handleCloseModal={handleCloseModal}
                                    />
                                ) : null}
                            </>


                            {deleteModal && (
                                <Dialog
                                    open={deleteModal}
                                    onClose={() => setDeleteModal(false)}
                                    aria-describedby="alert-dialog-slide-description"
                                >
                                    <DialogTitle>Alert! </DialogTitle>
                                    <DialogContent dividers={true}>
                                        <DialogContentText id="alert-dialog-slide-description">
                                            Are you sure you want to delete this record? Once deleted, this data cannot be recovered.
                                        </DialogContentText>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={() => setDeleteModal(false)} variant="outlined" color='primary'>Close</Button>
                                        <Button onClick={() => handleDeleteRecord()} variant="contained" color='error'>Delete</Button>
                                    </DialogActions>
                                </Dialog>
                            )}

                        </>
                        :
                        <>
                            <div className='d-flex justify-content-center'>
                                <div className="p-2 rounded d-flex justify-content-between align-items-center m-2 gap-2" style={{ background: '#ef9a9a' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#21253F"><path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-200h-80v200Zm40-100Z" /></svg>
                                    <span>Profile Not Found.</span>
                                </div>
                            </div>
                            <div className='d-flex justify-content-center mt-2'>
                                <Button color='primary' variant='outlined' onClick={redirectToHome}>
                                    Back To Home
                                </Button>
                            </div>
                        </>
                    }
                </>
            }
        </div>
    )
}

export default Profile
