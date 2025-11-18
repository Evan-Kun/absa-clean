import { useEffect, useState } from 'react';
import '../common.scss';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useSnackbar } from '../../context/SnackbarContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import userProfileServices from '../../services/api-services/user-profile-api.service';

const UserBasicInformationForm = (props: any) => {
    const theme = useTheme();
    const { user } = useUser();
    const { updateProfileBasicDetails } = userProfileServices();
    const showSnackbar = useSnackbar();
    const { userDetails, organization = [], editRecordData, handleCloseModal, isDialogView = true } = props;
    const [formValue, setFormValue] = useState<any>({})
    const [loader, setLoader] = useState<boolean>(false)

    useEffect(() => {
        if (userDetails?.id) { setFormValue(userDetails) }
    }, [userDetails])

    // Form validation schema
    const validationSchema = Yup.object({
        firstName: Yup.string().required('First Name is required').max(255, 'First Name must be at most 255 characters long'),
        lastName: Yup.string().required('Last Name is required').max(255, 'Last Name must be at most 255 characters long'),
        jobTitle: Yup.string().required('Job Title is required').max(255, 'Job Title must be at most 255 characters long'),
        slogan: Yup.string().required('Slogan is required').max(255, 'Slogan must be at most 255 characters long'),
        available:Yup.string().max(255,'Available must be at most 255 characters long'),
        preferredEnvironment:Yup.string().max(255,'Preferred Environment must be at most 255 characters long'),
        mostAmazing:Yup.string().max(255,'Most Amazing must be at most 255 characters long'),
        organization: Yup.string().required('Organization is required'),
        x_url:Yup.string().matches(/^https?:\/\/[^\s$.?#].[^\s]*$/, "Enter a valid URL.").max(255,'X URL must be at most 255 characters long'),
        google_scholar:Yup.string().matches(/^https?:\/\/[^\s$.?#].[^\s]*$/, "Enter a valid URL.").max(255,'Google Scholar URL must be at most 255 characters long'),
        facebook_url:Yup.string().matches(/^https?:\/\/[^\s$.?#].[^\s]*$/, "Enter a valid URL.").max(255,'Facebook URL must be at most 255 characters long'),
        linkdin_url:Yup.string().matches(/^https?:\/\/[^\s$.?#].[^\s]*$/, "Enter a valid URL.").max(255,'Linkdin URL must be at most 255 characters long'),
        bio: Yup.string().required('Bio is required').max(1024, 'Bio must be at most 1024 characters long')
    });

    // Formik hook
    const formik = useFormik({
        initialValues: {
            id: editRecordData?.id || '',
            firstName: editRecordData?.firstName || '',
            lastName: editRecordData?.lastName || '',
            jobTitle: editRecordData?.jobTitle || '',
            slogan: editRecordData?.slogan || '',
            available: editRecordData?.available || '',
            x_url: editRecordData?.x_url || '',
            google_scholar: editRecordData?.google_scholar || '',
            facebook_url: editRecordData?.facebook_url || '',
            linkdin_url: editRecordData?.linkdin_url || '',
            preferredEnvironment: editRecordData?.preferredEnvironment || '',
            mostAmazing: editRecordData?.mostAmazing || '',
            bio: editRecordData?.bio || '',
            organization: organization.find((ele: any) => ele?.id === (user?.organization_id || userDetails?.user?.organization?.id))?.organizationName || '',
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            setLoader(true);
            let payload: any = values;
            if (user?.isSuperadmin || user?.isOrgadmin) { payload['userId'] = userDetails?.userId }
            const resUpdateUser = await updateProfileBasicDetails(payload, 'basic-info');            
            if (resUpdateUser?.success) {
                showSnackbar(resUpdateUser?.message, 'success');
                handleCloseModal && handleCloseModal('basic-info', resUpdateUser?.data?.data);
            } else {
                showSnackbar(resUpdateUser?.data?.message || 'An error occurred', 'error');
            }
            setLoader(false);
        }
    });

    const updateUserDetails = async () => {
        setLoader(true)
        delete formValue?.profileImage;
        let payload: any = formValue;
        if (user?.isSuperadmin || user?.isOrgadmin) { payload['userId'] = userDetails?.userId }
        const resUpdateUser = await updateProfileBasicDetails(payload, 'basic-info');
        if (resUpdateUser?.success) {
            showSnackbar(resUpdateUser?.message, 'success');
            handleCloseModal && handleCloseModal('basic-info', false)
        } else {
            showSnackbar(resUpdateUser?.data?.message || 'An error occurred', 'error');
        }
        setLoader(false)
    }

    const buttonSx = {
        ...(loader && {
            bgcolor: theme.palette.primary.main,
        }),
    };


    const renderBody = () => {
        return (
            <>
                {/* row 1 firstname | lastname */}
                <div className='row mb-3'>
                    <div className="col-md-4">
                        <TextField
                            required
                            className='w-100' id="firstName" name='firstName' label="First name" color='primary'
                            variant="outlined"
                            placeholder='Enter first name'
                            value={formik.values.firstName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                            helperText={formik.touched.firstName && String(formik.errors.firstName || '')}
                            sx={{ marginBottom: { xs: 2, md: 0 } }}
                        />
                    </div>
                    <div className="col-md-4">
                        <TextField
                            required
                            className='w-100'
                            id="lastname"
                            name='lastName'
                            label="Last name"
                            color='primary'
                            variant="outlined"
                            placeholder='Enter last name'
                            value={formik.values.lastName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                            helperText={formik.touched.lastName && String(formik.errors.lastName || '')}
                            sx={{ marginBottom: { xs: 2, md: 0 } }}
                        />
                    </div>
                    <div className="col-md-4">
                        <TextField required className='w-100' id="jobTitle" name='jobTitle' label="Job Title" color='primary' variant="outlined" placeholder='Enter job Title'
                            value={formik.values.jobTitle}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.jobTitle && Boolean(formik.errors.jobTitle)}
                            helperText={formik.touched.jobTitle && String(formik.errors.jobTitle || '')}
                            sx={{ marginBottom: { xs: 2, md: 0 } }} />
                    </div>
                </div>

                {/* row 2 organization */}
                <div className="row mb-3">
                    <div className="col-md-4">
                        <TextField
                            required
                            className='w-100'
                            id="slogan"
                            name='slogan'
                            label="Slogan"
                            color='primary'
                            variant="outlined"
                            placeholder='Enter slogan'
                            value={formik.values.slogan}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.slogan && Boolean(formik.errors.slogan)}
                            helperText={formik.touched.slogan && String(formik.errors.slogan || '')}
                            sx={{ marginBottom: { xs: 2, md: 0 } }}
                        />
                    </div>

                    <div className="col-md-4">
                        <FormControl fullWidth>
                            <InputLabel variant="outlined" id="organization">Organization</InputLabel>
                            <Select disabled={true}
                                label="organization"
                                name="organization"
                                id="organization"
                                value={formik.values.organization}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.organization && Boolean(formik.errors.organization)}
                            >
                                {organization?.map((ele: any) => (
                                    <MenuItem value={ele?.organizationName}>{ele?.organizationName}</MenuItem>
                                ))}
                            </Select>
                            {formik.touched.organization && formik.errors.organization && (
                                <p style={{ color: theme.palette.error.main, fontSize: '12px' }}>{String(formik.errors.organization || '')}</p>
                            )}
                        </FormControl>
                    </div>
                    <div className="col-md-4">
                        <TextField
                            className='w-100'
                            id="available"
                            name='available'
                            label="Available"
                            color='primary'
                            variant="outlined"
                            placeholder='Enter available'
                            value={formik.values.available}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.available && Boolean(formik.errors.available)}
                            helperText={formik.touched.available && String(formik.errors.available || '')}
                            sx={{ marginBottom: { xs: 2, md: 0 } }}
                        />
                    </div>
                </div>

                {/* row 4 */}
                <div className="row mb-3">
                    {/* <div className="col-md-4">
                        <TextField id="x_url" className='w-100' name='x_url' label="X URL" color='primary' placeholder='Enter X URL'
                            value={formik.values.x_url}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.x_url && Boolean(formik.errors.x_url)}
                            helperText={formik.touched.x_url && String(formik.errors.x_url || '')}
                            sx={{ marginBottom: { xs: 2, md: 0 } }} />
                    </div> */}
                    <div className="col-md-4">
                        <TextField id="google_scholar" className='w-100' name='google_scholar' label="Google Scholar" color='primary' placeholder='Enter Google Scholar'
                            value={formik.values.google_scholar}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.google_scholar && Boolean(formik.errors.google_scholar)}
                            helperText={formik.touched.google_scholar && String(formik.errors.google_scholar || '')}
                            sx={{ marginBottom: { xs: 2, md: 0 } }} />
                    </div>
                    <div className="col-md-4">
                        <TextField id="facebook_url" className='w-100' name='facebook_url' label="Facebook URL" color='primary' placeholder='Enter facebook link'
                            value={formik.values.facebook_url}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.facebook_url && Boolean(formik.errors.facebook_url)}
                            helperText={formik.touched.facebook_url && String(formik.errors.facebook_url || '')}
                            sx={{ marginBottom: { xs: 2, md: 0 } }} />
                    </div>
                    <div className="col-md-4">
                        <TextField id="linkdin_url" className='w-100' name='linkdin_url' label="Linkdin URL" color='primary' placeholder='Enter linkdin link'
                            value={formik.values.linkdin_url}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.linkdin_url && Boolean(formik.errors.linkdin_url)}
                            helperText={formik.touched.linkdin_url && String(formik.errors.linkdin_url || '')}
                            sx={{ marginBottom: { xs: 2, md: 0 } }} />
                    </div>
                </div>

                {/* row 3 */}
                <div className="row mb-3">
                    <div className="col-md-6">
                        <TextField
                            multiline rows={4}
                            className='w-100'
                            id="preferredEnvironment"
                            name='preferredEnvironment'
                            label="Preferred Environment"
                            color='primary'
                            variant="outlined"
                            placeholder='Enter Preferred Environment'
                            value={formik.values.preferredEnvironment}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.preferredEnvironment && Boolean(formik.errors.preferredEnvironment)}
                            helperText={formik.touched.preferredEnvironment && String(formik.errors.preferredEnvironment || '')}
                            sx={{ marginBottom: { xs: 2, md: 0 } }}
                        />
                    </div>
                    <div className="col-md-6">
                        <TextField
                            multiline rows={4}
                            className='w-100'
                            id="mostAmazing"
                            name='mostAmazing'
                            label="Most Amazing..."
                            color='primary'
                            variant="outlined"
                            placeholder='Enter most amazing...'
                            value={formik.values.mostAmazing}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.mostAmazing && Boolean(formik.errors.mostAmazing)}
                            helperText={formik.touched.mostAmazing && String(formik.errors.mostAmazing || '')}
                            sx={{ marginBottom: { xs: 2, md: 0 } }}
                        />
                    </div>
                </div>

                {/* row 5 */}
                <div className='row mt-3'>
                    <div className="col-12">
                        <TextField required multiline rows={4} className='w-100' id="bio" name='bio' label="Bio" color='primary' variant="outlined"
                            placeholder='Enter bio...'
                            value={formik.values.bio}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.bio && Boolean(formik.errors.bio)}
                            helperText={formik.touched.bio && String(formik.errors.bio || '')}
                        />
                    </div>
                </div>


                {!isDialogView && (
                    <div className='d-flex justify-content-end mt-3 gap-2'>
                        <Button onClick={() => handleCloseModal()} variant="outlined" color='primary'>Close</Button>
                        <Button onClick={() => updateUserDetails()} variant="contained" color='primary'>Save</Button>
                    </div>
                )}
            </>
        );
    };

    return (
        <>
            {isDialogView ?
                <Dialog
                    open={true}
                    scroll={'paper'}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>Basic Information</DialogTitle>

                    <DialogContent dividers={true}>
                        <DialogContentText tabIndex={-1} >
                            {renderBody()}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button disabled={loader} onClick={() => handleCloseModal()} variant="outlined" color='primary' >Close</Button>

                        <Box sx={{ m: 1, position: 'relative' }}>
                            <Button color='primary' variant="contained" sx={buttonSx} disabled={loader || !formik.isValid || formik.isSubmitting} onClick={() => formik.submitForm()}>
                                Save
                            </Button>
                            {loader && (
                                <CircularProgress
                                    size={24}
                                    sx={{
                                        color: theme.palette.primary.main,
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        marginTop: '-12px',
                                        marginLeft: '-12px',
                                    }}
                                />
                            )}
                        </Box>
                    </DialogActions>
                </Dialog>
                :
                renderBody()
            }
        </>
    );
};

export default UserBasicInformationForm;
